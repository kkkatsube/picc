import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { XMarkIcon, PencilIcon, CheckIcon, StarIcon } from '@heroicons/react/24/outline';
import type { FavoritesCarousel as FavoritesCarouselType } from '../../api';

interface FavoritesCarouselProps {
  carousel: FavoritesCarouselType;
  onDelete: (id: number) => void;
  onUpdate: (id: number, name: string) => void;
  onImageDelete: (imageId: number) => void;
  onImageAdd: (carouselId: number, imageUrl: string) => void;
  onImageDragStart: (imageUrl: string) => void;
  onImageReorder: (carouselId: number, imageIds: number[]) => void;
  onCarouselDragStart?: (e: React.DragEvent) => void;
  onCarouselDragEnd?: () => void;
  layout?: 'horizontal' | 'grid' | 'grid-large'; // Layout mode: horizontal scroll, 4-column grid, or 9-column grid
}

export function FavoritesCarousel({
  carousel,
  onDelete,
  onUpdate,
  onImageDelete,
  onImageAdd,
  onImageDragStart,
  onImageReorder,
  onCarouselDragStart,
  onCarouselDragEnd,
  layout = 'horizontal', // Default to horizontal
}: FavoritesCarouselProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState(carousel.name);
  const [draggedImageId, setDraggedImageId] = useState<number | null>(null);
  const [isDragOverCarousel, setIsDragOverCarousel] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // ESCキーでプレビューを閉じる
  useEffect(() => {
    if (!previewImage) return;

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
      }
    };

    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [previewImage]);

  const handleNameEdit = () => {
    if (editedName.trim() && editedName !== carousel.name) {
      onUpdate(carousel.id, editedName.trim());
    }
    setIsEditing(false);
  };

  const handleImageDragStart = (e: React.DragEvent, imageId: number, imageUrl: string) => {
    console.log('FavoritesCarousel: Image drag start', { imageId, imageUrl });
    setDraggedImageId(imageId);
    e.dataTransfer.effectAllowed = 'copyMove';
    e.dataTransfer.setData('text/plain', imageUrl);
    console.log('FavoritesCarousel: dataTransfer set', e.dataTransfer.getData('text/plain'));
    onImageDragStart(imageUrl);
  };

  const handleImageDragOver = (e: React.DragEvent) => {
    e.preventDefault();

    // If dragging from within this carousel, allow reordering
    if (draggedImageId) {
      e.dataTransfer.dropEffect = 'move';
    } else {
      // If dragging from outside (local images), allow adding
      e.dataTransfer.dropEffect = 'copy';
    }
  };

  const handleImageDrop = (e: React.DragEvent, targetImageId: number) => {
    e.preventDefault();
    e.stopPropagation();

    // Check if this is an internal reorder or external add
    if (draggedImageId) {
      // Internal reorder: dragging image within this carousel
      if (draggedImageId === targetImageId) {
        setDraggedImageId(null);
        return;
      }

      const images = carousel.images || [];
      const draggedIndex = images.findIndex((img) => img.id === draggedImageId);
      const targetIndex = images.findIndex((img) => img.id === targetImageId);

      if (draggedIndex === -1 || targetIndex === -1) {
        setDraggedImageId(null);
        return;
      }

      // 並び替え
      const reordered = [...images];
      const [removed] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, removed);

      onImageReorder(
        carousel.id,
        reordered.map((img) => img.id)
      );
      setDraggedImageId(null);
    } else {
      // External add: dragging from local carousel
      const imageUrl = e.dataTransfer.getData('text/plain');
      if (imageUrl) {
        // Add to the end of carousel, not at drop position
        onImageAdd(carousel.id, imageUrl);
      }
    }
  };

  const handleImageDragEnd = () => {
    setDraggedImageId(null);
  };

  // Handle drop from local image carousel
  const handleCarouselDragOver = (e: React.DragEvent) => {
    // Only handle if not already handled by child (image)
    if (!draggedImageId) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'copy';
      setIsDragOverCarousel(true);
    }
  };

  const handleCarouselDragLeave = (e: React.DragEvent) => {
    // Only clear if leaving the entire carousel container
    if (e.currentTarget === e.target) {
      setIsDragOverCarousel(false);
    }
  };

  const handleCarouselDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOverCarousel(false);

    const imageUrl = e.dataTransfer.getData('text/plain');
    if (imageUrl && !draggedImageId) {
      // This is from local carousel, not internal reorder
      onImageAdd(carousel.id, imageUrl);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        {isEditing ? (
          <div className="flex items-center gap-2 flex-1">
            <input
              type="text"
              value={editedName}
              onChange={(e) => setEditedName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleNameEdit();
                if (e.key === 'Escape') {
                  setIsEditing(false);
                  setEditedName(carousel.name);
                }
              }}
              className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleNameEdit}
              className="p-1 text-green-600 hover:text-green-700"
              title="保存"
            >
              <CheckIcon className="h-4 w-4" />
            </button>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 flex-1 cursor-move"
            draggable
            onDragStart={onCarouselDragStart}
            onDragEnd={onCarouselDragEnd}
          >
            <div className="flex items-center gap-1.5">
              <StarIcon className="h-4 w-4 text-yellow-500" />
              <h3 className="text-sm font-medium text-gray-900">{carousel.name}</h3>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-gray-400 hover:text-gray-600"
              title="名前を編集"
            >
              <PencilIcon className="h-3 w-3" />
            </button>
          </div>
        )}

        <button
          onClick={() => onDelete(carousel.id)}
          className="p-1 text-gray-400 hover:text-red-600 transition-colors"
          title="カルーセルを削除"
        >
          <XMarkIcon className="h-4 w-4" />
        </button>
      </div>

      {/* Images */}
      <div
        className="relative w-full min-h-24"
        style={{
          scrollbarWidth: 'thin',
          backgroundColor: isDragOverCarousel ? '#dbeafe' : 'transparent',
        }}
        onDragOver={handleCarouselDragOver}
        onDragLeave={handleCarouselDragLeave}
        onDrop={handleCarouselDrop}
      >
        {carousel.images && carousel.images.length > 0 ? (
          <div className={layout === 'grid'
            ? "grid grid-cols-4 gap-2 pb-2"
            : layout === 'grid-large'
            ? "grid grid-cols-8 gap-2 pb-2"
            : "flex gap-2 overflow-x-auto pb-2 min-h-24"}>
            {carousel.images.map((image) => (
              <div
                key={image.id}
                className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden group cursor-move hover:ring-2 hover:ring-blue-500 transition-all flex-shrink-0"
                draggable
                onDragStart={(e) => handleImageDragStart(e, image.id, image.image_url)}
                onDragOver={handleImageDragOver}
                onDrop={(e) => handleImageDrop(e, image.id)}
                onDragEnd={handleImageDragEnd}
              >
                <img
                  src={image.image_url}
                  alt={`Image ${image.id}`}
                  className="w-full h-full object-cover cursor-pointer"
                  loading="lazy"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(image.image_url);
                  }}
                />
                {/* Delete button on hover */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onImageDelete(image.id);
                  }}
                  className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                  title="画像を削除"
                >
                  <XMarkIcon className="h-3 w-3" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24">
            <p className="text-sm text-gray-500">
              ローカル画像をドラッグ&ドロップして追加してください
            </p>
          </div>
        )}
      </div>

      {/* 画像プレビューモーダル */}
      {previewImage && createPortal(
        <div
          onClick={() => setPreviewImage(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 9999,
            margin: 0,
            padding: 0,
          }}
        >
          <button
            onClick={() => setPreviewImage(null)}
            aria-label="閉じる"
            style={{
              position: 'fixed',
              top: '16px',
              right: '16px',
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: 'white',
              border: 'none',
              fontSize: '36px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
              zIndex: 10000,
              color: '#1f2937',
            }}
          >
            ×
          </button>
          <img
            src={previewImage}
            alt="プレビュー"
            onClick={() => setPreviewImage(null)}
            style={{
              maxHeight: '95vh',
              maxWidth: '95vw',
              objectFit: 'contain',
              display: 'block',
              cursor: 'pointer',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          />
        </div>,
        document.body
      )}
    </div>
  );
}
