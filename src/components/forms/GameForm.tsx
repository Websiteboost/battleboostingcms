'use client';

import { useState, useCallback, memo, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImagePreview } from './ImagePreview';
import toast from 'react-hot-toast';

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
  
  // Refs para hacer focus en campos con error
  const titleRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  // Sincronizar initialData cuando cambie cualquier propiedad
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData?.title, initialData?.category, initialData?.image]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación frontend
    if (!formData.title || formData.title.trim() === '') {
      toast.error('El título es requerido', { position: 'top-center', duration: 3000 });
      titleRef.current?.focus();
      titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (!formData.category || formData.category.trim() === '') {
      toast.error('La categoría es requerida', { position: 'top-center', duration: 3000 });
      categoryRef.current?.focus();
      categoryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (!formData.image || formData.image.trim() === '') {
      toast.error('La URL de la imagen es requerida', { position: 'top-center', duration: 3000 });
      imageRef.current?.focus();
      imageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    // Validar URL
    try {
      new URL(formData.image);
      if (!formData.image.startsWith('http://') && !formData.image.startsWith('https://')) {
        throw new Error('Invalid protocol');
      }
    } catch {
      toast.error('La URL de la imagen no es válida', { position: 'top-center', duration: 4000 });
      imageRef.current?.focus();
      imageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
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
        ref={titleRef}
        label="Título"
        value={formData.title}
        onChange={handleTitleChange}
        required
        placeholder="Ej: League of Legends"
      />

      <Input
        ref={categoryRef}
        label="Categoría"
        value={formData.category}
        onChange={handleCategoryChange}
        required
        placeholder="Ej: MOBA"
      />

      <Input
        ref={imageRef}
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
