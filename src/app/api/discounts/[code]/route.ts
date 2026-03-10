import { NextResponse } from 'next/server';
import { sql } from '@/lib/db';

export async function GET(_req: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;

  if (!code || typeof code !== 'string') {
    return NextResponse.json({ error: 'Código inválido' }, { status: 400 });
  }

  const upperCode = code.toUpperCase().trim();

  try {
    const rows = await sql`
      SELECT id, code, discount_type, discount_value, active, expires_at
      FROM discount_codes
      WHERE code = ${upperCode}
        AND active = true
        AND (expires_at IS NULL OR expires_at > NOW())
      LIMIT 1
    `;

    if (rows.length === 0) {
      return NextResponse.json({ error: 'Código no encontrado, inactivo o expirado' }, { status: 404 });
    }

    const discount = rows[0];

    return NextResponse.json({
      code: discount.code,
      discount_type: discount.discount_type,
      discount_value: Number(discount.discount_value),
      expires_at: discount.expires_at ?? null,
    });
  } catch (error) {
    console.error('Error fetching discount:', error);
    return NextResponse.json({ error: 'Error interno del servidor' }, { status: 500 });
  }
}
