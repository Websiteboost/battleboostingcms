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
    const validated = accordionSchema.parse(data);
    
    // Generar ID único
    const id = `item-${Date.now()}`;
    
    await sql`
      INSERT INTO accordion_items (id, title, content, display_order)
      VALUES (${id}, ${validated.title}, ${validated.content}, ${validated.display_order})
    `;
    
    return { success: true, data: { id, ...validated } };
  } catch (error) {
    console.error('Error creating accordion item:', error);
    if (error instanceof z.ZodError) {
      return { success: false, error: error.issues[0].message };
    }
    return { success: false, error: 'Error al crear item del acordeón' };
  }
}

export async function updateAccordionItem(data: z.infer<typeof accordionSchema> & { id: string }) {
  try {
    const { id, ...rest } = data;
    const validated = accordionSchema.parse(rest);
    
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
    await sql`
      DELETE FROM accordion_items
      WHERE id = ${id}
    `;
    return { success: true };
  } catch (error) {
    console.error('Error deleting accordion item:', error);
    return { success: false, error: 'Error al eliminar item del acordeón' };
  }
}

export async function reorderAccordionItems(items: { id: string; display_order: number }[]) {
  try {
    // Actualizar el orden de todos los items
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
