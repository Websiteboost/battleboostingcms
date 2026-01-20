'use client';

import { useState, useCallback, memo, useEffect } from 'react';
import Image from 'next/image';
import { CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

interface ImagePreviewProps {
  imageUrl: string;
}

// Validar formato de URL
const isValidUrl = (url: string): boolean => {
  if (!url || url.trim() === '') return false;
  
  try {
    const urlObj = new URL(url);
    return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
  } catch {
    return false;
  }
};

// Validar que sea una URL de imagen
const isImageUrl = (url: string): boolean => {
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico'];
  const lowerUrl = url.toLowerCase();
  
  // Verificar extensión o si es de Vercel Blob Storage
  return imageExtensions.some(ext => lowerUrl.includes(ext)) || 
         lowerUrl.includes('vercel-storage.com') ||
         lowerUrl.includes('blob.vercel');
};

export const ImagePreview = memo(({ imageUrl }: ImagePreviewProps) => {
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  // Resetear estados cuando cambia la URL
  useEffect(() => {
    setImageError(false);
    setValidationError(null);
    setIsLoading(false);
    setIsValidating(true);

    // Validar formato de URL
    if (!imageUrl || imageUrl.trim() === '') {
      setIsValidating(false);
      return;
    }

    if (!isValidUrl(imageUrl)) {
      setValidationError('URL inválida. Debe comenzar con http:// o https://');
      setIsValidating(false);
      return;
    }

    if (!isImageUrl(imageUrl)) {
      setValidationError('La URL no parece ser una imagen válida');
      setIsValidating(false);
      return;
    }

    setIsValidating(false);
    setIsLoading(true);
  }, [imageUrl]);

  const handleError = useCallback(() => {
    setImageError(true);
    setIsLoading(false);
  }, []);

  const handleLoad = useCallback(() => {
    setIsLoading(false);
    setImageError(false);
  }, []);

  if (!imageUrl || imageUrl.trim() === '') {
    return null;
  }

  // Mostrar error de validación
  if (validationError) {
    return (
      <div className="p-3 bg-yellow-500/10 border border-yellow-500/50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-yellow-400 font-medium">Advertencia de URL</p>
            <p className="text-yellow-300/80 text-xs mt-1">{validationError}</p>
          </div>
        </div>
      </div>
    );
  }

  // Mostrar error de carga
  if (imageError) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
        <div className="flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
          <div className="text-sm">
            <p className="text-red-400 font-medium">Error al cargar imagen</p>
            <p className="text-red-300/80 text-xs mt-1">
              No se pudo cargar la imagen. Verifica que la URL sea correcta y la imagen exista.
            </p>
            <p className="text-red-300/60 text-xs mt-1 break-all">{imageUrl}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {/* Indicador de validación exitosa */}
      {!isValidating && !isLoading && !imageError && (
        <div className="flex items-center gap-2 text-xs text-green-400">
          <CheckCircle2 className="w-3 h-3" />
          <span>URL válida</span>
        </div>
      )}

      {/* Vista previa de la imagen */}
      <div className="relative h-40 sm:h-48 bg-slate-800 rounded-lg overflow-hidden border border-cyber-purple/30">
        {/* Loading overlay */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-800/80 z-10">
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="w-6 h-6 text-cyber-purple animate-spin" />
              <span className="text-xs text-gray-400">Cargando imagen...</span>
            </div>
          </div>
        )}

        <Image
          src={imageUrl}
          alt="Preview"
          fill
          className="object-cover"
          onError={handleError}
          onLoad={handleLoad}
          unoptimized
          priority={false}
        />
      </div>
    </div>
  );
});

ImagePreview.displayName = 'ImagePreview';
