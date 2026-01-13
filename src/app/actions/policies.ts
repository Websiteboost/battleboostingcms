'use server';

import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

// Schema para cada sección de política
const policySectionSchema = z.object({
  title: z.string().min(1, 'El título es requerido'),
  content: z.string().min(1, 'El contenido es requerido'),
});

// Schema para todas las políticas
const policiesSchema = z.object({
  section_1: policySectionSchema.optional(),
  section_2: policySectionSchema.optional(),
  section_3: policySectionSchema.optional(),
  section_4: policySectionSchema.optional(),
  section_5: policySectionSchema.optional(),
  section_6: policySectionSchema.optional(),
  section_7: policySectionSchema.optional(),
  section_8: policySectionSchema.optional(),
  section_9: policySectionSchema.optional(),
  section_10: policySectionSchema.optional(),
});

export type PolicySection = {
  title: string;
  content: string;
};

export type Policies = {
  section_1?: string;
  section_2?: string;
  section_3?: string;
  section_4?: string;
  section_5?: string;
  section_6?: string;
  section_7?: string;
  section_8?: string;
  section_9?: string;
  section_10?: string;
  updated_at?: Date;
};

// Función helper para combinar título y contenido en HTML
function combineSection(section: PolicySection | undefined): string | null {
  if (!section || !section.title.trim() || !section.content.trim()) {
    return null;
  }
  return `<h3>${section.title}</h3><span>${section.content}</span>`;
}

// Función helper para separar HTML en título y contenido
function parseSection(html: string | null): PolicySection | null {
  if (!html) return null;
  
  const h3Match = html.match(/<h3>(.*?)<\/h3>/);
  const spanMatch = html.match(/<span>(.*?)<\/span>/s);
  
  if (!h3Match || !spanMatch) return null;
  
  return {
    title: h3Match[1],
    content: spanMatch[1],
  };
}

export async function getPolicies() {
  try {
    const result = await sql`
      SELECT * FROM policies WHERE id = 1
    `;
    return { success: true, data: result[0] || null };
  } catch (error) {
    console.error('Error fetching policies:', error);
    return { success: false, error: 'Error al obtener las políticas' };
  }
}

export async function updatePolicies(data: any) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Convertir cada sección de objetos {title, content} a HTML
    const section_1 = data.section_1 ? combineSection(data.section_1) : null;
    const section_2 = data.section_2 ? combineSection(data.section_2) : null;
    const section_3 = data.section_3 ? combineSection(data.section_3) : null;
    const section_4 = data.section_4 ? combineSection(data.section_4) : null;
    const section_5 = data.section_5 ? combineSection(data.section_5) : null;
    const section_6 = data.section_6 ? combineSection(data.section_6) : null;
    const section_7 = data.section_7 ? combineSection(data.section_7) : null;
    const section_8 = data.section_8 ? combineSection(data.section_8) : null;
    const section_9 = data.section_9 ? combineSection(data.section_9) : null;
    const section_10 = data.section_10 ? combineSection(data.section_10) : null;

    // Usar UPSERT (INSERT ... ON CONFLICT)
    await sql`
      INSERT INTO policies (
        id, section_1, section_2, section_3, section_4, section_5,
        section_6, section_7, section_8, section_9, section_10
      )
      VALUES (
        1, ${section_1}, ${section_2}, ${section_3}, ${section_4}, ${section_5},
        ${section_6}, ${section_7}, ${section_8}, ${section_9}, ${section_10}
      )
      ON CONFLICT (id)
      DO UPDATE SET
        section_1 = ${section_1},
        section_2 = ${section_2},
        section_3 = ${section_3},
        section_4 = ${section_4},
        section_5 = ${section_5},
        section_6 = ${section_6},
        section_7 = ${section_7},
        section_8 = ${section_8},
        section_9 = ${section_9},
        section_10 = ${section_10},
        updated_at = CURRENT_TIMESTAMP
    `;
    
    revalidatePath('/dashboard/policies');
    return { success: true, message: 'Políticas actualizadas exitosamente' };
  } catch (error) {
    console.error('Error updating policies:', error);
    return { success: false, error: 'Error al actualizar las políticas' };
  }
}
