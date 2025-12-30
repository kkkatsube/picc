import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  const [bottomCarouselLimit, setBottomCarouselLimit] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);

  // Calculate how many carousels fit in bottom area
  useEffect(() => {
    const calculateVisibleCarousels = () => {
      // Check if we're on XL+ screen
      if (window.innerWidth < 1280) {
        // On smaller screens, show all carousels at bottom
        setBottomCarouselLimit(999);
        return;
      }

      // Calculate available height for bottom carousels
      const windowHeight = window.innerHeight;
      const headerHeight = 100; // Header height with padding
      const canvasHeight = 800; // Max canvas height from CanvasWorkspace
      const mainPadding = 48; // Main content py-6 (24px top + 24px bottom)
      const carouselSpacing = 24; // Space between carousels (space-y-6)

      // Grid layout calculation: 8 columns, average 6 images per carousel
      // Each image is 96px (w-24 h-24), with gap-2 (8px)
      // Average rows per carousel: ceil(6 images / 8 columns) = 1 row
      // But with more images, could be 2-3 rows
      // Conservative estimate: 2 rows average
      const imageSize = 96; // w-24 h-24
      const gridGap = 8; // gap-2
      const averageGridRows = 2; // Conservative estimate for grid-large layout
      const gridImageAreaHeight = (imageSize + gridGap) * averageGridRows;
      const carouselHeaderHeight = 40; // Header with title and buttons
      const carouselPadding = 32; // p-4 top and bottom
      const carouselHeight = carouselHeaderHeight + gridImageAreaHeight + carouselPadding + carouselSpacing;

      const createButtonHeight = 80; // Height of "Create New Carousel" button
      const safetyMargin = 50; // Extra safety margin to prevent overflow

      const availableHeight = windowHeight - headerHeight - canvasHeight - mainPadding - createButtonHeight - safetyMargin;
      const visibleCount = Math.max(1, Math.floor(availableHeight / carouselHeight));

      // Always show at least 1 carousel in bottom (LocalImageCarousel only if needed)
      // This prevents showing too few carousels
      setBottomCarouselLimit(Math.max(1, visibleCount));
    };

    calculateVisibleCarousels();
    window.addEventListener('resize', calculateVisibleCarousels);
    return () => window.removeEventListener('resize', calculateVisibleCarousels);
  }, []);

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

  // Split carousels: LocalImageCarousel + favorites
  // bottomCarouselLimit includes LocalImageCarousel, so favorites limit is (limit - 1)
  const favoritesForBottom = carousels.slice(0, bottomCarouselLimit - 1);
  const favoritesForLeftPanel = carousels.slice(bottomCarouselLimit - 1);

  return (
    <>
      {/* Bottom Carousels Section */}
      <div ref={containerRef} className="space-y-3">
        {/* Local Image Carousel - Always First in Bottom */}
        <LocalImageCarousel onImageDragStart={onImageDragStart} />

        {/* Bottom Favorites Carousels */}
        {favoritesForBottom.map((carousel) => (
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
              layout="grid-large"
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

      {/* Left Panel Overflow Carousels - Rendered via Portal */}
      {favoritesForLeftPanel.length > 0 && typeof document !== 'undefined' && (() => {
        const leftPanelElement = document.getElementById('left-panel-carousels');
        if (!leftPanelElement) return null;

        return createPortal(
          favoritesForLeftPanel.map((carousel) => (
            <div
              key={`left-${carousel.id}`}
              onDragOver={handleCarouselDragOver}
              onDrop={(e) => handleCarouselDrop(e, carousel.id)}
              className="mb-3"
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
                layout="grid"
              />
            </div>
          )),
          leftPanelElement
        );
      })()}
    </>
  );
}
