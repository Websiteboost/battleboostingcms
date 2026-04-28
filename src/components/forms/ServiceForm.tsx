'use client';

import { useState, useCallback, memo, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { ImagePreview } from './ImagePreview';
import { Trash2, Plus, ChevronDown, ArrowUp, ArrowDown } from 'lucide-react';

// bundle-dynamic-imports: load heavy component only on demand (7 sub-editors)
const PriceComponentEditor = dynamic(
  () => import('./PriceComponentEditor').then(m => ({ default: m.PriceComponentEditor })),
  { loading: () => <div className="h-20 animate-pulse bg-slate-800/60 rounded-lg" />, ssr: false }
);

// Hoisted outside component to avoid recreation on every render
const COMPONENT_LABELS: Record<string, string> = {
  bar: 'Barra',
  box: 'Cajas',
  selectors: 'Selectores',
  additional: 'Adicionales',
  custom: 'Custom',
  boxtitle: 'Caja Título',
  labeltitle: 'Separador',
  group: 'Grupo',
  'tab-group': 'Grup. Tabs',
  'select-group': 'Grup. Select',
};

// Tipos que producen un valor numérico al total (aplican descuento)
const DISCOUNT_COMPONENT_TYPES = new Set(['bar', 'box', 'selectors', 'additional', 'custom']);
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
  LabelTitleConfig,
  GroupConfig,
  TabGroupConfig,
  SelectGroupConfig,
} from '@/types/priceComponents';

interface ServiceFormProps {
  initialData?: {
    title: string;
    title_es?: string | null;
    category_id: string;
    price: number;
    image: string;
    description: string[];
    description_es?: string[] | null;
    service_points?: string[];
    service_points_es?: string[] | null;
    priceComponents?: PriceComponent[];
    gameIds?: string[];
  };
  categories: Array<{ id: string; name: string }>;
  games: Game[];
  onSubmit: (data: { 
    title: string;
    title_es?: string | null;
    category_id: string; 
    price: number; 
    image: string; 
    description: string[];
    description_es?: string[] | null;
    service_points?: string[];
    service_points_es?: string[] | null;
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
    case 'group':
      return { title: 'Nuevo Grupo', collapseByDefault: false, children: [] } as GroupConfig;
    case 'tab-group':
      return { tabs: [{ title: 'Pestaña 1', children: [] }] } as TabGroupConfig;
    case 'select-group':
      return { label: 'Selecciona una opción', options: [{ title: 'Opción 1', children: [] }] } as SelectGroupConfig;
  }
};

export const ServiceForm = memo(({ initialData, categories, games, onSubmit, onCancel, isEditing }: ServiceFormProps) => {
  const [formData, setFormData] = useState(initialData || {
    title: '',
    title_es: '' as string | null | undefined,
    category_id: '',
    price: 0,
    image: '',
    description: [''],
    description_es: [''] as string[] | null | undefined,
    service_points: [''],
    service_points_es: [''] as string[] | null | undefined,
    priceComponents: [],
    gameIds: [],
  });
  const [saving, setSaving] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
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
        description_es: (formData.description_es || []).filter(d => d.trim() !== ''),
        service_points: (formData.service_points || []).filter(p => p.trim() !== ''),
        service_points_es: (formData.service_points_es || []).filter(p => p.trim() !== ''),
        priceComponents: (formData.priceComponents || []).map(({ id, created_at, ...rest }, i) => ({
          ...rest,
          display_order: i,
          discount_percent: parseFloat(String(rest.discount_percent ?? 0)) || 0,
        })),
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

  const handleTitleEsChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, title_es: e.target.value }));
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

  const handleDescriptionEsChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newDescriptions = [...(prev.description_es || [''])];
      newDescriptions[index] = value;
      return { ...prev, description_es: newDescriptions };
    });
  }, []);

  const addDescriptionEs = useCallback(() => {
    setFormData(prev => ({ ...prev, description_es: [...(prev.description_es || ['']), ''] }));
  }, []);

  const removeDescriptionEs = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      description_es: (prev.description_es || ['']).filter((_, i) => i !== index),
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

  const handleServicePointEsChange = useCallback((index: number, value: string) => {
    setFormData(prev => {
      const newPoints = [...(prev.service_points_es || [''])];
      newPoints[index] = value;
      return { ...prev, service_points_es: newPoints };
    });
  }, []);

  const addServicePointEs = useCallback(() => {
    setFormData(prev => ({ ...prev, service_points_es: [...(prev.service_points_es || ['']), ''] }));
  }, []);

  const removeServicePointEs = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      service_points_es: (prev.service_points_es || ['']).filter((_, i) => i !== index),
    }));
  }, []);

  // Price Components handlers
  const addPriceComponent = useCallback((type: PriceComponentType) => {
    const nextIndex = formData.priceComponents?.length || 0;
    const newComponent: PriceComponent = {
      service_id: '',
      type,
      config: getDefaultConfig(type),
    };
    setFormData(prev => ({
      ...prev,
      priceComponents: [...(prev.priceComponents || []), newComponent],
    }));
    setExpandedIndex(nextIndex); // auto-expand newly added component
  }, [formData.priceComponents?.length]);

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

  const updatePriceComponentConfigEs = useCallback((index: number, configEs: any) => {
    setFormData(prev => {
      const newComponents = [...(prev.priceComponents || [])];
      newComponents[index] = { ...newComponents[index], config_es: configEs };
      return { ...prev, priceComponents: newComponents };
    });
  }, []);

  const updatePriceComponentRequired = useCallback((index: number, required: boolean) => {
    setFormData(prev => {
      const newComponents = [...(prev.priceComponents || [])];
      newComponents[index] = { ...newComponents[index], required };
      return { ...prev, priceComponents: newComponents };
    });
  }, []);

  const updatePriceComponentEstimatedTime = useCallback((index: number, estimatedTime: number) => {
    setFormData(prev => {
      const newComponents = [...(prev.priceComponents || [])];
      newComponents[index] = { ...newComponents[index], estimated_time: estimatedTime };
      return { ...prev, priceComponents: newComponents };
    });
  }, []);

  const updatePriceComponentDiscountPercent = useCallback((index: number, discountPercent: number) => {
    setFormData(prev => {
      const newComponents = [...(prev.priceComponents || [])];
      newComponents[index] = { ...newComponents[index], discount_percent: discountPercent };
      return { ...prev, priceComponents: newComponents };
    });
  }, []);

  const removePriceComponent = useCallback((index: number) => {
    setFormData(prev => ({
      ...prev,
      priceComponents: (prev.priceComponents || []).filter((_, i) => i !== index),
    }));
    // Adjust expandedIndex after removal
    setExpandedIndex(prev => {
      if (prev === null) return null;
      if (prev === index) return null;
      if (prev > index) return prev - 1;
      return prev;
    });
  }, []);

  const moveComponent = useCallback((index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    setFormData(prev => {
      const components = [...(prev.priceComponents || [])];
      if (targetIndex < 0 || targetIndex >= components.length) return prev;
      [components[index], components[targetIndex]] = [components[targetIndex], components[index]];
      return { ...prev, priceComponents: components };
    });
    // Keep the same component expanded after move
    setExpandedIndex(prev => {
      if (prev === index) return targetIndex;
      if (prev === targetIndex) return index;
      return prev;
    });
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

        <Input
          label={<>Título <span className="text-xs font-normal text-amber-400">(Spanish)</span></>}
          value={formData.title_es ?? ''}
          onChange={handleTitleEsChange}
          placeholder="Ej: Level 1-50 Express"
          className="border-amber-500/40 focus:border-amber-400"
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

      {/* Descripciones (Spanish) */}
      <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-amber-500/40">
        <h3 className="text-lg font-bold text-white mb-1">
          Descripciones / Características <span className="text-sm font-normal text-amber-400">(Spanish)</span>
        </h3>
        <p className="text-xs text-amber-400/70 mb-3">Versión en español de cada característica</p>
        
        {(formData.description_es || ['']).map((desc, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={desc}
              onChange={(e) => handleDescriptionEsChange(index, e.target.value)}
              placeholder={`Característica ${index + 1} (Spanish)`}
              className="flex-1 border-amber-500/40 focus:border-amber-400"
            />
            {(formData.description_es || ['']).length > 1 && (
              <Button
                type="button"
                variant="danger"
                onClick={() => removeDescriptionEs(index)}
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
          onClick={addDescriptionEs}
          className="w-full border-amber-500/40! text-amber-400!"
        >
          <Plus size={16} className="inline mr-2" />
          Agregar Descripción (Spanish)
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

      {/* Service Points (Spanish) */}
      <div className="space-y-3 p-4 bg-slate-900/50 rounded-lg border border-amber-500/40">
        <h3 className="text-lg font-bold text-white mb-1">
          Service Points <span className="text-sm font-normal text-amber-400">(Spanish)</span>
        </h3>
        <p className="text-xs text-amber-400/70 mb-3">Versión en español de cada punto adicional</p>
        
        {(formData.service_points_es || ['']).map((point, index) => (
          <div key={index} className="flex gap-2">
            <Input
              value={point}
              onChange={(e) => handleServicePointEsChange(index, e.target.value)}
              placeholder={`Service Point ${index + 1} (Spanish)`}
              className="flex-1 border-amber-500/40 focus:border-amber-400"
            />
            {(formData.service_points_es || ['']).length > 1 && (
              <Button
                type="button"
                variant="danger"
                onClick={() => removeServicePointEs(index)}
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
          onClick={addServicePointEs}
          className="w-full border-amber-500/40! text-amber-400!"
        >
          <Plus size={16} className="inline mr-2" />
          Agregar Service Point (Spanish)
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

        {/* Lista de componentes en acordeón */}
        <div className="space-y-2 mt-4">
          {(formData.priceComponents || []).map((component, index) => {
            const isExpanded = expandedIndex === index;
            const totalComponents = formData.priceComponents?.length || 0;
            return (
              <div key={index} className="border border-slate-700 rounded-lg overflow-hidden">
                {/* Accordion Header */}
                <div
                  className="flex items-center gap-2 p-3 bg-slate-800/80 cursor-pointer select-none hover:bg-slate-800 transition-colors"
                  onClick={() => setExpandedIndex(isExpanded ? null : index)}
                >
                  <span className="text-xs font-bold text-cyber-purple w-5 text-center shrink-0">{index + 1}</span>
                  <span className="flex-1 text-sm font-medium text-white">
                    {COMPONENT_LABELS[component.type] ?? component.type}
                  </span>

                  {/* Badge de descuento — visible en cabecera si discount > 0 */}
                  {DISCOUNT_COMPONENT_TYPES.has(component.type) && (component.discount_percent ?? 0) > 0 && (
                    <span className="text-xs font-bold px-1.5 py-0.5 rounded bg-cyber-green/20 text-cyber-green border border-cyber-green/30 shrink-0">
                      -{component.discount_percent}%
                    </span>
                  )}

                  {/* Toggle Obligatorio — siempre visible sin expandir */}
                  <div className="flex items-center gap-1.5" onClick={e => e.stopPropagation()}>
                    <span className="text-xs text-gray-500 hidden sm:inline">Obligatorio</span>
                    <button
                      type="button"
                      onClick={() => updatePriceComponentRequired(index, !component.required)}
                      className={`relative w-9 h-5 rounded-full transition-colors duration-200 shrink-0 ${
                        component.required ? 'bg-cyber-purple' : 'bg-slate-600'
                      }`}
                      title={component.required ? 'Obligatorio: Sí' : 'Obligatorio: No'}
                    >
                      <span className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-all duration-200 ${
                        component.required ? 'left-4.5' : 'left-0.5'
                      }`} />
                    </button>
                  </div>

                  {/* Reorder buttons — stopPropagation so they don't toggle accordion */}
                  <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => moveComponent(index, 'up')}
                      className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                      title="Mover arriba"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      type="button"
                      disabled={index === totalComponents - 1}
                      onClick={() => moveComponent(index, 'down')}
                      className="p-1.5 rounded hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed text-gray-400 hover:text-white transition-colors"
                      title="Mover abajo"
                    >
                      <ArrowDown size={13} />
                    </button>
                  </div>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={e => { e.stopPropagation(); removePriceComponent(index); }}
                    className="p-1.5 rounded hover:bg-red-900/50 text-gray-400 hover:text-red-400 transition-colors"
                    title="Eliminar componente"
                  >
                    <Trash2 size={13} />
                  </button>

                  {/* Expand indicator */}
                  <ChevronDown
                    size={16}
                    className={`text-gray-400 transition-transform duration-200 shrink-0 ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                  />
                </div>

                {/* Accordion Content — only mounted when expanded (rerender-memo / lazy) */}
                {isExpanded && (
                  <div className="p-3 border-t border-slate-700/60 space-y-3">
                    {/* Metadatos del componente: tiempo estimado + descuento */}
                    <div className="flex flex-wrap items-center gap-x-6 gap-y-2 px-1 pb-1 border-b border-slate-700/40">
                      {/* Tiempo Estimado */}
                      <div className="flex items-center gap-2">
                        <label className="text-xs text-gray-400 shrink-0">⏱ Tiempo estimado (min):</label>
                        <input
                          type="number"
                          min="0"
                          step="1"
                          value={component.estimated_time ?? 0}
                          onChange={(e) => updatePriceComponentEstimatedTime(index, parseInt(e.target.value) || 0)}
                          className="w-20 px-2 py-1 bg-slate-800/50 border border-slate-600 rounded text-xs text-white focus:outline-none focus:border-cyber-purple transition-colors"
                        />
                        <span className="text-xs text-gray-500">(0 = no aplica)</span>
                      </div>
                      {/* Descuento — solo para tipos con valor numérico */}
                      {DISCOUNT_COMPONENT_TYPES.has(component.type) && (
                        <div className="flex items-center gap-2">
                          <label className="text-xs text-gray-400 shrink-0">🏷 Descuento (%):</label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            step="0.01"
                            value={component.discount_percent ?? 0}
                            onChange={(e) => updatePriceComponentDiscountPercent(index, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 bg-slate-800/50 border border-cyber-green/30 rounded text-xs text-white focus:outline-none focus:border-cyber-green transition-colors"
                          />
                          <span className="text-xs text-gray-500">(0 = sin descuento)</span>
                        </div>
                      )}
                    </div>
                    <PriceComponentEditor
                      type={component.type}
                      config={component.config}
                      configEs={component.config_es}
                      onChange={(config) => updatePriceComponent(index, config)}
                      onChangeEs={(configEs) => updatePriceComponentConfigEs(index, configEs)}
                    />
                  </div>
                )}
              </div>
            );
          })}

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
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('group')}
            className="text-xs py-3 border-amber-500/40! text-amber-400!"
          >
            + Grupo
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('tab-group')}
            className="text-xs py-3 border-cyber-cyan/40! text-cyber-cyan!"
          >
            + Grup. Tabs
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => addPriceComponent('select-group')}
            className="text-xs py-3 border-cyber-pink/40! text-cyber-pink!"
          >
            + Grup. Select
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
