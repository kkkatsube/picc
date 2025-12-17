import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCanvasEditor } from '../hooks/useCanvasEditor';
import { CanvasSettings } from '../components/canvas/CanvasSettings';
import { CanvasWorkspace } from '../components/canvas/CanvasWorkspace';
import { AddImageForm } from '../components/canvas/AddImageForm';
import { ImagesList } from '../components/canvas/ImagesList';

export default function CanvasEditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const canvasId = parseInt(id || '0', 10);

  const {
    canvas,
    isLoading,
    isError,
    updateCanvas,
    isUpdating,
    deleteCanvas,
    isDeletingCanvas,
    images,
    isLoadingImages,
    addImage,
    isAddingImage,
    updateImage,
    isUpdatingImage,
    deleteImage,
    isDeletingImage,
  } = useCanvasEditor(canvasId);

  const handleAddImage = (url: string) => {
    addImage({ add_picture_url: url });
  };

  const handleDeleteCanvas = () => {
    deleteCanvas(undefined, {
      onSuccess: () => {
        // Canvas削除成功後、Dashboardに遷移
        navigate('/dashboard');
      },
    });
  };

  if (isLoading || isLoadingImages) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-blue-500 mx-auto mb-4"
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
          <p className="text-gray-600">Loading canvas...</p>
        </div>
      </div>
    );
  }

  if (isError || !canvas) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 text-lg mb-4">Failed to load canvas</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeftIcon className="h-5 w-5 mr-1" />
                Dashboard
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  {canvas.name || 'Untitled Canvas'}
                </h1>
                <p className="text-sm text-gray-600">Canvas Editor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Canvas Workspace (2/3 width on desktop) */}
          <div className="lg:col-span-2">
            <CanvasWorkspace
              canvas={canvas}
              images={images}
              onUpdateImage={(imageId, data) => updateImage({ imageId, data })}
              isUpdatingImage={isUpdatingImage}
            />
          </div>

          {/* Right Column: Settings & Controls (1/3 width on desktop) */}
          <div className="space-y-6">
            {/* Canvas Settings */}
            <CanvasSettings
              canvas={canvas}
              isUpdating={isUpdating}
              onSave={updateCanvas}
              onDelete={handleDeleteCanvas}
              isDeletingCanvas={isDeletingCanvas}
            />

            {/* Add Image Form */}
            <AddImageForm
              isAddingImage={isAddingImage}
              onAddImage={handleAddImage}
            />

            {/* Images List */}
            <ImagesList
              images={images}
              isDeletingImage={isDeletingImage}
              onDeleteImage={deleteImage}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
