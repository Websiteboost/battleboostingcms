'use client';

import { Sidebar } from '@/components/layout/Sidebar';
import { Menu, LogOut } from 'lucide-react';
import { useState } from 'react';
import { signOut } from 'next-auth/react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      
      <div className="flex-1 flex flex-col min-h-screen">
        {/* Header Mobile */}
        <header className="lg:hidden sticky top-0 z-30 bg-slate-950/95 backdrop-blur-lg border-b border-cyber-purple/20 px-4 py-3">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="text-gray-400 hover:text-white transition-colors p-2"
              aria-label="Abrir menú"
            >
              <Menu size={24} />
            </button>
            <h1 className="text-lg font-bold bg-linear-to-r from-cyber-purple to-cyber-pink bg-clip-text text-transparent">
              BattleBoost
            </h1>
            <button
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="text-gray-400 hover:text-red-400 transition-colors p-2"
              aria-label="Cerrar sesión"
              title="Cerrar sesión"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
