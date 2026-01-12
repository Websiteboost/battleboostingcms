'use server';

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { put, del, list } from '@vercel/blob';
import { revalidatePath } from "next/cache";

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

    const blob = await put(file.name, file, {
      access: 'public',
    });

    revalidatePath('/dashboard/images');
    return { success: true, data: { url: blob.url, filename: file.name } };
  } catch (error) {
    console.error('Error uploading image:', error);
    return { success: false, error: 'Error al subir la imagen' };
  }
}

export async function deleteImage(url: string) {
  const session = await getServerSession(authOptions);
  if (!session || (session.user as any).role !== 'admin') {
    return { success: false, error: 'No autorizado' };
  }

  try {
    await del(url);
    revalidatePath('/dashboard/images');
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
