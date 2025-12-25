import { useEffect, useRef } from 'react';
import { useLocalImages } from '../../hooks/useLocalImages';

interface LocalImageCarouselProps {
  onImageDragStart: (imageUrl: string) => void;
}

export function LocalImageCarousel({ onImageDragStart }: LocalImageCarouselProps) {
  const { images, isLoading, error, fetchRandomImages, loadMore } = useLocalImages();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // 初回ロード
  useEffect(() => {
    fetchRandomImages(10);
  }, [fetchRandomImages]);

  // 横スクロール時の追加読み込み
  const handleScroll = () => {
    const container = scrollContainerRef.current;
    if (!container || isLoading) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const scrollPercentage = (scrollLeft + clientWidth) / scrollWidth;

    // 80%スクロールしたら追加読み込み
    if (scrollPercentage > 0.8) {
      loadMore(10);
    }
  };

  const handleDragStart = (e: React.DragEvent<HTMLImageElement>, imageUrl: string) => {
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', imageUrl);
    onImageDragStart(imageUrl);
  };

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="text-sm font-medium text-gray-900 mb-2">📦 ローカル画像</h3>
        <p className="text-sm text-red-600">
          画像サーバーに接続できません。ローカル画像サーバーが起動しているか確認してください。
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">📦 ローカル画像</h3>

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {images.map((image) => (
          <div
            key={image.id}
            className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded overflow-hidden cursor-move hover:ring-2 hover:ring-blue-500 transition-all"
          >
            <img
              src={image.url}
              alt={image.id}
              draggable
              onDragStart={(e) => handleDragStart(e, image.url)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        ))}

        {isLoading && (
          <div className="flex-shrink-0 w-24 h-24 bg-gray-100 rounded flex items-center justify-center">
            <svg
              className="animate-spin h-6 w-6 text-gray-400"
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
          </div>
        )}

        {images.length === 0 && !isLoading && (
          <p className="text-sm text-gray-500 py-4">
            画像が見つかりません。IMAGE_DIRECTORYを確認してください。
          </p>
        )}
      </div>
    </div>
  );
}
