'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { getGames, deleteGame, createGame, updateGame, reorderGames } from '@/app/actions/games';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GameForm } from '@/components/forms/GameForm';
import { Pencil, Trash2, Plus, Image as ImageIcon, GripVertical, ArrowUp, ArrowDown } from 'lucide-react';
import type { Game } from '@/types';
import Image from 'next/image';
import toast from 'react-hot-toast';

const GameCard = memo(({
  game,
  imageError,
  onImageError,
  onEdit,
  onDelete,
  isDragging,
  isDragOver,
  onDragStart,
  onDragEnd,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  game: Game;
  imageError: boolean;
  onImageError: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`cursor-grab active:cursor-grabbing transition-all duration-150 rounded-lg ${
        isDragging ? 'opacity-50' : ''
      } ${isDragOver ? 'scale-[1.02] ring-1 ring-cyber-purple/60' : ''}`}
    >
      <Card className={`overflow-hidden h-full ${isDragOver ? 'border-cyber-purple' : ''}`}>
        <div className="relative h-40 sm:h-48 bg-slate-800">
          {/* Grip + posición */}
          <div className="absolute top-2 left-2 z-10 flex items-center gap-1">
            <GripVertical size={13} className="text-gray-400" />
            {game.display_order !== undefined && (
              <span className="text-xs font-bold bg-slate-900/80 text-gray-300 px-1.5 py-0.5 rounded">
                #{game.display_order}
              </span>
            )}
          </div>

          {!imageError && game.image ? (
            <Image
              src={game.image}
              alt={game.title}
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
          <h3 className="text-base sm:text-lg font-bold mb-1 truncate">{game.title}</h3>
          <p className="text-xs sm:text-sm text-gray-400 mb-3 sm:mb-4 truncate">{game.category}</p>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={onEdit}>
              <Pencil size={16} />
            </Button>
            <Button variant="danger" className="flex-1" onClick={onDelete}>
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
});

GameCard.displayName = 'GameCard';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  useEffect(() => {
    loadGames();
  }, []);

  const loadGames = useCallback(async () => {
    setLoading(true);
    const result = await getGames();
    if (result.success && result.data) {
      setGames(result.data as Game[]);
    }
    setLoading(false);
  }, []);

  // ── Drag & Drop ─────────────────────────────────────────────────────────────

  const handleDragStart = useCallback((index: number) => {
    setDragIndex(index);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDragIndex(null);
    setDragOverIndex(null);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverIndex(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }
    const newGames = [...games];
    const [moved] = newGames.splice(dragIndex, 1);
    newGames.splice(dropIndex, 0, moved);
    const updated = newGames.map((g, i) => ({ ...g, display_order: i + 1 }));
    setGames(updated);
    setDragIndex(null);
    setDragOverIndex(null);
    await reorderGames(updated.map(g => ({ id: g.id, display_order: g.display_order! })));
  }, [dragIndex, games]);

  // ── Move desde modal ─────────────────────────────────────────────────────────

  const handleMoveInModal = useCallback(async (direction: 'up' | 'down') => {
    if (!editingGame) return;
    const index = games.findIndex(g => g.id === editingGame.id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= games.length) return;

    const newGames = [...games];
    [newGames[index], newGames[targetIndex]] = [newGames[targetIndex], newGames[index]];
    const updated = newGames.map((g, i) => ({ ...g, display_order: i + 1 }));
    setGames(updated);

    const updatedEditing = updated.find(g => g.id === editingGame.id);
    if (updatedEditing) setEditingGame(updatedEditing);

    await reorderGames(updated.map(g => ({ id: g.id, display_order: g.display_order! })));
  }, [editingGame, games]);

  // ── CRUD ─────────────────────────────────────────────────────────────────────

  const openCreateModal = useCallback(() => {
    setEditingGame(null);
    setIsModalOpen(true);
  }, []);

  const openEditModal = useCallback((game: Game) => {
    setEditingGame(game);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingGame(null);
  }, []);

  const handleFormSubmit = useCallback(async (formData: { title: string; category: string; image: string }) => {
    const data = editingGame
      ? { ...formData, id: editingGame.id }
      : formData;

    const result = editingGame ? await updateGame(data) : await createGame(data);

    if (result.success) {
      toast.success(editingGame ? 'Juego actualizado exitosamente' : 'Juego creado exitosamente', {
        duration: 3000,
        position: 'top-center',
      });
      await loadGames();
      closeModal();
    } else {
      if ((result as any).details && Array.isArray((result as any).details)) {
        (result as any).details.forEach((detail: string) => {
          toast.error(detail, { duration: 5000, position: 'top-center' });
        });
      } else {
        toast.error(result.error || 'Error al guardar', { duration: 4000, position: 'top-center' });
      }
      throw new Error(result.error || 'Error al guardar');
    }
  }, [editingGame, loadGames, closeModal]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;
    const result = await deleteGame(id);
    if (result.success) {
      toast.success('Juego eliminado exitosamente', { duration: 3000, position: 'top-center' });
      await loadGames();
    } else {
      toast.error(result.error || 'Error al eliminar', { duration: 4000, position: 'top-center' });
    }
  }, [loadGames]);

  const handleImageError = useCallback((gameId: string) => {
    setImageError(prev => ({ ...prev, [gameId]: true }));
  }, []);

  // ── Render ───────────────────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando juegos...</div>
        </div>
      </div>
    );
  }

  const editingIndex = editingGame ? games.findIndex(g => g.id === editingGame.id) : -1;

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text">Juegos</h1>
        <Button onClick={openCreateModal} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Nuevo Juego
        </Button>
      </div>

      {/* Games Grid */}
      {games.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <ImageIcon size={40} className="sm:w-12 sm:h-12 mx-auto mb-4 text-gray-600" />
          <p className="text-sm sm:text-base text-gray-400 mb-4">No hay juegos creados</p>
          <Button onClick={openCreateModal} className="w-full sm:w-auto">Crear primer juego</Button>
        </Card>
      ) : (
        <>
          <p className="text-xs text-gray-500 flex items-center gap-1.5">
            <GripVertical size={12} />
            Arrastra el juego para editar el orden
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {games.map((game, index) => (
              <GameCard
                key={game.id}
                game={game}
                imageError={imageError[game.id] || false}
                onImageError={() => handleImageError(game.id)}
                onEdit={() => openEditModal(game)}
                onDelete={() => handleDelete(game.id, game.title)}
                isDragging={dragIndex === index}
                isDragOver={dragOverIndex === index}
                onDragStart={() => handleDragStart(index)}
                onDragEnd={handleDragEnd}
                onDragOver={(e) => handleDragOver(e, index)}
                onDragLeave={handleDragLeave}
                onDrop={(e) => handleDrop(e, index)}
              />
            ))}
          </div>
        </>
      )}

      {/* Modal Crear/Editar */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingGame ? 'Editar Juego' : 'Nuevo Juego'}
        >
          {/* Controles de posición — solo al editar */}
          {editingGame && (
            <div className="flex items-center gap-3 px-1 pb-3 mb-3 border-b border-slate-700">
              <span className="text-xs text-gray-400">
                Posición:{' '}
                <span className="text-white font-medium">#{editingGame.display_order}</span>
              </span>
              <div className="flex gap-1.5 ml-auto">
                <button
                  type="button"
                  disabled={editingIndex <= 0}
                  onClick={() => handleMoveInModal('up')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowUp size={13} /> Subir
                </button>
                <button
                  type="button"
                  disabled={editingIndex >= games.length - 1}
                  onClick={() => handleMoveInModal('down')}
                  className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium rounded-lg bg-slate-700 text-gray-300 hover:bg-slate-600 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  <ArrowDown size={13} /> Bajar
                </button>
              </div>
            </div>
          )}

          <GameForm
            key={editingGame?.id || 'new'}
            initialData={editingGame ? {
              title: editingGame.title,
              category: editingGame.category,
              image: editingGame.image,
            } : undefined}
            onSubmit={handleFormSubmit}
            onCancel={closeModal}
            isEditing={!!editingGame}
          />
        </Modal>
      )}
    </div>
  );
}
