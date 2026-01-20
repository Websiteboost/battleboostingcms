'use server';

import { sql } from '@/lib/db';
import { z } from 'zod';

const accordionSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
  display_order: z.number().int().positive('El orden debe ser positivo'),
});

export type AccordionItem = {
  id: string;
  title: string;
  content: string;
  display_order: number;
  created_at: Date;
};

export async function getAccordionItems() {
  try {
    const result = await sql`
      SELECT id, title, content, display_order, created_at
      FROM accordion_items
      ORDER BY display_order ASC
    `;
    return { success: true, data: result };
  } catch (error) {
    console.error('Error fetching accordion items:', error);
    return { success: false, error: 'Error al cargar items del acordeón' };
  }
}

export async function createAccordionItem(data: z.infer<typeof accordionSchema>) {
  try {
    const validatedData = accordionSchema.safeParse(data);
    
    if (!validatedData.success) {
      const errors = validatedData.error?.issues?.map((err: any) => {
        const field = err.path.join('.');
        return `${field ? field + ': ' : ''}${err.message}`;
      }) || ['Error de validación desconocido'];
      
      console.error('Validation errors:', validatedData.error);
      
      return {
        success: false,
        error: 'Datos inválidos',
        details: errors
      };
    }
    
    const validated = validatedData.data;
    
    // Generar ID único
    const id = `item-${Date.now()}`;
    
    // Si el display_order ya existe, ajustar los demás items
    const existingItems = await sql`
      SELECT id, display_order 
      FROM accordion_items 
      WHERE display_order >= ${validated.display_order}
      ORDER BY display_order ASC
    `;

    // Incrementar el orden de todos los items que están en o después de la posición deseada
    if (existingItems.length > 0) {
      for (const item of existingItems) {
        await sql`
          UPDATE accordion_items
          SET display_order = display_order + 1
          WHERE id = ${item.id}
        `;
      }
    }
    
    await sql`
      INSERT INTO accordion_items (id, title, content, display_order)
      VALUES (${id}, ${validated.title}, ${validated.content}, ${validated.display_order})
    `;
    
    return { success: true, data: { id, ...validated } };
  } catch (error) {
    console.error('Error creating accordion item:', error);
    return { success: false, error: 'Error al crear item del acordeón' };
  }
}

export async function updateAccordionItem(data: z.infer<typeof accordionSchema> & { id: string }) {
  try {
    const { id, ...rest } = data;
    
    const validatedData = accordionSchema.safeParse(rest);
    
    if (!validatedData.success) {
      const errors = validatedData.error?.issues?.map((err: any) => {
        const field = err.path.join('.');
        return `${field ? field + ': ' : ''}${err.message}`;
      }) || ['Error de validación desconocido'];
      
      console.error('Validation errors:', validatedData.error);
      
      return {
        success: false,
        error: 'Datos inválidos',
        details: errors
      };
    }
    
    const validated = validatedData.data;
    
    // Obtener el orden actual del item
    const currentItem = await sql`
      SELECT display_order 
      FROM accordion_items 
      WHERE id = ${id}
    `;

    if (currentItem.length === 0) {
      return { success: false, error: 'Item no encontrado' };
    }

    const oldOrder = currentItem[0].display_order;
    const newOrder = validated.display_order;

    // Si el orden cambió, recalcular todos los órdenes afectados
    if (oldOrder !== newOrder) {
      if (newOrder > oldOrder) {
        // Mover hacia abajo: decrementar los items entre oldOrder y newOrder
        await sql`
          UPDATE accordion_items
          SET display_order = display_order - 1
          WHERE display_order > ${oldOrder} AND display_order <= ${newOrder}
          AND id != ${id}
        `;
      } else {
        // Mover hacia arriba: incrementar los items entre newOrder y oldOrder
        await sql`
          UPDATE accordion_items
          SET display_order = display_order + 1
          WHERE display_order >= ${newOrder} AND display_order < ${oldOrder}
          AND id != ${id}
        `;
      }
    }

    // Actualizar el item actual
    await sql`
      UPDATE accordion_items
      SET title = ${validated.title},
          content = ${validated.content},
          display_order = ${validated.display_order}
      WHERE id = ${id}
    `;
    
    return { success: true, data: { id, ...validated } };
  } catch (error) {
    console.error('Error updating accordion item:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Error al actualizar item del acordeón' };
  }
}

export async function deleteAccordionItem(id: string) {
  try {
    // Obtener el orden del item a eliminar
    const itemToDelete = await sql`
      SELECT display_order 
      FROM accordion_items 
      WHERE id = ${id}
    `;

    if (itemToDelete.length === 0) {
      return { success: false, error: 'Item no encontrado' };
    }

    const deletedOrder = itemToDelete[0].display_order;

    // Eliminar el item
    await sql`
      DELETE FROM accordion_items
      WHERE id = ${id}
    `;

    // Ajustar el orden de los items posteriores (decrementar en 1)
    await sql`
      UPDATE accordion_items
      SET display_order = display_order - 1
      WHERE display_order > ${deletedOrder}
    `;

    return { success: true };
  } catch (error) {
    console.error('Error deleting accordion item:', error);
    return { success: false, error: 'Error al eliminar item del acordeón' };
  }
}

export async function reorderAccordionItems(items: { id: string; display_order: number }[]) {
  try {
    // Actualizar el orden de todos los items en una transacción
    // Para evitar conflictos, primero establecemos todos a valores negativos temporales
    for (let i = 0; i < items.length; i++) {
      await sql`
        UPDATE accordion_items
        SET display_order = ${-(i + 1)}
        WHERE id = ${items[i].id}
      `;
    }

    // Luego asignamos los valores correctos
    for (const item of items) {
      await sql`
        UPDATE accordion_items
        SET display_order = ${item.display_order}
        WHERE id = ${item.id}
      `;
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error reordering accordion items:', error);
    return { success: false, error: 'Error al reordenar items del acordeón' };
  }
}
