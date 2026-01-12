'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImagePreview } from './ImagePreview';

interface GameFormProps {
  initialData?: {
    title: string;
    category: string;
    image: string;
  };
  onSubmit: (data: { title: string; category: string; image: string }) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
}

export const GameForm = memo(({ initialData, onSubmit, onCancel, isEditing }: GameFormProps) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    category: '',
    image: '',
  });
  const [saving, setSaving] = useState(false);

  // Sincronizar initialData solo cuando el modal se abre
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData?.title, initialData?.category, initialData?.image]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar:', error);
    } finally {
      setSaving(false);
    }
  }, [formData, onSubmit]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, category: e.target.value }));
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, image: e.target.value }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
      <Input
        label="Título"
        value={formData.title}
        onChange={handleTitleChange}
        required
        placeholder="Ej: League of Legends"
      />

      <Input
        label="Categoría"
        value={formData.category}
        onChange={handleCategoryChange}
        required
        placeholder="Ej: MOBA"
      />

      <Input
        label="URL de Imagen"
        value={formData.image}
        onChange={handleImageChange}
        required
        placeholder="https://ejemplo.com/imagen.jpg"
      />

      <ImagePreview imageUrl={formData.image} />

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

GameForm.displayName = 'GameForm';
