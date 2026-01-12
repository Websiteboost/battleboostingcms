'use server';

import { sql } from '@/lib/db';

/**
 * Obtener todos los juegos asociados a un servicio
 */
export async function getServiceGames(serviceId: string): Promise<string[]> {
  try {
    const result = await sql`
      SELECT game_id FROM service_games 
      WHERE service_id = ${serviceId}
    `;
    return result.map((row: any) => row.game_id);
  } catch (error) {
    console.error('Error al obtener juegos de servicio:', error);
    throw new Error('Error al obtener juegos de servicio');
  }
}

/**
 * Reemplazar todos los juegos asociados a un servicio
 */
export async function replaceServiceGames(
  serviceId: string,
  gameIds: string[]
): Promise<void> {
  try {
    // Primero eliminamos todas las relaciones existentes
    await sql`
      DELETE FROM service_games
      WHERE service_id = ${serviceId}
    `;

    // Si no hay juegos, terminamos aquí
    if (!gameIds || gameIds.length === 0) {
      return;
    }

    // Insertamos las nuevas relaciones
    for (const gameId of gameIds) {
      await sql`
        INSERT INTO service_games (service_id, game_id)
        VALUES (${serviceId}, ${gameId})
      `;
    }
  } catch (error) {
    console.error('Error al reemplazar juegos de servicio:', error);
    throw new Error('Error al reemplazar juegos de servicio');
  }
}
