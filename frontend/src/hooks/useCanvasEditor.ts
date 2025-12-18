import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CanvasService, CanvasImageService } from '../api';
import type {
  CanvasResponse,
  UpdateCanvasRequest,
  CreateCanvasImageRequest,
  UpdateCanvasImageRequest,
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

  // PUT /api/canvases/{canvasId}/images/{id} - 画像更新
  const updateImageMutation = useMutation({
    mutationFn: ({ imageId, data }: { imageId: number; data: UpdateCanvasImageRequest }) =>
      CanvasImageService.updateCanvasImage(canvasId, imageId, data),
    onMutate: async ({ imageId, data }) => {
      // Cancel ongoing queries
      await queryClient.cancelQueries({ queryKey: ['canvas', canvasId, 'images'] });

      // Snapshot previous value
      const previousImages = queryClient.getQueryData(['canvas', canvasId, 'images']);

      // Optimistically update to the new value
      queryClient.setQueryData(['canvas', canvasId, 'images'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.map((img: any) => {
            if (img.id === imageId) {
              // Merge with existing values, ensuring numbers are preserved
              return {
                ...img,
                ...data,
                // Ensure numeric fields are numbers
                x: data.x !== undefined ? Number(data.x) : img.x,
                y: data.y !== undefined ? Number(data.y) : img.y,
                size: data.size !== undefined ? Number(data.size) : img.size,
                left: data.left !== undefined ? Number(data.left) : img.left,
                right: data.right !== undefined ? Number(data.right) : img.right,
                top: data.top !== undefined ? Number(data.top) : img.top,
                bottom: data.bottom !== undefined ? Number(data.bottom) : img.bottom,
              };
            }
            return img;
          }),
        };
      });

      return { previousImages };
    },
    onError: (error, _variables, context) => {
      // Rollback on error
      if (context?.previousImages) {
        queryClient.setQueryData(['canvas', canvasId, 'images'], context.previousImages);
      }
      console.error('Failed to update image:', error);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: ['canvas', canvasId, 'images'] });
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

    // 画像更新
    updateImage: updateImageMutation.mutate,
    isUpdatingImage: updateImageMutation.isPending,
    updateImageError: updateImageMutation.error,

    // 画像削除
    deleteImage: deleteImageMutation.mutate,
    isDeletingImage: deleteImageMutation.isPending,
    deleteImageError: deleteImageMutation.error,
  };
}
