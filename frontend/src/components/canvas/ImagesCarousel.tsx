import { useState } from 'react';
import { XMarkIcon, PhotoIcon } from '@heroicons/react/24/outline';
import type { CanvasImage } from '../../api';

interface ImagesCarouselProps {
  images: CanvasImage[];
  isDeletingImage: boolean;
  onDeleteImage: (imageId: number) => void;
}

// Check if URL is a video file
const isVideoFile = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
};

export function ImagesCarousel({ images, isDeletingImage, onDeleteImage }: ImagesCarouselProps) {
  const [deleteConfirmId, setDeleteConfirmId] = useState<number | null>(null);

  const handleDeleteClick = (imageId: number) => {
    setDeleteConfirmId(imageId);
  };

  const handleConfirmDelete = (imageId: number) => {
    onDeleteImage(imageId);
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
  };

  return (
    <div className="bg-white rounded-lg shadow p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <PhotoIcon className="h-4 w-4 text-blue-500" />
          <h3 className="text-sm font-medium text-gray-900">Canvas上の画像 ({images.length})</h3>
        </div>
      </div>

      {/* Images */}
      <div
        className="relative w-full min-h-24"
        style={{
          scrollbarWidth: 'thin',
        }}
      >
        {images && images.length > 0 ? (
          <div className="flex gap-2 overflow-x-auto pb-2 min-h-24">
            {images.map((image) => {
              const isVideo = isVideoFile(image.uri);
              return (
                <div
                  key={image.id}
                  className="relative w-24 h-24 bg-gray-100 rounded overflow-hidden group flex-shrink-0"
                >
                  {isVideo ? (
                    <video
                      src={image.uri}
                      className="w-full h-full object-cover"
                      muted
                      loop
                      playsInline
                    />
                  ) : (
                    <img
                      src={image.uri}
                      alt={`Canvas image ${image.id}`}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      onError={(e) => {
                        // Fallback for broken images
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="96" height="96"%3E%3Crect width="96" height="96" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3E?%3C/text%3E%3C/svg%3E';
                      }}
                    />
                  )}

                {/* Image Info Overlay (on hover) */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                  <div className="text-white text-xs text-center px-1">
                    <div>({image.x}, {image.y})</div>
                    <div>{image.width}×{image.height}</div>
                  </div>
                </div>

                {/* Delete button on hover */}
                {deleteConfirmId === image.id ? (
                  <div className="absolute inset-0 bg-black bg-opacity-75 flex flex-col items-center justify-center gap-1 p-2">
                    <button
                      onClick={() => handleConfirmDelete(image.id!)}
                      disabled={isDeletingImage}
                      className="w-full px-2 py-1 text-xs bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    >
                      削除
                    </button>
                    <button
                      onClick={handleCancelDelete}
                      disabled={isDeletingImage}
                      className="w-full px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50"
                    >
                      キャンセル
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleDeleteClick(image.id!)}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                    title="画像を削除"
                  >
                    <XMarkIcon className="h-3 w-3" />
                  </button>
                )}
              </div>
              );
            })}
          </div>
        ) : (
          <div className="flex items-center justify-center h-24">
            <p className="text-sm text-gray-500">
              Canvas上に画像がありません
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
