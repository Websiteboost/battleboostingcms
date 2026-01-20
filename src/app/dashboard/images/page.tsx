'use client';

import { useEffect, useState, useCallback, memo } from 'react';
import { listImages, uploadImage, deleteImage } from '@/app/actions/images';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { ImageUpload } from '@/components/forms/ImageUpload';
import { Plus, Trash2, Copy, Check, ExternalLink } from 'lucide-react';
import Image from 'next/image';

interface BlobImage {
  url: string;
  pathname: string;
  size: number;
  uploadedAt: Date;
}

// ImageCard como componente memoizado
const ImageCard = memo(({ 
  image, 
  onDelete, 
  onCopyUrl 
}: { 
  image: BlobImage;
  onDelete: () => void;
  onCopyUrl: () => void;
}) => {
  const [copied, setCopied] = useState(false);
  const [imageError, setImageError] = useState(false);

  const handleCopy = () => {
    onCopyUrl();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="overflow-hidden group">
      <div className="relative h-48 bg-slate-800">
        {!imageError ? (
          <Image
            src={image.url}
            alt={image.pathname}
            fill
            className="object-cover"
            onError={() => setImageError(true)}
            unoptimized
            loading="eager"
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-600">
            Error al cargar
          </div>
        )}
        {/* Overlay con acciones - visible en mobile, hover en desktop */}
        <div className="absolute inset-0 bg-black/60 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 md:gap-2">
          <Button
            variant="secondary"
            onClick={() => window.open(image.url, '_blank')}
            className="p-4 md:p-2!"
            title="Ver imagen"
          >
            <ExternalLink className="w-6 h-6 md:w-4 md:h-4" />
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopy}
            className="p-4 md:p-2!"
            title="Copiar URL"
          >
            {copied ? <Check className="w-6 h-6 md:w-4 md:h-4" /> : <Copy className="w-6 h-6 md:w-4 md:h-4" />}
          </Button>
          <Button
            variant="danger"
            onClick={onDelete}
            className="p-4 md:p-2!"
            title="Eliminar"
          >
            <Trash2 className="w-6 h-6 md:w-4 md:h-4" />
          </Button>
        </div>
      </div>
      <div className="p-3">
        <p className="text-sm font-medium truncate mb-1">{image.pathname}</p>
        <div className="flex items-center justify-between text-xs text-gray-400">
          <span>{(image.size / 1024).toFixed(1)} KB</span>
          <span>{new Date(image.uploadedAt).toLocaleDateString()}</span>
        </div>
      </div>
    </Card>
  );
});

ImageCard.displayName = 'ImageCard';

export default function ImagesPage() {
  const [images, setImages] = useState<BlobImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [totalSize, setTotalSize] = useState(0);
  const [totalCount, setTotalCount] = useState(0);

  const loadImages = useCallback(async () => {
    setLoading(true);
    const result = await listImages();
    if (result.success && result.data) {
      const imageData = result.data as BlobImage[];
      setImages(imageData);
      setTotalCount(imageData.length);
      
      // Calcular el tamaño total
      const total = imageData.reduce((acc, img) => acc + img.size, 0);
      setTotalSize(total);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadImages();
  }, [loadImages]);

  const handleUpload = useCallback(async (file: File) => {
    const formData = new FormData();
    formData.append('file', file);

    const result = await uploadImage(formData);
    if (result.success) {
      await loadImages();
      setIsModalOpen(false);
    } else {
      throw new Error(result.error || 'Error al subir la imagen');
    }
  }, [loadImages]);

  const handleDelete = useCallback(async (url: string, pathname: string) => {
    if (!confirm(`¿Estás seguro de eliminar "${pathname}"?`)) return;

    const result = await deleteImage(url);
    if (result.success) {
      await loadImages();
    } else {
      alert(result.error || 'Error al eliminar');
    }
  }, [loadImages]);

  const handleCopyUrl = useCallback((url: string) => {
    navigator.clipboard.writeText(url);
  }, []);

  // Formatear tamaño
  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-pulse-glow text-cyber-purple text-xl">Cargando imágenes...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-0">
        <div>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text mb-2">Imágenes</h1>
          
          {/* Stats Cards - Cyberpunk Style */}
          <div className="flex flex-wrap gap-3 mt-3">
            {/* Total Images */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-cyber-purple to-pink-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
              <div className="relative px-4 py-2 bg-slate-800/90 border border-cyber-purple/50 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-cyber-purple rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Total</p>
                    <p className="text-lg font-bold text-white">
                      {totalCount} <span className="text-sm text-gray-400 font-normal">img</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Storage Size */}
            <div className="relative group">
              <div className="absolute inset-0 bg-linear-to-r from-blue-500 to-cyan-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
              <div className="relative px-4 py-2 bg-slate-800/90 border border-blue-500/50 rounded-lg backdrop-blur-sm">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-wider">Bucket</p>
                    <p className="text-lg font-bold text-white">
                      {formatSize(totalSize)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Average Size */}
            {totalCount > 0 && (
              <div className="relative group">
                <div className="absolute inset-0 bg-linear-to-r from-green-500 to-emerald-500 rounded-lg blur opacity-25 group-hover:opacity-40 transition duration-200"></div>
                <div className="relative px-4 py-2 bg-slate-800/90 border border-green-500/50 rounded-lg backdrop-blur-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <p className="text-xs text-gray-400 uppercase tracking-wider">Promedio</p>
                      <p className="text-lg font-bold text-white">
                        {formatSize(totalSize / totalCount)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
          <Plus size={20} className="mr-2" />
          Subir Imagen
        </Button>
      </div>

      {/* Images Grid */}
      {images.length === 0 ? (
        <Card className="p-8 sm:p-12 text-center">
          <div className="text-gray-600 mb-4">
            <svg className="w-16 h-16 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <p className="text-sm sm:text-base text-gray-400 mb-4">No hay imágenes subidas</p>
          <Button onClick={() => setIsModalOpen(true)} className="w-full sm:w-auto">
            Subir primera imagen
          </Button>
        </Card>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {images.map((image) => (
            <ImageCard
              key={image.url}
              image={image}
              onDelete={() => handleDelete(image.url, image.pathname)}
              onCopyUrl={() => handleCopyUrl(image.url)}
            />
          ))}
        </div>
      )}

      {/* Modal de Upload */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Subir Imagen"
      >
        <ImageUpload
          onUpload={handleUpload}
          maxSize={5}
        />
      </Modal>
    </div>
  );
}
