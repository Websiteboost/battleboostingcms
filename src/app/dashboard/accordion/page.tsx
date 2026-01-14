'use client';

import { useEffect, useState, useCallback } from 'react';
import { 
  getAccordionItems, 
  deleteAccordionItem, 
  createAccordionItem, 
  updateAccordionItem,
  reorderAccordionItems,
  type AccordionItem 
} from '@/app/actions/accordion';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { AccordionForm } from '@/components/forms/AccordionForm';
import { Pencil, Trash2, Plus, GripVertical, ChevronDown, ChevronUp } from 'lucide-react';

export default function AccordionPage() {
  const [items, setItems] = useState<AccordionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<AccordionItem | null>(null);
  const [expandedItem, setExpandedItem] = useState<string | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const result = await getAccordionItems();
    if (result.success && result.data) {
      setItems(result.data as AccordionItem[]);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const openCreateModal = useCallback(() => {
    setEditingItem(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: AccordionItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingItem(null);
  }, []);

  const handleFormSubmit = useCallback(async (formData: any) => {
    const result = editingItem 
      ? await updateAccordionItem({ ...formData, id: editingItem.id })
      : await createAccordionItem(formData);

    if (result.success) {
      await loadData();
      closeModal();
    } else {
      throw new Error(result.error || 'Error al guardar');
    }
  }, [editingItem, loadData, closeModal]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;
    
    const result = await deleteAccordionItem(id);
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Error al eliminar');
    }
  }, [loadData]);

  const moveItem = useCallback(async (index: number, direction: 'up' | 'down') => {
    const newItems = [...items];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    // Intercambiar items
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    
    // Actualizar display_order en cada item
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      display_order: idx + 1
    }));

    const updates = updatedItems.map(item => ({
      id: item.id,
      display_order: item.display_order
    }));

    setItems(updatedItems);
    
    const result = await reorderAccordionItems(updates);
    if (!result.success) {
      alert('Error al reordenar items');
      await loadData();
    }
  }, [items, loadData]);

  // Drag and Drop handlers
  const handleDragStart = useCallback((e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = 'move';
    // Añadir un estilo visual durante el drag
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

    const newItems = [...items];
    const [draggedItem] = newItems.splice(draggedIndex, 1);
    newItems.splice(dropIndex, 0, draggedItem);

    // Recalcular display_order para todos los items
    const updatedItems = newItems.map((item, idx) => ({
      ...item,
      display_order: idx + 1
    }));

    const updates = updatedItems.map(item => ({
      id: item.id,
      display_order: item.display_order
    }));

    setItems(updatedItems);
    setDraggedIndex(null);
    setDragOverIndex(null);

    const result = await reorderAccordionItems(updates);
    if (!result.success) {
      alert('Error al reordenar items');
      await loadData();
    }
  }, [draggedIndex, items, loadData]);

  const toggleExpanded = useCallback((id: string) => {
    setExpandedItem(prev => prev === id ? null : id);
  }, []);

  const maxOrder = items.length > 0 ? Math.max(...items.map(i => i.display_order)) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyber-purple"></div>
          <p className="mt-4 text-gray-400">Cargando preguntas frecuentes...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-white">
            Preguntas Frecuentes (FAQ)
          </h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            Gestiona el acordeón de preguntas y respuestas
          </p>
          <p className="text-xs text-cyber-purple/70 mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse"></span>
            Arrastra la opción para editar el orden
          </p>
        </div>
        <Button 
          onClick={openCreateModal}
          className="w-full sm:w-auto"
        >
          <Plus className="w-4 h-4 mr-2" />
          Nueva Pregunta
        </Button>
      </div>

      {/* Items List */}
      {items.length === 0 ? (
        <Card className="text-center py-12">
          <p className="text-gray-400 mb-4">No hay preguntas frecuentes todavía</p>
          <Button onClick={openCreateModal}>
            <Plus className="w-4 h-4 mr-2" />
            Crear Primera Pregunta
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {items.map((item, index) => (
            <Card 
              key={item.id} 
              className={`transition-all ${
                dragOverIndex === index 
                  ? 'border-cyber-purple border-2 scale-[1.02]' 
                  : 'hover:border-cyber-purple/50'
              }`}
            >
              <div 
                className="p-4"
                draggable
                onDragStart={(e: React.DragEvent<HTMLDivElement>) => handleDragStart(e, index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e: React.DragEvent<HTMLDivElement>) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e: React.DragEvent<HTMLDivElement>) => handleDrop(e, index)}
              >
                <div className="flex items-start gap-3">
                  {/* Drag Handle & Order Controls */}
                  <div className="flex flex-col items-center gap-1 pt-1">
                    <div title="Arrastra para reordenar">
                      <GripVertical 
                        className="w-5 h-5 text-gray-400 cursor-grab active:cursor-grabbing hover:text-cyber-purple transition-colors" 
                      />
                    </div>
                  <div className="flex flex-col gap-0.5">
                    <button
                      onClick={() => moveItem(index, 'up')}
                      disabled={index === 0}
                      className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Mover arriba"
                    >
                      <ChevronUp className="w-4 h-4 text-gray-400" />
                    </button>
                    <button
                      onClick={() => moveItem(index, 'down')}
                      disabled={index === items.length - 1}
                      className="p-0.5 hover:bg-slate-700 rounded disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      title="Mover abajo"
                    >
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                  <span className="text-xs text-gray-500 mt-1">#{item.display_order}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => toggleExpanded(item.id)}
                    className="w-full text-left group"
                  >
                    <h3 className="text-base sm:text-lg font-semibold text-white group-hover:text-cyber-purple transition-colors">
                      {item.title}
                    </h3>
                  </button>
                  
                  {expandedItem === item.id && (
                    <div className="mt-3 pt-3 border-t border-slate-700">
                      <p className="text-sm text-gray-300 whitespace-pre-wrap">
                        {item.content}
                      </p>
                      <p className="text-xs text-gray-500 mt-2">
                        {item.content.length} caracteres
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button
                    variant="secondary"
                    onClick={() => openEditModal(item)}
                    title="Editar"
                  >
                    <Pencil className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    onClick={() => handleDelete(item.id, item.title)}
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de Crear/Editar */}
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={editingItem ? 'Editar Pregunta' : 'Nueva Pregunta'}
      >
        <AccordionForm
          key={editingItem?.id || 'new'}
          initialData={editingItem ? {
            id: editingItem.id,
            title: editingItem.title,
            content: editingItem.content,
            display_order: editingItem.display_order,
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={closeModal}
          isEditing={!!editingItem}
          maxOrder={maxOrder}
        />
      </Modal>
    </div>
  );
}
