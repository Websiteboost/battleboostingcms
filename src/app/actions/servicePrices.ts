'use server';

import { sql } from '@/lib/db';
import type { PriceComponent } from '@/types/priceComponents';

/**
 * Obtener todos los componentes de precio de un servicio
 * Devuelve el árbol: los grupos incluyen sus hijos en config.children
 */
export async function getServicePriceComponents(serviceId: string): Promise<PriceComponent[]> {
  try {
    const rows = await sql`
      SELECT * FROM service_prices 
      WHERE service_id = ${serviceId}
      ORDER BY display_order ASC, created_at ASC
    ` as PriceComponent[];

    // Separar raíces y hijos
    const roots = rows.filter(r => !r.group_id);
    const childrenByParent = new Map<string, PriceComponent[]>();
    rows.filter(r => r.group_id).forEach(child => {
      const list = childrenByParent.get(child.group_id!) ?? [];
      list.push(child);
      childrenByParent.set(child.group_id!, list);
    });

    // Reconstruir grupos con sus hijos embebidos en config.children
    return roots.map(root => {
      if (root.type !== 'group') return root;
      const children = (childrenByParent.get(root.id!) ?? []).map(c => ({
        type: c.type,
        config: c.config,
        display_order: c.display_order,
        required: c.required,
        estimated_time: c.estimated_time,        discount_percent: c.discount_percent,      }));
      return { ...root, config: { ...(root.config as any), children } };
    });
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
  config: any,
  displayOrder: number = 0,
  required: boolean = false,
  groupId: string | null = null,
  estimatedTime: number = 0,
  discountPercent: number = 0
): Promise<PriceComponent> {
  try {
    const rows = await sql`
      INSERT INTO service_prices (service_id, type, config, display_order, required, group_id, estimated_time, discount_percent)
      VALUES (${serviceId}, ${type}, ${JSON.stringify(config)}::jsonb, ${displayOrder}, ${required}, ${groupId}, ${estimatedTime}, ${discountPercent})
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
  components: Array<{ type: string; config: any; display_order?: number; required?: boolean; estimated_time?: number; discount_percent?: number }>
): Promise<PriceComponent[]> {
  try {
    // Primero eliminamos todos los componentes existentes
    await deleteAllServicePriceComponents(serviceId);

    // Si no hay componentes nuevos, retornamos array vacío
    if (!components || components.length === 0) {
      return [];
    }

    // Insertamos los nuevos componentes SECUENCIALMENTE para mantener el orden
    const newComponents: PriceComponent[] = [];
    for (let i = 0; i < components.length; i++) {
      const component = components[i];
      const order = component.display_order ?? i;
      const required = component.required ?? false;

      const estimatedTime = component.estimated_time ?? 0;
      const discountPercent = component.discount_percent ?? 0;

      if (component.type === 'group') {
        // Extraer children del config antes de guardar el padre (no se persisten en la columna config)
        const { children, ...groupConfigWithoutChildren } = component.config as any;
        const parentComponent = await createPriceComponent(serviceId, 'group', groupConfigWithoutChildren, order, required, null, estimatedTime, 0);
        newComponents.push(parentComponent);
        // Guardar los hijos con group_id apuntando al padre recién insertado
        if (Array.isArray(children)) {
          for (let j = 0; j < children.length; j++) {
            const child = children[j];
            await createPriceComponent(serviceId, child.type, child.config, child.display_order ?? j, child.required ?? false, parentComponent.id!, child.estimated_time ?? 0, child.discount_percent ?? 0);
          }
        }
      } else {
        const newComponent = await createPriceComponent(serviceId, component.type, component.config, order, required, null, estimatedTime, discountPercent);
        newComponents.push(newComponent);
      }
    }

    return newComponents;
  } catch (error) {
    console.error('Error al reemplazar componentes de precio:', error);
    throw new Error('Error al reemplazar componentes de precio');
  }
}
