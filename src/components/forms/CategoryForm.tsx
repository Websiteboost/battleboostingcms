'use client';

import { useState, useCallback, memo, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { IconSelector } from './IconSelector';
import toast from 'react-hot-toast';
import type { Game } from '@/types';

interface CategoryFormProps {
  initialData?: {
    name: string;
    description: string;
    icon: string;
    gameIds?: string[];
  };
  games: Game[];
  onSubmit: (data: { name: string; description: string; icon: string; gameIds: string[] }) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
}

export const CategoryForm = memo(({ initialData, games, onSubmit, onCancel, isEditing }: CategoryFormProps) => {
  const [formData, setFormData] = useState(initialData || {
    name: '',
    description: '',
    icon: '',
    gameIds: [],
  });
  const [saving, setSaving] = useState(false);
  
  // Refs para hacer focus en campos con error
  const nameRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData?.name, initialData?.description, initialData?.icon, initialData?.gameIds]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación frontend
    if (!formData.name || formData.name.trim() === '') {
      toast.error('El nombre es requerido', { position: 'top-center', duration: 3000 });
      nameRef.current?.focus();
      nameRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (!formData.description || formData.description.trim() === '') {
      toast.error('La descripción es requerida', { position: 'top-center', duration: 3000 });
      descriptionRef.current?.focus();
      descriptionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (!formData.icon || formData.icon.trim() === '') {
      toast.error('Debes seleccionar un icono', { position: 'top-center', duration: 3000 });
      return;
    }
    
    setSaving(true);
    try {
      await onSubmit({
        ...formData,
        gameIds: formData.gameIds || []
      });
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, onSubmit]);

  const handleNameChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, name: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, description: e.target.value }));
  }, []);

  const handleIconChange = useCallback((iconName: string) => {
    setFormData(prev => ({ ...prev, icon: iconName }));
  }, []);
const handleGameToggle = useCallback((gameId: string) => {
    setFormData(prev => {
      const gameIds = prev.gameIds || [];
      if (gameIds.includes(gameId)) {
        return { ...prev, gameIds: gameIds.filter(id => id !== gameId) };
      } else {
        return { ...prev, gameIds: [...gameIds, gameId] };
      }
    });
  }, []);

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
        ref={descriptionRef}
        label="Descripción"
        value={formData.description}
        onChange={handleDescriptionChange}
        required
        placeholder="Descripción de la categoría"
      />

      <IconSelector
        value={formData.icon}
        onChange={handleIconChange}
        label="Icono"
      />

      {/* Selector de Juegos */}
      <div className="space-y-2">
        <label className="block text-xs sm:text-sm font-medium text-gray-200">
          Juegos Disponibles
        </label>
        <div className="p-3 bg-slate-800/30 rounded-lg border border-cyber-purple/30 space-y-2">
          {games.map(game => (
            <label key={game.id} className="flex items-center gap-3 cursor-pointer hover:bg-slate-700/30 p-2 rounded transition-colors">
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
