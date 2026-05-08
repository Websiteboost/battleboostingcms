'use client';

import { useEffect, useState, useCallback, useMemo, memo, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { getServices, deleteService, createService, reorderServices, duplicateService } from '@/app/actions/services';
import { getCategories } from '@/app/actions/categories';
import { getGames } from '@/app/actions/games';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ServiceForm } from '@/components/forms/ServiceForm';
import {
  Pencil, Trash2, Plus, Image as ImageIcon, GripVertical, Copy, Loader2,
  Search, X, ChevronDown, ChevronLeft, ChevronRight
} from 'lucide-react';
import type { Service, Category, Game } from '@/types';
import Image from 'next/image';
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

// ─── ServiceCard ───────────────────────────────────────────────────────────────

const ServiceCard = memo(({
  service,
  categoryName,
  imageError,
  onImageError,
  onEdit,
  onDelete,
  onDuplicate,
  isEditing,
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
  onDuplicate: () => void;
  isEditing: boolean;
  displayOrder: number;
  onDragStart: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
  isDragOver: boolean;
}) => (
  <Card className={`overflow-hidden transition-all relative ${isDragOver ? 'border-cyber-purple border-2 scale-[1.02]' : ''}`}>
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
    >
      <button
        onClick={onDuplicate}
        className="absolute top-2 left-2 z-10 p-1.5 sm:p-2 bg-slate-900/90 hover:bg-cyber-purple/90 backdrop-blur-sm rounded-full transition-all duration-200 hover:scale-110 active:scale-95 shadow-lg"
        title="Duplicar servicio"
      >
        <Copy className="w-3 h-3 sm:w-4 sm:h-4 text-gray-300 hover:text-white" />
      </button>

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
          <Button variant="secondary" className="flex-1" onClick={onEdit} disabled={isEditing}>
            {isEditing ? <Loader2 size={16} className="animate-spin" /> : <Pencil size={16} />}
          </Button>
          <Button variant="danger" className="flex-1" onClick={onDelete}>
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  </Card>
));
ServiceCard.displayName = 'ServiceCard';

// ─── Page ──────────────────────────────────────────────────────────────────────

const PAGE_SIZE_OPTIONS = [
  { value: 8,  label: '8 por página'  },
  { value: 12, label: '12 por página' },
  { value: 24, label: '24 por página' },
  { value: 48, label: '48 por página' },
  { value: 0,  label: 'Todos'         },
];

export default function ServicesPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const [services,   setServices]   = useState<Service[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [games,      setGames]      = useState<Game[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [imageError,  setImageError]  = useState<Record<string, boolean>>({});

  // drag
  const [draggedId,  setDraggedId]  = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  // search + pagination
  const [searchQuery,  setSearchQuery]  = useState('');
  const [currentPage,  setCurrentPage]  = useState(1);
  const [pageSize,     setPageSize]     = useState(12);

  // ── data ──────────────────────────────────────────────────────────────────

  const loadData = useCallback(async () => {
    setLoading(true);
    const [svcRes, catRes, gameRes] = await Promise.all([
      getServices(), getCategories(), getGames()
    ]);
    if (svcRes.success  && svcRes.data)  setServices(svcRes.data as Service[]);
    if (catRes.success  && catRes.data)  setCategories(catRes.data as Category[]);
    if (gameRes.success && gameRes.data) setGames(gameRes.data as Game[]);
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const getCategoryName = useCallback(
    (id: string) => categories.find(c => c.id === id)?.name || 'Sin categoría',
    [categories]
  );

  // ── filtered + paginated ───────────────────────────────────────────────────

  const filteredServices = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return services;
    return services.filter(s =>
      s.title.toLowerCase().includes(q) ||
      (s.title_es?.toLowerCase().includes(q) ?? false) ||
      getCategoryName(s.category_id).toLowerCase().includes(q)
    );
  }, [services, searchQuery, getCategoryName]);

  const totalPages = pageSize === 0 ? 1 : Math.max(1, Math.ceil(filteredServices.length / pageSize));

  const paginatedServices = useMemo(() => {
    if (pageSize === 0) return filteredServices;
    const start = (currentPage - 1) * pageSize;
    return filteredServices.slice(start, start + pageSize);
  }, [filteredServices, currentPage, pageSize]);

  // ── handlers ──────────────────────────────────────────────────────────────

  const handleSearchChange = useCallback((value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  }, []);

  const handlePageSizeChange = useCallback((value: number) => {
    setPageSize(value);
    setCurrentPage(1);
  }, []);

  const openCreateModal = useCallback(() => setIsModalOpen(true), []);
  const closeModal      = useCallback(() => setIsModalOpen(false), []);

  const openEditPage = useCallback((service: Service) => {
    setEditingId(service.id);
    startTransition(() => router.push(`/dashboard/services/${service.id}/edit`));
  }, [router, startTransition]);

  const handleFormSubmit = useCallback(async (formData: any) => {
    const result = await createService(formData);
    if (result.success) {
      toast.success('Servicio creado exitosamente', { duration: 3000, position: 'top-center' });
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
  }, [loadData, closeModal]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;
    const result = await deleteService(id);
    if (result.success) {
      toast.success('Servicio eliminado exitosamente', { duration: 3000, position: 'top-center' });
      await loadData();
    } else {
      toast.error(result.error || 'Error al eliminar', { duration: 4000, position: 'top-center' });
    }
  }, [loadData]);

  const handleDuplicate = useCallback(async (id: string, title: string) => {
    if (!confirm(`¿Deseas duplicar el servicio "${title}"?`)) return;
    toast.loading('Duplicando servicio...', { duration: 1000, position: 'top-center' });
    const result = await duplicateService(id);
    if (result.success) {
      toast.success('Servicio duplicado exitosamente', { duration: 3000, position: 'top-center' });
      await loadData();
    } else {
      toast.error(result.error || 'Error al duplicar', { duration: 4000, position: 'top-center' });
    }
  }, [loadData]);

  const handleImageError = useCallback((id: string) => {
    setImageError(prev => ({ ...prev, [id]: true }));
  }, []);

  // drag — uses IDs so pagination offset doesn't affect indices
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

    const fromIdx = services.findIndex(s => s.id === draggedId);
    const toIdx   = services.findIndex(s => s.id === dropId);
    if (fromIdx === -1 || toIdx === -1) return;

    const next = [...services];
    const [moved] = next.splice(fromIdx, 1);
    next.splice(toIdx, 0, moved);
    const updated = next.map((s, i) => ({ ...s, display_order: i + 1 }));

    // snapshot del orden anterior para enviar solo los cambios reales
    const prevOrder = new Map(services.map(s => [s.id, (s as any).display_order as number]));
    const changed = updated
      .filter(s => s.display_order !== prevOrder.get(s.id))
      .map(s => ({ id: s.id, display_order: s.display_order }));

    setServices(updated);
    setDraggedId(null);
    setDragOverId(null);

    const result = await reorderServices(changed);
    if (!result.success) { alert('Error al reordenar servicios'); await loadData(); }
  }, [draggedId, services, loadData]);

  // ── render ────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando servicios...</div>
      </div>
    );
  }

  const showingFrom = pageSize === 0 ? 1 : (currentPage - 1) * pageSize + 1;
  const showingTo   = pageSize === 0 ? filteredServices.length : Math.min(currentPage * pageSize, filteredServices.length);

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text">Servicios</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            {searchQuery
              ? `${filteredServices.length} de ${services.length} ${services.length === 1 ? 'servicio' : 'servicios'}`
              : `${services.length} ${services.length === 1 ? 'servicio' : 'servicios'}`}
          </p>
          <p className="text-xs text-cyber-purple/70 mt-1 flex items-center gap-1">
            <span className="inline-block w-1.5 h-1.5 bg-cyber-purple rounded-full animate-pulse" />
            Arrastra el servicio para editar el orden
          </p>
        </div>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Nuevo Servicio
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
            placeholder="Buscar por nombre o categoría..."
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
      {services.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <ImageIcon size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-sm sm:text-base text-gray-400 mb-4">No hay servicios creados</p>
          <Button onClick={openCreateModal} className="w-full sm:w-auto">Crear primer servicio</Button>
        </Card>
      ) : filteredServices.length === 0 ? (
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
              Mostrando {showingFrom}–{showingTo} de {filteredServices.length}{' '}
              {filteredServices.length === 1 ? 'servicio' : 'servicios'}
              {searchQuery && (
                <> — búsqueda: <span className="text-cyber-purple">"{searchQuery}"</span></>
              )}
            </span>
            {totalPages > 1 && <span>Página {currentPage} de {totalPages}</span>}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {paginatedServices.map(service => (
              <ServiceCard
                key={service.id}
                service={service}
                categoryName={getCategoryName(service.category_id)}
                displayOrder={(service as any).display_order || 0}
                imageError={imageError[service.id] || false}
                onImageError={() => handleImageError(service.id)}
                isEditing={isPending && editingId === service.id}
                onEdit={() => openEditPage(service)}
                onDelete={() => handleDelete(service.id, service.title)}
                onDuplicate={() => handleDuplicate(service.id, service.title)}
                onDragStart={e => handleDragStart(e, service.id)}
                onDragEnd={handleDragEnd}
                onDragOver={e => handleDragOver(e, service.id)}
                onDragLeave={handleDragLeave}
                onDrop={e => handleDrop(e, service.id)}
                isDragOver={dragOverId === service.id}
              />
            ))}
          </div>

          {/* Pagination bottom */}
          {totalPages > 1 && (
            <PaginationControls current={currentPage} total={totalPages} onChange={setCurrentPage} />
          )}
        </>
      )}

      {/* Modal crear */}
      {isModalOpen && (
        <Modal isOpen={isModalOpen} onClose={closeModal} title="Nuevo Servicio">
          <ServiceForm
            key="new"
            initialData={undefined}
            categories={categories.map(c => ({ id: c.id, name: c.name }))}
            games={games}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isEditing={false}
          />
        </Modal>
      )}
    </div>
  );
}
