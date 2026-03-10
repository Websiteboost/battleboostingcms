'use client';

import { memo, useState, useCallback } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Trash2, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';
import { BarEditor } from './BarEditor';
import { BoxEditor } from './BoxEditor';
import { SelectorsEditor } from './SelectorsEditor';
import { AdditionalEditor } from './AdditionalEditor';
import { CustomEditor } from './CustomEditor';
import { BoxTitleEditor } from './BoxTitleEditor';
import { LabelTitleEditor } from './LabelTitleEditor';
import type {
  GroupConfig,
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
    case 'bar':
      return { mode: 'simple', progressValue: 1, defaultRange: { start: 1, end: 50 }, initValue: 1, finalValue: 50, step: 1, label: 'Select Range' } as BarConfig;
    case 'box':
      return { options: [{ label: '', value: 0 }] } as BoxConfig;
    case 'selectors':
      return { 'Choose Option': [{ label: '', value: 0 }] } as SelectorsConfig;
    case 'additional':
      return { title: 'Servicios Adicionales', addOption1: { type: 'checkbox', value: 0, label: '' } } as AdditionalConfig;
    case 'custom':
      return { label: 'Enter Amount', presets: [] } as CustomConfig;
    case 'boxtitle':
      return { options: [{ label: '', value: '' }] } as BoxTitleConfig;
    case 'labeltitle':
      return { title: 'Nueva Sección' } as LabelTitleConfig;
  }
};

function renderChildEditor(child: GroupChild, onChange: (config: any) => void) {
  switch (child.type) {
    case 'bar':        return <BarEditor config={child.config as BarConfig} onChange={onChange} />;
    case 'box':        return <BoxEditor config={child.config as BoxConfig} onChange={onChange} />;
    case 'selectors':  return <SelectorsEditor config={child.config as SelectorsConfig} onChange={onChange} />;
    case 'additional': return <AdditionalEditor config={child.config as AdditionalConfig} onChange={onChange} />;
    case 'custom':     return <CustomEditor config={child.config as CustomConfig} onChange={onChange} />;
    case 'boxtitle':   return <BoxTitleEditor config={child.config as BoxTitleConfig} onChange={onChange} />;
    case 'labeltitle': return <LabelTitleEditor config={child.config as LabelTitleConfig} onChange={onChange} />;
    default:           return null;
  }
}

interface GroupEditorProps {
  config: GroupConfig;
  onChange: (config: GroupConfig) => void;
}

export const GroupEditor = memo(({ config, onChange }: GroupEditorProps) => {
  const [expandedChild, setExpandedChild] = useState<number | null>(null);

  const addChild = useCallback((type: ChildComponentType) => {
    const newChild: GroupChild = { type, config: getChildDefaultConfig(type), required: false };
    onChange({ ...config, children: [...config.children, newChild] });
    setExpandedChild(config.children.length); // auto-expand new child
  }, [config, onChange]);

  const updateChildConfig = useCallback((index: number, childConfig: any) => {
    const newChildren = [...config.children];
    newChildren[index] = { ...newChildren[index], config: childConfig };
    onChange({ ...config, children: newChildren });
  }, [config, onChange]);

  const updateChildRequired = useCallback((index: number, required: boolean) => {
    const newChildren = [...config.children];
    newChildren[index] = { ...newChildren[index], required };
    onChange({ ...config, children: newChildren });
  }, [config, onChange]);

  const updateChildEstimatedTime = useCallback((index: number, estimatedTime: number) => {
    const newChildren = [...config.children];
    newChildren[index] = { ...newChildren[index], estimated_time: estimatedTime };
    onChange({ ...config, children: newChildren });
  }, [config, onChange]);

  const removeChild = useCallback((index: number) => {
    onChange({ ...config, children: config.children.filter((_, i) => i !== index) });
    setExpandedChild(prev => {
      if (prev === null || prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  }, [config, onChange]);

  const moveChild = useCallback((index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    const children = [...config.children];
    if (targetIndex < 0 || targetIndex >= children.length) return;
    [children[index], children[targetIndex]] = [children[targetIndex], children[index]];
    onChange({ ...config, children });
    setExpandedChild(prev => {
      if (prev === index) return targetIndex;
      if (prev === targetIndex) return index;
      return prev;
    });
  }, [config, onChange]);

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-amber-500/40">
      <h4 className="text-sm font-medium text-amber-400">Agrupador de Componentes</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Input
          label="Título del Grupo"
          value={config.title}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Ej: Opciones Avanzadas"
          required
        />
        <div className="flex flex-col gap-1.5">
          <span className="text-xs sm:text-sm font-medium text-gray-200">Estado inicial en el front</span>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onChange({ ...config, collapseByDefault: true })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                config.collapseByDefault ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Colapsado
            </button>
            <button
              type="button"
              onClick={() => onChange({ ...config, collapseByDefault: false })}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                !config.collapseByDefault ? 'bg-amber-500 text-slate-900' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
              }`}
            >
              Abierto
            </button>
          </div>
        </div>
      </div>

      {/* Children list */}
      <div className="space-y-2">
        <h5 className="text-xs font-medium text-gray-400">
          Componentes del grupo ({config.children.length})
        </h5>

        {config.children.length === 0 && (
          <div className="text-center py-4 text-xs text-gray-500 bg-slate-900/50 rounded border border-dashed border-slate-600">
            Sin componentes. Usa los botones de abajo para agregar.
          </div>
        )}

        {config.children.map((child, index) => {
          const isExpanded = expandedChild === index;
          return (
            <div key={index} className="border border-slate-600 rounded-lg overflow-hidden">
              {/* Child header */}
              <div
                className="flex items-center gap-2 p-2.5 bg-slate-700/60 cursor-pointer select-none hover:bg-slate-700 transition-colors"
                onClick={() => setExpandedChild(isExpanded ? null : index)}
              >
                <span className="text-xs font-bold text-amber-400 w-4 text-center shrink-0">{index + 1}</span>
                <span className="flex-1 text-xs font-medium text-white">{CHILD_LABELS[child.type]}</span>

                {/* Toggle required */}
                <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                  <span className="text-xs text-gray-500 hidden sm:inline">Oblig.</span>
                  <button
                    type="button"
                    onClick={() => updateChildRequired(index, !child.required)}
                    className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${
                      child.required ? 'bg-amber-500' : 'bg-slate-600'
                    }`}
                    title={child.required ? 'Obligatorio: Sí' : 'Obligatorio: No'}
                  >
                    <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                      child.required ? 'left-4.5' : 'left-0.5'
                    }`} />
                  </button>
                </div>

                {/* Reorder */}
                <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveChild(index, 'up')}
                    className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    type="button"
                    disabled={index === config.children.length - 1}
                    onClick={() => moveChild(index, 'down')}
                    className="p-1 rounded hover:bg-slate-600 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>

                {/* Delete */}
                <button
                  type="button"
                  onClick={e => { e.stopPropagation(); removeChild(index); }}
                  className="p-1 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                  title="Eliminar componente"
                >
                  <Trash2 size={12} />
                </button>

                <ChevronDown
                  size={14}
                  className={`text-gray-400 transition-transform duration-200 shrink-0 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>

              {/* Child content — only mounted when expanded */}
              {isExpanded && (
                <div className="p-2.5 border-t border-slate-600/60 space-y-2.5">
                  {/* Tiempo estimado del hijo */}
                  <div className="flex items-center gap-2">
                    <label className="text-xs text-gray-400 shrink-0">⏱ Tiempo (min):</label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={child.estimated_time ?? 0}
                      onChange={(e) => updateChildEstimatedTime(index, parseInt(e.target.value) || 0)}
                      className="w-20 px-2 py-1 bg-slate-800/50 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-amber-500 transition-colors"
                    />
                    <span className="text-xs text-gray-500">(0 = no aplica)</span>
                  </div>
                  {renderChildEditor(child, (cfg) => updateChildConfig(index, cfg))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add child buttons */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 border-t border-slate-700">
        {(Object.keys(CHILD_LABELS) as ChildComponentType[]).map(type => (
          <Button key={type} type="button" variant="secondary" onClick={() => addChild(type)} className="text-xs py-2">
            + {CHILD_LABELS[type]}
          </Button>
        ))}
      </div>
    </div>
  );
});

GroupEditor.displayName = 'GroupEditor';
