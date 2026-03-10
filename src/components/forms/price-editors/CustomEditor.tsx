'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import type { CustomConfig } from '@/types/priceComponents';

interface CustomEditorProps {
  config: CustomConfig;
  onChange: (config: CustomConfig) => void;
}

export const CustomEditor = memo(({ config, onChange }: CustomEditorProps) => {
  const presets = config.presets || [];

  const addPreset = () => onChange({ ...config, presets: [...presets, 0] });

  const updatePreset = (index: number, value: number) => {
    const newPresets = [...presets];
    newPresets[index] = value;
    onChange({ ...config, presets: newPresets });
  };

  const removePreset = (index: number) => {
    onChange({ ...config, presets: presets.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-purple-500/30">
      <h4 className="text-sm font-medium text-purple-400">Input de Precio Personalizado</h4>

      <Input
        label="Etiqueta"
        value={config.label}
        onChange={(e) => onChange({ ...config, label: e.target.value })}
        placeholder="Ej: Select Amount"
        required
      />

      <div className="space-y-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-200">
          Valores Preset (opcional)
        </label>
        {presets.map((preset, index) => (
          <div key={index} className="flex gap-2">
            <Input
              type="number"
              step="0.01"
              value={preset}
              onChange={(e) => updatePreset(index, parseFloat(e.target.value) || 0)}
              placeholder="Precio"
              className="flex-1"
            />
            <Button type="button" variant="danger" onClick={() => removePreset(index)} className="px-3!">
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        <Button type="button" variant="secondary" onClick={addPreset} className="w-full">
          + Agregar Preset
        </Button>
      </div>
    </div>
  );
});

CustomEditor.displayName = 'CustomEditor';
