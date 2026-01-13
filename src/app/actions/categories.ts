'use server';

import { sql } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import type { Category } from "@/types";
import { replaceCategoryGames } from "./categoryGames";

const categorySchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, { message: "El nombre es requerido" }),
  description: z.string().min(1, { message: "La descripción es requerida" }),
  icon: z.string().min(1, { message: "El icono es requerido" }),
  gameIds: z.array(z.string()).optional(),
});

export async function getCategories() {
  try {
    const result = await sql`
      SELECT id, name, description, icon, display_order, created_at
      FROM categories
      ORDER BY display_order ASC, name ASC
    `;
    return { success: true, data: result as Category[] };
  } catch (error) {
    console.error('Error fetching categories:', error);
    return { success: false, error: 'Error al obtener las categorías' };
  }
}

export async function createCategory(data: z.infer<typeof categorySchema>) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const validatedFields = categorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const { name, description, icon, gameIds } = validatedFields.data;

  try {
    // Obtener el máximo display_order actual
    const maxOrder = await sql`
      SELECT COALESCE(MAX(display_order), 0) as max_order FROM categories
    `;
    const nextOrder = maxOrder[0].max_order + 1;

    // Crear la categoría
    const result = await sql`
      INSERT INTO categories (name, description, icon, display_order)
      VALUES (${name}, ${description}, ${icon}, ${nextOrder})
      RETURNING id
    `;
    
    const categoryId = result[0].id;

    // Si hay juegos, asociarlos
    if (gameIds && gameIds.length > 0) {
      await replaceCategoryGames(categoryId, gameIds);
    }

    revalidatePath('/dashboard/categories');
    return { success: true, message: 'Categoría creada exitosamente' };
  } catch (error) {
    console.error('Error creating category:', error);
    return { success: false, error: 'Error al crear la categoría' };
  }
}

export async function updateCategory(data: z.infer<typeof categorySchema>) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const validatedFields = categorySchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const { id, name, description, icon, gameIds } = validatedFields.data;

  if (!id) {
    return { success: false, error: 'ID de la categoría es requerido' };
  }

  try {
    // Actualizar la categoría
    await sql`
      UPDATE categories
      SET name = ${name}, description = ${description}, icon = ${icon}
      WHERE id = ${id}
    `;

    // Actualizar juegos asociados
    if (gameIds !== undefined) {
      await replaceCategoryGames(id, gameIds || []);
    }

    revalidatePath('/dashboard/categories');
    return { success: true, message: 'Categoría actualizada exitosamente' };
  } catch (error) {
    console.error('Error updating category:', error);
    return { success: false, error: 'Error al actualizar la categoría' };
  }
}

export async function deleteCategory(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Obtener el orden del item a eliminar
    const categoryToDelete = await sql`
      SELECT display_order FROM categories WHERE id = ${id}
    `;

    if (categoryToDelete.length === 0) {
      return { success: false, error: 'Categoría no encontrada' };
    }

    const deletedOrder = categoryToDelete[0].display_order;

    // Eliminar la categoría
    await sql`DELETE FROM categories WHERE id = ${id}`;

    // Ajustar el orden de las categorías posteriores
    await sql`
      UPDATE categories
      SET display_order = display_order - 1
      WHERE display_order > ${deletedOrder}
    `;

    revalidatePath('/dashboard/categories');
    return { success: true, message: 'Categoría eliminada exitosamente' };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Error al eliminar la categoría' };
  }
}

export async function reorderCategories(items: { id: string; display_order: number }[]) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Actualizar el orden de todas las categorías en una transacción
    // Primero establecemos todos a valores negativos temporales
    for (let i = 0; i < items.length; i++) {
      await sql`
        UPDATE categories
        SET display_order = ${-(i + 1)}
        WHERE id = ${items[i].id}
      `;
    }

    // Luego asignamos los valores correctos
    for (const item of items) {
      await sql`
        UPDATE categories
        SET display_order = ${item.display_order}
        WHERE id = ${item.id}
      `;
    }

    revalidatePath('/dashboard/categories');
    return { success: true };
  } catch (error) {
    console.error('Error reordering categories:', error);
    return { success: false, error: 'Error al reordenar categorías' };
  }
}
