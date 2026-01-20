'use server';

import { sql } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";import { del } from '@vercel/blob';import type { Game } from "@/types";

const gameSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "El título es requerido" }),
  category: z.string().min(1, { message: "La categoría es requerida" }),
  image: z.string().regex(/^https?:\/\/.+/, { message: "La URL de la imagen no es válida" }),
});

export async function getGames() {
  try {
    const result = await sql`
      SELECT id, title, category, image, created_at
      FROM games
      ORDER BY created_at DESC
    `;
    return { success: true, data: result as Game[] };
  } catch (error) {
    console.error('Error fetching games:', error);
    return { success: false, error: 'Error al obtener los juegos' };
  }
}

export async function createGame(data: z.infer<typeof gameSchema>) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const validatedFields = gameSchema.safeParse(data);
  if (!validatedFields.success) {
    const errors = validatedFields.error.errors.map(err => {
      const field = err.path.join('.');
      return `${field ? field + ': ' : ''}${err.message}`;
    });
    return { 
      success: false, 
      error: 'Datos inválidos',
      details: errors,
      validationErrors: validatedFields.error.format()
    };
  }

  const { title, category, image } = validatedFields.data;

  try {
    await sql`
      INSERT INTO games (title, category, image)
      VALUES (${title}, ${category}, ${image})
    `;
    revalidatePath('/dashboard/games');
    return { success: true, message: 'Juego creado exitosamente' };
  } catch (error) {
    console.error('Error creating game:', error);
    return { success: false, error: 'Error al crear el juego' };
  }
}

export async function updateGame(data: z.infer<typeof gameSchema>) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const validatedFields = gameSchema.safeParse(data);
  if (!validatedFields.success) {
    const errors = validatedFields.error?.issues?.map((err: any) => {
      const field = err.path.join('.');
      return `${field ? field + ': ' : ''}${err.message}`;
    }) || ['Error de validación desconocido'];
    return { 
      success: false, 
      error: 'Datos inválidos',
      details: errors,
      validationErrors: validatedFields.error?.format()
    };
  }

  const { id, title, category, image } = validatedFields.data;

  if (!id) {
    return { success: false, error: 'ID del juego es requerido' };
  }

  try {
    await sql`
      UPDATE games
      SET title = ${title}, category = ${category}, image = ${image}
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/games');
    return { success: true, message: 'Juego actualizado exitosamente' };
  } catch (error) {
    console.error('Error updating game:', error);
    return { success: false, error: 'Error al actualizar el juego' };
  }
}

export async function deleteGame(id: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Obtener la URL de la imagen antes de eliminar
    const game = await sql`SELECT image FROM games WHERE id = ${id}`;
    
    // Eliminar el juego de la base de datos
    await sql`DELETE FROM games WHERE id = ${id}`;
    
    // Eliminar la imagen del blob storage si existe
    if (game[0]?.image && game[0].image.includes('blob.vercel-storage.com')) {
      try {
        await del(game[0].image);
      } catch (error) {
        console.error('Error deleting image from blob:', error);
        // No fallar si no se puede eliminar la imagen
      }
    }
    
    revalidatePath('/dashboard/games');
    return { success: true, message: 'Juego eliminado exitosamente' };
  } catch (error) {
    console.error('Error deleting game:', error);
    return { success: false, error: 'Error al eliminar el juego' };
  }
}
