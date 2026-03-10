'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/Input';
import type { LabelTitleConfig } from '@/types/priceComponents';

interface LabelTitleEditorProps {
  config: LabelTitleConfig;
  onChange: (config: LabelTitleConfig) => void;
}

export const LabelTitleEditor = memo(({ config, onChange }: LabelTitleEditorProps) => {
  return (
    <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-yellow-500/30">
      <h4 className="text-sm font-medium text-yellow-400">Separador de Sección</h4>
      <p className="text-xs text-gray-400">Muestra un título como divisor visual entre opciones</p>

      <Input
        label="Título del Separador"
        value={config.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Ej: Additional Options"
        required
      />
    </div>
  );
});

LabelTitleEditor.displayName = 'LabelTitleEditor';
