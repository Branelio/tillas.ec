'use client';
import { useCallback, useState, useRef } from 'react';
import { Upload, X, GripVertical, ImageIcon, Loader2 } from 'lucide-react';
import { adminMediaApi } from '@/lib/api';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  maxImages?: number;
}

export default function ImageUploader({ images, onChange, maxImages = 8 }: ImageUploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const uploadFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files).filter(f => f.type.startsWith('image/'));
    if (fileArray.length === 0) return;

    const remaining = maxImages - images.length;
    const toUpload = fileArray.slice(0, remaining);
    if (toUpload.length === 0) return;

    setUploading(true);
    try {
      const uploadPromises = toUpload.map(file => adminMediaApi.upload(file));
      const results = await Promise.all(uploadPromises);
      const urls = results.map(r => r.data.url);
      onChange([...images, ...urls]);
    } catch (err) {
      console.error('Error subiendo imágenes:', err);
    }
    setUploading(false);
  }, [images, onChange, maxImages]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files?.length) {
      uploadFiles(e.dataTransfer.files);
    }
  }, [uploadFiles]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const removeImage = (index: number) => {
    onChange(images.filter((_, i) => i !== index));
  };

  // Drag & drop para reordenar
  const handleSortStart = (index: number) => {
    setDragIndex(index);
  };

  const handleSortOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === index) return;
    const reordered = [...images];
    const [moved] = reordered.splice(dragIndex, 1);
    reordered.splice(index, 0, moved);
    onChange(reordered);
    setDragIndex(index);
  };

  const handleSortEnd = () => {
    setDragIndex(null);
  };

  return (
    <div>
      <label className="text-xs text-gray-500 mb-2 block uppercase tracking-wider">
        Imágenes ({images.length}/{maxImages})
      </label>

      {/* Grid de imágenes existentes */}
      {images.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mb-3">
          {images.map((url, i) => (
            <div
              key={`${url}-${i}`}
              draggable
              onDragStart={() => handleSortStart(i)}
              onDragOver={(e) => handleSortOver(e, i)}
              onDragEnd={handleSortEnd}
              className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                i === 0
                  ? 'border-admin-primary ring-1 ring-admin-primary/30'
                  : 'border-admin-border hover:border-gray-500'
              } ${dragIndex === i ? 'opacity-50 scale-95' : ''}`}
            >
              <img src={url} alt="" className="w-full h-full object-cover" />

              {/* Badge de imagen principal */}
              {i === 0 && (
                <div className="absolute top-1 left-1 bg-admin-primary text-black text-[9px] font-bold px-1.5 py-0.5 rounded">
                  PRINCIPAL
                </div>
              )}

              {/* Overlay de acciones */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <div className="text-gray-300">
                  <GripVertical size={16} />
                </div>
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); removeImage(i); }}
                  className="p-1.5 bg-red-500/80 text-white rounded-lg hover:bg-red-500 transition-colors"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dropzone */}
      {images.length < maxImages && (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={() => setDragOver(false)}
          onClick={() => fileRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
            dragOver
              ? 'border-admin-primary bg-admin-primary/10'
              : 'border-admin-border hover:border-gray-500 hover:bg-admin-elevated/50'
          }`}
        >
          {uploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 size={24} className="text-admin-primary animate-spin" />
              <p className="text-sm text-gray-400">Subiendo imágenes...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="p-3 bg-admin-elevated rounded-xl">
                {dragOver ? (
                  <ImageIcon size={24} className="text-admin-primary" />
                ) : (
                  <Upload size={24} className="text-gray-500" />
                )}
              </div>
              <div>
                <p className="text-sm text-gray-300">
                  {dragOver ? 'Suelta las imágenes aquí' : 'Arrastra imágenes o haz clic'}
                </p>
                <p className="text-xs text-gray-600 mt-0.5">PNG, JPG, WebP — máx 5MB c/u</p>
              </div>
            </div>
          )}
        </div>
      )}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => e.target.files && uploadFiles(e.target.files)}
      />
    </div>
  );
}
