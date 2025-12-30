import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useCanvasEditor } from '../hooks/useCanvasEditor';
import { CanvasSettings } from '../components/canvas/CanvasSettings';
import { CanvasWorkspace } from '../components/canvas/CanvasWorkspace';
import { AddImageForm } from '../components/canvas/AddImageForm';
import { ImagesList } from '../components/canvas/ImagesList';
import { FavoritesCarouselList } from '../components/carousel/FavoritesCarouselList';

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

  const handleAddImageFromCarousel = (imageUrl: string, x: number, y: number) => {
    console.log('handleAddImageFromCarousel called:', { imageUrl, x, y });

    // Calculate size: 30% of canvas width
    const canvasWidth = canvas?.width || 1920;
    const targetWidth = canvasWidth * 0.3;

    // Create a temporary image to get dimensions
    const img = new Image();
    img.crossOrigin = 'anonymous'; // Enable CORS

    img.onload = () => {
      console.log('Image loaded:', { width: img.width, height: img.height });
      const size = targetWidth / img.width;

      // Add image with calculated size, drop position, and dimensions
      console.log('Adding image to canvas:', { imageUrl, x, y, size, width: img.width, height: img.height });
      addImage({
        add_picture_url: imageUrl,
        x,
        y,
        size: Math.round(size * 100) / 100, // Round to 2 decimal places
        width: img.width,
        height: img.height,
      });
    };

    img.onerror = (error) => {
      console.error('Failed to load image:', error);
      // Fallback: add image with default size if loading fails
      // Use estimated dimensions for common image sizes
      const estimatedWidth = 800;
      const estimatedHeight = 600;
      const size = targetWidth / estimatedWidth;

      addImage({
        add_picture_url: imageUrl,
        x,
        y,
        size: Math.round(size * 100) / 100,
        width: estimatedWidth,
        height: estimatedHeight,
      });
    };

    img.src = imageUrl;
  };

  const handleImageDragStart = (_imageUrl: string) => {
    // Image drag start handled by individual carousel components
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
      {/* Header - with safe area support for PWA */}
      <header className="bg-white shadow" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
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
      <main className="mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex gap-6 justify-center">
          {/* Left Panel: Overflow Carousels (XL+ only) - 450px width */}
          <aside className="hidden xl:flex flex-col flex-shrink-0 overflow-y-auto" style={{ width: '450px', maxHeight: 'calc(100vh - 200px)' }}>
            {/* This will be populated by FavoritesCarouselList with overflow logic */}
            <div id="left-panel-carousels" className="space-y-3">
              {/* Overflow carousels will be rendered here */}
            </div>
          </aside>

          {/* Center Column: Canvas Workspace & Bottom Carousels - 900px width */}
          <div className="flex-shrink-0 space-y-6" style={{ width: '900px' }}>
            {/* Canvas Workspace */}
            <CanvasWorkspace
              canvas={canvas}
              images={images}
              onUpdateImage={(imageId, data) => updateImage({ imageId, data })}
              onAddImage={handleAddImageFromCarousel}
              isUpdatingImage={isUpdatingImage}
            />

            {/* Bottom Carousels - Hidden on mobile */}
            <div className="hidden lg:block">
              <FavoritesCarouselList onImageDragStart={handleImageDragStart} />
            </div>
          </div>

          {/* Right Column: Settings & Controls - 450px width */}
          <aside className="flex-shrink-0 space-y-6 hidden lg:block" style={{ width: '450px' }}>
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
          </aside>
        </div>
      </main>
    </div>
  );
}
