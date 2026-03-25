'use server';

import { sql } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath, unstable_noStore as noStore } from "next/cache";
import { z } from "zod";

const homeFeatureSchema = z.object({
  id: z.string().uuid(),
  icon: z.string().min(1, { message: "El icono es requerido" }),
  title: z.string().min(1, { message: "El título es requerido" }),
  description: z.string().min(1, { message: "La descripción es requerida" }),
  title_es: z.string().optional().nullable(),
  description_es: z.string().optional().nullable(),
});

export type HomeFeatureUpdate = z.infer<typeof homeFeatureSchema>;

export interface HomeFeature {
  id: string;
  icon: string;
  title: string;
  description: string;
  title_es?: string | null;
  description_es?: string | null;
  display_order: number;
}

export async function getHomeFeatures() {
  noStore();
  try {
    const result = await sql`
      SELECT id, icon, title, description, title_es, description_es, display_order
      FROM home_features ORDER BY display_order ASC
    `;
    return { success: true, data: result as HomeFeature[] };
  } catch (error) {
    console.error('Error fetching home features:', error);
    return { success: false, error: 'Error al obtener las features' };
  }
}

export async function updateHomeFeatures(features: HomeFeatureUpdate[]) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const parsed = z.array(homeFeatureSchema).safeParse(features);
  if (!parsed.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  try {
    for (const f of parsed.data) {
      await sql`
        UPDATE home_features
        SET icon = ${f.icon},
            title = ${f.title},
            description = ${f.description},
            title_es = ${f.title_es ?? null},
            description_es = ${f.description_es ?? null}
        WHERE id = ${f.id}
      `;
    }
    revalidatePath('/dashboard/config');
    return { success: true };
  } catch (error) {
    console.error('Error updating home features:', error);
    return { success: false, error: 'Error al actualizar las features' };
  }
}
