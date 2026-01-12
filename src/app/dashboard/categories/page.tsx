'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { getCategories, deleteCategory, createCategory, updateCategory } from '@/app/actions/categories';
import { getGames } from '@/app/actions/games';
import { getCategoryGames } from '@/app/actions/categoryGames';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm } from '@/components/forms/CategoryForm';
import { Pencil, Trash2, Plus } from 'lucide-react';
import type { Category, Game } from '@/types';
import * as Icons from 'lucide-react';

// CategoryCard como componente memoizado
const CategoryCard = memo(({ 
  category, 
  onEdit, 
  onDelete 
}: { 
  category: Category;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  // Obtener el icono dinámicamente
  const IconComponent = (Icons as any)[category.icon] || Icons.HelpCircle;

  return (
    <Card className="p-4">
      <div className="flex items-start gap-4">
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
          {categories.map((category) => (
            <CategoryCard
              key={category.id}
              category={category}
              onEdit={() => openEditModal(category)}
              onDelete={() => handleDelete(category.id, category.name)}
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
