'use client';

import { useState, useCallback, memo } from 'react';
import Image from 'next/image';

interface ImagePreviewProps {
  imageUrl: string;
}

export const ImagePreview = memo(({ imageUrl }: ImagePreviewProps) => {
  const [imageError, setImageError] = useState(false);

  const handleError = useCallback(() => {
    setImageError(true);
  }, []);

  if (!imageUrl) return null;

  if (imageError) {
    return (
      <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
        No se pudo cargar la imagen. Verifica la URL.
      </div>
    );
  }

  return (
    <div className="relative h-40 sm:h-48 bg-slate-800 rounded-lg overflow-hidden">
      <Image
        src={imageUrl}
        alt="Preview"
        fill
        className="object-cover"
        onError={handleError}
        unoptimized
        priority={false}
      />
    </div>
  );
});

ImagePreview.displayName = 'ImagePreview';
