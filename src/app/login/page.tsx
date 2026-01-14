'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import toast, { Toaster } from 'react-hot-toast';

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Credenciales inválidas');
        toast.error('Credenciales inválidas', {
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(239, 68, 68, 0.5)',
          },
        });
      } else {
        toast.success('¡Bienvenido de vuelta!', {
          duration: 2000,
          style: {
            background: '#1e293b',
            color: '#fff',
            border: '1px solid rgba(139, 92, 246, 0.5)',
          },
        });
        
        setTimeout(() => {
          router.push('/dashboard');
          router.refresh();
        }, 500);
      }
    } catch (error) {
      setError('Error al iniciar sesión');
      toast.error('Error al iniciar sesión', {
        style: {
          background: '#1e293b',
          color: '#fff',
          border: '1px solid rgba(239, 68, 68, 0.5)',
        },
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 sm:p-6">
      <Toaster position="top-center" />
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-3xl sm:text-4xl font-bold neon-text mb-2">
            BattleBoost CMS
          </h1>
          <p className="text-sm sm:text-base text-gray-400">Gestor de Contenido</p>
        </div>

        {/* Login Form */}
        <div className="glass-effect rounded-xl p-6 sm:p-8 shadow-neon">
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            <Input
              type="email"
              label="Email"
              placeholder="admin@battleboost.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            <Input
              type="password"
              label="Contraseña"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />

            {error && (
              <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
            </Button>
          </form>
        </div>

        {/* Info */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Solo usuarios administradores pueden acceder
        </p>
      </div>
    </div>
  );
}
