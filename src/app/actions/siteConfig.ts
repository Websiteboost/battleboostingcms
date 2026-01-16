'use server';

import { sql } from "@/lib/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const siteConfigSchema = z.object({
  logo_text: z.string().min(1, { message: "El texto del logo es requerido" }),
  home_title: z.string().min(1, { message: "El título es requerido" }),
  home_subtitle: z.string().min(1, { message: "El subtítulo es requerido" }),
  home_categories: z.array(z.string()).min(1, { message: "Debe haber al menos una categoría" }),
  accordion_title: z.string().min(1, { message: "El título del acordeón es requerido" }),
  footer_payment_title: z.string().min(1, { message: "El título de pago es requerido" }),
  footer_copyright: z.string().min(1, { message: "El copyright es requerido" }),
  disclaimer: z.string().min(1, { message: "El disclaimer es requerido" }),
  discord_link: z.string().optional(),
  discord_work_us: z.string().optional(),
  payment_disclaimer: z.string().optional(),
});

export async function getSiteConfig() {
  try {
    const result = await sql`
      SELECT * FROM site_config WHERE id = 1
    `;
    return { success: true, data: result[0] || null };
  } catch (error) {
    console.error('Error fetching site config:', error);
    return { success: false, error: 'Error al obtener la configuración' };
  }
}

export async function updateSiteConfig(data: z.infer<typeof siteConfigSchema>) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  const validatedFields = siteConfigSchema.safeParse(data);
  if (!validatedFields.success) {
    return { success: false, error: 'Datos inválidos' };
  }

  const { logo_text, home_title, home_subtitle, home_categories, accordion_title, footer_payment_title, footer_copyright, disclaimer, discord_link, discord_work_us, payment_disclaimer } = validatedFields.data;

  try {
    // Usar UPSERT (INSERT ... ON CONFLICT)
    await sql`
      INSERT INTO site_config (id, logo_text, home_title, home_subtitle, home_categories, accordion_title, footer_payment_title, footer_copyright, disclaimer, discord_link, discord_work_us, payment_disclaimer)
      VALUES (1, ${logo_text}, ${home_title}, ${home_subtitle}, ${home_categories}, ${accordion_title}, ${footer_payment_title}, ${footer_copyright}, ${disclaimer}, ${discord_link}, ${discord_work_us}, ${payment_disclaimer})
      ON CONFLICT (id)
      DO UPDATE SET
        logo_text = ${logo_text},
        home_title = ${home_title},
        home_subtitle = ${home_subtitle},
        home_categories = ${home_categories},
        accordion_title = ${accordion_title},
        footer_payment_title = ${footer_payment_title},
        footer_copyright = ${footer_copyright},
        disclaimer = ${disclaimer},
        discord_link = ${discord_link},
        discord_work_us = ${discord_work_us},
        payment_disclaimer = ${payment_disclaimer},
        updated_at = CURRENT_TIMESTAMP
    `;
    
    revalidatePath('/dashboard');
    return { success: true, message: 'Configuración actualizada exitosamente' };
  } catch (error) {
    console.error('Error updating site config:', error);
    return { success: false, error: 'Error al actualizar la configuración' };
  }
}
