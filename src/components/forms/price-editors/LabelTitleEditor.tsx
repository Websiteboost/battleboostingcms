'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/Input';
import type { LabelTitleConfig } from '@/types/priceComponents';

interface LabelTitleEditorProps {
  config: LabelTitleConfig;
  onChange: (config: LabelTitleConfig) => void;
  configEs?: Record<string, any> | null;
  onChangeEs?: (configEs: any) => void;
}

export const LabelTitleEditor = memo(({ config, onChange, configEs, onChangeEs }: LabelTitleEditorProps) => {
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
      <Input
        label={<>Título del Separador <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
        value={configEs?.title ?? ''}
        onChange={(e) => onChangeEs?.({ ...(configEs || {}), title: e.target.value })}
        placeholder="Ej: Opciones Adicionales"
        className="border-amber-500/40 focus:border-amber-400"
      />
    </div>
  );
});

LabelTitleEditor.displayName = 'LabelTitleEditor';
