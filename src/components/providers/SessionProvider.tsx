'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export function SessionMonitor({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const hasShownToast = useRef(false);
  const previousStatus = useRef(status);
  const isInitialLoad = useRef(true);

  useEffect(() => {
    console.log('🔍 SessionMonitor - Status:', status, 'Previous:', previousStatus.current, 'Session:', !!session);
    
    // Si el estado cambió de authenticated a unauthenticated
    if (previousStatus.current === 'authenticated' && status === 'unauthenticated') {
      console.log('❌ Sesión expirada detectada');
      if (!hasShownToast.current) {
        hasShownToast.current = true;
        toast.error('Tu sesión ha expirado. Por favor, inicia sesión nuevamente.', {
          duration: 4000,
          position: 'top-center',
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.5)',
          },
        });
        
        // Redirigir al login después de un breve delay
        setTimeout(() => {
          router.push('/login');
        }, 500);
      }
    }

    // Solo redirigir si no es la carga inicial y después de que loading haya terminado
    if (status === 'unauthenticated' && previousStatus.current === 'loading' && !isInitialLoad.current) {
      console.log('⚠️ No autenticado después de cargar');
      if (!hasShownToast.current && window.location.pathname !== '/login') {
        hasShownToast.current = true;
        router.push('/login');
      }
    }

    if (isInitialLoad.current && status !== 'loading') {
      isInitialLoad.current = false;
    }

    previousStatus.current = status;
  }, [status, router, session]);

  // Reset del flag cuando vuelve a estar autenticado
  useEffect(() => {
    if (status === 'authenticated') {
      hasShownToast.current = false;
    }
  }, [status]);

  return <>{children}</>;
}
