'use client';

import { useState, memo, useRef, useEffect } from 'react';
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
  'Gamepad',
  'Gamepad2',
  'Joystick',
  'Dice1',
  'Dice2',
  'Dice3',
  'Dice4',
  'Dice5',
  'Dice6',
  'Crosshair',
  'Skull',
  'Ghost',
  'Bomb',
  'Axe',
  'BowArrow',
  'Castle',
  'ChessKnight',
  'ChessPawn',
  'Drama',
  'Footprints',
  'Radar',
  'Radiation',
  'Siren',
  'Wand',
  'Shuffle',
  'MonitorPlay',
  'PlayCircle',
  'Workflow',

  // Usuarios & Social
  'Users',
  'User',
  'UserPlus',
  'UserCheck',
  'UsersRound',
  'Heart',
  'MessageCircle',
  'MessageSquare',
  'ThumbsUp',
  'Smile',
  'PersonStanding',
  'Share2',
  'HandshakeIcon',

  // Acciones & Progreso
  'TrendingUp',
  'BarChart',
  'Activity',
  'CircuitBoard',
  'Cpu',
  'HardDrive',
  'ArrowUp',
  'ArrowUpRight',
  'ChevronsUp',
  'CheckCheck',
  'ListChecks',
  'CircleCheck',
  'Focus',
  'Scan',
  'ScanLine',

  // Dinero & Comercio
  'DollarSign',
  'CreditCard',
  'Wallet',
  'ShoppingCart',
  'Gift',
  'Package',
  'Box',
  'Gem',
  'Coins',
  'Banknote',
  'Percent',
  'BadgePlus',
  'BadgeMinus',
  'BadgeDollarSign',

  // Velocidad & Potencia
  'FastForward',
  'Gauge',
  'Fuel',
  'Power',
  'Battery',
  'BatteryCharging',
  'CloudLightning',
  'Dumbbell',
  'Infinity',
  'Tornado',

  // Seguridad & Premium
  'Lock',
  'Unlock',
  'Key',
  'ShieldCheck',
  'ShieldAlert',
  'BadgeCheck',
  'Fingerprint',
  'Signal',

  // Diseño & Creatividad
  'Palette',
  'Brush',
  'Wand2',
  'Stars',
  'Eye',
  'Diamond',
  'Spade',
  'Lightbulb',

  // Comunicación & Streaming
  'Bell',
  'BellRing',
  'Mail',
  'Send',
  'Phone',
  'Headphones',
  'Mic',
  'Video',
  'Tv',
  'Camera',
  'Music',
  'Volume2',
  'Radio',

  // Tech & Conectividad
  'Monitor',
  'Globe',
  'Wifi',
  'Server',
  'Cloud',
  'Bot',
  'Hash',
  'Settings',
  'Settings2',
  'SlidersHorizontal',
  'Wrench',
  'MousePointer2',
  'Laptop',
  'Smartphone',

  // Tiempo & Velocidad
  'Clock',
  'Timer',
  'Hourglass',
  'Repeat',
  'RotateCw',
  'RefreshCw',

  // Logros & Aprendizaje
  'Medal',
  'GraduationCap',
  'ExternalLink',
  'Download',
  'Upload',

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
  'Sun',
  'Moon',
  'CloudSun',
] as const;

interface IconSelectorProps {
  value: string;
  onChange: (iconName: string) => void;
  label?: string;
}

export const IconSelector = memo(({ value, onChange, label = 'Icono' }: IconSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleSelect = (iconName: string) => {
    onChange(iconName);
    setIsOpen(false);
  };

  const SelectedIcon = value ? (Icons as any)[value] : null;

  return (
    <div ref={containerRef} className="w-full">
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

      {/* Panel de iconos — inline en el flujo para no salirse del contenedor */}
      {isOpen && (
        <div className="mt-2 w-full bg-slate-800 border border-cyber-purple/50 rounded-lg shadow-xl p-3 max-h-72 overflow-y-auto">
          <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
            {AVAILABLE_ICONS.map((iconName) => {
              const IconComponent = (Icons as any)[iconName];
              const isSelected = value === iconName;
              
              return (
                <button
                  key={iconName}
                  type="button"
                  onClick={() => handleSelect(iconName)}
                  className={`p-2 rounded-lg border transition-all hover:scale-105 flex flex-col items-center gap-1 ${
                    isSelected
                      ? 'bg-cyber-purple/20 border-cyber-purple text-cyber-purple'
                      : 'bg-slate-700/50 border-slate-600 text-gray-300 hover:border-cyber-purple/50 hover:text-white'
                  }`}
                >
                  <IconComponent size={20} />
                  <span className="text-[10px] truncate w-full text-center">{iconName}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
});

IconSelector.displayName = 'IconSelector';
