'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { getServices, deleteService, createService, updateService, reorderServices } from '@/app/actions/services';
import { getCategories } from '@/app/actions/categories';
import { getGames } from '@/app/actions/games';
import { getServicePriceComponents } from '@/app/actions/servicePrices';
import { getServiceGames } from '@/app/actions/serviceGames';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ServiceForm } from '@/components/forms/ServiceForm';
import { Pencil, Trash2, Plus, Image as ImageIcon, GripVertical } from 'lucide-react';
import type { Service, Category, Game } from '@/types';
import type { PriceComponent } from '@/types/priceComponents';
import Image from 'next/image';
import toast from 'react-hot-toast';

// ServiceCard como componente memoizado
const ServiceCard = memo(({ 
  service, 
  categoryName,
  imageError,
  onImageError,
  onEdit, 
  onDelete,
  displayOrder,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
  isDragOver
}: { 
  service: Service;
  categoryName: string;
  imageError: boolean;
  onImageError: () => void;
  onEdit: () => void;
  onDelete: () => void;
  displayOrder: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragOver: boolean;
}) => {
  return (
    <Card className={`overflow-hidden transition-all relative ${isDragOver ? 'border-cyber-purple border-2 scale-[1.02]' : ''}`}>
      <div 
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Badge de orden con drag handle */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-1 bg-slate-900/90 backdrop-blur-sm rounded-full px-2 py-1 shadow-lg">
          <div title="Arrastra para reordenar">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing hover:text-cyber-purple transition-colors" />
          </div>
          <span className="text-xs font-semibold text-cyber-purple">#{displayOrder}</span>
        </div>

        <div className="relative h-40 sm:h-48 bg-slate-800">
          {!imageError && service.image ? (
            <Image
              src={service.image}
              alt={service.title}
              fill
              className="object-cover"
              onError={onImageError}
              unoptimized
              loading="eager"
              priority
            />
          ) : (
            <div className="flex items-center justify-center h-full">
              <ImageIcon size={40} className="sm:w-12 sm:h-12 text-gray-600" />
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="text-base sm:text-lg font-bold mb-1 truncate">{service.title}</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-2">{categoryName}</p>
          <p className="text-lg font-bold text-cyber-purple mb-3">${service.price}</p>
          <div className="flex gap-2">
            <Button 
              variant="secondary" 
              className="flex-1"
              onClick={onEdit}
            >
              <Pencil size={16} />
            </Button>
            <Button 
              variant="danger" 
              className="flex-1"
              onClick={onDelete}
            >
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
});

ServiceCard.displayName = 'ServiceCard';

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [servicesResult, categoriesResult, gamesResult] = await Promise.all([
      getServices(),
      getCategories(),
      getGames()
    ]);

    if (servicesResult.success && servicesResult.data) {
      setServices(servicesResult.data as Service[]);
    }

    if (categoriesResult.success && categoriesResult.data) {
      setCategories(categoriesResult.data as Category[]);
    }

    if (gamesResult.success && gamesResult.data) {
      setGames(gamesResult.data as Game[]);
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getCategoryName = useCallback((categoryId: string) => {
    return categories.find(c => c.id === categoryId)?.name || 'Sin categoría';
  }, [categories]);

  const openCreateModal = useCallback(() => {
    setEditingService(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback(async (service: Service) => {
    setEditingService(service);
    setIsModalOpen(true);
    
    // Cargar componentes de precio y juegos del servicio
    try {
      const [priceComponents, gameIds] = await Promise.all([
        getServicePriceComponents(service.id),
        getServiceGames(service.id)
      ]);
      setEditingService({
        ...service,
        priceComponents,
        gameIds
      } as any);
    } catch (error) {
      console.error('Error al cargar datos del servicio:', error);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingService(null);
  }, []);

  const handleFormSubmit = useCallback(async (formData: any) => {
    const data = editingService 
      ? { ...formData, id: editingService.id }
      : formData;

    const result = editingService
      ? await updateService(data)
      : await createService(data);

    if (result.success) {
      toast.success(editingService ? 'Servicio actualizado exitosamente' : 'Servicio creado exitosamente', {
        duration: 3000,
        position: 'top-center',
      });
      await loadData();
      closeModal();
    } else {
      // Mostrar errores detallados
      if ((result as any).details && Array.isArray((result as any).details)) {
        (result as any).details.forEach((detail: string) => {
          toast.error(detail, {
            duration: 5000,
            position: 'top-center',
          });
        });
      } else {
        toast.error(result.error || 'Error al guardar', {
          duration: 4000,
          position: 'top-center',
        });
      }
      throw new Error(result.error || 'Error al guardar');
    }
  }, [editingService, loadData, closeModal]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;
    
    const result = await deleteService(id);
    if (result.success) {
      toast.success('Servicio eliminado exitosamente', {
        duration: 3000,
        position: 'top-center',
      });
      await loadData();
    } else {
      toast.error(result.error || 'Error al eliminar', {
        duration: 4000,
        position: 'top-center',
      });
    }
  }, [loadData]);

  const handleImageError = useCallback((serviceId: string) => {
    setImageError(prev => ({ ...prev, [serviceId]: true }));
  }, []);

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '0.5';
    }
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) {
      e.currentTarget.style.opacity = '1';
    }
    setDraggedIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    
    if (draggedIndex === null || draggedIndex === dropIndex) {
      setDraggedIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newServices = [...services];
    const [draggedService] = newServices.splice(draggedIndex, 1);
    newServices.splice(dropIndex, 0, draggedService);

    // Recalcular display_order para todos los servicios
    const updatedServices = newServices.map((svc, idx) => ({
      ...svc,
      display_order: idx + 1
    }));

    const updates = updatedServices.map(svc => ({
      id: svc.id,
      display_order: svc.display_order
    }));

    setServices(updatedServices);
    setDraggedIndex(null);
    setDragOverIndex(null);

    const result = await reorderServices(updates);
    if (!result.success) {
      alert('Error al reordenar servicios');
      await loadData();
    }
  }, [draggedIndex, services, loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando servicios...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text">Servicios</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            {services.length} {services.length === 1 ? 'servicio' : 'servicios'}
          </p>
          <p className="text-xs text-cyber-purple/70 mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse"></span>
            Arrastra el servicio para editar el orden
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Nuevo Servicio
        </Button>
      </div>

      {/* Services Grid */}
      {services.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <ImageIcon size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-sm sm:text-base text-gray-400 mb-4">No hay servicios creados</p>
          <Button onClick={openCreateModal} className="w-full sm:w-auto">Crear primer servicio</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {services.map((service, index) => (
            <ServiceCard
              key={service.id}
              service={service}
              categoryName={getCategoryName(service.category_id)}
              displayOrder={(service as any).display_order || index + 1}
              imageError={imageError[service.id] || false}
              onImageError={() => handleImageError(service.id)}
              onEdit={() => openEditModal(service)}
              onDelete={() => handleDelete(service.id, service.title)}
              onDragStart={(e) => handleDragStart(e, index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => handleDragOver(e, index)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, index)}
              isDragOver={dragOverIndex === index}
            />
          ))}
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingService ? 'Editar Servicio' : 'Nuevo Servicio'}
        >
          <ServiceForm
            key={editingService?.id || 'new'}
            initialData={editingService ? {
              title: editingService.title,
              category_id: editingService.category_id,
              price: editingService.price,
              image: editingService.image,
              description: editingService.description,
              service_points: (editingService as any).service_points || [],
              priceComponents: (editingService as any).priceComponents || [],
              gameIds: (editingService as any).gameIds || []
            } : undefined}
            categories={categories.map(c => ({ id: c.id, name: c.name }))}
            games={games}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isEditing={!!editingService}
          />
        </Modal>
      )}
    </div>
  );
}
