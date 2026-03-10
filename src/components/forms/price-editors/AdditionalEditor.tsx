'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import type { AdditionalConfig, AdditionalOption } from '@/types/priceComponents';

interface AdditionalEditorProps {
  config: AdditionalConfig;
  onChange: (config: AdditionalConfig) => void;
}

export const AdditionalEditor = memo(({ config, onChange }: AdditionalEditorProps) => {
  const title = config.title || 'Servicios Adicionales (Checkboxes)';
  const options = Object.entries(config)
    .filter(([key]) => key !== 'title')
    .filter((entry): entry is [string, AdditionalOption] => {
      const [, value] = entry;
      return typeof value === 'object' && value !== null && 'type' in value;
    });

  const updateTitle = (newTitle: string) => onChange({ ...config, title: newTitle });

  const addOption = () => {
    const newKey = `addOption${options.length + 1}`;
    onChange({ ...config, [newKey]: { type: 'checkbox', value: 0, label: '' } });
  };

  const updateOption = (key: string, value: number, label: string) => {
    onChange({ ...config, [key]: { type: 'checkbox', value, label } });
  };

  const removeOption = (key: string) => {
    const newConfig = { ...config };
    delete newConfig[key];
    onChange(newConfig);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-cyber-green/30">
      <Input
        label="Título del Componente"
        value={title}
        onChange={(e) => updateTitle(e.target.value)}
        placeholder="Ej: Servicios Premium, Extras Disponibles, etc."
        className="mb-2"
      />

      <div className="border-t border-slate-700 pt-3">
        <h4 className="text-xs font-medium text-gray-400 mb-3">Opciones del Componente</h4>

        {options.map(([key, option]) => (
          <div key={key} className="flex gap-2">
            <Input
              label="Descripción"
              value={option.label}
              onChange={(e) => updateOption(key, option.value, e.target.value)}
              placeholder="Ej: Priority Queue"
              className="flex-1"
            />
            <Input
              label="Precio Extra"
              type="number"
              step="0.01"
              value={option.value}
              onChange={(e) => updateOption(key, parseFloat(e.target.value) || 0, option.label)}
              className="w-28"
            />
            {options.length > 1 && (
              <Button type="button" variant="danger" onClick={() => removeOption(key)} className="px-3! self-end">
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ))}

        <Button type="button" variant="secondary" onClick={addOption} className="w-full">
          + Agregar Servicio Adicional
        </Button>
      </div>
    </div>
  );
});

AdditionalEditor.displayName = 'AdditionalEditor';
