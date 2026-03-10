'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import type { BoxTitleConfig, BoxTitleOption } from '@/types/priceComponents';

interface BoxTitleEditorProps {
  config: BoxTitleConfig;
  onChange: (config: BoxTitleConfig) => void;
}

export const BoxTitleEditor = memo(({ config, onChange }: BoxTitleEditorProps) => {
  const addOption = () => onChange({ options: [...config.options, { label: '', value: '' }] });

  const updateOption = (index: number, option: BoxTitleOption) => {
    const newOptions = [...config.options];
    newOptions[index] = option;
    onChange({ options: newOptions });
  };

  const removeOption = (index: number) => {
    onChange({ options: config.options.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-blue-500/30">
      <h4 className="text-sm font-medium text-blue-400">Cajas con Título y Datos</h4>
      <p className="text-xs text-gray-400">Muestra información sin valor numérico</p>
      <div className="p-2 bg-blue-500/10 border border-blue-500/30 rounded text-xs text-gray-300">
        ℹ️ Si el texto es corto, la caja será pequeña. Si es largo, su tamaño por defecto se dobla.
      </div>

      {config.options.map((option, index) => (
        <div key={index} className="flex gap-2">
          <Input
            label="Título"
            value={option.label}
            onChange={(e) => updateOption(index, { ...option, label: e.target.value })}
            placeholder="Ej: Feature 1"
            className="flex-1"
            required
          />
          <Input
            label="Datos/Información"
            value={option.value}
            onChange={(e) => updateOption(index, { ...option, value: e.target.value })}
            placeholder="Ej: Includes XYZ"
            className="flex-1"
            required
          />
          <Button type="button" variant="danger" onClick={() => removeOption(index)} className="px-3! self-end">
            <Trash2 size={16} />
          </Button>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={addOption} className="w-full">
        + Agregar Opción
      </Button>
    </div>
  );
});

BoxTitleEditor.displayName = 'BoxTitleEditor';
