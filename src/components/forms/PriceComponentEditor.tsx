'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2 } from 'lucide-react';
import type { 
  BarConfig, 
  BoxConfig, 
  SelectorsConfig, 
  AdditionalConfig,
  AdditionalOption,
  CustomConfig,
  PriceComponentType,
  BoxOption,
  SelectorOption,
  BoxTitleConfig,
  BoxTitleOption,
  LabelTitleConfig
} from '@/types/priceComponents';

// ============================================================================
// BAR COMPONENT EDITOR
// ============================================================================
interface BarEditorProps {
  config: BarConfig;
  onChange: (config: BarConfig) => void;
}

export const BarEditor = memo(({ config, onChange }: BarEditorProps) => {
  return (
    <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-cyber-purple/30">
      <h4 className="text-sm font-medium text-cyber-purple">Barra Incremental (Rango)</h4>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Input
          label="Valor Inicial"
          type="number"
          value={config.initValue}
          onChange={(e) => onChange({ ...config, initValue: parseFloat(e.target.value) || 0 })}
          required
        />
        <Input
          label="Valor Final"
          type="number"
          value={config.finalValue}
          onChange={(e) => onChange({ ...config, finalValue: parseFloat(e.target.value) || 0 })}
          required
        />
        <Input
          label="Incremento (Step)"
          type="number"
          value={config.step}
          onChange={(e) => onChange({ ...config, step: parseFloat(e.target.value) || 1 })}
          required
        />
      </div>
      
      <Input
        label="Etiqueta (opcional)"
        value={config.label || ''}
        onChange={(e) => onChange({ ...config, label: e.target.value })}
        placeholder="Ej: Select Level"
      />
    </div>
  );
});

BarEditor.displayName = 'BarEditor';

// ============================================================================
// BOX COMPONENT EDITOR
// ============================================================================
interface BoxEditorProps {
  config: BoxConfig;
  onChange: (config: BoxConfig) => void;
}

export const BoxEditor = memo(({ config, onChange }: BoxEditorProps) => {
  const addOption = () => {
    onChange({
      options: [...config.options, { label: '', value: 0 }]
    });
  };

  const updateOption = (index: number, option: BoxOption) => {
    const newOptions = [...config.options];
    newOptions[index] = option;
    onChange({ options: newOptions });
  };

  const removeOption = (index: number) => {
    onChange({
      options: config.options.filter((_, i) => i !== index)
    });
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-cyber-cyan/30">
      <h4 className="text-sm font-medium text-cyber-cyan">Cajas de Precio (Selección Múltiple)</h4>
      
      {config.options.map((option, index) => (
        <div key={index} className="flex gap-2">
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
            <Button
              type="button"
              variant="danger"
              onClick={() => removeOption(index)}
              className="px-3! self-end"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ))}
      
      <Button
        type="button"
        variant="secondary"
        onClick={addOption}
        className="w-full"
      >
        + Agregar Opción
      </Button>
    </div>
  );
});

BoxEditor.displayName = 'BoxEditor';

// ============================================================================
// SELECTORS COMPONENT EDITOR
// ============================================================================
interface SelectorsEditorProps {
  config: SelectorsConfig;
  onChange: (config: SelectorsConfig) => void;
}

export const SelectorsEditor = memo(({ config, onChange }: SelectorsEditorProps) => {
  const selectors = Object.entries(config);

  const addSelector = () => {
    const newKey = `Nuevo Selector ${selectors.length + 1}`;
    onChange({
      ...config,
      [newKey]: [{ label: '', value: 0 }]
    });
  };

  const updateSelectorTitle = (oldTitle: string, newTitle: string) => {
    const newConfig = { ...config };
    newConfig[newTitle] = newConfig[oldTitle];
    delete newConfig[oldTitle];
    onChange(newConfig);
  };

  const updateSelectorOptions = (title: string, options: SelectorOption[]) => {
    onChange({
      ...config,
      [title]: options
    });
  };

  const removeSelector = (title: string) => {
    const newConfig = { ...config };
    delete newConfig[title];
    onChange(newConfig);
  };

  const addOptionToSelector = (title: string) => {
    const currentOptions = config[title];
    updateSelectorOptions(title, [...currentOptions, { label: '', value: 0 }]);
  };

  const updateOption = (title: string, index: number, option: SelectorOption) => {
    const newOptions = [...config[title]];
    newOptions[index] = option;
    updateSelectorOptions(title, newOptions);
  };

  const removeOption = (title: string, index: number) => {
    const newOptions = config[title].filter((_, i) => i !== index);
    updateSelectorOptions(title, newOptions);
  };

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-cyber-pink/30">
      <h4 className="text-sm font-medium text-cyber-pink">Selectores Personalizados (Dropdowns)</h4>
      
      {selectors.map(([title, options]) => (
        <div key={title} className="space-y-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <div className="flex gap-2 items-end">
            <Input
              label="Título del Selector"
              value={title}
              onChange={(e) => updateSelectorTitle(title, e.target.value)}
              placeholder="Ej: Choose Difficulty"
              className="flex-1"
            />
            {selectors.length > 1 && (
              <Button
                type="button"
                variant="danger"
                onClick={() => removeSelector(title)}
                className="px-3!"
              >
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
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => removeOption(title, index)}
                  className="px-3! self-end"
                >
                  <Trash2 size={16} />
                </Button>
              )}
            </div>
          ))}

          <Button
            type="button"
            variant="secondary"
            onClick={() => addOptionToSelector(title)}
            className="w-full text-sm"
          >
            + Agregar Opción
          </Button>
        </div>
      ))}

      <Button
        type="button"
        variant="secondary"
        onClick={addSelector}
        className="w-full"
      >
        + Agregar Selector
      </Button>
    </div>
  );
});

SelectorsEditor.displayName = 'SelectorsEditor';

// ============================================================================
// ADDITIONAL SERVICES EDITOR
// ============================================================================
interface AdditionalEditorProps {
  config: AdditionalConfig;
  onChange: (config: AdditionalConfig) => void;
}

export const AdditionalEditor = memo(({ config, onChange }: AdditionalEditorProps) => {
  // Separar el título de las opciones
  const title = config.title || 'Servicios Adicionales (Checkboxes)';
  const options = Object.entries(config)
    .filter(([key]) => key !== 'title')
    .filter((entry): entry is [string, AdditionalOption] => {
      const [, value] = entry;
      return typeof value === 'object' && value !== null && 'type' in value;
    });

  const updateTitle = (newTitle: string) => {
    onChange({
      ...config,
      title: newTitle
    });
  };

  const addOption = () => {
    const newKey = `addOption${options.length + 1}`;
    onChange({
      ...config,
      [newKey]: { type: 'checkbox', value: 0, label: '' }
    });
  };

  const updateOption = (key: string, value: number, label: string) => {
    onChange({
      ...config,
      [key]: { type: 'checkbox', value, label }
    });
  };

  const removeOption = (key: string) => {
    const newConfig = { ...config };
    delete newConfig[key];
    onChange(newConfig);
  };

  return (
    <div className="space-y-3 p-4 bg-slate-800/30 rounded-lg border border-cyber-green/30">
      {/* Título editable del componente */}
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
            <Button
              type="button"
              variant="danger"
              onClick={() => removeOption(key)}
              className="px-3! self-end"
            >
              <Trash2 size={16} />
            </Button>
          )}
        </div>
      ))}
      
      <Button
        type="button"
        variant="secondary"
        onClick={addOption}
        className="w-full"
      >
        + Agregar Servicio Adicional
      </Button>
      </div>
    </div>
  );
});

AdditionalEditor.displayName = 'AdditionalEditor';

// ============================================================================
// CUSTOM PRICE EDITOR
// ============================================================================
interface CustomEditorProps {
  config: CustomConfig;
  onChange: (config: CustomConfig) => void;
}

export const CustomEditor = memo(({ config, onChange }: CustomEditorProps) => {
  const presets = config.presets || [];

  const addPreset = () => {
    onChange({
      ...config,
      presets: [...presets, 0]
    });
  };

  const updatePreset = (index: number, value: number) => {
    const newPresets = [...presets];
    newPresets[index] = value;
    onChange({ ...config, presets: newPresets });
  };

  const removePreset = (index: number) => {
    onChange({
      ...config,
      presets: presets.filter((_, i) => i !== index)
    });
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
            <Button
              type="button"
              variant="danger"
              onClick={() => removePreset(index)}
              className="px-3!"
            >
              <Trash2 size={16} />
            </Button>
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={addPreset}
          className="w-full"
        >
          + Agregar Preset
        </Button>
      </div>
    </div>
  );
});

CustomEditor.displayName = 'CustomEditor';

// ============================================================================
// BOX TITLE COMPONENT EDITOR
// ============================================================================
interface BoxTitleEditorProps {
  config: BoxTitleConfig;
  onChange: (config: BoxTitleConfig) => void;
}

export const BoxTitleEditor = memo(({ config, onChange }: BoxTitleEditorProps) => {
  const addOption = () => {
    onChange({
      options: [...config.options, { label: '', value: '' }]
    });
  };

  const updateOption = (index: number, option: BoxTitleOption) => {
    const newOptions = [...config.options];
    newOptions[index] = option;
    onChange({ options: newOptions });
  };

  const removeOption = (index: number) => {
    onChange({
      options: config.options.filter((_, i) => i !== index)
    });
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
          <Button
            type="button"
            variant="danger"
            onClick={() => removeOption(index)}
            className="px-3! self-end"
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ))}
      
      <Button
        type="button"
        variant="secondary"
        onClick={addOption}
        className="w-full"
      >
        + Agregar Opción
      </Button>
    </div>
  );
});

BoxTitleEditor.displayName = 'BoxTitleEditor';

// ============================================================================
// LABEL TITLE COMPONENT EDITOR (Separador)
// ============================================================================
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

// ============================================================================
// MAIN COMPONENT SELECTOR
// ============================================================================
interface PriceComponentEditorProps {
  type: PriceComponentType;
  config: any;
  onChange: (config: any) => void;
}

export const PriceComponentEditor = memo(({ type, config, onChange }: PriceComponentEditorProps) => {
  switch (type) {
    case 'bar':
      return <BarEditor config={config} onChange={onChange} />;
    case 'box':
      return <BoxEditor config={config} onChange={onChange} />;
    case 'selectors':
      return <SelectorsEditor config={config} onChange={onChange} />;
    case 'additional':
      return <AdditionalEditor config={config} onChange={onChange} />;
    case 'custom':
      return <CustomEditor config={config} onChange={onChange} />;
    case 'boxtitle':
      return <BoxTitleEditor config={config} onChange={onChange} />;
    case 'labeltitle':
      return <LabelTitleEditor config={config} onChange={onChange} />;
    default:
      return null;
  }
});

PriceComponentEditor.displayName = 'PriceComponentEditor';
