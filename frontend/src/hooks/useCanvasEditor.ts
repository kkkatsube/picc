import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CanvasService, CanvasImageService } from '../api';
import type {
  CanvasResponse,
  UpdateCanvasRequest,
  CreateCanvasImageRequest,
} from '../api';

/**
 * Canvas Editor hook
 * Canvas詳細取得、更新、画像管理機能を提供
 */
export function useCanvasEditor(canvasId: number) {
  const queryClient = useQueryClient();

  // GET /api/canvases/{id} - Canvas詳細取得（画像含む）
  const {
    data: canvas,
    isLoading,
    isError,
    error,
  } = useQuery<CanvasResponse>({
    queryKey: ['canvas', canvasId],
    queryFn: () => CanvasService.getCanvas(canvasId),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // PUT /api/canvases/{id} - Canvas情報更新
  const updateCanvasMutation = useMutation({
    mutationFn: (data: UpdateCanvasRequest) =>
      CanvasService.updateCanvas(canvasId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvas', canvasId] });
      queryClient.invalidateQueries({ queryKey: ['canvases'] });
    },
    onError: (error) => {
      console.error('Failed to update canvas:', error);
    },
  });

  // GET /api/canvases/{canvasId}/images - Canvas画像一覧取得
  const {
    data: imagesResponse,
    isLoading: isLoadingImages,
  } = useQuery({
    queryKey: ['canvas', canvasId, 'images'],
    queryFn: () => CanvasImageService.listCanvasImages(canvasId),
    enabled: !!canvasId,
    staleTime: 1000 * 60 * 5,
  });

  // POST /api/canvases/{canvasId}/images - 画像追加
  const addImageMutation = useMutation({
    mutationFn: (data: CreateCanvasImageRequest) =>
      CanvasImageService.createCanvasImage(canvasId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvas', canvasId, 'images'] });
    },
    onError: (error) => {
      console.error('Failed to add image:', error);
    },
  });

  // DELETE /api/canvases/{canvasId}/images/{id} - 画像削除
  const deleteImageMutation = useMutation({
    mutationFn: (imageId: number) =>
      CanvasImageService.deleteCanvasImage(canvasId, imageId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvas', canvasId, 'images'] });
    },
    onError: (error) => {
      console.error('Failed to delete image:', error);
    },
  });

  // DELETE /api/canvases/{id} - Canvas削除
  const deleteCanvasMutation = useMutation({
    mutationFn: () => CanvasService.deleteCanvas(canvasId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['canvases'] });
    },
    onError: (error) => {
      console.error('Failed to delete canvas:', error);
    },
  });

  return {
    // Canvas情報
    canvas: canvas?.data,
    isLoading,
    isError,
    error,

    // Canvas更新
    updateCanvas: updateCanvasMutation.mutate,
    isUpdating: updateCanvasMutation.isPending,
    updateError: updateCanvasMutation.error,

    // Canvas削除
    deleteCanvas: deleteCanvasMutation.mutate,
    isDeletingCanvas: deleteCanvasMutation.isPending,
    deleteCanvasError: deleteCanvasMutation.error,

    // Canvas画像
    images: imagesResponse?.data ?? [],
    isLoadingImages,

    // 画像追加
    addImage: addImageMutation.mutate,
    isAddingImage: addImageMutation.isPending,
    addImageError: addImageMutation.error,

    // 画像削除
    deleteImage: deleteImageMutation.mutate,
    isDeletingImage: deleteImageMutation.isPending,
    deleteImageError: deleteImageMutation.error,
  };
}
