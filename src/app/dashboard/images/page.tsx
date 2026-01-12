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
        {/* Overlay con acciones */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
          <Button
            variant="secondary"
            onClick={() => window.open(image.url, '_blank')}
            className="p-2!"
          >
            <ExternalLink size={16} />
          </Button>
          <Button
            variant="secondary"
            onClick={handleCopy}
            className="p-2!"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
          </Button>
          <Button
            variant="danger"
            onClick={onDelete}
            className="p-2!"
          >
            <Trash2 size={16} />
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

  const loadImages = useCallback(async () => {
    setLoading(true);
    const result = await listImages();
    if (result.success && result.data) {
      setImages(result.data as BlobImage[]);
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
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold neon-text">Imágenes</h1>
          <p className="text-sm sm:text-base text-gray-400 mt-1">
            {images.length} {images.length === 1 ? 'imagen' : 'imágenes'} en almacenamiento
          </p>
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
