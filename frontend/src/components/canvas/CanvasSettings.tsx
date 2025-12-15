import { useState, useEffect } from 'react';
import type { Canvas } from '../../api';

interface CanvasSettingsProps {
  canvas: Canvas | undefined;
  isUpdating: boolean;
  onSave: (data: { name?: string; memo?: string; width?: number; height?: number }) => void;
  onDelete: () => void;
  isDeletingCanvas: boolean;
}

export function CanvasSettings({ canvas, isUpdating, onSave, onDelete, isDeletingCanvas }: CanvasSettingsProps) {
  const [name, setName] = useState('');
  const [memo, setMemo] = useState('');
  const [width, setWidth] = useState(1920);
  const [height, setHeight] = useState(1080);
  const [hasChanges, setHasChanges] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Canvas情報が読み込まれたら初期値をセット
  useEffect(() => {
    if (canvas) {
      setName(canvas.name || '');
      setMemo(canvas.memo || '');
      setWidth(canvas.width || 1920);
      setHeight(canvas.height || 1080);
    }
  }, [canvas]);

  // 変更検知
  useEffect(() => {
    if (canvas) {
      const changed =
        name !== (canvas.name || '') ||
        memo !== (canvas.memo || '') ||
        width !== (canvas.width || 1920) ||
        height !== (canvas.height || 1080);
      setHasChanges(changed);
    }
  }, [name, memo, width, height, canvas]);

  const handleSave = () => {
    onSave({
      name: name || undefined,
      memo: memo || undefined,
      width,
      height,
    });
    setHasChanges(false);
    setSavedAt(new Date());

    // 3秒後に保存メッセージを消す
    setTimeout(() => setSavedAt(null), 3000);
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

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Canvas Settings</h3>

      {/* Canvas Name */}
      <div className="mb-4">
        <label htmlFor="canvas-name" className="block text-sm font-medium text-gray-700 mb-2">
          Canvas Name
        </label>
        <input
          id="canvas-name"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="My Canvas"
        />
      </div>

      {/* Memo */}
      <div className="mb-4">
        <label htmlFor="canvas-memo" className="block text-sm font-medium text-gray-700 mb-2">
          Memo
        </label>
        <textarea
          id="canvas-memo"
          value={memo}
          onChange={(e) => setMemo(e.target.value)}
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          placeholder="Description..."
        />
      </div>

      {/* Dimensions */}
      <div className="grid grid-cols-2 gap-4 mb-4">
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={isUpdating || !hasChanges}
        className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
      >
        {isUpdating ? (
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
            Saving...
          </>
        ) : (
          'Save Canvas Info'
        )}
      </button>

      {/* Save success message */}
      {savedAt && !isUpdating && (
        <div className="mt-2 text-sm text-green-600 text-center">
          ✓ Saved successfully
        </div>
      )}

      {/* Delete Button */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        {!showDeleteConfirm ? (
          <button
            onClick={handleDeleteClick}
            className="w-full px-4 py-2 bg-red-50 text-red-600 border border-red-300 rounded-md hover:bg-red-100 transition-colors flex items-center justify-center"
          >
            <svg
              className="h-4 w-4 mr-2"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
              />
            </svg>
            Delete Canvas
          </button>
        ) : (
          <div className="space-y-2">
            <p className="text-sm text-gray-700 font-medium text-center">
              Delete this canvas permanently?
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleConfirmDelete}
                disabled={isDeletingCanvas}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50 flex items-center justify-center transition-colors"
              >
                {isDeletingCanvas ? (
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
                    Deleting...
                  </>
                ) : (
                  'Yes, Delete'
                )}
              </button>
              <button
                onClick={handleCancelDelete}
                disabled={isDeletingCanvas}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
