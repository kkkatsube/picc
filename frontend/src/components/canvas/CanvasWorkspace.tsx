import { useState, useEffect, useRef, type PointerEvent, type MouseEvent } from 'react';
import type { Canvas, CanvasImage, UpdateCanvasImageRequest } from '../../api';

interface CanvasWorkspaceProps {
  canvas: Canvas | undefined;
  images: CanvasImage[];
  onUpdateImage?: (imageId: number, data: UpdateCanvasImageRequest) => void;
  onAddImage?: (imageUrl: string, x: number, y: number) => void;
  isUpdatingImage?: boolean;
}

export function CanvasWorkspace({ canvas, images, onUpdateImage, onAddImage, isUpdatingImage }: CanvasWorkspaceProps) {
  const canvasContainerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1.0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Drag & Drop state for adding images from carousel
  const [isDragOverCanvas, setIsDragOverCanvas] = useState(false);

  // Drag state
  const [draggingImageId, setDraggingImageId] = useState<number | null>(null);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [committedOffsets, setCommittedOffsets] = useState<Map<number, { x: number; y: number }>>(new Map());

  // Resize state
  const [resizingImageId, setResizingImageId] = useState<number | null>(null);
  const [resizeStartSize, setResizeStartSize] = useState<number>(1.0);
  const [resizeCorner, setResizeCorner] = useState<'nw' | 'ne' | 'sw' | 'se' | null>(null);
  const [resizeAnchor, setResizeAnchor] = useState<{ x: number; y: number }>({ x: 0, y: 0 }); // Fixed opposite corner
  const [resizeStartImagePos, setResizeStartImagePos] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [resizeDelta, setResizeDelta] = useState<number>(0);
  const [resizePositionDelta, setResizePositionDelta] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [committedSizes, setCommittedSizes] = useState<Map<number, number>>(new Map());
  const [committedPositions, setCommittedPositions] = useState<Map<number, { x: number; y: number }>>(new Map());

  // Crop state
  const [croppingImageId, setCroppingImageId] = useState<number | null>(null);
  const [cropEdge, setCropEdge] = useState<'top' | 'bottom' | 'left' | 'right' | null>(null);
  const [cropStartPos, setCropStartPos] = useState<number>(0);
  const [cropDelta, setCropDelta] = useState<number>(0);
  const [committedCrops, setCommittedCrops] = useState<Map<number, { left: number; right: number; top: number; bottom: number }>>(new Map());

  // Hover state
  const [hoveredImageId, setHoveredImageId] = useState<number | null>(null);

  // Selected state (for touch devices - persists after tap)
  const [selectedImageId, setSelectedImageId] = useState<number | null>(null);

  const canvasWidth = canvas?.width || 1920;
  const canvasHeight = canvas?.height || 1080;

  // コンテナの横幅いっぱいに Canvas を表示するスケールを計算（縦幅は800pxまで）
  useEffect(() => {
    if (!canvasContainerRef.current || isFullscreen) return;

    const updateScale = () => {
      if (!canvasContainerRef.current) return;
      const containerWidth = canvasContainerRef.current.clientWidth;
      const maxHeight = 800; // 縦幅の最大値

      // 横幅基準のスケール
      const scaleByWidth = containerWidth / canvasWidth;
      // 縦幅基準のスケール（800pxを超えないように）
      const scaleByHeight = maxHeight / canvasHeight;

      // より小さい方のスケールを採用（両方の制限を満たす）
      const calculatedScale = Math.min(scaleByWidth, scaleByHeight);
      setScale(calculatedScale);
    };

    updateScale();

    // ウィンドウリサイズ時も再計算
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [canvasWidth, canvasHeight, isFullscreen]);

  // フルスクリーン表示（iOS対応: 疑似フルスクリーン）
  const enterFullscreen = async () => {
    if (!canvasContainerRef.current) return;

    // フルスクリーンAPI対応チェック（PCブラウザなど）
    if (canvasContainerRef.current.requestFullscreen) {
      try {
        await canvasContainerRef.current.requestFullscreen();
        setIsFullscreen(true);
        return;
      } catch (err) {
        console.error('Failed to enter fullscreen:', err);
      }
    }

    // iOS/非対応ブラウザ: 疑似フルスクリーン
    setIsFullscreen(true);
  };

  // フルスクリーン解除
  const exitFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    }
    setIsFullscreen(false);
  };

  // Esc キーでフルスクリーン解除
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        exitFullscreen();
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

  // Image drag handlers
  const handleImagePointerDown = (e: PointerEvent<SVGImageElement>, image: CanvasImage) => {
    // Disable drag in fullscreen mode (read-only)
    if (isFullscreen) return;

    e.preventDefault();

    // Set selected image for touch devices (persists to show handles)
    setSelectedImageId(image.id);

    const svg = e.currentTarget.ownerSVGElement;
    if (!svg) return;

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    setDraggingImageId(image.id);
    setDragStartPos({ x: svgP.x, y: svgP.y });
    setDragOffset({ x: 0, y: 0 });
  };

  const handlePointerMove = (e: PointerEvent<SVGSVGElement>) => {
    // Handle crop
    if (croppingImageId) {
      e.preventDefault(); // Prevent scrolling during crop
      handleCropMove(e);
      return;
    }

    // Handle resize
    if (resizingImageId) {
      e.preventDefault(); // Prevent scrolling during resize
      handleResizeMove(e);
      return;
    }

    // Handle drag
    if (!draggingImageId || !dragStartPos) return;
    e.preventDefault(); // Prevent scrolling during drag

    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    setDragOffset({
      x: svgP.x - dragStartPos.x,
      y: svgP.y - dragStartPos.y,
    });
  };

  const handlePointerUp = () => {
    // Handle crop end
    if (croppingImageId) {
      handleCropEnd();
      return;
    }

    // Handle resize end
    if (resizingImageId) {
      handleResizeEnd();
      return;
    }

    // Handle drag end
    if (!draggingImageId || !onUpdateImage) {
      setDraggingImageId(null);
      setDragStartPos(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    const image = images.find((img) => img.id === draggingImageId);
    if (!image) {
      setDraggingImageId(null);
      setDragStartPos(null);
      setDragOffset({ x: 0, y: 0 });
      return;
    }

    const currentImageId = draggingImageId;

    // Store the committed offset to prevent flicker
    setCommittedOffsets((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentImageId, dragOffset);
      return newMap;
    });

    // Update image position
    const newX = (image.x || 0) + dragOffset.x;
    const newY = (image.y || 0) + dragOffset.y;

    onUpdateImage(currentImageId, {
      x: Math.round(newX),
      y: Math.round(newY),
    });

    // Reset drag state immediately
    setDraggingImageId(null);
    setDragStartPos(null);
    setDragOffset({ x: 0, y: 0 });

    // Keep the image hovered after drag to show handles
    setHoveredImageId(currentImageId);
  };

  // Clear committed values when image updates from server
  useEffect(() => {
    if (!isUpdatingImage && committedOffsets.size > 0) {
      setCommittedOffsets(new Map());
    }
    if (!isUpdatingImage && committedSizes.size > 0) {
      setCommittedSizes(new Map());
    }
    if (!isUpdatingImage && committedPositions.size > 0) {
      setCommittedPositions(new Map());
    }
    if (!isUpdatingImage && committedCrops.size > 0) {
      setCommittedCrops(new Map());
    }
  }, [isUpdatingImage, committedOffsets.size, committedSizes.size, committedPositions.size, committedCrops.size]);

  // Resize handlers
  const handleResizeStart = (e: PointerEvent<SVGRectElement>, image: CanvasImage, corner: 'nw' | 'ne' | 'sw' | 'se') => {
    // Disable resize in fullscreen mode (read-only)
    if (isFullscreen) return;

    e.preventDefault();
    e.stopPropagation();

    // Maintain selection when starting resize
    setSelectedImageId(image.id);

    const svgElement = e.currentTarget.ownerSVGElement;
    if (!svgElement) return;

    // Store initial state
    const committedSize = committedSizes.get(image.id);
    const committedPosition = committedPositions.get(image.id);
    const currentSize = committedSize || image.size || 1.0;
    const currentX = committedPosition?.x ?? image.x ?? 0;
    const currentY = committedPosition?.y ?? image.y ?? 0;
    const imageWidth = (image.width || 0) * currentSize;
    const imageHeight = (image.height || 0) * currentSize;

    // Calculate anchor point (opposite corner that stays fixed)
    let anchorX = currentX;
    let anchorY = currentY;

    switch (corner) {
      case 'nw': // Dragging top-left → anchor is bottom-right
        anchorX = currentX + imageWidth;
        anchorY = currentY + imageHeight;
        break;
      case 'ne': // Dragging top-right → anchor is bottom-left
        anchorX = currentX;
        anchorY = currentY + imageHeight;
        break;
      case 'sw': // Dragging bottom-left → anchor is top-right
        anchorX = currentX + imageWidth;
        anchorY = currentY;
        break;
      case 'se': // Dragging bottom-right → anchor is top-left
        anchorX = currentX;
        anchorY = currentY;
        break;
    }

    setResizingImageId(image.id);
    setResizeStartSize(currentSize);
    setResizeCorner(corner);
    setResizeAnchor({ x: anchorX, y: anchorY });
    setResizeStartImagePos({ x: currentX, y: currentY });
    setResizeDelta(0);
    setResizePositionDelta({ x: 0, y: 0 });
  };

  const handleResizeMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!resizingImageId || !resizeCorner) return;

    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const image = images.find(img => img.id === resizingImageId);
    if (!image) return;

    const originalWidth = image.width || 0;
    const originalHeight = image.height || 0;

    // Calculate new width and height based on distance from anchor
    const newWidth = Math.abs(svgP.x - resizeAnchor.x);
    const newHeight = Math.abs(svgP.y - resizeAnchor.y);

    // Calculate size ratio to maintain aspect ratio
    const widthRatio = newWidth / (originalWidth * resizeStartSize);
    const heightRatio = newHeight / (originalHeight * resizeStartSize);

    // Use average of both ratios for smooth scaling
    const sizeRatio = (widthRatio + heightRatio) / 2;
    const newSize = resizeStartSize * sizeRatio;
    const delta = newSize - resizeStartSize;

    // Calculate new position based on which corner is being dragged
    // The anchor stays fixed, and the top-left corner position changes
    const finalWidth = originalWidth * newSize;
    const finalHeight = originalHeight * newSize;

    let newX = resizeStartImagePos.x;
    let newY = resizeStartImagePos.y;

    switch (resizeCorner) {
      case 'nw': // Dragging top-left → anchor (bottom-right) is fixed
        newX = resizeAnchor.x - finalWidth;
        newY = resizeAnchor.y - finalHeight;
        break;
      case 'ne': // Dragging top-right → anchor (bottom-left) is fixed
        newX = resizeAnchor.x;
        newY = resizeAnchor.y - finalHeight;
        break;
      case 'sw': // Dragging bottom-left → anchor (top-right) is fixed
        newX = resizeAnchor.x - finalWidth;
        newY = resizeAnchor.y;
        break;
      case 'se': // Dragging bottom-right → anchor (top-left) is fixed
        newX = resizeAnchor.x;
        newY = resizeAnchor.y;
        break;
    }

    setResizeDelta(delta);
    setResizePositionDelta({
      x: newX - resizeStartImagePos.x,
      y: newY - resizeStartImagePos.y,
    });
  };

  const handleResizeEnd = () => {
    if (!resizingImageId || !onUpdateImage) {
      setResizingImageId(null);
      setResizeStartSize(1.0);
      setResizeCorner(null);
      setResizeAnchor({ x: 0, y: 0 });
      setResizeStartImagePos({ x: 0, y: 0 });
      setResizeDelta(0);
      setResizePositionDelta({ x: 0, y: 0 });
      return;
    }

    const currentImageId = resizingImageId;
    const newSize = Math.max(0.1, Math.min(5.0, resizeStartSize + resizeDelta));
    const newX = Math.round(resizeStartImagePos.x + resizePositionDelta.x);
    const newY = Math.round(resizeStartImagePos.y + resizePositionDelta.y);

    // Store committed size and position to prevent flicker
    setCommittedSizes((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentImageId, newSize);
      return newMap;
    });

    setCommittedPositions((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentImageId, { x: newX, y: newY });
      return newMap;
    });

    // Update image size and position
    onUpdateImage(currentImageId, {
      size: newSize,
      x: newX,
      y: newY,
    });

    // Reset resize state immediately (committed values will keep the display)
    setResizingImageId(null);
    setResizeStartSize(1.0);
    setResizeCorner(null);
    setResizeAnchor({ x: 0, y: 0 });
    setResizeStartImagePos({ x: 0, y: 0 });
    setResizeDelta(0);
    setResizePositionDelta({ x: 0, y: 0 });

    // Keep the image hovered after resize to show handles
    setHoveredImageId(currentImageId);
  };

  // Crop handlers
  const handleCropStart = (e: PointerEvent<SVGRectElement>, image: CanvasImage, edge: 'top' | 'bottom' | 'left' | 'right') => {
    // Disable crop in fullscreen mode (read-only)
    if (isFullscreen) return;

    e.preventDefault();
    e.stopPropagation();

    // Maintain selection when starting crop
    setSelectedImageId(image.id);

    const svgElement = e.currentTarget.ownerSVGElement;
    if (!svgElement) return;

    const pt = svgElement.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svgElement.getScreenCTM()?.inverse());

    setCroppingImageId(image.id);
    setCropEdge(edge);
    setCropStartPos(edge === 'top' || edge === 'bottom' ? svgP.y : svgP.x);
    setCropDelta(0);
  };

  const handleCropMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!croppingImageId || !cropEdge) return;

    const image = images.find((img) => img.id === croppingImageId);
    if (!image) return;

    const svg = e.currentTarget;
    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    const currentPos = cropEdge === 'top' || cropEdge === 'bottom' ? svgP.y : svgP.x;
    const imageSize = image.size || 1.0;

    // Calculate delta in pixels (will be converted to crop units)
    let delta = 0;
    if (cropEdge === 'top') {
      delta = currentPos - cropStartPos;
    } else if (cropEdge === 'bottom') {
      delta = cropStartPos - currentPos;
    } else if (cropEdge === 'left') {
      delta = currentPos - cropStartPos;
    } else if (cropEdge === 'right') {
      delta = cropStartPos - currentPos;
    }

    // Convert to crop units (delta / imageSize)
    setCropDelta(delta / imageSize);
  };

  const handleCropEnd = () => {
    if (!croppingImageId || !cropEdge || !onUpdateImage) {
      setCroppingImageId(null);
      setCropEdge(null);
      setCropStartPos(0);
      setCropDelta(0);
      return;
    }

    const image = images.find((img) => img.id === croppingImageId);
    if (!image) {
      setCroppingImageId(null);
      setCropEdge(null);
      setCropStartPos(0);
      setCropDelta(0);
      return;
    }

    const currentImageId = croppingImageId;
    const committedCrop = committedCrops.get(currentImageId);
    const currentLeft = committedCrop?.left || image.left || 0;
    const currentRight = committedCrop?.right || image.right || 0;
    const currentTop = committedCrop?.top || image.top || 0;
    const currentBottom = committedCrop?.bottom || image.bottom || 0;

    let newCrop = { left: currentLeft, right: currentRight, top: currentTop, bottom: currentBottom };

    if (cropEdge === 'top') {
      newCrop.top = Math.round(Math.max(0, currentTop + cropDelta));
    } else if (cropEdge === 'bottom') {
      newCrop.bottom = Math.round(Math.max(0, currentBottom + cropDelta));
    } else if (cropEdge === 'left') {
      newCrop.left = Math.round(Math.max(0, currentLeft + cropDelta));
    } else if (cropEdge === 'right') {
      newCrop.right = Math.round(Math.max(0, currentRight + cropDelta));
    }

    // Round all values to integers
    newCrop = {
      left: Math.round(newCrop.left),
      right: Math.round(newCrop.right),
      top: Math.round(newCrop.top),
      bottom: Math.round(newCrop.bottom),
    };

    // Store committed crop to prevent flicker
    setCommittedCrops((prev) => {
      const newMap = new Map(prev);
      newMap.set(currentImageId, newCrop);
      return newMap;
    });

    // Update image crop
    console.log('Updating crop:', { imageId: currentImageId, newCrop });
    onUpdateImage(currentImageId, newCrop);

    // Reset crop state
    setCroppingImageId(null);
    setCropEdge(null);
    setCropStartPos(0);
    setCropDelta(0);

    // Keep the image hovered after crop to show handles
    setHoveredImageId(currentImageId);
  };

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

  // Prevent body scroll in pseudo-fullscreen and add class for PullToRefresh detection
  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      document.body.classList.add('fullscreen-active');
      return () => {
        document.body.style.overflow = '';
        document.body.classList.remove('fullscreen-active');
      };
    }
  }, [isFullscreen]);

  const handleCanvasClick = (e: MouseEvent<HTMLDivElement>) => {
    // Clear selection when clicking on canvas background (not on an image)
    if (e.target === e.currentTarget) {
      setSelectedImageId(null);
    }

    if (isFullscreen) {
      exitFullscreen();
    }
  };

  // Drag & Drop handlers for adding images from carousel
  const handleCanvasDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    setIsDragOverCanvas(true);
  };

  const handleCanvasDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    // Only clear if leaving the canvas container itself
    if (e.currentTarget === e.target) {
      setIsDragOverCanvas(false);
    }
  };

  const handleCanvasDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOverCanvas(false);

    console.log('Canvas drop event triggered');

    if (!onAddImage) {
      console.warn('onAddImage callback is not provided');
      return;
    }

    const imageUrl = e.dataTransfer.getData('text/plain');
    console.log('Dropped image URL:', imageUrl);

    if (!imageUrl) {
      console.warn('No image URL in dataTransfer');
      return;
    }

    // Get SVG element to convert client coordinates to SVG coordinates
    const svg = canvasContainerRef.current?.querySelector('svg');
    if (!svg) {
      console.error('SVG element not found');
      return;
    }

    const pt = svg.createSVGPoint();
    pt.x = e.clientX;
    pt.y = e.clientY;
    const svgP = pt.matrixTransform(svg.getScreenCTM()?.inverse());

    console.log('Drop position (SVG coords):', { x: svgP.x, y: svgP.y });

    // Call onAddImage with image URL and drop position
    onAddImage(imageUrl, Math.round(svgP.x), Math.round(svgP.y));
  };

  return (
    <div className={isFullscreen && !document.fullscreenElement
      ? "fixed inset-0 z-50 bg-black"
      : "bg-white shadow rounded-lg overflow-hidden"}>
      {/* Header - hide in pseudo-fullscreen */}
      {!(isFullscreen && !document.fullscreenElement) && (
        <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-semibold">Canvas Workspace</h3>
          {/* Fullscreen/Exit button */}
          <button
            onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            className="inline-flex items-center px-3 py-2 bg-gray-700 text-white text-sm rounded hover:bg-gray-800 transition-colors"
            title={isFullscreen ? "Exit Fullscreen (Press ESC)" : "Fullscreen (Press ESC to exit)"}
          >
          <svg
            className="h-4 w-4 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {isFullscreen ? (
              // Exit fullscreen icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25"
              />
            ) : (
              // Enter fullscreen icon
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"
              />
            )}
          </svg>
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
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
      )}

      {/* SVG Canvas */}
      <div
        ref={canvasContainerRef}
        className={isFullscreen && !document.fullscreenElement
          ? 'bg-black w-screen h-screen flex items-start justify-center overflow-y-auto'
          : isFullscreen
          ? 'bg-black overflow-auto w-full h-full flex items-center justify-center'
          : 'w-full overflow-auto'}
        style={!isFullscreen ? {
          background: isDragOverCanvas
            ? 'repeating-conic-gradient(#93c5fd 0% 25%, #dbeafe 0% 50%) 50% / 20px 20px'
            : 'repeating-conic-gradient(#e5e7eb 0% 25%, transparent 0% 50%) 50% / 20px 20px'
        } : {}}
        onClick={handleCanvasClick}
        onDragOver={handleCanvasDragOver}
        onDragLeave={handleCanvasDragLeave}
        onDrop={handleCanvasDrop}
      >
        <svg
          width={isFullscreen ? '100vw' : '100%'}
          height={isFullscreen ? 'auto' : canvasHeight * scale}
          viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
          preserveAspectRatio={isFullscreen && !document.fullscreenElement ? "xMinYMin meet" : "xMidYMid meet"}
          style={{
            display: 'block',
            cursor: isFullscreen
              ? 'default'
              : croppingImageId && cropEdge
              ? (cropEdge === 'top' || cropEdge === 'bottom' ? 'ns-resize' : 'ew-resize')
              : resizingImageId
              ? 'nwse-resize'
              : draggingImageId
              ? 'grabbing'
              : 'default',
            overflow: 'visible',
            touchAction: 'none' // Prevent all default touch behaviors (scrolling, zooming, etc.)
          }}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerLeave={handlePointerUp}
        >
          {/* Clip path for canvas boundaries */}
          <defs>
            <clipPath id="canvas-bounds">
              <rect
                x={0}
                y={0}
                width={canvasWidth}
                height={canvasHeight}
              />
            </clipPath>
          </defs>

          {/* Background rect */}
          <rect
            width={canvasWidth}
            height={canvasHeight}
            fill="white"
          />

          {/* Group for all images with clipping */}
          <g clipPath="url(#canvas-bounds)">

          {/* Render images */}
          {images.map((image) => {
            const baseSize = image.size || 1.0;
            const imageX = image.x || 0;
            const imageY = image.y || 0;
            const imageWidth = image.width || 0;
            const imageHeight = image.height || 0;
            const baseLeft = image.left || 0;
            const baseRight = image.right || 0;
            const baseTop = image.top || 0;
            const baseBottom = image.bottom || 0;

            // フルスクリーン時は scale を適用しない（100% 表示）
            const renderScale = isFullscreen ? 1 : 1;

            // Apply drag offset if this image is being dragged or has committed offset
            const isDragging = draggingImageId === image.id;
            const committedOffset = committedOffsets.get(image.id);
            const offsetX = isDragging ? dragOffset.x : (committedOffset?.x || 0);
            const offsetY = isDragging ? dragOffset.y : (committedOffset?.y || 0);

            // Apply resize position delta if this image is being resized or has committed position
            const isResizing = resizingImageId === image.id;
            const committedPosition = committedPositions.get(image.id);
            const resizeOffsetX = isResizing ? resizePositionDelta.x : 0;
            const resizeOffsetY = isResizing ? resizePositionDelta.y : 0;
            const baseX = committedPosition?.x ?? imageX;
            const baseY = committedPosition?.y ?? imageY;

            const displayX = baseX + offsetX + resizeOffsetX;
            const displayY = baseY + offsetY + resizeOffsetY;

            // Apply resize delta if this image is being resized or has committed size
            const committedSize = committedSizes.get(image.id);
            const imageSize = isResizing
              ? Math.max(0.1, Math.min(5.0, resizeStartSize + resizeDelta))
              : (committedSize || baseSize);

            // Apply crop delta if this image is being cropped or has committed crop
            const isCropping = croppingImageId === image.id;
            const committedCrop = committedCrops.get(image.id);
            let left = committedCrop?.left || baseLeft;
            let right = committedCrop?.right || baseRight;
            let top = committedCrop?.top || baseTop;
            let bottom = committedCrop?.bottom || baseBottom;

            if (isCropping && cropEdge) {
              if (cropEdge === 'top') {
                top = Math.max(0, (committedCrop?.top || baseTop) + cropDelta);
              } else if (cropEdge === 'bottom') {
                bottom = Math.max(0, (committedCrop?.bottom || baseBottom) + cropDelta);
              } else if (cropEdge === 'left') {
                left = Math.max(0, (committedCrop?.left || baseLeft) + cropDelta);
              } else if (cropEdge === 'right') {
                right = Math.max(0, (committedCrop?.right || baseRight) + cropDelta);
              }
            }

            // Check if hovered or selected (for touch devices)
            const isHovered = hoveredImageId === image.id;
            const isSelected = selectedImageId === image.id;

            // Calculate handle size based on display size (not canvas size)
            // Use larger dimension for consistent handle size across different canvas sizes
            // Detect touch device and use larger handles for better touch target
            const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
            const displaySize = Math.max(canvasWidth, canvasHeight);
            const baseHandleSize = displaySize / 100; // ~19px for 1920px
            const handleSize = isFullscreen ? 16 : (isTouchDevice ? baseHandleSize * 2 : baseHandleSize);

            return (
              <g key={image.id}>
                {/* ClipPath for cropping */}
                <defs>
                  <clipPath id={`clip-${image.id}`}>
                    <rect
                      x={(displayX + left * imageSize) * renderScale}
                      y={(displayY + top * imageSize) * renderScale}
                      width={(imageWidth - left - right) * imageSize * renderScale}
                      height={(imageHeight - top - bottom) * imageSize * renderScale}
                    />
                  </clipPath>
                </defs>

                {/* Image */}
                <image
                  href={image.uri}
                  x={displayX * renderScale}
                  y={displayY * renderScale}
                  width={imageWidth * imageSize * renderScale}
                  height={imageHeight * imageSize * renderScale}
                  clipPath={`url(#clip-${image.id})`}
                  style={{
                    cursor: isFullscreen
                      ? 'default'
                      : isCropping && cropEdge
                      ? (cropEdge === 'top' || cropEdge === 'bottom' ? 'ns-resize' : 'ew-resize')
                      : isResizing
                      ? 'nwse-resize'
                      : isDragging
                      ? 'grabbing'
                      : 'move',
                    opacity: isDragging || isResizing || isCropping ? 0.7 : 1
                  }}
                  preserveAspectRatio="none"
                  onPointerDown={(e) => handleImagePointerDown(e, image)}
                  onPointerEnter={() => setHoveredImageId(image.id)}
                  onPointerLeave={() => setHoveredImageId(null)}
                />

                {/* Resize handles - show on hover or selected (hide when any operation is active or in fullscreen) */}
                {!isFullscreen && (isHovered || isSelected) && !isDragging && !isResizing && !isCropping && (
                  <>
                    {/* Top-left corner */}
                    {/* Invisible larger touch target - extends both outside and inside the image */}
                    {isTouchDevice && (
                      <rect
                        x={(displayX * renderScale) - handleSize * 4}
                        y={(displayY * renderScale) - handleSize * 4}
                        width={handleSize * 8}
                        height={handleSize * 8}
                        fill="transparent"
                        style={{ cursor: 'nwse-resize', pointerEvents: 'auto' }}
                        onPointerDown={(e) => handleResizeStart(e, image, 'nw')}
                      />
                    )}
                    {/* Visible handle */}
                    <rect
                      x={(displayX * renderScale) - handleSize / 2}
                      y={(displayY * renderScale) - handleSize / 2}
                      width={handleSize}
                      height={handleSize}
                      fill="white"
                      stroke="#3B82F6"
                      strokeWidth={handleSize / 8}
                      style={{ cursor: 'nwse-resize', pointerEvents: isTouchDevice ? 'none' : 'auto' }}
                      onPointerDown={(e) => handleResizeStart(e, image, 'nw')}
                      onPointerEnter={() => setHoveredImageId(image.id)}
                    />
                    {/* Top-right corner */}
                    {/* Invisible larger touch target - extends both outside and inside the image */}
                    {isTouchDevice && (
                      <rect
                        x={(displayX + imageWidth * imageSize) * renderScale - handleSize * 4}
                        y={(displayY * renderScale) - handleSize * 4}
                        width={handleSize * 8}
                        height={handleSize * 8}
                        fill="transparent"
                        style={{ cursor: 'nesw-resize', pointerEvents: 'auto' }}
                        onPointerDown={(e) => handleResizeStart(e, image, 'ne')}
                      />
                    )}
                    {/* Visible handle */}
                    <rect
                      x={(displayX + imageWidth * imageSize) * renderScale - handleSize / 2}
                      y={(displayY * renderScale) - handleSize / 2}
                      width={handleSize}
                      height={handleSize}
                      fill="white"
                      stroke="#3B82F6"
                      strokeWidth={handleSize / 8}
                      style={{ cursor: 'nesw-resize', pointerEvents: isTouchDevice ? 'none' : 'auto' }}
                      onPointerDown={(e) => handleResizeStart(e, image, 'ne')}
                      onPointerEnter={() => setHoveredImageId(image.id)}
                    />
                    {/* Bottom-left corner */}
                    {/* Invisible larger touch target - extends both outside and inside the image */}
                    {isTouchDevice && (
                      <rect
                        x={(displayX * renderScale) - handleSize * 4}
                        y={(displayY + imageHeight * imageSize) * renderScale - handleSize * 4}
                        width={handleSize * 8}
                        height={handleSize * 8}
                        fill="transparent"
                        style={{ cursor: 'nesw-resize', pointerEvents: 'auto' }}
                        onPointerDown={(e) => handleResizeStart(e, image, 'sw')}
                      />
                    )}
                    {/* Visible handle */}
                    <rect
                      x={(displayX * renderScale) - handleSize / 2}
                      y={(displayY + imageHeight * imageSize) * renderScale - handleSize / 2}
                      width={handleSize}
                      height={handleSize}
                      fill="white"
                      stroke="#3B82F6"
                      strokeWidth={handleSize / 8}
                      style={{ cursor: 'nesw-resize', pointerEvents: isTouchDevice ? 'none' : 'auto' }}
                      onPointerDown={(e) => handleResizeStart(e, image, 'sw')}
                      onPointerEnter={() => setHoveredImageId(image.id)}
                    />
                    {/* Bottom-right corner */}
                    {/* Invisible larger touch target - extends both outside and inside the image */}
                    {isTouchDevice && (
                      <rect
                        x={(displayX + imageWidth * imageSize) * renderScale - handleSize * 4}
                        y={(displayY + imageHeight * imageSize) * renderScale - handleSize * 4}
                        width={handleSize * 8}
                        height={handleSize * 8}
                        fill="transparent"
                        style={{ cursor: 'nwse-resize', pointerEvents: 'auto' }}
                        onPointerDown={(e) => handleResizeStart(e, image, 'se')}
                      />
                    )}
                    {/* Visible handle */}
                    <rect
                      x={(displayX + imageWidth * imageSize) * renderScale - handleSize / 2}
                      y={(displayY + imageHeight * imageSize) * renderScale - handleSize / 2}
                      width={handleSize}
                      height={handleSize}
                      fill="white"
                      stroke="#3B82F6"
                      strokeWidth={handleSize / 8}
                      style={{ cursor: 'nwse-resize', pointerEvents: isTouchDevice ? 'none' : 'auto' }}
                      onPointerDown={(e) => handleResizeStart(e, image, 'se')}
                      onPointerEnter={() => setHoveredImageId(image.id)}
                    />

                    {/* Edge handles for cropping */}
                    {/* Top edge */}
                    <rect
                      x={(displayX + imageWidth * imageSize / 2) * renderScale - handleSize}
                      y={(displayY + top * imageSize) * renderScale - handleSize / 2}
                      width={handleSize * 2}
                      height={handleSize}
                      fill="white"
                      stroke="#10B981"
                      strokeWidth={handleSize / 8}
                      style={{ cursor: 'ns-resize', pointerEvents: 'auto' }}
                      onPointerDown={(e) => handleCropStart(e, image, 'top')}
                      onPointerEnter={() => setHoveredImageId(image.id)}
                    />
                    {/* Bottom edge */}
                    <rect
                      x={(displayX + imageWidth * imageSize / 2) * renderScale - handleSize}
                      y={(displayY + (imageHeight - bottom) * imageSize) * renderScale - handleSize / 2}
                      width={handleSize * 2}
                      height={handleSize}
                      fill="white"
                      stroke="#10B981"
                      strokeWidth={handleSize / 8}
                      style={{ cursor: 'ns-resize', pointerEvents: 'auto' }}
                      onPointerDown={(e) => handleCropStart(e, image, 'bottom')}
                      onPointerEnter={() => setHoveredImageId(image.id)}
                    />
                    {/* Left edge */}
                    <rect
                      x={(displayX + left * imageSize) * renderScale - handleSize / 2}
                      y={(displayY + imageHeight * imageSize / 2) * renderScale - handleSize}
                      width={handleSize}
                      height={handleSize * 2}
                      fill="white"
                      stroke="#10B981"
                      strokeWidth={handleSize / 8}
                      style={{ cursor: 'ew-resize', pointerEvents: 'auto' }}
                      onPointerDown={(e) => handleCropStart(e, image, 'left')}
                      onPointerEnter={() => setHoveredImageId(image.id)}
                    />
                    {/* Right edge */}
                    <rect
                      x={(displayX + (imageWidth - right) * imageSize) * renderScale - handleSize / 2}
                      y={(displayY + imageHeight * imageSize / 2) * renderScale - handleSize}
                      width={handleSize}
                      height={handleSize * 2}
                      fill="white"
                      stroke="#10B981"
                      strokeWidth={handleSize / 8}
                      style={{ cursor: 'ew-resize', pointerEvents: 'auto' }}
                      onPointerDown={(e) => handleCropStart(e, image, 'right')}
                      onPointerEnter={() => setHoveredImageId(image.id)}
                    />
                  </>
                )}
              </g>
            );
          })}
          </g>
        </svg>
      </div>

      {/* Canvas Info */}
      <div className="bg-gray-50 px-4 py-2 border-t border-gray-200 text-sm text-gray-600 text-center">
        Canvas: {canvasWidth} × {canvasHeight} px | Images: {images.length}
      </div>
    </div>
  );
}
