'use server';

import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

export interface DiscountCode {
  id: string;
  code: string;
  discount_type: 'percent' | 'fixed';
  discount_value: number;
  active: boolean;
  expires_at: string | null;
  created_at: string;
}

const discountSchema = z.object({
  code: z
    .string()
    .min(3, 'El código debe tener al menos 3 caracteres')
    .max(50, 'El código no puede superar 50 caracteres')
    .regex(/^[A-Z0-9_-]+$/, 'Solo mayúsculas, números, guiones y guion bajo'),
  discount_type: z.enum(['percent', 'fixed']),
  discount_value: z
    .number()
    .positive('El valor debe ser mayor que 0')
    .max(100, 'El porcentaje no puede superar 100'),
  active: z.boolean().default(true),
  expires_at: z.string().nullable().optional(),
});

export async function getDiscounts(): Promise<{ success: boolean; data?: DiscountCode[]; error?: string }> {
  try {
    const rows = await sql`
      SELECT * FROM discount_codes ORDER BY created_at DESC
    ` as DiscountCode[];
    return { success: true, data: rows };
  } catch (error) {
    console.error('Error fetching discounts:', error);
    return { success: false, error: 'Error al obtener los descuentos' };
  }
}

export async function createDiscount(data: z.infer<typeof discountSchema>): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'No autorizado' };

  const parsed = discountSchema.safeParse(data);
  if (!parsed.success) {
    const msg = parsed.error.issues.map(i => i.message).join(', ');
    return { success: false, error: msg };
  }

  const { code, discount_type, discount_value, active, expires_at } = parsed.data;

  try {
    await sql`
      INSERT INTO discount_codes (code, discount_type, discount_value, active, expires_at)
      VALUES (${code}, ${discount_type}, ${discount_value}, ${active}, ${expires_at ?? null})
    `;
    revalidatePath('/dashboard/descuentos');
    return { success: true };
  } catch (error: any) {
    if (error?.code === '23505') return { success: false, error: 'Ya existe un código con ese nombre' };
    console.error('Error creating discount:', error);
    return { success: false, error: 'Error al crear el descuento' };
  }
}

export async function updateDiscount(id: string, data: Partial<z.infer<typeof discountSchema>>): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'No autorizado' };

  try {
    await sql`
      UPDATE discount_codes
      SET
        code         = COALESCE(${data.code ?? null}, code),
        discount_type  = COALESCE(${data.discount_type ?? null}, discount_type),
        discount_value = COALESCE(${data.discount_value ?? null}, discount_value),
        active         = COALESCE(${data.active ?? null}, active),
        expires_at     = ${data.expires_at !== undefined ? (data.expires_at ?? null) : sql`expires_at`}
      WHERE id = ${id}
    `;
    revalidatePath('/dashboard/descuentos');
    return { success: true };
  } catch (error: any) {
    if (error?.code === '23505') return { success: false, error: 'Ya existe un código con ese nombre' };
    console.error('Error updating discount:', error);
    return { success: false, error: 'Error al actualizar el descuento' };
  }
}

export async function toggleDiscountActive(id: string, active: boolean): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'No autorizado' };

  try {
    await sql`UPDATE discount_codes SET active = ${active} WHERE id = ${id}`;
    revalidatePath('/dashboard/descuentos');
    return { success: true };
  } catch (error) {
    console.error('Error toggling discount:', error);
    return { success: false, error: 'Error al actualizar el estado' };
  }
}

export async function deleteDiscount(id: string): Promise<{ success: boolean; error?: string }> {
  const session = await getServerSession(authOptions);
  if (!session) return { success: false, error: 'No autorizado' };

  try {
    await sql`DELETE FROM discount_codes WHERE id = ${id}`;
    revalidatePath('/dashboard/descuentos');
    return { success: true };
  } catch (error) {
    console.error('Error deleting discount:', error);
    return { success: false, error: 'Error al eliminar el descuento' };
  }
}
