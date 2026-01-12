'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

interface AccordionFormData {
  id?: string;
  title: string;
  content: string;
  display_order: number;
}

interface AccordionFormProps {
  initialData?: AccordionFormData;
  onSubmit: (data: AccordionFormData) => Promise<void>;
  onCancel: () => void;
  isEditing?: boolean;
  maxOrder: number;
}

export const AccordionForm = memo(function AccordionForm({ 
  initialData, 
  onSubmit, 
  onCancel,
  isEditing = false,
  maxOrder
}: AccordionFormProps) {
  const [formData, setFormData] = useState<AccordionFormData>({
    id: initialData?.id,
    title: initialData?.title || '',
    content: initialData?.content || '',
    display_order: initialData?.display_order || maxOrder + 1,
  });
  const [saving, setSaving] = useState(false);

  // Actualizar formData cuando cambia initialData
  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id,
        title: initialData.title || '',
        content: initialData.content || '',
        display_order: initialData.display_order || maxOrder + 1,
      });
    }
  }, [initialData, maxOrder]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.title.trim() || !formData.content.trim()) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    setSaving(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error al guardar:', error);
      alert(error instanceof Error ? error.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  }, [formData, onSubmit]);

  const handleChange = useCallback((field: keyof AccordionFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  }, []);

  return (
    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-white mb-2">
          Título <span className="text-cyber-purple">*</span>
        </label>
        <input
          type="text"
          id="title"
          value={formData.title}
          onChange={(e) => handleChange('title', e.target.value)}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700 border border-cyber-purple/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all text-sm sm:text-base"
          placeholder="¿Cuál es tu pregunta?"
          required
        />
      </div>

      <div>
        <label htmlFor="content" className="block text-sm font-medium text-white mb-2">
          Respuesta <span className="text-cyber-purple">*</span>
        </label>
        <textarea
          id="content"
          value={formData.content}
          onChange={(e) => handleChange('content', e.target.value)}
          rows={6}
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700 border border-cyber-purple/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all text-sm sm:text-base resize-none"
          placeholder="Escribe la respuesta completa..."
          required
        />
        <p className="mt-1 text-xs text-gray-400">
          {formData.content.length} caracteres
        </p>
      </div>

      <div>
        <label htmlFor="display_order" className="block text-sm font-medium text-white mb-2">
          Orden de visualización <span className="text-cyber-purple">*</span>
        </label>
        <input
          type="number"
          id="display_order"
          value={formData.display_order}
          onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 1)}
          min="1"
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-700 border border-cyber-purple/50 rounded-lg text-white focus:outline-none focus:border-cyber-purple focus:ring-1 focus:ring-cyber-purple transition-all text-sm sm:text-base"
          required
        />
        <p className="mt-1 text-xs text-gray-400">
          {isEditing ? 'Orden actual en la lista' : `Siguiente disponible: ${maxOrder + 1}`}
        </p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3 pt-2 sm:pt-4">
        <Button 
          type="button" 
          variant="secondary" 
          onClick={onCancel}
          disabled={saving}
          className="w-full sm:w-auto order-2 sm:order-1"
        >
          Cancelar
        </Button>
        <Button 
          type="submit" 
          disabled={saving}
          className="w-full sm:flex-1 order-1 sm:order-2"
        >
          {saving ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
        </Button>
      </div>
    </form>
  );
});
