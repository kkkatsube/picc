import { useState, useEffect, useMemo } from 'react';
import type { Canvas, CanvasImage } from '../../api';

interface CanvasWorkspaceProps {
  canvas: Canvas | undefined;
  images: CanvasImage[];
}

export function CanvasWorkspace({ canvas, images }: CanvasWorkspaceProps) {
  const [scale, setScale] = useState(0.5);

  const canvasWidth = canvas?.width || 1920;
  const canvasHeight = canvas?.height || 1080;

  // スケールを画面サイズに合わせて自動調整
  const calculateFitScale = useMemo(() => {
    const availableWidth = Math.max(800, window.innerWidth * 0.5);
    const availableHeight = Math.max(500, window.innerHeight * 0.6);

    const scaleX = availableWidth / canvasWidth;
    const scaleY = availableHeight / canvasHeight;

    const optimalScale = Math.min(scaleX, scaleY);
    return Math.max(0.1, Math.min(1.0, optimalScale));
  }, [canvasWidth, canvasHeight]);

  // 初回マウント時にフィット表示
  useEffect(() => {
    setScale(calculateFitScale);
  }, [calculateFitScale]);

  const handleFitToScreen = () => {
    setScale(calculateFitScale);
  };

  return (
    <div className="bg-gray-100 rounded-lg p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Canvas Workspace</h3>
        <div className="flex items-center space-x-4">
          {/* Scale Slider */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Scale:</span>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={scale}
              onChange={(e) => setScale(parseFloat(e.target.value))}
              className="w-24"
            />
            <span className="text-sm font-medium min-w-[3rem]">
              {(scale * 100).toFixed(0)}%
            </span>
          </div>

          {/* Fit to Screen Button */}
          <button
            onClick={handleFitToScreen}
            className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
          >
            Fit to Screen
          </button>
        </div>
      </div>

      {/* SVG Canvas */}
      <div className="bg-white border-2 border-gray-300 overflow-auto rounded">
        <svg
          width={canvasWidth * scale}
          height={canvasHeight * scale}
          style={{ display: 'block', margin: 'auto' }}
        >
          {/* Background rect for visual reference */}
          <rect
            width={canvasWidth * scale}
            height={canvasHeight * scale}
            fill="white"
            stroke="#e5e7eb"
            strokeWidth="1"
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

            return (
              <g key={image.id}>
                {/* ClipPath for cropping */}
                <defs>
                  <clipPath id={`clip-${image.id}`}>
                    <rect
                      x={(imageX + left * imageSize) * scale}
                      y={(imageY + top * imageSize) * scale}
                      width={(imageWidth - left - right) * imageSize * scale}
                      height={(imageHeight - top - bottom) * imageSize * scale}
                    />
                  </clipPath>
                </defs>

                {/* Image */}
                <image
                  href={image.uri}
                  x={imageX * scale}
                  y={imageY * scale}
                  width={imageWidth * imageSize * scale}
                  height={imageHeight * imageSize * scale}
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
      <div className="mt-2 text-sm text-gray-600 text-center">
        Canvas: {canvasWidth} × {canvasHeight} px | Images: {images.length} | Scale: {(scale * 100).toFixed(0)}%
      </div>
    </div>
  );
}
