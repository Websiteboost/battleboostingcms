'use client';

import { useState, useCallback, memo, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconSelector } from './IconSelector';
import { Hash } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Game } from '@/types';

interface CategoryFormProps {
  initialData?: {
    name: string;
    description: string;
    icon: string;
    gameIds?: string[];
    name_es?: string | null;
    description_es?: string | null;
  };
  games: Game[];
  displayOrder?: number;
  totalCategories?: number;
  onSubmit: (data: {
    name: string;
    description: string;
    icon: string;
    gameIds: string[];
    name_es?: string | null;
    description_es?: string | null;
    display_order?: number;
  }) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
}

export const CategoryForm = memo(({
  initialData,
  games,
  displayOrder,
  totalCategories,
  onSubmit,
  onCancel,
  isEditing,
}: CategoryFormProps) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    icon: '',
    gameIds: [] as string[],
    name_es: '',
    description_es: '',
  });
  const [orderValue, setOrderValue] = useState<number>(displayOrder ?? 1);
  const [saving, setSaving] = useState(false);

  const nameRef        = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) setFormData(initialData);
  }, [
    initialData?.name,
    initialData?.description,
    initialData?.icon,
    initialData?.gameIds,
    initialData?.name_es,
    initialData?.description_es,
  ]);

  // Sync orderValue when prop changes (e.g. async gameIds load reopens modal)
  useEffect(() => {
    if (displayOrder !== undefined) setOrderValue(displayOrder);
  }, [displayOrder]);

  const handleOrderChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    if (!val || !totalCategories) return;
    setOrderValue(Math.max(1, Math.min(totalCategories, Math.round(val))));
  }, [totalCategories]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name?.trim()) {
      toast.error('El nombre es requerido', { position: 'top-center', duration: 3000 });
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!formData.description?.trim()) {
      toast.error('La descripción es requerida', { position: 'top-center', duration: 3000 });
      descriptionRef.current?.focus();
      descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    if (!formData.icon?.trim()) {
      toast.error('Debes seleccionar un icono', { position: 'top-center', duration: 3000 });
      return;
    }

    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        gameIds: formData.gameIds || [],
        display_order: isEditing ? orderValue : undefined,
      });
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, onSubmit, isEditing, orderValue]);

  const handleNameChange        = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, name: e.target.value })), []);
  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, description: e.target.value })), []);
  const handleNameEsChange      = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, name_es: e.target.value })), []);
  const handleDescriptionEsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) =>
    setFormData(prev => ({ ...prev, description_es: e.target.value })), []);
  const handleIconChange        = useCallback((iconName: string) =>
    setFormData(prev => ({ ...prev, icon: iconName })), []);
  const handleGameToggle        = useCallback((gameId: string) =>
    setFormData(prev => {
      const ids = prev.gameIds || [];
      return {
        ...prev,
        gameIds: ids.includes(gameId) ? ids.filter(id => id !== gameId) : [...ids, gameId],
      };
    }), []);

  const originalOrder = displayOrder ?? 1;

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <Input
        ref={nameRef}
        label="Nombre"
        value={formData.name}
        onChange={handleNameChange}
        required
        placeholder="Ej: Power Leveling"
      />

      <Input
        label="Nombre (Spanish)"
        value={formData.name_es || ''}
        onChange={handleNameEsChange}
        placeholder="Ej: Subida de Nivel Rápido"
      />

      <Input
        ref={descriptionRef}
        label="Descripción"
        value={formData.description}
        onChange={handleDescriptionChange}
        required
        placeholder="Descripción de la categoría"
      />

      <Input
        label="Descripción (Spanish)"
        value={formData.description_es || ''}
        onChange={handleDescriptionEsChange}
        placeholder="Descripción de la categoría en español"
      />

      <IconSelector
        value={formData.icon}
        onChange={handleIconChange}
        label="Icono"
      />

      {/* Posición en la lista — solo al editar */}
      {isEditing && totalCategories !== undefined && totalCategories > 0 && (
        <div className="space-y-1.5 pt-1">
          <label className="block text-xs sm:text-sm font-medium text-gray-200 flex items-center gap-1.5">
            <Hash size={13} className="text-cyber-purple" />
            Posición en la lista
          </label>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={1}
              max={totalCategories}
              value={orderValue}
              onChange={handleOrderChange}
              className="w-24 bg-slate-800/60 border border-cyber-purple/30 rounded-xl px-3 py-2.5 text-sm text-white text-center focus:outline-none focus:border-cyber-purple transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
              style={orderValue !== originalOrder ? { boxShadow: '0 0 14px rgb(168 85 247 / 0.35)' } : undefined}
            />
            <span className="text-sm text-gray-400">
              de {totalCategories} {totalCategories === 1 ? 'categoría' : 'categorías'}
            </span>
            {orderValue !== originalOrder && (
              <span className="text-xs text-cyber-purple font-medium">(era #{originalOrder})</span>
            )}
          </div>
          <p className="text-xs text-gray-500">
            Las demás categorías se reordenan automáticamente al guardar
          </p>
        </div>
      )}

      {/* Selector de Juegos */}
      <div className="space-y-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-200">
          Juegos Disponibles
        </label>
        <div className="p-3 bg-slate-800/30 rounded-lg border border-cyber-purple/30 space-y-2">
          {games.map(game => (
            <label
              key={game.id}
              className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 p-2 rounded transition-colors"
            >
              <input
                type="checkbox"
                checked={formData.gameIds?.includes(game.id) || false}
                onChange={() => handleGameToggle(game.id)}
                className="w-4 h-4 rounded border-cyber-purple/50 bg-slate-700 text-cyber-purple focus:ring-cyber-purple focus:ring-offset-slate-900"
              />
              <span className="text-sm text-white">{game.title}</span>
              <span className="text-xs text-gray-400">({game.category})</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
        <Button
          type="button"
          variant="secondary"
          onClick={onCancel}
          className="flex-1 order-2 sm:order-1"
          disabled={saving}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={saving}
          className="flex-1 order-1 sm:order-2"
        >
          {saving ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
        </Button>
      </div>
    </form>
  );
});

CategoryForm.displayName = 'CategoryForm';
