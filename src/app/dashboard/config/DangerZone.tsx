'use client';

import { useState } from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { resetDatabase } from '@/app/actions/resetDatabase';
import { deleteAllImages } from '@/app/actions/images';

export function DangerZone() {
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [isDeleteImagesModalOpen, setIsDeleteImagesModalOpen] = useState(false);
  const [deleteImagesConfirmText, setDeleteImagesConfirmText] = useState('');
  const [deletingImages, setDeletingImages] = useState(false);

  const handleResetDatabase = async () => {
    if (resetConfirmText !== 'RESET') {
      alert('Debes escribir "RESET" para confirmar');
      return;
    }
    setResetting(true);
    const result = await resetDatabase();
    if (result.success) {
      alert('✅ Base de datos reiniciada exitosamente. La página se recargará.');
      setIsResetModalOpen(false);
      setResetConfirmText('');
      window.location.href = '/login';
    } else {
      alert('❌ ' + (result.error || 'Error al reiniciar la base de datos'));
    }
    setResetting(false);
  };

  const handleDeleteAllImages = async () => {
    if (deleteImagesConfirmText !== 'DELETE ALL') {
      alert('Debes escribir "DELETE ALL" para confirmar');
      return;
    }
    setDeletingImages(true);
    const result = await deleteAllImages();
    if (result.success) {
      alert('✅ ' + result.message);
      setIsDeleteImagesModalOpen(false);
      setDeleteImagesConfirmText('');
    } else {
      alert('❌ ' + (result.error || 'Error al eliminar las imágenes'));
    }
    setDeletingImages(false);
  };

  return (
    <>
      <div className="border border-red-500/40 rounded-xl overflow-hidden bg-red-950/10">
        <div className="flex items-center gap-3 p-4 border-b border-red-500/20">
          <div className="p-2 bg-red-500/15 rounded-lg border border-red-500/25">
            <AlertTriangle size={18} className="text-red-400" />
          </div>
          <div>
            <p className="font-semibold text-red-400 text-sm">Zona de Peligro</p>
            <p className="text-xs text-gray-400">Acciones irreversibles sobre la base de datos</p>
          </div>
        </div>
        <div className="p-4 space-y-4">
          <div className="p-4 bg-slate-800/50 rounded-lg border border-red-500/30">
            <h3 className="text-white font-semibold mb-2">Reiniciar Base de Datos</h3>
            <p className="text-sm text-gray-300 mb-4">
              Esta acción eliminará <strong className="text-red-400">TODOS</strong> los datos actuales y restaurará la base de datos a su estado inicial de fábrica.
              <br />
              <span className="text-red-400">⚠️ Esta acción es irreversible.</span>
            </p>
            <Button type="button" variant="danger" onClick={() => setIsResetModalOpen(true)} className="w-full sm:w-auto">
              <AlertTriangle className="w-4 h-4 mr-2" />
              Reset Database
            </Button>
          </div>
          <div className="p-4 bg-slate-800/50 rounded-lg border border-orange-500/30">
            <h3 className="text-white font-semibold mb-2">Eliminar Todas las Imágenes</h3>
            <p className="text-sm text-gray-300 mb-4">
              Esta acción eliminará <strong className="text-orange-400">TODAS</strong> las imágenes del Blob Storage y limpiará las referencias en la base de datos.
              <br />
              <span className="text-orange-400">⚠️ Esta acción es irreversible.</span>
            </p>
            <Button type="button" variant="danger" onClick={() => setIsDeleteImagesModalOpen(true)} className="w-full sm:w-auto">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete All Images
            </Button>
          </div>
        </div>
      </div>

      {/* Modal Reset */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => { setIsResetModalOpen(false); setResetConfirmText(''); }}
        title="⚠️ Confirmar Reinicio de Base de Datos"
      >
        <div className="space-y-4">
          <div className="p-4 bg-red-950/30 border border-red-500/50 rounded-lg">
            <p className="text-white font-semibold mb-2">¡ADVERTENCIA CRÍTICA!</p>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Se eliminarán todos los juegos, categorías y servicios</li>
              <li>Se borrarán todas las preguntas del FAQ</li>
              <li>Se restablecerá la configuración del sitio</li>
              <li>Se creará un usuario admin por defecto</li>
              <li>Serás desconectado y deberás iniciar sesión nuevamente</li>
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Escribe <span className="text-red-400 font-bold">RESET</span> para confirmar:
            </label>
            <Input
              value={resetConfirmText}
              onChange={(e) => setResetConfirmText(e.target.value)}
              placeholder="Escribe RESET en mayúsculas"
              className="font-mono"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" variant="secondary" onClick={() => { setIsResetModalOpen(false); setResetConfirmText(''); }} disabled={resetting} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="button" variant="danger" onClick={handleResetDatabase} disabled={resetConfirmText !== 'RESET' || resetting} className="w-full sm:flex-1">
              {resetting ? 'Reiniciando...' : 'Confirmar Reset'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal Delete Images */}
      <Modal
        isOpen={isDeleteImagesModalOpen}
        onClose={() => { setIsDeleteImagesModalOpen(false); setDeleteImagesConfirmText(''); }}
        title="⚠️ Confirmar Eliminación de Todas las Imágenes"
      >
        <div className="space-y-4">
          <div className="p-4 bg-orange-950/30 border border-orange-500/50 rounded-lg">
            <p className="text-white font-semibold mb-2">¡ADVERTENCIA!</p>
            <ul className="text-sm text-gray-300 space-y-1 list-disc list-inside">
              <li>Se eliminarán TODAS las imágenes del Blob Storage</li>
              <li>Se limpiarán las referencias en juegos y servicios</li>
              <li>Esta acción no se puede deshacer</li>
            </ul>
          </div>
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Escribe <span className="text-orange-400 font-bold">DELETE ALL</span> para confirmar:
            </label>
            <Input
              value={deleteImagesConfirmText}
              onChange={(e) => setDeleteImagesConfirmText(e.target.value)}
              placeholder="Escribe DELETE ALL en mayúsculas"
              className="font-mono"
            />
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button type="button" variant="secondary" onClick={() => { setIsDeleteImagesModalOpen(false); setDeleteImagesConfirmText(''); }} disabled={deletingImages} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button type="button" variant="danger" onClick={handleDeleteAllImages} disabled={deleteImagesConfirmText !== 'DELETE ALL' || deletingImages} className="w-full sm:flex-1">
              {deletingImages ? 'Eliminando...' : 'Confirmar Eliminación'}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
