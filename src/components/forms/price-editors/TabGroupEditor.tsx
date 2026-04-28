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
  TabGroupConfig,
  TabGroupTab,
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

interface TabGroupEditorProps {
  config: TabGroupConfig;
  onChange: (config: TabGroupConfig) => void;
  configEs?: Record<string, any> | null;
  onChangeEs?: (configEs: any) => void;
}

export const TabGroupEditor = memo(({ config, onChange, configEs, onChangeEs }: TabGroupEditorProps) => {
  const [expandedTab, setExpandedTab] = useState<number | null>(0);
  const [expandedChild, setExpandedChild] = useState<Record<number, number | null>>({});

  // ── Tab management ──────────────────────────────────────────────────────────

  const addTab = useCallback(() => {
    const newTab: TabGroupTab = { title: `Pestaña ${config.tabs.length + 1}`, children: [] };
    const newIndex = config.tabs.length;
    onChange({ ...config, tabs: [...config.tabs, newTab] });
    setExpandedTab(newIndex);
  }, [config, onChange]);

  const removeTab = useCallback((tabIndex: number) => {
    if (config.tabs.length <= 1) return;
    const newTabs = config.tabs.filter((_, i) => i !== tabIndex);
    onChange({ ...config, tabs: newTabs });

    const newEs = configEs ? {
      ...configEs,
      tabs: (configEs.tabs || []).filter((_: any, i: number) => i !== tabIndex),
    } : undefined;
    if (newEs) onChangeEs?.(newEs);

    setExpandedTab(prev => {
      if (prev === null || prev === tabIndex) return newTabs.length > 0 ? 0 : null;
      if (prev > tabIndex) return prev - 1;
      return prev;
    });
    setExpandedChild(prev => {
      const next: Record<number, number | null> = {};
      Object.entries(prev).forEach(([k, v]) => {
        const ki = parseInt(k);
        if (ki === tabIndex) return;
        next[ki > tabIndex ? ki - 1 : ki] = v;
      });
      return next;
    });
  }, [config, configEs, onChange, onChangeEs]);

  const updateTabTitle = useCallback((tabIndex: number, title: string) => {
    const newTabs = [...config.tabs];
    newTabs[tabIndex] = { ...newTabs[tabIndex], title };
    onChange({ ...config, tabs: newTabs });
  }, [config, onChange]);

  const updateTabTitleEs = useCallback((tabIndex: number, title: string) => {
    const currentTabs = configEs?.tabs || config.tabs.map(() => ({}));
    const newTabs = [...currentTabs];
    newTabs[tabIndex] = { ...(newTabs[tabIndex] || {}), title };
    onChangeEs?.({ ...(configEs || {}), tabs: newTabs });
  }, [config.tabs, configEs, onChangeEs]);

  const moveTab = useCallback((tabIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? tabIndex - 1 : tabIndex + 1;
    if (targetIndex < 0 || targetIndex >= config.tabs.length) return;
    const tabs = [...config.tabs];
    [tabs[tabIndex], tabs[targetIndex]] = [tabs[targetIndex], tabs[tabIndex]];
    onChange({ ...config, tabs });

    if (configEs?.tabs) {
      const esTabs = [...configEs.tabs];
      [esTabs[tabIndex], esTabs[targetIndex]] = [esTabs[targetIndex], esTabs[tabIndex]];
      onChangeEs?.({ ...configEs, tabs: esTabs });
    }

    setExpandedTab(prev => {
      if (prev === tabIndex) return targetIndex;
      if (prev === targetIndex) return tabIndex;
      return prev;
    });
  }, [config, configEs, onChange, onChangeEs]);

  // ── Child management ────────────────────────────────────────────────────────

  const addChild = useCallback((tabIndex: number, type: ChildComponentType) => {
    const newChild: GroupChild = { type, config: getChildDefaultConfig(type), required: false };
    const newTabs = [...config.tabs];
    const newChildIndex = newTabs[tabIndex].children.length;
    newTabs[tabIndex] = { ...newTabs[tabIndex], children: [...newTabs[tabIndex].children, newChild] };
    onChange({ ...config, tabs: newTabs });
    setExpandedChild(prev => ({ ...prev, [tabIndex]: newChildIndex }));
  }, [config, onChange]);

  const updateChildConfig = useCallback((tabIndex: number, childIndex: number, childConfig: any) => {
    const newTabs = [...config.tabs];
    const children = [...newTabs[tabIndex].children];
    children[childIndex] = { ...children[childIndex], config: childConfig };
    newTabs[tabIndex] = { ...newTabs[tabIndex], children };
    onChange({ ...config, tabs: newTabs });
  }, [config, onChange]);

  const updateChildConfigEs = useCallback((tabIndex: number, childIndex: number, childEs: any) => {
    const currentTabs = configEs?.tabs || config.tabs.map(tab => ({ title: '', children: tab.children.map(() => ({})) }));
    const newTabs = [...currentTabs];
    const tabEntry = { ...(newTabs[tabIndex] || {}) };
    const children = [...(tabEntry.children || config.tabs[tabIndex].children.map(() => ({})))];
    children[childIndex] = { ...(children[childIndex] || {}), config_es: childEs };
    tabEntry.children = children;
    newTabs[tabIndex] = tabEntry;
    onChangeEs?.({ ...(configEs || {}), tabs: newTabs });
  }, [config.tabs, configEs, onChangeEs]);

  const updateChildRequired = useCallback((tabIndex: number, childIndex: number, required: boolean) => {
    const newTabs = [...config.tabs];
    const children = [...newTabs[tabIndex].children];
    children[childIndex] = { ...children[childIndex], required };
    newTabs[tabIndex] = { ...newTabs[tabIndex], children };
    onChange({ ...config, tabs: newTabs });
  }, [config, onChange]);

  const updateChildEstimatedTime = useCallback((tabIndex: number, childIndex: number, estimatedTime: number) => {
    const newTabs = [...config.tabs];
    const children = [...newTabs[tabIndex].children];
    children[childIndex] = { ...children[childIndex], estimated_time: estimatedTime };
    newTabs[tabIndex] = { ...newTabs[tabIndex], children };
    onChange({ ...config, tabs: newTabs });
  }, [config, onChange]);

  const removeChild = useCallback((tabIndex: number, childIndex: number) => {
    const newTabs = [...config.tabs];
    const children = newTabs[tabIndex].children.filter((_, i) => i !== childIndex);
    newTabs[tabIndex] = { ...newTabs[tabIndex], children };
    onChange({ ...config, tabs: newTabs });
    setExpandedChild(prev => {
      const current = prev[tabIndex];
      if (current === null || current === undefined) return prev;
      if (current === childIndex) return { ...prev, [tabIndex]: null };
      if (current > childIndex) return { ...prev, [tabIndex]: current - 1 };
      return prev;
    });
  }, [config, onChange]);

  const moveChild = useCallback((tabIndex: number, childIndex: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? childIndex - 1 : childIndex + 1;
    const newTabs = [...config.tabs];
    const children = [...newTabs[tabIndex].children];
    if (targetIndex < 0 || targetIndex >= children.length) return;
    [children[childIndex], children[targetIndex]] = [children[targetIndex], children[childIndex]];
    newTabs[tabIndex] = { ...newTabs[tabIndex], children };
    onChange({ ...config, tabs: newTabs });
    setExpandedChild(prev => {
      const current = prev[tabIndex];
      if (current === childIndex) return { ...prev, [tabIndex]: targetIndex };
      if (current === targetIndex) return { ...prev, [tabIndex]: childIndex };
      return prev;
    });
  }, [config, onChange]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-cyber-cyan/40">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-cyber-cyan">Agrupador de Pestañas</h4>
        <Button
          type="button"
          variant="secondary"
          onClick={addTab}
          className="text-xs py-1.5 px-2.5 border-cyber-cyan/40! text-cyber-cyan!"
        >
          <Plus size={12} className="inline mr-1" />
          Añadir Tab
        </Button>
      </div>

      <div className="space-y-2">
        <h5 className="text-xs font-medium text-gray-400">
          Pestañas ({config.tabs.length})
        </h5>

        {config.tabs.map((tab, tabIndex) => {
          const isTabExpanded = expandedTab === tabIndex;
          const expandedChildIndex = expandedChild[tabIndex] ?? null;

          return (
            <div key={tabIndex} className="border border-slate-600 rounded-lg overflow-hidden">
              {/* Tab header */}
              <div
                className="flex items-center gap-2 p-2.5 bg-slate-700/60 cursor-pointer select-none hover:bg-slate-700 transition-colors"
                onClick={() => setExpandedTab(isTabExpanded ? null : tabIndex)}
              >
                <span className="text-xs font-bold text-cyber-cyan w-4 text-center shrink-0">{tabIndex + 1}</span>
                <span className="flex-1 text-xs font-medium text-white truncate">
                  {tab.title || `Pestaña ${tabIndex + 1}`}
                </span>
                <span className="text-xs text-gray-500 shrink-0">{tab.children.length} comp.</span>

                {/* Reorder */}
                <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={tabIndex === 0}
                    onClick={() => moveTab(tabIndex, 'up')}
                    className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={tabIndex === config.tabs.length - 1}
                    onClick={() => moveTab(tabIndex, 'down')}
                    className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  disabled={config.tabs.length <= 1}
                  onClick={e => { e.stopPropagation(); removeTab(tabIndex); }}
                  className="p-1 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                  title={config.tabs.length <= 1 ? 'Mínimo 1 pestaña' : 'Eliminar pestaña'}
                >
                  <Trash2 size={12} />
                </button>

                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 shrink-0 ${isTabExpanded ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Tab content */}
              {isTabExpanded && (
                <div className="p-3 border-t border-slate-600/60 space-y-3">
                  {/* Títulos de la pestaña EN + ES */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    <Input
                      label="Título de la pestaña"
                      value={tab.title}
                      onChange={e => updateTabTitle(tabIndex, e.target.value)}
                      placeholder="Ej: Opción Básica"
                      required
                    />
                    <Input
                      label={<>Título <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
                      value={configEs?.tabs?.[tabIndex]?.title ?? ''}
                      onChange={e => updateTabTitleEs(tabIndex, e.target.value)}
                      placeholder="Ej: Opción Básica"
                      className="border-amber-500/40 focus:border-amber-400"
                    />
                  </div>

                  {/* Hijos de esta pestaña */}
                  <div className="space-y-1.5">
                    <h6 className="text-xs font-medium text-gray-400">
                      Componentes de esta pestaña ({tab.children.length})
                    </h6>

                    {tab.children.length === 0 && (
                      <div className="text-center py-3 text-xs text-gray-500 bg-slate-900/50 rounded border border-dashed border-slate-600">
                        Sin componentes. Usa los botones de abajo para agregar.
                      </div>
                    )}

                    {tab.children.map((child, childIndex) => {
                      const isChildExpanded = expandedChildIndex === childIndex;
                      return (
                        <div key={childIndex} className="border border-slate-600/70 rounded-lg overflow-hidden">
                          <div
                            className="flex items-center gap-2 p-2 bg-slate-800/60 cursor-pointer select-none hover:bg-slate-800 transition-colors"
                            onClick={() => setExpandedChild(prev => ({ ...prev, [tabIndex]: isChildExpanded ? null : childIndex }))}
                          >
                            <span className="text-xs font-bold text-cyber-cyan/70 w-4 text-center shrink-0">{childIndex + 1}</span>
                            <span className="flex-1 text-xs font-medium text-white">{CHILD_LABELS[child.type]}</span>

                            {/* Toggle required */}
                            <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                              <span className="text-xs text-gray-500 hidden sm:inline">Oblig.</span>
                              <button
                                type="button"
                                onClick={() => updateChildRequired(tabIndex, childIndex, !child.required)}
                                className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${child.required ? 'bg-cyber-cyan' : 'bg-slate-600'}`}
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
                                onClick={() => moveChild(tabIndex, childIndex, 'up')}
                                className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                              >
                                <ArrowUp size={11} />
                              </button>
                              <button
                                type="button"
                                disabled={childIndex === tab.children.length - 1}
                                onClick={() => moveChild(tabIndex, childIndex, 'down')}
                                className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                              >
                                <ArrowDown size={11} />
                              </button>
                            </div>

                            {/* Delete */}
                            <button
                              type="button"
                              onClick={e => { e.stopPropagation(); removeChild(tabIndex, childIndex); }}
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
                                  onChange={e => updateChildEstimatedTime(tabIndex, childIndex, parseInt(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 bg-slate-800/50 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-cyber-cyan transition-colors"
                                />
                                <span className="text-xs text-gray-500">(0 = no aplica)</span>
                              </div>
                              {renderChildEditor(
                                child,
                                cfg => updateChildConfig(tabIndex, childIndex, cfg),
                                configEs?.tabs?.[tabIndex]?.children?.[childIndex]?.config_es,
                                es => updateChildConfigEs(tabIndex, childIndex, es),
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
                        onClick={() => addChild(tabIndex, type)}
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

TabGroupEditor.displayName = 'TabGroupEditor';
