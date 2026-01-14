'use client';

import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import toast from 'react-hot-toast';

/**
 * Hook para manejar errores de autenticación de forma centralizada
 */
export function useAuthErrorHandler() {
  const router = useRouter();

  const handleError = useCallback((error: any) => {
    // Detectar errores de autenticación
    if (
      error?.message?.includes('No autorizado') ||
      error?.message?.includes('sesión') ||
      error?.message?.includes('autenticación') ||
      error?.error?.includes('No autorizado')
    ) {
      toast.error('Tu sesión ha expirado. Redirigiendo al login...', {
        duration: 3000,
        position: 'top-center',
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(239, 68, 68, 0.5)',
        },
      });

      setTimeout(() => {
        router.push('/login');
      }, 500);
      
      return true; // Indica que se manejó el error de auth
    }
    
    return false; // No es un error de auth
  }, [router]);

  return { handleError };
}
