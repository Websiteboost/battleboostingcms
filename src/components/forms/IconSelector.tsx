'use client';

import { useState, memo } from 'react';
import * as Icons from 'lucide-react';

const AVAILABLE_ICONS = [
  // Gaming & Competitivo
  'Zap',
  'Trophy',
  'Award',
  'Shield',
  'Swords',
  'Sword',
  'Target',
  'Crown',
  'Flame',
  'Sparkles',
  'Star',
  'Rocket',
  'Gamepad2',
  'Dice1',
  'Dice2',
  'Dice3',
  'Dice4',
  'Dice5',
  'Dice6',
  
  // Usuarios & Social
  'Users',
  'User',
  'UserPlus',
  'UserCheck',
  'UsersRound',
  'Heart',
  'MessageCircle',
  'MessageSquare',
  
  // Acciones & Progreso
  'TrendingUp',
  'BarChart',
  'Activity',
  'Zap',
  'Bolt',
  'CircuitBoard',
  'Cpu',
  'HardDrive',
  
  // Dinero & Comercio
  'DollarSign',
  'CreditCard',
  'Wallet',
  'ShoppingCart',
  'Gift',
  'Package',
  'Box',
  
  // Velocidad & Potencia
  'FastForward',
  'Gauge',
  'Fuel',
  'Power',
  'Battery',
  'BatteryCharging',
  'Zap',
  
  // Seguridad & Premium
  'Lock',
  'Unlock',
  'Key',
  'ShieldCheck',
  'ShieldAlert',
  'BadgeCheck',
  'VerifiedIcon',
  
  // Diseño & Creatividad
  'Palette',
  'Brush',
  'Wand2',
  'Sparkles',
  'Stars',
  'Eye',
  
  // Comunicación
  'Bell',
  'BellRing',
  'Mail',
  'Send',
  'Phone',
  'Headphones',
  
  // Tiempo & Velocidad
  'Clock',
  'Timer',
  'Hourglass',
  'Repeat',
  'RotateCw',
  'RefreshCw',
  
  // Otros relevantes
  'Flag',
  'Mountain',
  'Compass',
  'Map',
  'Navigation',
  'Bookmark',
  'Tag',
  'Layers',
  'Grid',
  'Hexagon',
  'Octagon',
  'Pentagon',
] as const;

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export const IconSelector = memo(({ value, onChange, label = 'Icono' }: IconSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
  };

  const SelectedIcon = value ? (Icons as any)[value] : null;

  return (
    <div className="w-full relative">
      <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5 sm:mb-2">
        {label}
      </label>
      
      {/* Botón selector */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800/50 border border-cyber-purple/30 rounded-lg text-sm sm:text-base text-white hover:border-cyber-purple focus:outline-none focus:border-cyber-purple focus:ring-2 focus:ring-cyber-purple/50 transition-colors flex items-center justify-between"
      >
        <div className="flex items-center gap-2">
          {SelectedIcon ? (
            <>
              <SelectedIcon size={20} className="text-cyber-purple" />
              <span>{value}</span>
            </>
          ) : (
            <span className="text-gray-400">Selecciona un icono...</span>
          )}
        </div>
        <Icons.ChevronDown 
          size={16} 
          className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {/* Dropdown de iconos */}
      {isOpen && (
        <div className="absolute z-50 mt-2 w-full max-w-2xl bg-slate-800 border border-cyber-purple/50 rounded-lg shadow-xl p-3 max-h-96 overflow-y-auto">
          <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
            {AVAILABLE_ICONS.map((iconName) => {
              const IconComponent = (Icons as any)[iconName];
              const isSelected = value === iconName;
              
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => handleSelect(iconName)}
                  className={`p-3 rounded-lg border transition-all hover:scale-105 flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple'
                      : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-cyber-purple/50 hover:text-white'
                  }`}
                >
                  <IconComponent size={24} />
                  <span className="text-xs truncate w-full text-center">{iconName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Overlay para cerrar */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
});

IconSelector.displayName = 'IconSelector';
