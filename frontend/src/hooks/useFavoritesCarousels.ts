import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FavoritesService } from '../api/services/FavoritesService';
import type { FavoritesCarousel } from '../api';

/**
 * Favorites Carousels API management hook
 * Provides favorites carousels and images CRUD functionality
 */
export function useFavoritesCarousels() {
  const queryClient = useQueryClient();

  // GET /api/favorites/carousels - List all carousels
  const {
    data: carousels,
    isLoading,
    isError,
    error,
  } = useQuery<FavoritesCarousel[]>({
    queryKey: ['favorites', 'carousels'],
    queryFn: () => FavoritesService.getFavoritesCarousels(),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
  });

  // POST /api/favorites/carousels - Create carousel
  const createCarouselMutation = useMutation({
    mutationFn: (name: string) =>
      FavoritesService.createFavoritesCarousel({ name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'carousels'] });
    },
    onError: (error) => {
      console.error('Failed to create carousel:', error);
    },
  });

  // PUT /api/favorites/carousels/{id} - Update carousel
  const updateCarouselMutation = useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) =>
      FavoritesService.updateFavoritesCarousel(id, { name }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'carousels'] });
    },
    onError: (error) => {
      console.error('Failed to update carousel:', error);
    },
  });

  // DELETE /api/favorites/carousels/{id} - Delete carousel
  const deleteCarouselMutation = useMutation({
    mutationFn: (id: number) => FavoritesService.deleteFavoritesCarousel(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'carousels'] });
    },
    onError: (error) => {
      console.error('Failed to delete carousel:', error);
    },
  });

  // PUT /api/favorites/carousels/reorder - Reorder carousels
  const reorderCarouselsMutation = useMutation({
    mutationFn: (carouselIds: number[]) =>
      FavoritesService.reorderFavoritesCarousels({ carousel_ids: carouselIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'carousels'] });
    },
    onError: (error) => {
      console.error('Failed to reorder carousels:', error);
    },
  });

  // POST /api/favorites/carousels/{carouselId}/images - Add image to carousel
  const addImageMutation = useMutation({
    mutationFn: ({ carouselId, imageUrl }: { carouselId: number; imageUrl: string }) =>
      FavoritesService.addImageToCarousel(carouselId, { image_url: imageUrl }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'carousels'] });
    },
    onError: (error) => {
      console.error('Failed to add image:', error);
    },
  });

  // DELETE /api/favorites/images/{id} - Delete image
  const deleteImageMutation = useMutation({
    mutationFn: (id: number) => FavoritesService.deleteFavoritesImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'carousels'] });
    },
    onError: (error) => {
      console.error('Failed to delete image:', error);
    },
  });

  // PUT /api/favorites/carousels/{carouselId}/images/reorder - Reorder images
  const reorderImagesMutation = useMutation({
    mutationFn: ({ carouselId, imageIds }: { carouselId: number; imageIds: number[] }) =>
      FavoritesService.reorderCarouselImages(carouselId, { image_ids: imageIds }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['favorites', 'carousels'] });
    },
    onError: (error) => {
      console.error('Failed to reorder images:', error);
    },
  });

  return {
    // Data
    carousels: carousels || [],
    isLoading,
    isError,
    error,

    // Carousel operations
    createCarousel: createCarouselMutation.mutate,
    isCreatingCarousel: createCarouselMutation.isPending,
    updateCarousel: updateCarouselMutation.mutate,
    isUpdatingCarousel: updateCarouselMutation.isPending,
    deleteCarousel: deleteCarouselMutation.mutate,
    isDeletingCarousel: deleteCarouselMutation.isPending,
    reorderCarousels: reorderCarouselsMutation.mutate,
    isReorderingCarousels: reorderCarouselsMutation.isPending,

    // Image operations
    addImage: addImageMutation.mutate,
    isAddingImage: addImageMutation.isPending,
    deleteImage: deleteImageMutation.mutate,
    isDeletingImage: deleteImageMutation.isPending,
    reorderImages: reorderImagesMutation.mutate,
    isReorderingImages: reorderImagesMutation.isPending,
  };
}
