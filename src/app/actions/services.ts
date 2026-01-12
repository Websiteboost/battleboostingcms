'use server';

import { sql } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Service } from "@/types";
import { replaceServicePriceComponents } from "./servicePrices";
import { replaceServiceGames } from "./serviceGames";

const serviceSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "El título es requerido" }),
  category_id: z.string().min(1, { message: "La categoría es requerida" }),
  price: z.number().min(0, { message: "El precio debe ser mayor o igual a 0" }),
  image: z.string().regex(/^https?:\/\/.+/, { message: "La URL de la imagen no es válida" }),
  description: z.array(z.string()).min(1, { message: "Debe haber al menos una descripción" }),
  priceComponents: z.array(z.object({
    service_id: z.string(),
    type: z.enum(['bar', 'box', 'custom', 'selectors', 'additional']),
    config: z.any(),
  })).optional(),
  gameIds: z.array(z.string()).optional(),
});

export async function getServices() {
  try {
    const result = await sql`
      SELECT s.*, c.name as category_name
      FROM services s
      LEFT JOIN categories c ON s.category_id = c.id
      ORDER BY s.created_at DESC
    `;
    return { success: true, data: result as Service[] };
  } catch (error) {
    console.error('Error fetching services:', error);
    return { success: false, error: 'Error al obtener los servicios' };
  }
}

export async function createService(data: z.infer<typeof serviceSchema>) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const validatedFields = serviceSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const { title, category_id, price, image, description, priceComponents, gameIds } = validatedFields.data;

  try {
    // Crear el servicio
    const result = await sql`
      INSERT INTO services (title, category_id, price, image, description)
      VALUES (${title}, ${category_id}, ${price}, ${image}, ${description})
      RETURNING id
    `;
    
    const serviceId = result[0].id;

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
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const validatedFields = serviceSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const { id, title, category_id, price, image, description, priceComponents, gameIds } = validatedFields.data;

  if (!id) {
    return { success: false, error: 'ID del servicio es requerido' };
  }

  try {
    // Actualizar el servicio
    await sql`
      UPDATE services
      SET title = ${title}, category_id = ${category_id}, price = ${price}, 
          image = ${image}, description = ${description}
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
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    await sql`DELETE FROM services WHERE id = ${id}`;
    revalidatePath('/dashboard/services');
    return { success: true, message: 'Servicio eliminado exitosamente' };
  } catch (error) {
    console.error('Error deleting service:', error);
    return { success: false, error: 'Error al eliminar el servicio' };
  }
}
