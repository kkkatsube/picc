import { useState } from 'react';
import type { CanvasImage } from '../../api';

interface ImagesListProps {
  images: CanvasImage[];
  isDeletingImage: boolean;
  onDeleteImage: (imageId: number) => void;
}

export function ImagesList({ images, isDeletingImage, onDeleteImage }: ImagesListProps) {
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
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">
        Images on Canvas ({images.length})
      </h3>

      {images.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <svg
            className="mx-auto h-12 w-12 text-gray-400 mb-2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <p className="font-medium">No images yet</p>
          <p className="text-sm mt-1">Add an image using the form above</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {images.map((image) => (
            <div
              key={image.id}
              className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start space-x-3">
                {/* Image Thumbnail */}
                <div className="flex-shrink-0">
                  <img
                    src={image.uri}
                    alt="Canvas image"
                    className="w-16 h-16 object-cover rounded border border-gray-200"
                    onError={(e) => {
                      // Fallback for broken images
                      e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="64" height="64"%3E%3Crect width="64" height="64" fill="%23f3f4f6"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af"%3E?%3C/text%3E%3C/svg%3E';
                    }}
                  />
                </div>

                {/* Image Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate" title={image.uri}>
                    {image.uri}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Size: {image.width} × {image.height} px
                  </p>
                  <p className="text-xs text-gray-500">
                    Position: ({image.x}, {image.y}) | Scale: {image.size}
                  </p>
                </div>

                {/* Delete Button */}
                <div className="flex-shrink-0">
                  {deleteConfirmId === image.id ? (
                    <div className="flex flex-col space-y-1">
                      <button
                        onClick={() => handleConfirmDelete(image.id!)}
                        disabled={isDeletingImage}
                        className="px-2 py-1 text-xs text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
                      >
                        Confirm
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        disabled={isDeletingImage}
                        className="px-2 py-1 text-xs text-gray-700 bg-gray-200 hover:bg-gray-300 rounded disabled:opacity-50"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleDeleteClick(image.id!)}
                      className="px-3 py-1 text-sm text-red-600 hover:bg-red-50 rounded border border-red-300 transition-colors"
                    >
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
