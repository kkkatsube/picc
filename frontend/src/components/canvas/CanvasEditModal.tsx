import { useState, useEffect, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/outline';
import type { Canvas } from '../../api';

interface CanvasEditModalProps {
  canvas: Canvas | undefined;
  isOpen: boolean;
  onClose: () => void;
  isUpdating: boolean;
  onSave: (data: { name?: string; memo?: string; width?: number; height?: number }) => void;
  onDelete: () => void;
  isDeletingCanvas: boolean;
  isAddingImage: boolean;
  onAddImage: (url: string) => void;
}

export function CanvasEditModal({
  canvas,
  isOpen,
  onClose,
  isUpdating,
  onSave,
  onDelete,
  isDeletingCanvas,
  isAddingImage,
  onAddImage,
}: CanvasEditModalProps) {

  // Canvas Settings state
  const [name, setName] = useState('');
  const [width, setWidth] = useState(3840);
  const [height, setHeight] = useState(2160);
  const [hasChanges, setHasChanges] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Add Image state
  const [imageUrl, setImageUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  // Canvas情報が読み込まれたら初期値をセット
  useEffect(() => {
    if (canvas) {
      setName(canvas.name || '');
      setWidth(canvas.width || 3840);
      setHeight(canvas.height || 2160);
    }
  }, [canvas]);

  // 変更検知
  useEffect(() => {
    if (canvas) {
      const changed =
        name !== (canvas.name || '') ||
        width !== (canvas.width || 3840) ||
        height !== (canvas.height || 2160);
      setHasChanges(changed);
    }
  }, [name, width, height, canvas]);

  const handleSave = () => {
    onSave({
      name: name || undefined,
      width,
      height,
    });
    setHasChanges(false);
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    onDelete();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const handleAddImageSubmit = (e: FormEvent) => {
    e.preventDefault();
    setUrlError('');

    if (!imageUrl) {
      setUrlError('Please enter an image URL');
      return;
    }

    if (!imageUrl.startsWith('https://')) {
      setUrlError('Only HTTPS URLs are allowed');
      return;
    }

    try {
      new URL(imageUrl);
      onAddImage(imageUrl);
      setImageUrl('');
      setUrlError('');
    } catch {
      setUrlError('Invalid URL format');
    }
  };

  const handleClose = () => {
    onClose();
    setShowDeleteConfirm(false);
    setUrlError('');
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      onClick={handleClose}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Canvas Settings</h2>
          <button
            onClick={handleClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded hover:bg-gray-100"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

            {/* Modal Content */}
            <div className="p-6 space-y-6">
              {/* Canvas Settings Section */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Canvas Info</h3>

                <div className="space-y-4">
                  {/* Canvas Name */}
                  <div>
                    <label htmlFor="canvas-name" className="block text-sm font-medium text-gray-700 mb-2">
                      Canvas Name
                    </label>
                    <input
                      id="canvas-name"
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Canvas Name"
                    />
                  </div>

                  {/* Dimensions */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="canvas-width" className="block text-sm font-medium text-gray-700 mb-2">
                        Width (px)
                      </label>
                      <input
                        id="canvas-width"
                        type="number"
                        value={width}
                        onChange={(e) => setWidth(parseInt(e.target.value) || 0)}
                        min="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                    <div>
                      <label htmlFor="canvas-height" className="block text-sm font-medium text-gray-700 mb-2">
                        Height (px)
                      </label>
                      <input
                        id="canvas-height"
                        type="number"
                        value={height}
                        onChange={(e) => setHeight(parseInt(e.target.value) || 0)}
                        min="100"
                        className="w-full px-3 py-2 border border-gray-300 rounded"
                      />
                    </div>
                  </div>

                  {/* Save Button */}
                  <button
                    onClick={handleSave}
                    disabled={isUpdating || !hasChanges}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    {isUpdating ? 'Saving...' : 'Save Canvas Info'}
                  </button>
                </div>
              </div>

              {/* Add Image Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4">Add Image</h3>

                <form onSubmit={handleAddImageSubmit} className="space-y-4">
                  <div>
                    <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 mb-2">
                      Image URL (HTTPS)
                    </label>
                    <input
                      id="image-url"
                      type="url"
                      value={imageUrl}
                      onChange={(e) => {
                        setImageUrl(e.target.value);
                        setUrlError('');
                      }}
                      placeholder="https://example.com/image.jpg"
                      className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-blue-500 focus:border-blue-500"
                      disabled={isAddingImage}
                    />
                    {urlError && (
                      <p className="mt-1 text-sm text-red-600">{urlError}</p>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={isAddingImage || !imageUrl}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
                  >
                    {isAddingImage ? (
                      <>
                        <svg
                          className="animate-spin h-4 w-4 mr-2"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          />
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          />
                        </svg>
                        Adding Image...
                      </>
                    ) : (
                      <>
                        <PlusIcon className="h-4 w-4 mr-2" />
                        Add Image
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Delete Canvas Section */}
              <div className="pt-6 border-t border-gray-200">
                <h3 className="text-lg font-semibold mb-4 text-red-600">Danger Zone</h3>

                {!showDeleteConfirm ? (
                  <button
                    onClick={handleDeleteClick}
                    className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-300 rounded hover:bg-red-100 transition-colors"
                  >
                    Delete Canvas
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700 font-medium">
                      Delete this canvas permanently?
                    </p>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={handleConfirmDelete}
                        disabled={isDeletingCanvas}
                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 transition-colors"
                      >
                        {isDeletingCanvas ? 'Deleting...' : 'Yes, Delete'}
                      </button>
                      <button
                        onClick={handleCancelDelete}
                        disabled={isDeletingCanvas}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 disabled:opacity-50 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
      </div>
    </div>
  </div>,
  document.body
  );
}
