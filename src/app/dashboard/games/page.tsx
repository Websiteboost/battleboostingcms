'use client';

import { useEffect, useState, useCallback, useMemo, memo } from 'react';
import { getGames, deleteGame, createGame, updateGame } from '@/app/actions/games';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { GameForm } from '@/components/forms/GameForm';
import { Pencil, Trash2, Plus, Image as ImageIcon } from 'lucide-react';
import type { Game } from '@/types';
import Image from 'next/image';

// GameCard como componente memoizado separado
const GameCard = memo(({ 
  game, 
  imageError, 
  onImageError, 
  onEdit, 
  onDelete 
}: { 
  game: Game; 
  imageError: boolean;
  onImageError: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <Card className="overflow-hidden">
      <div className="relative h-40 sm:h-48 bg-slate-800">
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
    </Card>
  );
});

GameCard.displayName = 'GameCard';

export default function GamesPage() {
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [imageError, setImageError] = useState<Record<string, boolean>>({});

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

    const result = editingGame
      ? await updateGame(data)
      : await createGame(data);

    if (result.success) {
      await loadGames();
      closeModal();
    } else {
      throw new Error(result.error || 'Error al guardar');
    }
  }, [editingGame, loadGames, closeModal]);

  const handleDelete = useCallback(async (id: string, title: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${title}"?`)) return;
    
    const result = await deleteGame(id);
    if (result.success) {
      await loadGames();
    } else {
      alert(result.error || 'Error al eliminar');
    }
  }, [loadGames]);

  const handleImageError = useCallback((gameId: string) => {
    setImageError(prev => ({ ...prev, [gameId]: true }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando juegos...</div>
        </div>
      </div>
    );
  }

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {games.map((game) => (
            <GameCard
              key={game.id}
              game={game}
              imageError={imageError[game.id] || false}
              onImageError={() => handleImageError(game.id)}
              onEdit={() => openEditModal(game)}
              onDelete={() => handleDelete(game.id, game.title)}
            />
          ))}
        </div>
      )}

      {/* Modal de Crear/Editar */}
      {isModalOpen && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={editingGame ? 'Editar Juego' : 'Nuevo Juego'}
        >
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
