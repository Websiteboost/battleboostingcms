'use server';

import { sql } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import bcrypt from 'bcryptjs';
import { revalidatePath } from 'next/cache';

export async function getUsers() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const users = await sql`
      SELECT id, email, role, created_at 
      FROM users 
      ORDER BY created_at DESC
    `;
    
    return { success: true, data: users };
  } catch (error) {
    console.error('Error fetching users:', error);
    return { success: false, error: 'Error al obtener usuarios' };
  }
}

export async function updateUserEmail(userId: string, newEmail: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return { success: false, error: 'Email inválido' };
    }

    // Verificar si el email ya existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${newEmail} AND id != ${userId}
    `;

    if (existingUser.length > 0) {
      return { success: false, error: 'Este email ya está en uso' };
    }

    // Actualizar email
    await sql`
      UPDATE users 
      SET email = ${newEmail}
      WHERE id = ${userId}
    `;

    revalidatePath('/dashboard/cuenta');
    return { success: true, message: 'Email actualizado exitosamente' };
  } catch (error) {
    console.error('Error updating email:', error);
    return { success: false, error: 'Error al actualizar email' };
  }
}

export async function updateUserPassword(userId: string, newPassword: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Validar contraseña
    if (newPassword.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // Hash de la contraseña con bcrypt (compatible con login)
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await sql`
      UPDATE users 
      SET password_hash = ${hashedPassword}
      WHERE id = ${userId}
    `;

    revalidatePath('/dashboard/cuenta');
    return { success: true, message: 'Contraseña actualizada exitosamente' };
  } catch (error) {
    console.error('Error updating password:', error);
    return { success: false, error: 'Error al actualizar contraseña' };
  }
}

export async function createUser(email: string, password: string, role: 'admin' | 'user') {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Validar email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { success: false, error: 'Email inválido' };
    }

    // Validar contraseña
    if (password.length < 6) {
      return { success: false, error: 'La contraseña debe tener al menos 6 caracteres' };
    }

    // Verificar si el email ya existe
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email}
    `;

    if (existingUser.length > 0) {
      return { success: false, error: 'Este email ya está en uso' };
    }

    // Hash de la contraseña con bcrypt (compatible con login)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generar ID único corto (máx 21 caracteres para VARCHAR(21))
    // Formato: u_timestamp_random (ej: u_1737504_a3f9x2)
    const timestamp = Date.now().toString().slice(-7); // últimos 7 dígitos
    const random = Math.random().toString(36).substring(2, 8); // 6 caracteres
    const userId = `u_${timestamp}_${random}`; // Total: ~16 caracteres

    // Crear usuario
    await sql`
      INSERT INTO users (id, email, password_hash, role)
      VALUES (${userId}, ${email}, ${hashedPassword}, ${role})
    `;

    revalidatePath('/dashboard/cuenta');
    return { success: true, message: 'Usuario creado exitosamente' };
  } catch (error) {
    console.error('Error creating user:', error);
    return { success: false, error: 'Error al crear usuario' };
  }
}
