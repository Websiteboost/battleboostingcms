'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { getCategories, deleteCategory, createCategory, updateCategory, reorderCategories } from '@/app/actions/categories';
import { getGames } from '@/app/actions/games';
import { getCategoryGames } from '@/app/actions/categoryGames';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { Pencil, Trash2, Plus, GripVertical } from 'lucide-react';
import type { Category, Game } from '@/types';
import * as Icons from 'lucide-react';

// CategoryCard como componente memoizado
const CategoryCard = memo(({ 
  category, 
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
  category: Category;
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
  // Obtener el icono dinámicamente
  const IconComponent = (Icons as any)[category.icon] || Icons.HelpCircle;

  return (
    <Card className={`transition-all relative ${isDragOver ? 'border-cyber-purple border-2 scale-[1.02]' : ''}`}>
      <div 
        className="p-4"
        draggable
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
      >
        {/* Badge de orden con drag handle */}
        <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-700/80 backdrop-blur-sm rounded-full px-2 py-1">
          <div title="Arrastra para reordenar">
            <GripVertical className="w-4 h-4 text-gray-400 cursor-grab active:cursor-grabbing hover:text-cyber-purple transition-colors" />
          </div>
          <span className="text-xs font-semibold text-cyber-purple">#{displayOrder}</span>
        </div>

        <div className="flex items-start gap-4 pr-16">
          <div className="p-3 rounded-full bg-cyber-purple/20">
            <IconComponent size={24} className="text-cyber-purple" />
          </div>
          <div className="flex-1">
            <h3 className="text-lg font-bold mb-1">{category.name}</h3>
            <p className="text-sm text-gray-400 mb-4">{category.description}</p>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                className="flex-1"
                onClick={onEdit}
              >
                <Pencil size={16} className="mr-2" />
                Editar
              </Button>
              <Button 
                variant="danger" 
                className="flex-1"
                onClick={onDelete}
              >
                <Trash2 size={16} className="mr-2" />
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
});

CategoryCard.displayName = 'CategoryCard';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    const [categoriesResult, gamesResult] = await Promise.all([
      getCategories(),
      getGames()
    ]);
    
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

  const openCreateModal = useCallback(() => {
    setEditingCategory(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback(async (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);

    // Cargar juegos de la categoría
    try {
      const gameIds = await getCategoryGames(category.id);
      setEditingCategory({
        ...category,
        gameIds
      } as any);
    } catch (error) {
      console.error('Error al cargar juegos de categoría:', error);
    }
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingCategory(null);
  }, []);

  const handleFormSubmit = useCallback(async (formData: { name: string; description: string; icon: string; gameIds: string[] }) => {
    const data = editingCategory 
      ? { ...formData, id: editingCategory.id }
      : formData;

    const result = editingCategory
      ? await updateCategory(data)
      : await createCategory(data);

    if (result.success) {
      await loadData();
      closeModal();
    } else {
      throw new Error(result.error || 'Error al guardar');
    }
  }, [editingCategory, loadData, closeModal]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return;
    
    const result = await deleteCategory(id);
    if (result.success) {
      await loadData();
    } else {
      alert(result.error || 'Error al eliminar');
    }
  }, [loadData]);

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

    const newCategories = [...categories];
    const [draggedCategory] = newCategories.splice(draggedIndex, 1);
    newCategories.splice(dropIndex, 0, draggedCategory);

    // Recalcular display_order para todas las categorías
    const updatedCategories = newCategories.map((cat, idx) => ({
      ...cat,
      display_order: idx + 1
    }));

    const updates = updatedCategories.map(cat => ({
      id: cat.id,
      display_order: cat.display_order
    }));

    setCategories(updatedCategories);
    setDraggedIndex(null);
    setDragOverIndex(null);

    const result = await reorderCategories(updates);
    if (!result.success) {
      alert('Error al reordenar categorías');
      await loadData();
    }
  }, [draggedIndex, categories, loadData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando categorías...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text">Categorías</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            {categories.length} {categories.length === 1 ? 'categoría' : 'categorías'}
          </p>
          <p className="text-xs text-cyber-purple/70 mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse"></span>
            Arrastra la categoría para editar el orden
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Categories List */}
      {categories.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <Icons.Folder size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-sm sm:text-base text-gray-400 mb-4">No hay categorías creadas</p>
          <Button onClick={openCreateModal} className="w-full sm:w-auto">Crear primera categoría</Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          {categories.map((category, index) => (
            <CategoryCard
              key={category.id}
              category={category}
              displayOrder={(category as any).display_order || index + 1}
              onEdit={() => openEditModal(category)}
              onDelete={() => handleDelete(category.id, category.name)}
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
          title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}
        >
          <CategoryForm
            key={editingCategory?.id || 'new'}
            initialData={editingCategory ? {
              name: editingCategory.name,
              description: editingCategory.description,
              icon: editingCategory.icon,
              gameIds: (editingCategory as any).gameIds || [],
            } : undefined}
            games={games}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isEditing={!!editingCategory}
          />
        </Modal>
      )}
    </div>
  );
}
