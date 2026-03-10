'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import type { SelectorsConfig, SelectorOption } from '@/types/priceComponents';

interface SelectorsEditorProps {
  config: SelectorsConfig;
  onChange: (config: SelectorsConfig) => void;
}

export const SelectorsEditor = memo(({ config, onChange }: SelectorsEditorProps) => {
  const selectors = Object.entries(config);

  const addSelector = () => {
    const newKey = `Nuevo Selector ${selectors.length + 1}`;
    onChange({ ...config, [newKey]: [{ label: '', value: 0 }] });
  };

  const updateSelectorTitle = (oldTitle: string, newTitle: string) => {
    const newConfig = { ...config };
    newConfig[newTitle] = newConfig[oldTitle];
    delete newConfig[oldTitle];
    onChange(newConfig);
  };

  const updateSelectorOptions = (title: string, options: SelectorOption[]) => {
    onChange({ ...config, [title]: options });
  };

  const removeSelector = (title: string) => {
    const newConfig = { ...config };
    delete newConfig[title];
    onChange(newConfig);
  };

  const addOptionToSelector = (title: string) => {
    updateSelectorOptions(title, [...config[title], { label: '', value: 0 }]);
  };

  const updateOption = (title: string, index: number, option: SelectorOption) => {
    const newOptions = [...config[title]];
    newOptions[index] = option;
    updateSelectorOptions(title, newOptions);
  };

  const removeOption = (title: string, index: number) => {
    updateSelectorOptions(title, config[title].filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-cyber-pink/30">
      <h4 className="text-sm font-medium text-cyber-pink">Selectores Personalizados (Dropdowns)</h4>

      {selectors.map(([title, options], selectorIndex) => (
        <div key={selectorIndex} className="space-y-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className="flex gap-2 items-end">
            <Input
              label="Título del Selector"
              value={title}
              onChange={(e) => updateSelectorTitle(title, e.target.value)}
              placeholder="Ej: Choose Difficulty"
              className="flex-1"
            />
            {selectors.length > 1 && (
              <Button type="button" variant="danger" onClick={() => removeSelector(title)} className="px-3!">
                <Trash2 size={16} />
              </Button>
            )}
          </div>

          {options.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                label={`Opción ${index + 1}`}
                value={option.label}
                onChange={(e) => updateOption(title, index, { ...option, label: e.target.value })}
                placeholder="Ej: Beginner"
                className="flex-1"
              />
              <Input
                label="Precio"
                type="number"
                step="0.01"
                value={option.value}
                onChange={(e) => updateOption(title, index, { ...option, value: parseFloat(e.target.value) || 0 })}
                className="w-24"
              />
              {options.length > 1 && (
                <Button type="button" variant="danger" onClick={() => removeOption(title, index)} className="px-3! self-end">
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}

          <Button type="button" variant="secondary" onClick={() => addOptionToSelector(title)} className="w-full text-sm">
            + Agregar Opción
          </Button>
        </div>
      ))}

      <Button type="button" variant="secondary" onClick={addSelector} className="w-full">
        + Agregar Selector
      </Button>
    </div>
  );
});

SelectorsEditor.displayName = 'SelectorsEditor';
