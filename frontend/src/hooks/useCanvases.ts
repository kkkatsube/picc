import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CanvasService } from '../api';
import type { CanvasListResponse, CreateCanvasRequest, UpdateCanvasRequest } from '../api';

/**
 * Canvas API management hook
 * Provides canvas CRUD functionality
 */
export function useCanvases() {
    const queryClient = useQueryClient();

    // GET /api/canvases - List all canvases
    const {
        data: canvases,
        isLoading,
        isError,
        error,
    } = useQuery<CanvasListResponse>({
        queryKey: ['canvases'],
        queryFn: () => CanvasService.listCanvases(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });

    // POST /api/canvases - Create canvas
    const createMutation = useMutation({
        mutationFn: (data: CreateCanvasRequest) =>
            CanvasService.createCanvas(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['canvases'] });
        },
        onError: (error) => {
            console.error('Failed to create canvas:', error);
        },
    });

    // PUT /api/canvases/{id} - Update canvas
    const updateMutation = useMutation({
        mutationFn: ({ id, data }: { id: number; data: UpdateCanvasRequest }) =>
            CanvasService.updateCanvas(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['canvases'] });
        },
        onError: (error) => {
            console.error('Failed to update canvas:', error);
        },
    });

    // DELETE /api/canvases/{id} - Delete canvas
    const deleteMutation = useMutation({
        mutationFn: (id: number) => CanvasService.deleteCanvas(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['canvases'] });
        },
        onError: (error) => {
            console.error('Failed to delete canvas:', error);
        },
    });

    return {
        // Canvas list
        canvases: canvases?.data ?? [],
        isLoading,
        isError,
        error,

        // Create operation
        createCanvas: createMutation.mutate,
        isCreating: createMutation.isPending,
        createError: createMutation.error,

        // Update operation
        updateCanvas: updateMutation.mutate,
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error,

        // Delete operation
        deleteCanvas: deleteMutation.mutate,
        isDeleting: deleteMutation.isPending,
        deleteError: deleteMutation.error,
    };
}
