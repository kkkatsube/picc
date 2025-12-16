import { useState, useEffect, useRef } from 'react';
import type { Canvas, CanvasImage } from '../../api';

interface CanvasWorkspaceProps {
  canvas: Canvas | undefined;
  images: CanvasImage[];
}

export function CanvasWorkspace({ canvas, images }: CanvasWorkspaceProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const canvasWidth = canvas?.width || 1920;
  const canvasHeight = canvas?.height || 1080;

  // コンテナの横幅いっぱいに Canvas を表示するスケールを計算
  useEffect(() => {
    if (!canvasContainerRef.current || isFullscreen) return;

    const updateScale = () => {
      if (!canvasContainerRef.current) return;
      const containerWidth = canvasContainerRef.current.clientWidth;
      const calculatedScale = containerWidth / canvasWidth;
      setScale(calculatedScale);
    };

    updateScale();

    // ウィンドウリサイズ時も再計算
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasWidth, isFullscreen]);

  // フルスクリーン表示
  const enterFullscreen = async () => {
    if (!canvasContainerRef.current) return;

    try {
      await canvasContainerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } catch (err) {
      console.error('Failed to enter fullscreen:', err);
    }
  };

  // Esc キーでフルスクリーン解除
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        if (document.fullscreenElement) {
          document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    };

    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) {
        setIsFullscreen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('fullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [isFullscreen]);

  /* 将来的な機能拡張用（現在は非表示）
  const calculateFitScale = () => {
    if (!containerRef.current) return 0.5;
    const containerWidth = containerRef.current.clientWidth - 32;
    const containerHeight = containerRef.current.clientHeight - 32;
    const scaleX = containerWidth / canvasWidth;
    const scaleY = containerHeight / canvasHeight;
    const optimalScale = Math.min(scaleX, scaleY);
    return Math.max(0.1, Math.min(1.0, optimalScale));
  };

  const handleFitToScreen = () => {
    setScale(calculateFitScale());
  };
  */

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
        <h3 className="text-lg font-semibold">Canvas Workspace</h3>
        <button
          onClick={enterFullscreen}
          className="inline-flex items-center px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-800 transition-colors"
          title="Fullscreen (Press ESC to exit)"
        >
          <svg
            className="h-4 w-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
            />
          </svg>
          Fullscreen
        </button>
        {/* 将来的な機能拡張用（Scale コントロール）
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Scale:</span>
            <input type="range" min="0.1" max="1" step="0.1" value={scale} onChange={(e) => setScale(parseFloat(e.target.value))} className="w-24" />
            <span className="text-sm font-medium min-w-[3rem]">{(scale * 100).toFixed(0)}%</span>
          </div>
          <button onClick={handleFitToScreen} className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors">Fit to Screen</button>
        </div>
        */}
      </div>

      {/* SVG Canvas */}
      <div
        ref={canvasContainerRef}
        className={isFullscreen ? 'bg-black overflow-auto w-full h-full flex items-center justify-center' : 'w-full bg-white overflow-auto'}
      >
        <svg
          width={isFullscreen ? canvasWidth : '100%'}
          height={isFullscreen ? canvasHeight : canvasHeight * scale}
          viewBox={isFullscreen ? undefined : `0 0 ${canvasWidth} ${canvasHeight}`}
          preserveAspectRatio={isFullscreen ? undefined : 'xMidYMid meet'}
          style={{ display: 'block' }}
        >
          {/* Background rect */}
          <rect
            width={canvasWidth}
            height={canvasHeight}
            fill="white"
          />

          {/* Render images */}
          {images.map((image) => {
            const imageSize = image.size || 0.25;
            const imageX = image.x || 0;
            const imageY = image.y || 0;
            const imageWidth = image.width || 0;
            const imageHeight = image.height || 0;
            const left = image.left || 0;
            const right = image.right || 0;
            const top = image.top || 0;
            const bottom = image.bottom || 0;

            // フルスクリーン時は scale を適用しない（100% 表示）
            const renderScale = isFullscreen ? 1 : 1;

            return (
              <g key={image.id}>
                {/* ClipPath for cropping */}
                <defs>
                  <clipPath id={`clip-${image.id}`}>
                    <rect
                      x={(imageX + left * imageSize) * renderScale}
                      y={(imageY + top * imageSize) * renderScale}
                      width={(imageWidth - left - right) * imageSize * renderScale}
                      height={(imageHeight - top - bottom) * imageSize * renderScale}
                    />
                  </clipPath>
                </defs>

                {/* Image */}
                <image
                  href={image.uri}
                  x={imageX * renderScale}
                  y={imageY * renderScale}
                  width={imageWidth * imageSize * renderScale}
                  height={imageHeight * imageSize * renderScale}
                  clipPath={`url(#clip-${image.id})`}
                  style={{ cursor: 'default' }}
                  preserveAspectRatio="none"
                />
              </g>
            );
          })}
        </svg>
      </div>

      {/* Canvas Info */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-sm text-gray-600 text-center">
        Canvas: {canvasWidth} × {canvasHeight} px | Images: {images.length}
      </div>
    </div>
  );
}
