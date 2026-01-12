'use server';

import { sql } from '@/lib/db';

/**
 * Obtener todos los juegos asociados a una categoría
 */
export async function getCategoryGames(categoryId: string): Promise<string[]> {
  try {
    const result = await sql`
      SELECT game_id FROM category_games 
      WHERE category_id = ${categoryId}
    `;
    return result.map((row: any) => row.game_id);
  } catch (error) {
    console.error('Error al obtener juegos de categoría:', error);
    throw new Error('Error al obtener juegos de categoría');
  }
}

/**
 * Reemplazar todos los juegos asociados a una categoría
 */
export async function replaceCategoryGames(
  categoryId: string,
  gameIds: string[]
): Promise<void> {
  try {
    // Primero eliminamos todas las relaciones existentes
    await sql`
      DELETE FROM category_games
      WHERE category_id = ${categoryId}
    `;

    // Si no hay juegos, terminamos aquí
    if (!gameIds || gameIds.length === 0) {
      return;
    }

    // Insertamos las nuevas relaciones
    for (const gameId of gameIds) {
      await sql`
        INSERT INTO category_games (category_id, game_id)
        VALUES (${categoryId}, ${gameId})
      `;
    }
  } catch (error) {
    console.error('Error al reemplazar juegos de categoría:', error);
    throw new Error('Error al reemplazar juegos de categoría');
  }
}

/**
 * Obtener todas las categorías asociadas a un juego
 */
export async function getGameCategories(gameId: string): Promise<string[]> {
  try {
    const result = await sql`
      SELECT category_id FROM category_games 
      WHERE game_id = ${gameId}
    `;
    return result.map((row: any) => row.category_id);
  } catch (error) {
    console.error('Error al obtener categorías de juego:', error);
    throw new Error('Error al obtener categorías de juego');
  }
}
