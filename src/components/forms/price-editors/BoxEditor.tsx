'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import type { BoxConfig, BoxOption } from '@/types/priceComponents';

interface BoxEditorProps {
  config: BoxConfig;
  onChange: (config: BoxConfig) => void;
  configEs?: Record<string, any> | null;
  onChangeEs?: (configEs: any) => void;
}

export const BoxEditor = memo(({ config, onChange, configEs, onChangeEs }: BoxEditorProps) => {
  const showPrice = config.showPrice !== false; // default true
  const style = config.style || 'box';

  const addOption = () => {
    onChange({ ...config, options: [...config.options, { label: '', value: 0 }] });
  };

  const updateOption = (index: number, option: BoxOption) => {
    const newOptions = [...config.options];
    newOptions[index] = option;
    onChange({ ...config, options: newOptions });
  };

  const removeOption = (index: number) => {
    onChange({ ...config, options: config.options.filter((_, i) => i !== index) });
  };

  const updateOptionLabelEs = (index: number, label: string) => {
    const newOpts = [...(configEs?.options || config.options.map(() => ({})))];
    newOpts[index] = { ...newOpts[index], label };
    onChangeEs?.({ ...(configEs || {}), options: newOpts });
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-cyber-cyan/30">
      <h4 className="text-sm font-medium text-cyber-cyan">Cajas de Precio (Selección Múltiple)</h4>

      {/* Opciones visuales */}
      <div className="flex flex-wrap gap-4 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Estilo visual</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onChange({ ...config, style: 'box' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                style === 'box' ? 'bg-cyber-cyan text-slate-900' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Caja
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...config, style: 'pill' })}
              className={`px-3 py-1.5 text-xs font-medium rounded-full transition-colors ${
                style === 'pill' ? 'bg-cyber-cyan text-slate-900' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Píldora
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-xs text-gray-400 font-medium">Mostrar precio</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onChange({ ...config, showPrice: true })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                showPrice ? 'bg-cyber-cyan text-slate-900' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Visible
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...config, showPrice: false })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                !showPrice ? 'bg-slate-500 text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Oculto
            </button>
          </div>
        </div>
      </div>

      {/* Opciones */}
      {config.options.map((option, index) => (
        <div key={index} className="space-y-1.5">
          <div className="flex gap-2">
            <Input
              label={`Opción ${index + 1} - Etiqueta`}
              value={option.label}
              onChange={(e) => updateOption(index, { ...option, label: e.target.value })}
              placeholder="Ej: Basic, Standard"
              className="flex-1"
            />
            <Input
              label="Precio"
              type="number"
              step="0.01"
              value={option.value}
              onChange={(e) => updateOption(index, { ...option, value: parseFloat(e.target.value) || 0 })}
              className="w-24"
            />
            {config.options.length > 1 && (
              <Button type="button" variant="danger" onClick={() => removeOption(index)} className="px-3! self-end">
                <Trash2 size={16} />
              </Button>
            )}
          </div>
          <Input
            label={<>Etiqueta <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
            value={configEs?.options?.[index]?.label ?? ''}
            onChange={(e) => updateOptionLabelEs(index, e.target.value)}
            placeholder={`Opción ${index + 1} en español`}
            className="border-amber-500/40 focus:border-amber-400"
          />
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={addOption} className="w-full">
        + Agregar Opción
      </Button>
    </div>
  );
});

BoxEditor.displayName = 'BoxEditor';
