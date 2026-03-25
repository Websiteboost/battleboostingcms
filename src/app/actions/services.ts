'use server';

import { sql } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Service } from "@/types";
import { replaceServicePriceComponents, getServicePriceComponents } from "./servicePrices";
import { replaceServiceGames, getServiceGames } from "./serviceGames";

const serviceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "El título es requerido" }),
  category_id: z.string().min(1, { message: "La categoría es requerida" }),
  price: z.number().min(0, { message: "El precio debe ser mayor o igual a 0" }),
  image: z.string().regex(/^https?:\/\/.+/, { message: "La URL de la imagen no es válida" }),
  description: z.array(z.string()).min(1, { message: "Debe haber al menos una descripción" }),
  service_points: z.array(z.string()).optional(),
  title_es: z.string().optional().nullable(),
  description_es: z.array(z.string()).optional().nullable(),
  service_points_es: z.array(z.string()).optional().nullable(),
  priceComponents: z.array(z.object({
    service_id: z.string().optional(),
    type: z.enum(['bar', 'box', 'custom', 'selectors', 'additional', 'boxtitle', 'labeltitle', 'group']),
    config: z.any(),
    config_es: z.any().optional(),
    display_order: z.number().optional(),
    required: z.boolean().optional(),
    estimated_time: z.number().optional(),
    discount_percent: z.coerce.number().optional(),
  })).optional(),
  gameIds: z.array(z.string()).optional(),
});

export async function getServices() {
  try {
    const result = await sql`
      SELECT s.*, c.name as category_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.display_order ASC, s.created_at DESC
    `;
    return { success: true, data: result as Service[] };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { success: false, error: 'Error al obtener los servicios' };
  }
}

export async function createService(data: z.infer<typeof serviceSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const validatedFields = serviceSchema.safeParse(data);
    if (!validatedFields.success) {
      const errors = validatedFields.error?.issues?.map((err: any) => {
        const field = err.path.join('.');
        return `${field ? field + ': ' : ''}${err.message}`;
      }) || ['Error de validación desconocido'];
      
      console.error('Validation errors:', validatedFields.error);
      
      return { 
        success: false, 
        error: 'Datos inválidos',
        details: errors,
        validationErrors: validatedFields.error?.format()
      };
    }

    const { title, category_id, price, image, description, service_points, title_es, description_es, service_points_es, priceComponents, gameIds } = validatedFields.data;

    // Generar ID único basado en el título
    const baseSlug = title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Eliminar diacríticos
      .replace(/[^a-z0-9]+/g, '-') // Reemplazar caracteres no alfanuméricos con guiones
      .replace(/^-+|-+$/g, ''); // Eliminar guiones al inicio y final
    
    // Verificar si existe un servicio con este slug
    let serviceId = baseSlug;
    let counter = 1;
    let exists = await sql`SELECT id FROM services WHERE id = ${serviceId}`;
    
    while (exists.length > 0) {
      serviceId = `${baseSlug}-${counter}`;
      exists = await sql`SELECT id FROM services WHERE id = ${serviceId}`;
      counter++;
    }

    // Obtener el máximo display_order actual (global)
    const maxOrder = await sql`
      SELECT COALESCE(MAX(display_order), 0) as max_order 
      FROM services
    `;
    const nextOrder = maxOrder[0].max_order + 1;

    // Crear el servicio
    await sql`
      INSERT INTO services (id, title, category_id, price, image, description, service_points, display_order, title_es, description_es, service_points_es)
      VALUES (${serviceId}, ${title}, ${category_id}, ${price}, ${image}, ${description}, ${service_points || []}, ${nextOrder}, ${title_es ?? null}, ${description_es ?? null}, ${service_points_es ?? null})
    `;

    // Si hay componentes de precio, crearlos
    if (priceComponents && priceComponents.length > 0) {
      await replaceServicePriceComponents(serviceId, priceComponents);
    }

    // Si hay juegos, asociarlos
    if (gameIds && gameIds.length > 0) {
      await replaceServiceGames(serviceId, gameIds);
    }

    revalidatePath('/dashboard/services');
    return { success: true, message: 'Servicio creado exitosamente' };
  } catch (error) {
    console.error('Error creating service:', error);
    return { success: false, error: 'Error al crear el servicio' };
  }
}

export async function updateService(data: z.infer<typeof serviceSchema>) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const validatedFields = serviceSchema.safeParse(data);
    if (!validatedFields.success) {
      const errors = validatedFields.error?.issues?.map((err: any) => {
        const field = err.path.join('.');
        return `${field ? field + ': ' : ''}${err.message}`;
      }) || ['Error de validación desconocido'];
      
      console.error('Validation errors:', validatedFields.error);
      
      return { 
        success: false, 
        error: 'Datos inválidos',
        details: errors,
        validationErrors: validatedFields.error?.format()
      };
    }

    const { id, title, category_id, price, image, description, service_points, title_es, description_es, service_points_es, priceComponents, gameIds } = validatedFields.data;

    if (!id) {
      return { success: false, error: 'ID del servicio es requerido' };
    }

    // Actualizar el servicio
    await sql`
      UPDATE services
      SET title = ${title}, category_id = ${category_id}, price = ${price}, 
          image = ${image}, description = ${description}, service_points = ${service_points || []},
          title_es = ${title_es ?? null}, description_es = ${description_es ?? null}, service_points_es = ${service_points_es ?? null}
      WHERE id = ${id}
    `;

    // Actualizar componentes de precio (reemplaza todos)
    if (priceComponents !== undefined) {
      await replaceServicePriceComponents(id, priceComponents || []);
    }

    // Actualizar juegos asociados
    if (gameIds !== undefined) {
      await replaceServiceGames(id, gameIds || []);
    }

    revalidatePath('/dashboard/services');
    return { success: true, message: 'Servicio actualizado exitosamente' };
  } catch (error) {
    console.error('Error updating service:', error);
    return { success: false, error: 'Error al actualizar el servicio' };
  }
}

export async function deleteService(id: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Obtener la URL de la imagen y datos del servicio antes de eliminar
    const service = await sql`SELECT image, category_id, display_order FROM services WHERE id = ${id}`;
    
    if (service.length === 0) {
      return { success: false, error: 'Servicio no encontrado' };
    }

    const { category_id: categoryId, display_order: deletedOrder } = service[0];

    // Eliminar el servicio de la base de datos (cascade eliminará relations)
    await sql`DELETE FROM services WHERE id = ${id}`;

    // Ajustar el orden de los servicios posteriores en la misma categoría
    await sql`
      UPDATE services
      SET display_order = display_order - 1
      WHERE category_id = ${categoryId} AND display_order > ${deletedOrder}
    `;

    revalidatePath('/dashboard/services');
    return { success: true, message: 'Servicio eliminado exitosamente' };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, error: 'Error al eliminar el servicio' };
  }
}

export async function reorderServices(items: { id: string; display_order: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Actualizar el orden de todos los servicios en una transacción
    // Primero establecemos todos a valores negativos temporales
    for (let i = 0; i < items.length; i++) {
      await sql`
        UPDATE services
        SET display_order = ${-(i + 1)}
        WHERE id = ${items[i].id}
      `;
    }

    // Luego asignamos los valores correctos
    for (const item of items) {
      await sql`
        UPDATE services
        SET display_order = ${item.display_order}
        WHERE id = ${item.id}
      `;
    }

    revalidatePath('/dashboard/services');
    return { success: true };
  } catch (error) {
    console.error('Error reordering services:', error);
    return { success: false, error: 'Error al reordenar servicios' };
  }
}

export async function duplicateService(serviceId: string) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Obtener el servicio original
    const services = await sql`
      SELECT * FROM services WHERE id = ${serviceId}
    `;

    if (services.length === 0) {
      return { success: false, error: 'Servicio no encontrado' };
    }

    const originalService = services[0];

    // Obtener los componentes de precio y juegos asociados
    const [priceComponents, gameIds] = await Promise.all([
      getServicePriceComponents(serviceId),
      getServiceGames(serviceId)
    ]);

    // Generar un nuevo ID único
    const baseName = `${originalService.title} (Copia)`;
    const baseSlug = baseName
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    
    let newServiceId = baseSlug;
    let counter = 1;
    let exists = await sql`SELECT id FROM services WHERE id = ${newServiceId}`;
    
    while (exists.length > 0) {
      newServiceId = `${baseSlug}-${counter}`;
      exists = await sql`SELECT id FROM services WHERE id = ${newServiceId}`;
      counter++;
    }

    // Obtener el máximo display_order actual
    const maxOrder = await sql`
      SELECT COALESCE(MAX(display_order), 0) as max_order FROM services
    `;
    const nextOrder = maxOrder[0].max_order + 1;

    // Crear el nuevo servicio
    await sql`
      INSERT INTO services (id, title, category_id, price, image, description, service_points, display_order)
      VALUES (
        ${newServiceId}, 
        ${baseName}, 
        ${originalService.category_id}, 
        ${originalService.price}, 
        ${originalService.image}, 
        ${originalService.description}, 
        ${originalService.service_points || []}, 
        ${nextOrder}
      )
    `;

    // Copiar los componentes de precio (incluyendo grupos con sus hijos embebidos en config.children)
    if (priceComponents && priceComponents.length > 0) {
      const componentsWithoutId = priceComponents.map((pc, i) => ({
        type: pc.type,
        config: pc.config,
        display_order: pc.display_order ?? i,
        required: pc.required ?? false,
        estimated_time: pc.estimated_time ?? 0,
      }));
      await replaceServicePriceComponents(newServiceId, componentsWithoutId);
    }

    // Copiar las relaciones con juegos
    if (gameIds && gameIds.length > 0) {
      await replaceServiceGames(newServiceId, gameIds);
    }

    revalidatePath('/dashboard/services');
    return { success: true, message: 'Servicio duplicado exitosamente' };
  } catch (error) {
    console.error('Error duplicating service:', error);
    return { success: false, error: 'Error al duplicar el servicio' };
  }
}
