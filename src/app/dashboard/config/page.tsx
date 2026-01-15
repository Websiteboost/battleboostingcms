'use client';

import { useEffect, useState, useCallback } from 'react';
import { getSiteConfig, updateSiteConfig } from '@/app/actions/siteConfig';
import { resetDatabase } from '@/app/actions/resetDatabase';
import { deleteAllImages } from '@/app/actions/images';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';
import { Settings, AlertTriangle, Trash2 } from 'lucide-react';

interface SiteConfig {
  logo_text: string;
  home_title: string;
  home_subtitle: string;
  home_categories: string[];
  accordion_title: string;
  footer_payment_title: string;
  footer_copyright: string;
  disclaimer: string;
  discord_link: string;
  discord_work_us: string;
}

export default function ConfigPage() {
  const [config, setConfig] = useState<SiteConfig>({
    logo_text: '',
    home_title: '',
    home_subtitle: '',
    home_categories: [''],
    accordion_title: '',
    footer_payment_title: '',
    footer_copyright: '',
    disclaimer: '',
    discord_link: '',
    discord_work_us: '',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetConfirmText, setResetConfirmText] = useState('');
  const [resetting, setResetting] = useState(false);
  const [isDeleteImagesModalOpen, setIsDeleteImagesModalOpen] = useState(false);
  const [deleteImagesConfirmText, setDeleteImagesConfirmText] = useState('');
  const [deletingImages, setDeletingImages] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    const result = await getSiteConfig();
    if (result.success && result.data) {
      setConfig(result.data as SiteConfig);
    }
    setLoading(false);
  }

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    // Filtrar categorías vacías
    const cleanedData = {
      ...config,
      home_categories: config.home_categories.filter(c => c.trim() !== ''),
    };

    const result = await updateSiteConfig(cleanedData);
    if (result.success) {
      alert('Configuración guardada exitosamente');
    } else {
      alert(result.error || 'Error al guardar');
    }

    setSaving(false);
  };

  const handleCategoryChange = (index: number, value: string) => {
    const newCategories = [...config.home_categories];
    newCategories[index] = value;
    setConfig({ ...config, home_categories: newCategories });
  };

  const addCategory = () => {
    setConfig({ ...config, home_categories: [...config.home_categories, ''] });
  };

  const removeCategory = (index: number) => {
    setConfig({
      ...config,
      home_categories: config.home_categories.filter((_, i) => i !== index),
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando configuración...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text">Configuración del Sitio</h1>
        <p className="text-sm sm:text-base text-gray-400 mt-1">
          Gestiona la configuración general del sitio web
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección Home */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-cyber-purple" size={24} />
            <h2 className="text-xl font-bold">Página de Inicio</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Texto del Logo"
              value={config.logo_text}
              onChange={(e) => setConfig({ ...config, logo_text: e.target.value })}
              required
              placeholder="BATTLE BOOSTING"
            />
            <p className="text-xs text-gray-400 -mt-2">
              El texto se divide por espacios para crear líneas múltiples en el logo.
            </p>

            <Input
              label="Título Principal (Tab)"
              value={config.home_title}
              onChange={(e) => setConfig({ ...config, home_title: e.target.value })}
              required
              placeholder="BattleBoosting Gaming Services"
            />

            <Input
              label="Subtítulo"
              value={config.home_subtitle}
              onChange={(e) => setConfig({ ...config, home_subtitle: e.target.value })}
              required
              placeholder="Your trusted platform for professional gaming services"
            />

            {/* Categorías del Home */}
            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-200">
                Categorías del Home
              </label>
              {config.home_categories.map((category, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    value={category}
                    onChange={(e) => handleCategoryChange(index, e.target.value)}
                    placeholder={`Categoría ${index + 1}`}
                    className="flex-1"
                  />
                  {config.home_categories.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => removeCategory(index)}
                      className="px-3!"
                    >
                      ✕
                    </Button>
                  )}
                </div>
              ))}
              <Button
                type="button"
                variant="secondary"
                onClick={addCategory}
                className="w-full"
              >
                + Agregar Categoría
              </Button>
            </div>
          </div>
        </Card>

        {/* Sección Acordeón FAQ */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-cyber-purple" size={24} />
            <h2 className="text-xl font-bold">Acordeón FAQ</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Título del Acordeón"
              value={config.accordion_title}
              onChange={(e) => setConfig({ ...config, accordion_title: e.target.value })}
              required
              placeholder="Frequently Asked Questions"
            />
            <p className="text-xs text-gray-400">
              Este título se muestra encima del acordeón de preguntas frecuentes en la página pública.
            </p>
          </div>
        </Card>

        {/* Sección Discord */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-cyber-purple" size={24} />
            <h2 className="text-xl font-bold">Discord</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Link de Discord (Servidor Principal)"
              value={config.discord_link}
              onChange={(e) => setConfig({ ...config, discord_link: e.target.value })}
              placeholder="https://discord.gg/tu-servidor-aqui"
            />
            <p className="text-xs text-gray-400 -mt-2">
              Link de invitación al servidor de Discord principal.
            </p>

            <Input
              label="Link de Discord (Trabaja con Nosotros)"
              value={config.discord_work_us}
              onChange={(e) => setConfig({ ...config, discord_work_us: e.target.value })}
              placeholder="https://discord.gg/tu-servidor-work-aqui"
            />
            <p className="text-xs text-gray-400 -mt-2">
              Link de Discord para reclutamiento y trabajo.
            </p>
          </div>
        </Card>

        {/* Sección Footer */}
        <Card className="p-4 sm:p-6">
          <div className="flex items-center gap-3 mb-4">
            <Settings className="text-cyber-purple" size={24} />
            <h2 className="text-xl font-bold">Footer</h2>
          </div>

          <div className="space-y-4">
            <Input
              label="Título de Métodos de Pago"
              value={config.footer_payment_title}
              onChange={(e) => setConfig({ ...config, footer_payment_title: e.target.value })}
              required
              placeholder="Accepted payment methods"
            />

            <Input
              label="Copyright"
              value={config.footer_copyright}
              onChange={(e) => setConfig({ ...config, footer_copyright: e.target.value })}
              required
              placeholder="© 2025 BattleBoosting. All rights reserved."
            />

            <div className="space-y-2">
              <label className="block text-xs sm:text-sm font-medium text-gray-200">
                Disclaimer
              </label>
              <textarea
                value={config.disclaimer}
                onChange={(e) => setConfig({ ...config, disclaimer: e.target.value })}
                required
                rows={4}
                placeholder="All services are provided for entertainment purposes only..."
                className="w-full px-3 sm:px-4 py-2 sm:py-3 bg-slate-800/50 border border-slate-700/50 rounded-lg text-white text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-cyber-purple/50 focus:border-cyber-purple transition-all duration-300 resize-vertical"
              />
              <p className="text-xs text-gray-400">
                Mensaje de liberación de responsabilidad que se muestra en el footer.
              </p>
            </div>
          </div>
        </Card>

        {/* Sección Zona de Peligro */}
        <Card className="p-4 sm:p-6 border-red-500/50 bg-red-950/10">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-red-500">Zona de Peligro</h2>
          </div>

          <div className="space-y-4">
            <div className="p-4 bg-slate-800/50 rounded-lg border border-red-500/30">
              <h3 className="text-white font-semibold mb-2">Reiniciar Base de Datos</h3>
              <p className="text-sm text-gray-300 mb-4">
                Esta acción eliminará <strong className="text-red-400">TODOS</strong> los datos actuales y restaurará la base de datos a su estado inicial de fábrica.
                <br />
                <span className="text-red-400">⚠️ Esta acción es irreversible.</span>
              </p>
              <Button 
                type="button" 
                variant="danger"
                onClick={() => setIsResetModalOpen(true)}
                className="w-full sm:w-auto"
              >
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
              <Button 
                type="button" 
                variant="danger"
                onClick={() => setIsDeleteImagesModalOpen(true)}
                className="w-full sm:w-auto"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete All Images
              </Button>
            </div>
          </div>
        </Card>

        {/* Botón de Guardar */}
        <div className="flex justify-end">
          <Button type="submit" disabled={saving} className="w-full sm:w-auto">
            {saving ? 'Guardando...' : 'Guardar Configuración'}
          </Button>
        </div>
      </form>

      {/* Modal de Confirmación Reset */}
      <Modal
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetConfirmText('');
        }}
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsResetModalOpen(false);
                setResetConfirmText('');
              }}
              disabled={resetting}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleResetDatabase}
              disabled={resetConfirmText !== 'RESET' || resetting}
              className="w-full sm:flex-1"
            >
              {resetting ? 'Reiniciando...' : 'Confirmar Reset'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Modal de Confirmación Delete All Images */}
      <Modal
        isOpen={isDeleteImagesModalOpen}
        onClose={() => {
          setIsDeleteImagesModalOpen(false);
          setDeleteImagesConfirmText('');
        }}
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
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsDeleteImagesModalOpen(false);
                setDeleteImagesConfirmText('');
              }}
              disabled={deletingImages}
              className="w-full sm:w-auto"
            >
              Cancelar
            </Button>
            <Button
              type="button"
              variant="danger"
              onClick={handleDeleteAllImages}
              disabled={deleteImagesConfirmText !== 'DELETE ALL' || deletingImages}
              className="w-full sm:flex-1"
            >
              {deletingImages ? 'Eliminando...' : 'Confirmar Eliminación'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
