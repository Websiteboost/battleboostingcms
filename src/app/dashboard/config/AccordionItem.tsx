'use client';

import { type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';

interface AccordionItemProps {
  id: string;
  title: string;
  desc: string;
  icon: ReactNode;
  iconBg: string;
  children: ReactNode;
  openSections: Record<string, boolean>;
  toggle: (id: string) => void;
}

export function AccordionItem({ id, title, desc, icon, iconBg, children, openSections, toggle }: AccordionItemProps) {
  const isOpen = !!openSections[id];
  return (
    <div className="border border-slate-700/60 rounded-xl overflow-hidden bg-slate-900/40">
      <button
        type="button"
        onClick={() => toggle(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-slate-800/50 transition-colors text-left"
      >
        <div className="flex items-center gap-3">
          <div className={`p-2 rounded-lg border ${iconBg}`}>{icon}</div>
          <div>
            <p className="font-semibold text-white text-sm">{title}</p>
            <p className="text-xs text-gray-400">{desc}</p>
          </div>
        </div>
        <ChevronDown
          size={18}
          className={`text-gray-400 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>
      <div
        className={`transition-all duration-300 ease-in-out ${isOpen ? 'max-h-150 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}
      >
        <div className="overflow-y-auto max-h-150 p-4 border-t border-slate-700/40 space-y-4">
          {children}
        </div>
      </div>
    </div>
  );
}
