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
      SELECT id, name, description, icon, created_at
      FROM categories
      ORDER BY name ASC
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
    // Crear la categoría
    const result = await sql`
      INSERT INTO categories (name, description, icon)
      VALUES (${name}, ${description}, ${icon})
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
    await sql`DELETE FROM categories WHERE id = ${id}`;
    revalidatePath('/dashboard/categories');
    return { success: true, message: 'Categoría eliminada exitosamente' };
  } catch (error) {
    console.error('Error deleting category:', error);
    return { success: false, error: 'Error al eliminar la categoría' };
  }
}
