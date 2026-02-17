'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put, del, list } from '@vercel/blob';
import { revalidatePath } from "next/cache";
import { sql } from '@/lib/db';

export async function uploadImage(formData: FormData) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    const file = formData.get('file') as File;
    
    if (!file) {
      return { success: false, error: 'No se ha proporcionado un archivo' };
    }

    // Validar tamaño del archivo (1MB = 1048576 bytes)
    const MAX_FILE_SIZE = 1024 * 1024; // 1MB
    if (file.size > MAX_FILE_SIZE) {
      return { 
        success: false, 
        error: `La imagen es demasiado grande (${(file.size / 1024 / 1024).toFixed(2)}MB). El tamaño máximo permitido es 1MB.` 
      };
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'El archivo debe ser una imagen válida' };
    }

    const blob = await put(file.name, file, {
      access: 'public',
    });

    revalidatePath('/dashboard/images');
    return { success: true, data: { url: blob.url, filename: file.name } };
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // Manejo de errores más específico
    let errorMessage = 'Error al subir la imagen';
    
    if (error instanceof Error) {
      // Error de Next.js por body excedido
      if (error.message.includes('body') && error.message.includes('1MB')) {
        errorMessage = 'La imagen excede el límite de 1MB permitido por el servidor.';
      }
      // Error de red o timeout
      else if (error.message.includes('fetch') || error.message.includes('network')) {
        errorMessage = 'Error de conexión. Por favor, intenta nuevamente.';
      }
      // Error de Vercel Blob
      else if (error.message.includes('blob') || error.message.includes('storage')) {
        errorMessage = 'Error al guardar la imagen en el almacenamiento.';
      }
      else {
        errorMessage = `Error: ${error.message}`;
      }
    }
    
    return { success: false, error: errorMessage };
  }
}

export async function deleteImage(url: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Verificar si la imagen está siendo usada por algún game o service
    const usedInGames = await sql`SELECT id, title FROM games WHERE image = ${url}`;
    const usedInServices = await sql`SELECT id, title FROM services WHERE image = ${url}`;
    
    if (usedInGames.length > 0 || usedInServices.length > 0) {
      const gamesList = usedInGames.map((g: any) => g.title).join(', ');
      const servicesList = usedInServices.map((s: any) => s.title).join(', ');
      
      let message = 'Esta imagen está siendo usada por:\n';
      if (usedInGames.length > 0) message += `\nJuegos: ${gamesList}`;
      if (usedInServices.length > 0) message += `\nServicios: ${servicesList}`;
      message += '\n\nSe eliminará la imagen y se removerán las referencias.';
      
      // Actualizar los registros para remover la imagen
      if (usedInGames.length > 0) {
        await sql`UPDATE games SET image = '' WHERE image = ${url}`;
      }
      if (usedInServices.length > 0) {
        await sql`UPDATE services SET image = '' WHERE image = ${url}`;
      }
    }
    
    // Eliminar la imagen del blob storage
    await del(url);
    revalidatePath('/dashboard/images');
    revalidatePath('/dashboard/games');
    revalidatePath('/dashboard/services');
    return { success: true, message: 'Imagen eliminada exitosamente' };
  } catch (error) {
    console.error('Error deleting image:', error);
    return { success: false, error: 'Error al eliminar la imagen' };
  }
}

export async function listImages() {
  try {
    const { blobs } = await list();
    return { success: true, data: blobs };
  } catch (error) {
    console.error('Error listing images:', error);
    return { success: false, error: 'Error al listar las imágenes' };
  }
}

export async function deleteAllImages() {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    // Listar todas las imágenes
    const { blobs } = await list();
    
    if (blobs.length === 0) {
      return { success: true, message: 'No hay imágenes para eliminar' };
    }

    // Eliminar todas las imágenes del blob storage
    const deletePromises = blobs.map(blob => del(blob.url));
    await Promise.all(deletePromises);

    // Limpiar referencias en la base de datos
    await sql`UPDATE games SET image = '' WHERE image LIKE '%blob.vercel-storage.com%'`;
    await sql`UPDATE services SET image = '' WHERE image LIKE '%blob.vercel-storage.com%'`;

    revalidatePath('/dashboard/images');
    revalidatePath('/dashboard/games');
    revalidatePath('/dashboard/services');
    
    return { success: true, message: `${blobs.length} imagen(es) eliminada(s) exitosamente` };
  } catch (error) {
    console.error('Error deleting all images:', error);
    return { success: false, error: 'Error al eliminar todas las imágenes' };
  }
}
