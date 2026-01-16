import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { ArrowPathIcon, ArrowDownIcon, ArrowUpIcon, PhotoIcon, FolderIcon, HomeIcon } from '@heroicons/react/24/outline';
import { useLocalImages } from '../../hooks/useLocalImages';

interface LocalImageCarouselProps {
  onImageDragStart: (imageUrl: string) => void;
}

// Check if URL is a video file
const isVideoFile = (url: string): boolean => {
  return /\.(mp4|webm|ogg|mov)$/i.test(url);
};

export function LocalImageCarousel({ onImageDragStart }: LocalImageCarouselProps) {
  const { images, folders, currentPath, sortOrder, isLoading, error, fetchRandomImages, loadMore, navigateToFolder, changeSortOrder } = useLocalImages();
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [hoveredImageId, setHoveredImageId] = useState<string | null>(null); // Hover state tracking
  const [isDragging, setIsDragging] = useState(false); // Track if currently dragging

  // 初回ロード
  useEffect(() => {
    fetchRandomImages(10);
  }, [fetchRandomImages]);

  // パンくずリストの生成
  const breadcrumbs = currentPath
    ? currentPath.split('/').reduce<{ name: string; path: string }[]>((acc, part, index, arr) => {
        const path = arr.slice(0, index + 1).join('/');
        acc.push({ name: part, path });
        return acc;
      }, [])
    : [];

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

  const handleDragStart = (e: React.DragEvent<HTMLImageElement | HTMLVideoElement>, imageUrl: string) => {
    setIsDragging(true); // Set dragging state
    setHoveredImageId(null); // Clear hover state when drag starts
    e.dataTransfer.effectAllowed = 'copy';
    e.dataTransfer.setData('text/plain', imageUrl);
    onImageDragStart(imageUrl);
  };

  const handleDragEnd = () => {
    setIsDragging(false); // Clear dragging state
    setHoveredImageId(null); // Clear hover state on drag end
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
      {/* タイトル + パンくずリスト + ソート選択 */}
      <div className="flex items-center justify-between gap-2 mb-3 min-h-[1.5rem]">
        <div className="flex items-center gap-2 flex-1">
          <div className="flex items-center gap-1.5">
            <PhotoIcon className="h-4 w-4 text-gray-700" />
            <h3 className="text-sm font-medium text-gray-900">ローカル画像</h3>
          </div>
          {currentPath && (
            <>
              <span className="text-gray-400">›</span>
              <div className="flex items-center gap-1 text-xs text-gray-600 flex-wrap">
                <button
                  onClick={() => navigateToFolder('')}
                  className="flex items-center gap-1 hover:text-blue-600 hover:underline transition-colors"
                >
                  <HomeIcon className="h-3.5 w-3.5" />
                  <span>ルート</span>
                </button>
                {breadcrumbs.map((crumb, index) => (
                  <React.Fragment key={crumb.path}>
                    <span className="text-gray-400">/</span>
                    <button
                      onClick={() => navigateToFolder(crumb.path)}
                      className={`hover:text-blue-600 hover:underline transition-colors ${
                        index === breadcrumbs.length - 1 ? 'font-medium text-gray-900' : ''
                      }`}
                    >
                      {crumb.name}
                    </button>
                  </React.Fragment>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ソート選択 */}
        <div className="flex items-center gap-1">
          <button
            onClick={() => changeSortOrder('random')}
            className={`p-1.5 rounded transition-colors ${
              sortOrder === 'random'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="ランダム"
          >
            <ArrowPathIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => changeSortOrder('desc')}
            className={`p-1.5 rounded transition-colors ${
              sortOrder === 'desc'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="新しい順"
          >
            <ArrowDownIcon className="h-4 w-4" />
          </button>
          <button
            onClick={() => changeSortOrder('asc')}
            className={`p-1.5 rounded transition-colors ${
              sortOrder === 'asc'
                ? 'bg-blue-100 text-blue-600'
                : 'text-gray-400 hover:text-gray-600 hover:bg-gray-100'
            }`}
            title="古い順"
          >
            <ArrowUpIcon className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* サブフォルダタグ */}
      {folders.length > 0 && (
        <div className="flex gap-2 flex-wrap mb-3">
          {folders.map((folder) => (
            <button
              key={folder.path}
              onClick={() => navigateToFolder(folder.path)}
              className="px-3 py-1.5 bg-blue-50 text-blue-700 text-xs rounded-full hover:bg-blue-100 transition-colors flex items-center gap-1.5"
            >
              <FolderIcon className="h-3.5 w-3.5" />
              {folder.name}
            </button>
          ))}
        </div>
      )}

      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex gap-2 overflow-x-auto pb-2"
        style={{ scrollbarWidth: 'thin' }}
      >
        {images.map((image) => {
          const isVideo = isVideoFile(image.url);
          return (
            <div
              key={image.id}
              className={`flex-shrink-0 w-24 h-24 bg-gray-100 rounded overflow-hidden cursor-move transition-all ${
                hoveredImageId === image.id ? 'ring-2 ring-blue-500' : ''
              }`}
              onMouseEnter={() => {
                // Only set hover state if not currently dragging
                if (!isDragging) {
                  setHoveredImageId(image.id);
                }
              }}
              onMouseLeave={() => setHoveredImageId(null)}
            >
              {isVideo ? (
                <video
                  src={image.url}
                  draggable
                  onDragStart={(e) => handleDragStart(e, image.url)}
                  onDragEnd={handleDragEnd}
                  className="w-full h-full object-cover cursor-pointer"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(image.url);
                  }}
                  muted
                  loop
                  playsInline
                />
              ) : (
                <img
                  src={image.url}
                  alt={image.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, image.url)}
                  onDragEnd={handleDragEnd}
                  className="w-full h-full object-cover cursor-pointer"
                  loading="lazy"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewImage(image.url);
                  }}
                />
              )}
            </div>
          );
        })}

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

      {/* 画像・動画プレビューモーダル */}
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
          {isVideoFile(previewImage) ? (
            <video
              src={previewImage}
              controls
              autoPlay
              loop
              onClick={(e) => e.stopPropagation()}
              style={{
                maxHeight: '95vh',
                maxWidth: '95vw',
                objectFit: 'contain',
                display: 'block',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
              }}
            />
          ) : (
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
          )}
        </div>,
        document.body
      )}
    </div>
  );
}
