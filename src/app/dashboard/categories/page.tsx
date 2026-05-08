'use client';

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import {
  getCategories, deleteCategory, createCategory, updateCategory,
  reorderCategories, duplicateCategory, moveCategoryToPosition
} from '@/app/actions/categories';
import { getGames } from '@/app/actions/games';
import { getCategoryGames } from '@/app/actions/categoryGames';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { CategoryForm } from '@/components/forms/CategoryForm';
import {
  Pencil, Trash2, Plus, GripVertical, Copy,
  Search, X, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import type { Category, Game } from '@/types';
import * as Icons from 'lucide-react';
import toast from 'react-hot-toast';

// ─── helpers ──────────────────────────────────────────────────────────────────

function getPageNumbers(current: number, total: number): (number | '...')[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages: (number | '...')[] = [1];
  if (current > 3) pages.push('...');
  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('...');
  pages.push(total);
  return pages;
}

// ─── PaginationControls ────────────────────────────────────────────────────────

const PaginationControls = memo(({ current, total, onChange }: {
  current: number;
  total: number;
  onChange: (p: number) => void;
}) => {
  const pages = getPageNumbers(current, total);
  return (
    <div className="flex items-center justify-center gap-1.5 flex-wrap">
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        className="p-2 rounded-lg bg-slate-800/60 border border-cyber-purple/20 text-gray-400 hover:text-white hover:border-cyber-purple/60 hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`e${i}`} className="px-1 text-gray-500 text-sm select-none">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onChange(p as number)}
            className={`min-w-[36px] h-9 px-2 rounded-lg text-sm font-medium transition-all border ${
              p === current
                ? 'bg-cyber-purple text-white border-cyber-purple shadow-neon'
                : 'bg-slate-800/60 border-cyber-purple/20 text-gray-400 hover:text-white hover:border-cyber-purple/60 hover:bg-slate-700/60'
            }`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        className="p-2 rounded-lg bg-slate-800/60 border border-cyber-purple/20 text-gray-400 hover:text-white hover:border-cyber-purple/60 hover:bg-slate-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
});
PaginationControls.displayName = 'PaginationControls';

// ─── CategoryCard ──────────────────────────────────────────────────────────────

const CategoryCard = memo(({
  category,
  onEdit,
  onDelete,
  onDuplicate,
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
  onDuplicate: () => void;
  displayOrder: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragOver: boolean;
}) => {
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
        <button
          onClick={onDuplicate}
          className="absolute top-2 left-2 z-10 p-1.5 sm:p-2 bg-slate-700/80 hover:bg-cyber-purple/80 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95"
          title="Duplicar categoría"
        >
          <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 hover:text-white" />
        </button>

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
              <Button variant="secondary" className="flex-1" onClick={onEdit}>
                <Pencil size={16} className="mr-2" />
                Editar
              </Button>
              <Button variant="danger" className="flex-1" onClick={onDelete}>
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

// ─── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [
  { value: 8,  label: '8 por página'  },
  { value: 12, label: '12 por página' },
  { value: 24, label: '24 por página' },
  { value: 48, label: '48 por página' },
  { value: 0,  label: 'Todos'         },
];

export default function CategoriesPage() {
  const [categories,       setCategories]       = useState<Category[]>([]);
  const [games,            setGames]            = useState<Game[]>([]);
  const [loading,          setLoading]          = useState(true);
  const [isModalOpen,      setIsModalOpen]      = useState(false);
  const [editingCategory,  setEditingCategory]  = useState<Category | null>(null);

  // drag
  const [draggedId,  setDraggedId]  = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // search + pagination
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize,    setPageSize]    = useState(12);

  // ── data ──────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    const [catRes, gameRes] = await Promise.all([getCategories(), getGames()]);
    if (catRes.success  && catRes.data)  setCategories(catRes.data as Category[]);
    if (gameRes.success && gameRes.data) setGames(gameRes.data as Game[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  // ── filtered + paginated ───────────────────────────────────────────────────

  const filteredCategories = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter(c =>
      c.name.toLowerCase().includes(q) ||
      (c.name_es?.toLowerCase().includes(q) ?? false) ||
      c.description.toLowerCase().includes(q) ||
      (c.description_es?.toLowerCase().includes(q) ?? false)
    );
  }, [categories, searchQuery]);

  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filteredCategories.length / pageSize));

  const paginatedCategories = useMemo(() => {
    if (pageSize === 0) return filteredCategories;
    const start = (currentPage - 1) * pageSize;
    return filteredCategories.slice(start, start + pageSize);
  }, [filteredCategories, currentPage, pageSize]);

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  }, []);

  const openCreateModal = useCallback(() => { setEditingCategory(null); setIsModalOpen(true); }, []);

  const openEditModal = useCallback(async (category: Category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
    try {
      const gameIds = await getCategoryGames(category.id);
      setEditingCategory({ ...category, gameIds } as any);
    } catch {
      // no-op
    }
  }, []);

  const closeModal = useCallback(() => { setIsModalOpen(false); setEditingCategory(null); }, []);

  const handleFormSubmit = useCallback(async (
    formData: {
      name: string;
      description: string;
      icon: string;
      gameIds: string[];
      name_es?: string | null;
      description_es?: string | null;
      display_order?: number;
    }
  ) => {
    const { display_order, ...restData } = formData;
    const data = editingCategory ? { ...restData, id: editingCategory.id } : restData;
    const result = editingCategory ? await updateCategory(data) : await createCategory(data);

    if (result.success) {
      // Si el orden cambió, mover a la nueva posición
      if (editingCategory && display_order !== undefined) {
        const originalOrder = (editingCategory as any).display_order as number;
        if (display_order !== originalOrder) {
          const moveResult = await moveCategoryToPosition(editingCategory.id, display_order);
          if (!moveResult.success) {
            toast.error(moveResult.error || 'Error al actualizar la posición', {
              duration: 4000, position: 'top-center'
            });
          }
        }
      }

      toast.success(editingCategory ? 'Categoría actualizada exitosamente' : 'Categoría creada exitosamente', {
        duration: 3000, position: 'top-center'
      });
      await loadData();
      closeModal();
    } else {
      if ((result as any).details?.length) {
        (result as any).details.forEach((d: string) =>
          toast.error(d, { duration: 5000, position: 'top-center' })
        );
      } else {
        toast.error(result.error || 'Error al guardar', { duration: 4000, position: 'top-center' });
      }
      throw new Error(result.error || 'Error al guardar');
    }
  }, [editingCategory, loadData, closeModal]);

  const handleDelete = useCallback(async (id: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${name}"?`)) return;
    const result = await deleteCategory(id);
    if (result.success) {
      toast.success('Categoría eliminada exitosamente', { duration: 3000, position: 'top-center' });
      await loadData();
    } else {
      toast.error(result.error || 'Error al eliminar', { duration: 4000, position: 'top-center' });
    }
  }, [loadData]);

  const handleDuplicate = useCallback(async (id: string, name: string) => {
    if (!confirm(`¿Deseas duplicar la categoría "${name}"?`)) return;
    toast.loading('Duplicando categoría...', { duration: 1000, position: 'top-center' });
    const result = await duplicateCategory(id);
    if (result.success) {
      toast.success('Categoría duplicada exitosamente', { duration: 3000, position: 'top-center' });
      await loadData();
    } else {
      toast.error(result.error || 'Error al duplicar', { duration: 4000, position: 'top-center' });
    }
  }, [loadData]);

  // drag — usa IDs para que el offset de página no afecte los índices
  const handleDragStart = useCallback((e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '0.5';
  }, []);

  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (e.currentTarget instanceof HTMLElement) e.currentTarget.style.opacity = '1';
    setDraggedId(null);
    setDragOverId(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, id: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverId(id);
  }, []);

  const handleDragLeave = useCallback(() => setDragOverId(null), []);

  const handleDrop = useCallback(async (e: React.DragEvent, dropId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === dropId) { setDraggedId(null); setDragOverId(null); return; }

    const fromIdx = categories.findIndex(c => c.id === draggedId);
    const toIdx   = categories.findIndex(c => c.id === dropId);
    if (fromIdx === -1 || toIdx === -1) return;

    const next = [...categories];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const updated = next.map((c, i) => ({ ...c, display_order: i + 1 }));

    // snapshot del orden anterior para enviar solo los cambios reales
    const prevOrder = new Map(categories.map(c => [c.id, (c as any).display_order as number]));
    const changed = updated
      .filter(c => c.display_order !== prevOrder.get(c.id))
      .map(c => ({ id: c.id, display_order: c.display_order }));

    setCategories(updated);
    setDraggedId(null);
    setDragOverId(null);

    const result = await reorderCategories(changed);
    if (!result.success) { alert('Error al reordenar categorías'); await loadData(); }
  }, [draggedId, categories, loadData]);

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando categorías...</div>
      </div>
    );
  }

  const showingFrom = pageSize === 0 ? 1 : (currentPage - 1) * pageSize + 1;
  const showingTo   = pageSize === 0 ? filteredCategories.length : Math.min(currentPage * pageSize, filteredCategories.length);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text">Categorías</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            {searchQuery
              ? `${filteredCategories.length} de ${categories.length} ${categories.length === 1 ? 'categoría' : 'categorías'}`
              : `${categories.length} ${categories.length === 1 ? 'categoría' : 'categorías'}`}
          </p>
          <p className="text-xs text-cyber-purple/70 mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse" />
            Arrastra la categoría para editar el orden
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Nueva Categoría
        </Button>
      </div>

      {/* Toolbar: búsqueda + tamaño de página */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => handleSearchChange(e.target.value)}
            placeholder="Buscar por nombre o descripción..."
            className="w-full bg-slate-800/60 border border-cyber-purple/30 rounded-xl pl-10 pr-9 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyber-purple transition-all"
            style={{ boxShadow: searchQuery ? '0 0 16px rgb(168 85 247 / 0.2)' : undefined }}
          />
          {searchQuery && (
            <button
              onClick={() => { setSearchQuery(''); setCurrentPage(1); }}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Page size selector */}
        <div className="relative shrink-0">
          <select
            value={pageSize}
            onChange={e => handlePageSizeChange(Number(e.target.value))}
            className="cyber-select appearance-none bg-slate-800/60 border border-cyber-purple/30 rounded-xl pl-4 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-cyber-purple transition-all cursor-pointer w-full sm:w-auto"
          >
            {PAGE_SIZE_OPTIONS.map(o => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-purple pointer-events-none" />
        </div>
      </div>

      {/* Content */}
      {categories.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <Icons.Folder size={48} className="mx-auto mb-4 text-gray-600" />
          <p className="text-sm sm:text-base text-gray-400 mb-4">No hay categorías creadas</p>
          <Button onClick={openCreateModal} className="w-full sm:w-auto">Crear primera categoría</Button>
        </Card>
      ) : filteredCategories.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <Search size={40} className="mx-auto mb-4 text-gray-600" />
          <p className="text-sm sm:text-base text-gray-400 mb-1">
            Sin resultados para{' '}
            <span className="text-cyber-purple font-medium">"{searchQuery}"</span>
          </p>
          <p className="text-xs text-gray-500 mb-4">Intenta con otro término de búsqueda</p>
          <Button variant="secondary" onClick={() => { setSearchQuery(''); setCurrentPage(1); }}>
            Limpiar búsqueda
          </Button>
        </Card>
      ) : (
        <>
          {/* Pagination top */}
          {totalPages > 1 && (
            <PaginationControls current={currentPage} total={totalPages} onChange={setCurrentPage} />
          )}

          {/* Results info */}
          <div className="flex items-center justify-between text-xs text-gray-500 px-1">
            <span>
              Mostrando {showingFrom}–{showingTo} de {filteredCategories.length}{' '}
              {filteredCategories.length === 1 ? 'categoría' : 'categorías'}
              {searchQuery && (
                <> — búsqueda: <span className="text-cyber-purple">"{searchQuery}"</span></>
              )}
            </span>
            {totalPages > 1 && <span>Página {currentPage} de {totalPages}</span>}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
            {paginatedCategories.map(category => (
              <CategoryCard
                key={category.id}
                category={category}
                displayOrder={(category as any).display_order || 0}
                onEdit={() => openEditModal(category)}
                onDelete={() => handleDelete(category.id, category.name)}
                onDuplicate={() => handleDuplicate(category.id, category.name)}
                onDragStart={e => handleDragStart(e, category.id)}
                onDragEnd={handleDragEnd}
                onDragOver={e => handleDragOver(e, category.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, category.id)}
                isDragOver={dragOverId === category.id}
              />
            ))}
          </div>

          {/* Pagination bottom */}
          {totalPages > 1 && (
            <PaginationControls current={currentPage} total={totalPages} onChange={setCurrentPage} />
          )}
        </>
      )}

      {/* Modal crear/editar */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title={editingCategory ? 'Editar Categoría' : 'Nueva Categoría'}>
          <CategoryForm
            key={editingCategory?.id || 'new'}
            initialData={editingCategory ? {
              name:            editingCategory.name,
              name_es:         editingCategory.name_es ?? '',
              description:     editingCategory.description,
              description_es:  editingCategory.description_es ?? '',
              icon:            editingCategory.icon,
              gameIds:         (editingCategory as any).gameIds || [],
            } : undefined}
            displayOrder={(editingCategory as any)?.display_order}
            totalCategories={editingCategory ? categories.length : undefined}
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
