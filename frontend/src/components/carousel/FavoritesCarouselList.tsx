import React, { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';
import { FavoritesCarousel } from './FavoritesCarousel';
import { LocalImageCarousel } from './LocalImageCarousel';
import { useFavoritesCarousels } from '../../hooks/useFavoritesCarousels';

interface FavoritesCarouselListProps {
  onImageDragStart: (imageUrl: string) => void;
}

export function FavoritesCarouselList({ onImageDragStart }: FavoritesCarouselListProps) {
  const {
    carousels,
    isLoading,
    createCarousel,
    updateCarousel,
    deleteCarousel,
    addImage,
    deleteImage,
    reorderImages,
    reorderCarousels,
  } = useFavoritesCarousels();

  const [isCreating, setIsCreating] = useState(false);
  const [newCarouselName, setNewCarouselName] = useState('');
  const [draggedCarouselId, setDraggedCarouselId] = useState<number | null>(null);

  const handleCreateCarousel = () => {
    if (newCarouselName.trim()) {
      createCarousel(newCarouselName.trim());
      setNewCarouselName('');
      setIsCreating(false);
    }
  };

  const handleUpdateCarousel = (id: number, name: string) => {
    updateCarousel({ id, name });
  };

  const handleReorderImages = (carouselId: number, imageIds: number[]) => {
    reorderImages({ carouselId, imageIds });
  };

  const handleAddImage = (carouselId: number, imageUrl: string) => {
    addImage({ carouselId, imageUrl });
  };

  const handleCarouselDragStart = (e: React.DragEvent, carouselId: number) => {
    console.log('Carousel drag start:', carouselId);
    setDraggedCarouselId(carouselId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('carousel-id', String(carouselId));
  };

  const handleCarouselDragOver = (e: React.DragEvent) => {
    // Check if we're dragging a carousel
    if (draggedCarouselId !== null) {
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
    }
  };

  const handleCarouselDrop = (e: React.DragEvent, targetCarouselId: number) => {
    // Check if this is a carousel drag
    if (draggedCarouselId === null) {
      // This is not a carousel drag, let child components handle it
      return;
    }

    e.preventDefault();
    e.stopPropagation();

    console.log('Carousel drop:', { draggedCarouselId, targetCarouselId });

    if (draggedCarouselId === targetCarouselId) {
      setDraggedCarouselId(null);
      return;
    }

    const draggedIndex = carousels.findIndex((c) => c.id === draggedCarouselId);
    const targetIndex = carousels.findIndex((c) => c.id === targetCarouselId);

    if (draggedIndex === -1 || targetIndex === -1) {
      console.error('Invalid carousel indices:', { draggedIndex, targetIndex });
      setDraggedCarouselId(null);
      return;
    }

    // Reorder carousels
    const reordered = [...carousels];
    const [removed] = reordered.splice(draggedIndex, 1);
    reordered.splice(targetIndex, 0, removed);

    console.log('Reordering carousels:', reordered.map((c) => c.id));
    reorderCarousels(reordered.map((c) => c.id));
    setDraggedCarouselId(null);
  };

  const handleCarouselDragEnd = () => {
    console.log('Carousel drag end');
    setDraggedCarouselId(null);
  };

  if (isLoading) {
    return (
      <div className="space-y-3">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">読み込み中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Local Image Carousel - Always First */}
      <LocalImageCarousel onImageDragStart={onImageDragStart} />

      {/* Favorites Carousels */}
      {carousels.map((carousel) => (
        <div
          key={carousel.id}
          onDragOver={handleCarouselDragOver}
          onDrop={(e) => handleCarouselDrop(e, carousel.id)}
        >
          <FavoritesCarousel
            carousel={carousel}
            onDelete={deleteCarousel}
            onUpdate={handleUpdateCarousel}
            onImageDelete={deleteImage}
            onImageAdd={handleAddImage}
            onImageDragStart={onImageDragStart}
            onImageReorder={handleReorderImages}
            onCarouselDragStart={(e) => handleCarouselDragStart(e, carousel.id)}
            onCarouselDragEnd={handleCarouselDragEnd}
          />
        </div>
      ))}

      {/* Create New Carousel */}
      {isCreating ? (
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newCarouselName}
              onChange={(e) => setNewCarouselName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreateCarousel();
                if (e.key === 'Escape') {
                  setIsCreating(false);
                  setNewCarouselName('');
                }
              }}
              placeholder="カルーセル名を入力..."
              className="flex-1 px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreateCarousel}
              className="px-4 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
            >
              作成
            </button>
            <button
              onClick={() => {
                setIsCreating(false);
                setNewCarouselName('');
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition-colors"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsCreating(true)}
          className="w-full bg-white rounded-lg shadow p-4 text-gray-600 hover:text-blue-600 hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          <span className="text-sm font-medium">新しいカルーセルを作成</span>
        </button>
      )}
    </div>
  );
}
