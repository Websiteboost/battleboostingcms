'use client';

import { memo } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Plus, Trash2 } from 'lucide-react';
import type { BarConfig, BarBreakpoint } from '@/types/priceComponents';

interface BarEditorProps {
  config: BarConfig;
  onChange: (config: BarConfig) => void;
}

export const BarEditor = memo(({ config, onChange }: BarEditorProps) => {
  const mode = config.mode || 'simple';
  const progressValue = config.progressValue || 1;
  const defaultRange = config.defaultRange || { start: 1, end: 50 };

  const toggleMode = () => {
    if (mode === 'simple') {
      onChange({
        ...config,
        mode: 'breakpoints',
        breakpoints: [{
          initValue: config.initValue || 1,
          finalValue: config.finalValue || 50,
          step: config.step || 1,
        }],
      });
    } else {
      const firstBreakpoint = config.breakpoints?.[0];
      onChange({
        ...config,
        mode: 'simple',
        initValue: firstBreakpoint?.initValue || 1,
        finalValue: firstBreakpoint?.finalValue || 50,
        step: firstBreakpoint?.step || 1,
        breakpoints: undefined,
      });
    }
  };

  const addBreakpoint = () => {
    const breakpoints = config.breakpoints || [];
    const last = breakpoints[breakpoints.length - 1];
    const newInitValue = last ? last.finalValue + 1 : 1;
    onChange({
      ...config,
      breakpoints: [...breakpoints, { initValue: newInitValue, finalValue: newInitValue + 49, step: 1 }],
    });
  };

  const updateBreakpoint = (index: number, breakpoint: BarBreakpoint) => {
    const newBreakpoints = [...(config.breakpoints || [])];
    newBreakpoints[index] = breakpoint;
    onChange({ ...config, breakpoints: newBreakpoints });
  };

  const removeBreakpoint = (index: number) => {
    onChange({ ...config, breakpoints: (config.breakpoints || []).filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-4 p-4 bg-slate-800/30 rounded-lg border border-cyber-purple/30">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <h4 className="text-sm font-medium text-cyber-purple">Barra Incremental (Rango)</h4>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">Modo:</span>
          <button
            type="button"
            onClick={toggleMode}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              mode === 'simple' ? 'bg-cyber-purple text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Simple
          </button>
          <button
            type="button"
            onClick={toggleMode}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
              mode === 'breakpoints' ? 'bg-cyber-purple text-white' : 'bg-slate-700 text-gray-300 hover:bg-slate-600'
            }`}
          >
            Breakpoints
          </button>
        </div>
      </div>

      <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <span className="text-xs font-medium text-blue-400">ℹ️ Valor de Progreso Visual</span>
        <p className="text-xs text-gray-400 my-2">
          Controla de cuánto en cuánto incrementa visualmente la barra en el frontend (no afecta cálculos)
        </p>
        <Input
          label="Incremento Visual de la Barra"
          type="number"
          min="1"
          value={progressValue}
          onChange={(e) => onChange({ ...config, progressValue: parseFloat(e.target.value) || 1 })}
          placeholder="Ej: 1, 5, 10"
          required
        />
      </div>

      <Input
        label="Etiqueta (opcional)"
        value={config.label || ''}
        onChange={(e) => onChange({ ...config, label: e.target.value })}
        placeholder="Ej: Select Level"
      />

      <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
        <span className="text-xs font-medium text-green-400">🎯 Rango por Defecto</span>
        <p className="text-xs text-gray-400 my-2">
          Define qué valores mostrar inicialmente en el selector de rango del cliente
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Inicio por Defecto"
            type="number"
            value={defaultRange.start}
            onChange={(e) => onChange({ ...config, defaultRange: { ...defaultRange, start: parseFloat(e.target.value) || 0 } })}
            placeholder="Ej: 1"
            required
          />
          <Input
            label="Final por Defecto"
            type="number"
            value={defaultRange.end}
            onChange={(e) => onChange({ ...config, defaultRange: { ...defaultRange, end: parseFloat(e.target.value) || 0 } })}
            placeholder="Ej: 50"
            required
          />
        </div>
      </div>

      {mode === 'simple' && (
        <div className="space-y-3 p-3 bg-slate-900/50 rounded-lg border border-slate-700">
          <h5 className="text-xs font-medium text-gray-300">Configuración del Rango</h5>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Valor Inicial"
              type="number"
              value={config.initValue || 0}
              onChange={(e) => onChange({ ...config, initValue: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Valor Final"
              type="number"
              value={config.finalValue || 0}
              onChange={(e) => onChange({ ...config, finalValue: parseFloat(e.target.value) || 0 })}
              required
            />
            <Input
              label="Incremento (Cálculo)"
              type="number"
              value={config.step || 1}
              onChange={(e) => onChange({ ...config, step: parseFloat(e.target.value) || 1 })}
              required
            />
          </div>
          <p className="text-xs text-gray-400 italic">💡 Un solo rango. Ideal para precios lineales.</p>
        </div>
      )}

      {mode === 'breakpoints' && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h5 className="text-xs font-medium text-gray-300">Breakpoints (Rangos Escalonados)</h5>
            <Button type="button" variant="secondary" onClick={addBreakpoint} className="px-3 py-1.5 text-xs">
              <Plus size={14} className="mr-1" />
              Agregar Breakpoint
            </Button>
          </div>
          <p className="text-xs text-gray-400 italic p-2 bg-slate-900/50 rounded border border-slate-700">
            💡 Útil para precios escalonados. Ej: niveles 1-50 cuestan $1/nivel, 51-100 cuestan $2/nivel, etc.
          </p>
          {(config.breakpoints || []).map((breakpoint, index) => (
            <div key={index} className="p-3 bg-slate-900/50 rounded-lg border border-slate-700 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-cyber-purple">Breakpoint {index + 1}</span>
                {(config.breakpoints?.length || 0) > 1 && (
                  <Button type="button" variant="danger" onClick={() => removeBreakpoint(index)} className="px-2 py-1 text-xs">
                    <Trash2 size={14} />
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <Input label="Inicio" type="number" value={breakpoint.initValue}
                  onChange={(e) => updateBreakpoint(index, { ...breakpoint, initValue: parseFloat(e.target.value) || 0 })} required />
                <Input label="Final" type="number" value={breakpoint.finalValue}
                  onChange={(e) => updateBreakpoint(index, { ...breakpoint, finalValue: parseFloat(e.target.value) || 0 })} required />
                <Input label="Incremento" type="number" value={breakpoint.step}
                  onChange={(e) => updateBreakpoint(index, { ...breakpoint, step: parseFloat(e.target.value) || 1 })} required />
              </div>
            </div>
          ))}
          {(!config.breakpoints || config.breakpoints.length === 0) && (
            <div className="p-4 text-center text-sm text-gray-400 bg-slate-900/50 rounded-lg border border-dashed border-slate-600">
              No hay breakpoints. Haz clic en "Agregar Breakpoint" para comenzar.
            </div>
          )}
        </div>
      )}
    </div>
  );
});

BarEditor.displayName = 'BarEditor';
