'use client';

import { useState, useCallback, memo, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImagePreview } from './ImagePreview';
import { PriceComponentEditor } from './PriceComponentEditor';
import { Trash2, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import type { Game } from '@/types';
import type { 
  PriceComponentType, 
  PriceComponent,
  BarConfig,
  BoxConfig,
  SelectorsConfig,
  AdditionalConfig,
  CustomConfig,
  BoxTitleConfig,
  LabelTitleConfig
} from '@/types/priceComponents';

interface ServiceFormProps {
  initialData?: {
    title: string;
    category_id: string;
    price: number;
    image: string;
    description: string[];
    service_points?: string[];
    priceComponents?: PriceComponent[];
    gameIds?: string[];
  };
  categories: Array<{ id: string; name: string }>;
  games: Game[];
  onSubmit: (data: { 
    title: string; 
    category_id: string; 
    price: number; 
    image: string; 
    description: string[];
    service_points?: string[];
    priceComponents: Omit<PriceComponent, 'id' | 'created_at'>[];
    gameIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
  isEditing: boolean;
}

// Configuraciones por defecto para cada tipo
const getDefaultConfig = (type: PriceComponentType): any => {
  switch (type) {
    case 'bar':
      return { 
        mode: 'simple', 
        progressValue: 1,
        defaultRange: { start: 1, end: 50 },
        initValue: 1, 
        finalValue: 50, 
        step: 1, 
        label: 'Select Range' 
      } as BarConfig;
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

export const ServiceForm = memo(({ initialData, categories, games, onSubmit, onCancel, isEditing }: ServiceFormProps) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    category_id: '',
    price: 0,
    image: '',
    description: [''],
    service_points: [''],
    priceComponents: [],
    gameIds: [],
  });
  const [saving, setSaving] = useState(false);
  
  // Refs para hacer focus en campos con error
  const titleRef = useRef<HTMLInputElement>(null);
  const categoryRef = useRef<HTMLSelectElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  // Sincronizar initialData cuando cambie cualquier propiedad
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [
    initialData?.title,
    initialData?.category_id,
    initialData?.price,
    initialData?.image,
    JSON.stringify(initialData?.gameIds),
    JSON.stringify(initialData?.description),
    JSON.stringify(initialData?.priceComponents)
  ]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación frontend antes de enviar
    if (!formData.title || formData.title.trim() === '') {
      toast.error('El título es requerido', { position: 'top-center', duration: 3000 });
      titleRef.current?.focus();
      titleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    if (!formData.category_id) {
      toast.error('Debes seleccionar una categoría', { position: 'top-center', duration: 3000 });
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
    
    // Validar que sea una URL válida
    try {
      new URL(formData.image);
      if (!formData.image.startsWith('http://') && !formData.image.startsWith('https://')) {
        throw new Error('Invalid protocol');
      }
    } catch {
      toast.error('La URL de la imagen no es válida. Debe comenzar con http:// o https://', { 
        position: 'top-center', 
        duration: 4000 
      });
      imageRef.current?.focus();
      imageRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    
    const cleanedDescriptions = formData.description.filter(d => d.trim() !== '');
    if (cleanedDescriptions.length === 0) {
      toast.error('Debe haber al menos una descripción', { position: 'top-center', duration: 3000 });
      return;
    }
    
    setSaving(true);
    try {
      // Filtrar descripciones y service points vacíos
      const cleanedData = {
        ...formData,
        price: typeof formData.price === 'string' ? parseFloat(formData.price) : formData.price,
        description: cleanedDescriptions,
        service_points: (formData.service_points || []).filter(p => p.trim() !== ''),
        priceComponents: formData.priceComponents?.map(({ id, created_at, ...rest }) => rest) || [],
        gameIds: formData.gameIds || [],
      };
      await onSubmit(cleanedData);
    } catch (error) {
      console.error('Error al guardar:', error);
      // El error ya se muestra en la página padre con toast
    } finally {
      setSaving(false);
    }
  }, [formData, onSubmit]);

  const handleTitleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title: e.target.value }));
  }, []);

  const handleCategoryChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, category_id: e.target.value }));
  }, []);

  const handlePriceChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }));
  }, []);

  const handleImageChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, image: e.target.value }));
  }, []);

  const handleDescriptionChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newDescriptions = [...prev.description];
      newDescriptions[index] = value;
      return { ...prev, description: newDescriptions };
    });
  }, []);

  const addDescription = useCallback(() => {
    setFormData(prev => ({ ...prev, description: [...prev.description, ''] }));
  }, []);

  const removeDescription = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      description: prev.description.filter((_, i) => i !== index),
    }));
  }, []);

  // Service Points handlers
  const handleServicePointChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newPoints = [...(prev.service_points || [''])];
      newPoints[index] = value;
      return { ...prev, service_points: newPoints };
    });
  }, []);

  const addServicePoint = useCallback(() => {
    setFormData(prev => ({ ...prev, service_points: [...(prev.service_points || ['']), ''] }));
  }, []);

  const removeServicePoint = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      service_points: (prev.service_points || ['']).filter((_, i) => i !== index),
    }));
  }, []);

  // Price Components handlers
  const addPriceComponent = useCallback((type: PriceComponentType) => {
    const newComponent: Omit<PriceComponent, 'id' | 'created_at'> = {
      service_id: '', // Se asignará en el backend
      type,
      config: getDefaultConfig(type),
    };
    
    setFormData(prev => ({
      ...prev,
      priceComponents: [...(prev.priceComponents || []), newComponent as PriceComponent],
    }));
  }, []);

  const updatePriceComponent = useCallback((index: number, config: any) => {
    setFormData(prev => {
      const newComponents = [...(prev.priceComponents || [])];
      newComponents[index] = {
        ...newComponents[index],
        config,
      };
      return { ...prev, priceComponents: newComponents };
    });
  }, []);

  const removePriceComponent = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      priceComponents: (prev.priceComponents || []).filter((_, i) => i !== index),
    }));
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
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Información básica */}
      <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-3">Información Básica</h3>
        
        <Input
          ref={titleRef}
          label="Título"
          value={formData.title}
          onChange={handleTitleChange}
          required
          placeholder="Ej: Level 1-50 Express"
        />

      <div className="w-full">
        <label className="block text-xs sm:text-sm font-medium text-gray-200 mb-1.5 sm:mb-2">
          Categoría
        </label>
        <select
          ref={categoryRef}
          value={formData.category_id}
          onChange={handleCategoryChange}
          required
          className="w-full px-3 sm:px-4 py-2 sm:py-2.5 bg-slate-800/50 border border-cyber-purple/30 rounded-lg text-sm sm:text-base text-white focus:outline-none focus:border-cyber-purple focus:ring-2 focus:ring-cyber-purple/50 transition-colors"
        >
          <option value="">Selecciona una categoría</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
      </div>

        <Input
          label="Precio Base (USD) - Solo si NO usas componentes de precio"
          type="number"
          step="0.01"
          min="0"
          value={formData.price}
          onChange={handlePriceChange}
          placeholder="25.00"
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

        {/* Selector de Juegos */}
        <div className="space-y-2">
          <label className="block text-xs sm:text-sm font-medium text-gray-200">
            Juegos Disponibles
          </label>
          <div className="p-3 bg-slate-800/30 rounded-lg border border-cyber-purple/30 space-y-2 max-h-48 overflow-y-auto">
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
      </div>

      {/* Descripciones */}
      <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-3">Descripciones / Características</h3>
        
        {formData.description.map((desc, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={desc}
              onChange={(e) => handleDescriptionChange(index, e.target.value)}
              placeholder={`Característica ${index + 1}`}
              className="flex-1"
            />
            {formData.description.length > 1 && (
              <Button
                type="button"
                variant="danger"
                onClick={() => removeDescription(index)}
                className="px-3!"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={addDescription}
          className="w-full"
        >
          <Plus size={16} className="inline mr-2" />
          Agregar Descripción
        </Button>
      </div>

      {/* Service Points */}
      <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-slate-700">
        <h3 className="text-lg font-bold text-white mb-3">Service Points (Información Adicional)</h3>
        <p className="text-xs text-gray-400 mb-3">Puntos clave o beneficios adicionales del servicio</p>
        
        {(formData.service_points || ['']).map((point, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={point}
              onChange={(e) => handleServicePointChange(index, e.target.value)}
              placeholder={`Service Point ${index + 1}`}
              className="flex-1"
            />
            {(formData.service_points || ['']).length > 1 && (
              <Button
                type="button"
                variant="danger"
                onClick={() => removeServicePoint(index)}
                className="px-3!"
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        ))}
        <Button
          type="button"
          variant="secondary"
          onClick={addServicePoint}
          className="w-full"
        >
          <Plus size={16} className="inline mr-2" />
          Agregar Service Point
        </Button>
      </div>

      {/* Componentes de Precio Dinámico */}
      <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-cyber-purple/50">
        <div className="flex justify-between items-center mb-3">
          <h3 className="text-lg font-bold text-white">Componentes de Precio Dinámico</h3>
          <span className="text-xs text-gray-400">
            {(formData.priceComponents?.length || 0)} componente(s) agregado(s)
          </span>
        </div>

        <div className="p-3 bg-cyber-purple/10 border border-cyber-purple/30 rounded-lg text-sm text-gray-300">
          <p className="font-medium text-white mb-1">💡 ¿Qué son los componentes de precio?</p>
          <p className="text-xs">Los componentes permiten crear precios dinámicos. El usuario podrá configurar opciones que cambiarán el precio final.</p>
        </div>

        {/* Lista de componentes agregados */}
        <div className="space-y-3 mt-4">
          {(formData.priceComponents || []).map((component, index) => (
            <div key={index} className="relative">
              <Button
                type="button"
                variant="danger"
                onClick={() => removePriceComponent(index)}
                className="absolute top-2 right-2 z-10 px-2! py-1!"
              >
                <Trash2 size={14} />
              </Button>
              
              <PriceComponentEditor
                type={component.type}
                config={component.config}
                onChange={(config) => updatePriceComponent(index, config)}
              />
            </div>
          ))}

          {(!formData.priceComponents || formData.priceComponents.length === 0) && (
            <div className="text-center py-8 text-gray-500 text-sm">
              No hay componentes de precio. Usa los botones de abajo para agregar.
            </div>
          )}
        </div>

        {/* Botones para agregar componentes */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-700">
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('bar')}
            className="text-xs py-3"
          >
            + Barra
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('box')}
            className="text-xs py-3"
          >
            + Cajas
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('selectors')}
            className="text-xs py-3"
          >
            + Selectores
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('additional')}
            className="text-xs py-3"
          >
            + Adicionales
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('custom')}
            className="text-xs py-3"
          >
            + Custom
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('boxtitle')}
            className="text-xs py-3"
          >
            + Caja Título
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('labeltitle')}
            className="text-xs py-3"
          >
            + Separador
          </Button>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-col sm:flex-row gap-3 pt-4">
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

ServiceForm.displayName = 'ServiceForm';
