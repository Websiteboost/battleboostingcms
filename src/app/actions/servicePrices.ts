'use server';

import { sql } from '@/lib/db';
import type { PriceComponent } from '@/types/priceComponents';

/**
 * Obtener todos los componentes de precio de un servicio
 */
export async function getServicePriceComponents(serviceId: string): Promise<PriceComponent[]> {
  try {
    const rows = await sql`
      SELECT * FROM service_prices 
      WHERE service_id = ${serviceId}
      ORDER BY created_at ASC
    ` as PriceComponent[];
    return rows;
  } catch (error) {
    console.error('Error al obtener componentes de precio:', error);
    throw new Error('Error al obtener componentes de precio');
  }
}

/**
 * Crear un nuevo componente de precio
 */
export async function createPriceComponent(
  serviceId: string,
  type: string,
  config: any
): Promise<PriceComponent> {
  try {
    const rows = await sql`
      INSERT INTO service_prices (service_id, type, config)
      VALUES (${serviceId}, ${type}, ${JSON.stringify(config)}::jsonb)
      RETURNING *
    ` as PriceComponent[];
    return rows[0];
  } catch (error) {
    console.error('Error al crear componente de precio:', error);
    throw new Error('Error al crear componente de precio');
  }
}

/**
 * Actualizar un componente de precio existente
 */
export async function updatePriceComponent(
  id: string,
  config: any
): Promise<PriceComponent> {
  try {
    const rows = await sql`
      UPDATE service_prices
      SET config = ${JSON.stringify(config)}::jsonb
      WHERE id = ${id}
      RETURNING *
    ` as PriceComponent[];
    return rows[0];
  } catch (error) {
    console.error('Error al actualizar componente de precio:', error);
    throw new Error('Error al actualizar componente de precio');
  }
}

/**
 * Eliminar un componente de precio
 */
export async function deletePriceComponent(id: string): Promise<void> {
  try {
    await sql`
      DELETE FROM service_prices
      WHERE id = ${id}
    `;
  } catch (error) {
    console.error('Error al eliminar componente de precio:', error);
    throw new Error('Error al eliminar componente de precio');
  }
}

/**
 * Eliminar todos los componentes de precio de un servicio
 */
export async function deleteAllServicePriceComponents(serviceId: string): Promise<void> {
  try {
    await sql`
      DELETE FROM service_prices
      WHERE service_id = ${serviceId}
    `;
  } catch (error) {
    console.error('Error al eliminar componentes de precio:', error);
    throw new Error('Error al eliminar componentes de precio');
  }
}

/**
 * Reemplazar todos los componentes de precio de un servicio
 * (elimina los existentes y crea los nuevos)
 */
export async function replaceServicePriceComponents(
  serviceId: string,
  components: Array<{ type: string; config: any }>
): Promise<PriceComponent[]> {
  try {
    // Primero eliminamos todos los componentes existentes
    await deleteAllServicePriceComponents(serviceId);

    // Si no hay componentes nuevos, retornamos array vacío
    if (!components || components.length === 0) {
      return [];
    }

    // Insertamos los nuevos componentes
    const insertPromises = components.map(component =>
      createPriceComponent(serviceId, component.type, component.config)
    );

    const newComponents = await Promise.all(insertPromises);
    return newComponents;
  } catch (error) {
    console.error('Error al reemplazar componentes de precio:', error);
    throw new Error('Error al reemplazar componentes de precio');
  }
}
