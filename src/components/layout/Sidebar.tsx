'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Gamepad2, 
  Folder, 
  Package, 
  Image,
  LogOut,
  X,
  Settings,
  HelpCircle
} from 'lucide-react';
import { signOut } from 'next-auth/react';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Juegos', href: '/dashboard/games', icon: Gamepad2 },
  { name: 'Categorías', href: '/dashboard/categories', icon: Folder },
  { name: 'Servicios', href: '/dashboard/services', icon: Package },
  { name: 'FAQ', href: '/dashboard/accordion', icon: HelpCircle },
  { name: 'Imágenes', href: '/dashboard/images', icon: Image },
  { name: 'Configuración', href: '/dashboard/config', icon: Settings },
];

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return (
    <>
      {/* Overlay para mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={`
          fixed lg:static inset-y-0 left-0 z-50
          w-72 h-screen
          bg-slate-950/95 lg:bg-transparent
          backdrop-blur-lg lg:backdrop-blur-none
          border-r border-cyber-purple/20
          flex flex-col
          transform transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Logo */}
        <div className="p-4 lg:p-6 border-b border-cyber-purple/20 flex items-center justify-between">
          <h1 className="text-xl lg:text-2xl font-bold bg-linear-to-r from-cyber-purple to-cyber-pink bg-clip-text text-transparent">
            BattleBoost CMS
          </h1>
          <button
            onClick={onClose}
            className="lg:hidden text-gray-400 hover:text-white transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 lg:p-4 space-y-1 lg:space-y-2 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg
                  transition-all duration-200
                  ${isActive 
                    ? 'bg-cyber-purple/20 border-l-4 border-cyber-purple text-white shadow-neon' 
                    : 'text-gray-400 hover:text-white hover:bg-cyber-purple/10'
                  }
                `}
              >
                <Icon size={20} />
                <span className="font-medium text-sm lg:text-base">{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 lg:p-4 border-t border-cyber-purple/20">
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="flex items-center gap-3 px-3 lg:px-4 py-2.5 lg:py-3 rounded-lg w-full text-gray-400 hover:text-white hover:bg-red-600/20 transition-all duration-200"
          >
            <LogOut size={20} />
            <span className="font-medium text-sm lg:text-base">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
}
