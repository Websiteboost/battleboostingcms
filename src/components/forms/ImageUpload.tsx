'use client';

import { useState, useCallback, useRef, memo } from 'react';
import { Button } from '@/components/ui/Button';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface ImageUploadProps {
  onUpload: (file: File) => Promise<void>;
  maxSize?: number; // en MB
  accept?: string;
}

export const ImageUpload = memo(({ 
  onUpload, 
  maxSize = 5,
  accept = 'image/*'
}: ImageUploadProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = useCallback((file: File): string | null => {
    // Validar tipo
    if (!file.type.startsWith('image/')) {
      return 'El archivo debe ser una imagen';
    }

    // Validar tamaño
    const sizeMB = file.size / (1024 * 1024);
    if (sizeMB > maxSize) {
      return `La imagen no debe superar ${maxSize}MB`;
    }

    return null;
  }, [maxSize]);

  const handleFile = useCallback((file: File) => {
    const error = validateFile(file);
    if (error) {
      setError(error);
      return;
    }

    setFile(file);
    setError(null);

    // Crear preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  }, [validateFile]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      await onUpload(file);
      // Limpiar después de subir exitosamente
      setFile(null);
      setPreview(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al subir la imagen');
    } finally {
      setUploading(false);
    }
  }, [file, onUpload]);

  const handleClear = useCallback(() => {
    setFile(null);
    setPreview(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          relative border-2 border-dashed rounded-xl p-8 transition-all
          ${isDragging 
            ? 'border-cyber-purple bg-cyber-purple/10' 
            : 'border-cyber-purple/30 hover:border-cyber-purple/50'
          }
          ${preview ? 'p-4' : 'p-8'}
        `}
      >
        {preview ? (
          <div className="space-y-4">
            <div className="relative aspect-video bg-slate-800 rounded-lg overflow-hidden">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-contain"
              />
              <button
                onClick={handleClear}
                className="absolute top-2 right-2 p-2 bg-red-600 rounded-full hover:bg-red-700 transition-colors"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400 mb-2">{file?.name}</p>
              <p className="text-xs text-gray-500">
                {file && `${(file.size / (1024 * 1024)).toFixed(2)} MB`}
              </p>
            </div>
          </div>
        ) : (
          <div className="text-center">
            <ImageIcon size={48} className="mx-auto mb-4 text-gray-600" />
            <p className="text-gray-400 mb-2">
              Arrastra una imagen aquí o haz clic para seleccionar
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Máximo {maxSize}MB - JPG, PNG, GIF, WebP
            </p>
            <Button
              type="button"
              variant="secondary"
              onClick={() => fileInputRef.current?.click()}
            >
              <Upload size={16} className="mr-2" />
              Seleccionar Imagen
            </Button>
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileInput}
          className="hidden"
        />
      </div>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-400 text-sm">
          {error}
        </div>
      )}

      {/* Upload Button */}
      {file && !error && (
        <Button
          onClick={handleUpload}
          disabled={uploading}
          className="w-full"
        >
          {uploading ? 'Subiendo...' : 'Subir Imagen'}
        </Button>
      )}
    </div>
  );
});

ImageUpload.displayName = 'ImageUpload';
