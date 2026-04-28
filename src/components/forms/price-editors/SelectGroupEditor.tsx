'use client';

import { memo, useState, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2, ChevronDown, ArrowUp, ArrowDown, Plus } from 'lucide-react';
import { BarEditor } from './BarEditor';
import { BoxEditor } from './BoxEditor';
import { SelectorsEditor } from './SelectorsEditor';
import { AdditionalEditor } from './AdditionalEditor';
import { CustomEditor } from './CustomEditor';
import { BoxTitleEditor } from './BoxTitleEditor';
import { LabelTitleEditor } from './LabelTitleEditor';
import type {
  SelectGroupConfig,
  SelectGroupOption,
  GroupChild,
  ChildComponentType,
  BarConfig,
  BoxConfig,
  SelectorsConfig,
  AdditionalConfig,
  CustomConfig,
  BoxTitleConfig,
  LabelTitleConfig,
} from '@/types/priceComponents';

const CHILD_LABELS: Record<ChildComponentType, string> = {
  bar: 'Barra',
  box: 'Cajas',
  selectors: 'Selectores',
  additional: 'Adicionales',
  custom: 'Custom',
  boxtitle: 'Caja Título',
  labeltitle: 'Separador',
};

const getChildDefaultConfig = (type: ChildComponentType): any => {
  switch (type) {
    case 'bar':        return { mode: 'simple', progressValue: 1, defaultRange: { start: 1, end: 50 }, initValue: 1, finalValue: 50, step: 1, label: 'Select Range' } as BarConfig;
    case 'box':        return { options: [{ label: '', value: 0 }] } as BoxConfig;
    case 'selectors':  return { 'Choose Option': [{ label: '', value: 0 }] } as SelectorsConfig;
    case 'additional': return { title: 'Servicios Adicionales', addOption1: { type: 'checkbox', value: 0, label: '' } } as AdditionalConfig;
    case 'custom':     return { label: 'Enter Amount', presets: [] } as CustomConfig;
    case 'boxtitle':   return { options: [{ label: '', value: '' }] } as BoxTitleConfig;
    case 'labeltitle': return { title: 'Nueva Sección' } as LabelTitleConfig;
  }
};

function renderChildEditor(
  child: GroupChild,
  onChange: (config: any) => void,
  configEs?: any,
  onChangeEs?: (es: any) => void,
) {
  switch (child.type) {
    case 'bar':        return <BarEditor config={child.config as BarConfig} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'box':        return <BoxEditor config={child.config as BoxConfig} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'selectors':  return <SelectorsEditor config={child.config as SelectorsConfig} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'additional': return <AdditionalEditor config={child.config as AdditionalConfig} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'custom':     return <CustomEditor config={child.config as CustomConfig} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'boxtitle':   return <BoxTitleEditor config={child.config as BoxTitleConfig} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    case 'labeltitle': return <LabelTitleEditor config={child.config as LabelTitleConfig} onChange={onChange} configEs={configEs} onChangeEs={onChangeEs} />;
    default:           return null;
  }
}

interface SelectGroupEditorProps {
  config: SelectGroupConfig;
  onChange: (config: SelectGroupConfig) => void;
  configEs?: Record<string, any> | null;
  onChangeEs?: (configEs: any) => void;
}

export const SelectGroupEditor = memo(({ config, onChange, configEs, onChangeEs }: SelectGroupEditorProps) => {
  const [expandedOption, setExpandedOption] = useState<number | null>(0);
  const [expandedChild, setExpandedChild] = useState<Record<number, number | null>>({});

  // ── Option management ────────────────────────────────────────────────────────

  const addOption = useCallback(() => {
    const newOption: SelectGroupOption = { title: `Opción ${config.options.length + 1}`, children: [] };
    const newIndex = config.options.length;
    onChange({ ...config, options: [...config.options, newOption] });
    setExpandedOption(newIndex);
  }, [config, onChange]);

  const removeOption = useCallback((optIndex: number) => {
    if (config.options.length <= 1) return;
    const newOptions = config.options.filter((_, i) => i !== optIndex);
    onChange({ ...config, options: newOptions });

    const newEs = configEs ? {
      ...configEs,
      options: (configEs.options || []).filter((_: any, i: number) => i !== optIndex),
    } : undefined;
    if (newEs) onChangeEs?.(newEs);

    setExpandedOption(prev => {
      if (prev === null || prev === optIndex) return newOptions.length > 0 ? 0 : null;
      if (prev > optIndex) return prev - 1;
      return prev;
    });
    setExpandedChild(prev => {
      const next: Record<number, number | null> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki === optIndex) return;
        next[ki > optIndex ? ki - 1 : ki] = v;
      });
      return next;
    });
  }, [config, configEs, onChange, onChangeEs]);

  const updateOptionTitle = useCallback((optIndex: number, title: string) => {
    const newOptions = [...config.options];
    newOptions[optIndex] = { ...newOptions[optIndex], title };
    onChange({ ...config, options: newOptions });
  }, [config, onChange]);

  const updateOptionTitleEs = useCallback((optIndex: number, title: string) => {
    const currentOptions = configEs?.options || config.options.map(() => ({}));
    const newOptions = [...currentOptions];
    newOptions[optIndex] = { ...(newOptions[optIndex] || {}), title };
    onChangeEs?.({ ...(configEs || {}), options: newOptions });
  }, [config.options, configEs, onChangeEs]);

  const moveOption = useCallback((optIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? optIndex - 1 : optIndex + 1;
    if (targetIndex < 0 || targetIndex >= config.options.length) return;
    const options = [...config.options];
    [options[optIndex], options[targetIndex]] = [options[targetIndex], options[optIndex]];
    onChange({ ...config, options });

    if (configEs?.options) {
      const esOptions = [...configEs.options];
      [esOptions[optIndex], esOptions[targetIndex]] = [esOptions[targetIndex], esOptions[optIndex]];
      onChangeEs?.({ ...configEs, options: esOptions });
    }

    setExpandedOption(prev => {
      if (prev === optIndex) return targetIndex;
      if (prev === targetIndex) return optIndex;
      return prev;
    });
  }, [config, configEs, onChange, onChangeEs]);

  // ── Child management ─────────────────────────────────────────────────────────

  const addChild = useCallback((optIndex: number, type: ChildComponentType) => {
    const newChild: GroupChild = { type, config: getChildDefaultConfig(type), required: false };
    const newOptions = [...config.options];
    const newChildIndex = newOptions[optIndex].children.length;
    newOptions[optIndex] = { ...newOptions[optIndex], children: [...newOptions[optIndex].children, newChild] };
    onChange({ ...config, options: newOptions });
    setExpandedChild(prev => ({ ...prev, [optIndex]: newChildIndex }));
  }, [config, onChange]);

  const updateChildConfig = useCallback((optIndex: number, childIndex: number, childConfig: any) => {
    const newOptions = [...config.options];
    const children = [...newOptions[optIndex].children];
    children[childIndex] = { ...children[childIndex], config: childConfig };
    newOptions[optIndex] = { ...newOptions[optIndex], children };
    onChange({ ...config, options: newOptions });
  }, [config, onChange]);

  const updateChildConfigEs = useCallback((optIndex: number, childIndex: number, childEs: any) => {
    const currentOptions = configEs?.options || config.options.map(opt => ({ title: '', children: opt.children.map(() => ({})) }));
    const newOptions = [...currentOptions];
    const optEntry = { ...(newOptions[optIndex] || {}) };
    const children = [...(optEntry.children || config.options[optIndex].children.map(() => ({})))];
    children[childIndex] = { ...(children[childIndex] || {}), config_es: childEs };
    optEntry.children = children;
    newOptions[optIndex] = optEntry;
    onChangeEs?.({ ...(configEs || {}), options: newOptions });
  }, [config.options, configEs, onChangeEs]);

  const updateChildRequired = useCallback((optIndex: number, childIndex: number, required: boolean) => {
    const newOptions = [...config.options];
    const children = [...newOptions[optIndex].children];
    children[childIndex] = { ...children[childIndex], required };
    newOptions[optIndex] = { ...newOptions[optIndex], children };
    onChange({ ...config, options: newOptions });
  }, [config, onChange]);

  const updateChildEstimatedTime = useCallback((optIndex: number, childIndex: number, estimatedTime: number) => {
    const newOptions = [...config.options];
    const children = [...newOptions[optIndex].children];
    children[childIndex] = { ...children[childIndex], estimated_time: estimatedTime };
    newOptions[optIndex] = { ...newOptions[optIndex], children };
    onChange({ ...config, options: newOptions });
  }, [config, onChange]);

  const removeChild = useCallback((optIndex: number, childIndex: number) => {
    const newOptions = [...config.options];
    const children = newOptions[optIndex].children.filter((_, i) => i !== childIndex);
    newOptions[optIndex] = { ...newOptions[optIndex], children };
    onChange({ ...config, options: newOptions });
    setExpandedChild(prev => {
      const current = prev[optIndex];
      if (current === null || current === undefined) return prev;
      if (current === childIndex) return { ...prev, [optIndex]: null };
      if (current > childIndex) return { ...prev, [optIndex]: current - 1 };
      return prev;
    });
  }, [config, onChange]);

  const moveChild = useCallback((optIndex: number, childIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? childIndex - 1 : childIndex + 1;
    const newOptions = [...config.options];
    const children = [...newOptions[optIndex].children];
    if (targetIndex < 0 || targetIndex >= children.length) return;
    [children[childIndex], children[targetIndex]] = [children[targetIndex], children[childIndex]];
    newOptions[optIndex] = { ...newOptions[optIndex], children };
    onChange({ ...config, options: newOptions });
    setExpandedChild(prev => {
      const current = prev[optIndex];
      if (current === childIndex) return { ...prev, [optIndex]: targetIndex };
      if (current === targetIndex) return { ...prev, [optIndex]: childIndex };
      return prev;
    });
  }, [config, onChange]);

  // ── Render ───────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-cyber-pink/40">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-cyber-pink">Agrupador por Selector</h4>
        <Button
          type="button"
          variant="secondary"
          onClick={addOption}
          className="text-xs py-1.5 px-2.5 border-cyber-pink/40! text-cyber-pink!"
        >
          <Plus size={12} className="inline mr-1" />
          Añadir Opción
        </Button>
      </div>

      {/* Etiqueta del selector EN + ES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        <Input
          label="Etiqueta del selector"
          value={config.label}
          onChange={e => onChange({ ...config, label: e.target.value })}
          placeholder="Ej: Selecciona tu modalidad"
          required
        />
        <Input
          label={<>Etiqueta <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
          value={configEs?.label ?? ''}
          onChange={e => onChangeEs?.({ ...(configEs || {}), label: e.target.value })}
          placeholder="Ej: Selecciona tu modalidad"
          className="border-amber-500/40 focus:border-amber-400"
        />
      </div>

      <div className="space-y-2">
        <h5 className="text-xs font-medium text-gray-400">
          Opciones ({config.options.length})
        </h5>

        {config.options.map((option, optIndex) => {
          const isOptExpanded = expandedOption === optIndex;
          const expandedChildIndex = expandedChild[optIndex] ?? null;

          return (
            <div key={optIndex} className="border border-slate-600 rounded-lg overflow-hidden">
              {/* Option header */}
              <div
                className="flex items-center gap-2 p-2.5 bg-slate-700/60 cursor-pointer select-none hover:bg-slate-700 transition-colors"
                onClick={() => setExpandedOption(isOptExpanded ? null : optIndex)}
              >
                <span className="text-xs font-bold text-cyber-pink w-4 text-center shrink-0">{optIndex + 1}</span>
                <span className="flex-1 text-xs font-medium text-white truncate">
                  {option.title || `Opción ${optIndex + 1}`}
                </span>
                <span className="text-xs text-gray-500 shrink-0">{option.children.length} comp.</span>

                {/* Reorder */}
                <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={optIndex === 0}
                    onClick={() => moveOption(optIndex, 'up')}
                    className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={optIndex === config.options.length - 1}
                    onClick={() => moveOption(optIndex, 'down')}
                    className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  disabled={config.options.length <= 1}
                  onClick={e => { e.stopPropagation(); removeOption(optIndex); }}
                  className="p-1 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={config.options.length <= 1 ? 'Mínimo 1 opción' : 'Eliminar opción'}
                >
                  <Trash2 size={12} />
                </button>

                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 shrink-0 ${isOptExpanded ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Option content */}
              {isOptExpanded && (
                <div className="p-3 border-t border-slate-600/60 space-y-3">
                  {/* Títulos de la opción EN + ES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Input
                      label="Texto de la opción"
                      value={option.title}
                      onChange={e => updateOptionTitle(optIndex, e.target.value)}
                      placeholder="Ej: Plan Básico"
                      required
                    />
                    <Input
                      label={<>Texto <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
                      value={configEs?.options?.[optIndex]?.title ?? ''}
                      onChange={e => updateOptionTitleEs(optIndex, e.target.value)}
                      placeholder="Ej: Plan Básico"
                      className="border-amber-500/40 focus:border-amber-400"
                    />
                  </div>

                  {/* Hijos de esta opción */}
                  <div className="space-y-1.5">
                    <h6 className="text-xs font-medium text-gray-400">
                      Componentes de esta opción ({option.children.length})
                    </h6>

                    {option.children.length === 0 && (
                      <div className="text-center py-3 text-xs text-gray-500 bg-slate-900/50 rounded border border-dashed border-slate-600">
                        Sin componentes. Usa los botones de abajo para agregar.
                      </div>
                    )}

                    {option.children.map((child, childIndex) => {
                      const isChildExpanded = expandedChildIndex === childIndex;
                      return (
                        <div key={childIndex} className="border border-slate-600/70 rounded-lg overflow-hidden">
                          <div
                            className="flex items-center gap-2 p-2 bg-slate-800/60 cursor-pointer select-none hover:bg-slate-800 transition-colors"
                            onClick={() => setExpandedChild(prev => ({ ...prev, [optIndex]: isChildExpanded ? null : childIndex }))}
                          >
                            <span className="text-xs font-bold text-cyber-pink/70 w-4 text-center shrink-0">{childIndex + 1}</span>
                            <span className="flex-1 text-xs font-medium text-white">{CHILD_LABELS[child.type]}</span>

                            {/* Toggle required */}
                            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                              <span className="text-xs text-gray-500 hidden sm:inline">Oblig.</span>
                              <button
                                type="button"
                                onClick={() => updateChildRequired(optIndex, childIndex, !child.required)}
                                className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${child.required ? 'bg-cyber-pink' : 'bg-slate-600'}`}
                                title={child.required ? 'Obligatorio: Sí' : 'Obligatorio: No'}
                              >
                                <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${child.required ? 'left-4.5' : 'left-0.5'}`} />
                              </button>
                            </div>

                            {/* Reorder */}
                            <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                              <button
                                type="button"
                                disabled={childIndex === 0}
                                onClick={() => moveChild(optIndex, childIndex, 'up')}
                                className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button
                                type="button"
                                disabled={childIndex === option.children.length - 1}
                                onClick={() => moveChild(optIndex, childIndex, 'down')}
                                className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                              >
                                <ArrowDown size={11} />
                              </button>
                            </div>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); removeChild(optIndex, childIndex); }}
                              className="p-1 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                            >
                              <Trash2 size={11} />
                            </button>

                            <ChevronDown
                              size={13}
                              className={`text-gray-400 transition-transform duration-200 shrink-0 ${isChildExpanded ? 'rotate-180' : ''}`}
                            />
                          </div>

                          {isChildExpanded && (
                            <div className="p-2.5 border-t border-slate-600/60 space-y-2.5">
                              <div className="flex items-center gap-2">
                                <label className="text-xs text-gray-400 shrink-0">⏱ Tiempo (min):</label>
                                <input
                                  type="number"
                                  min="0"
                                  step="1"
                                  value={child.estimated_time ?? 0}
                                  onChange={e => updateChildEstimatedTime(optIndex, childIndex, parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 bg-slate-800/50 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-cyber-pink transition-colors"
                                />
                                <span className="text-xs text-gray-500">(0 = no aplica)</span>
                              </div>
                              {renderChildEditor(
                                child,
                                cfg => updateChildConfig(optIndex, childIndex, cfg),
                                configEs?.options?.[optIndex]?.children?.[childIndex]?.config_es,
                                es => updateChildConfigEs(optIndex, childIndex, es),
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Add child buttons */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-slate-700">
                    {(Object.keys(CHILD_LABELS) as ChildComponentType[]).map(type => (
                      <Button
                        key={type}
                        type="button"
                        variant="secondary"
                        onClick={() => addChild(optIndex, type)}
                        className="text-xs py-2"
                      >
                        + {CHILD_LABELS[type]}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
});

SelectGroupEditor.displayName = 'SelectGroupEditor';
