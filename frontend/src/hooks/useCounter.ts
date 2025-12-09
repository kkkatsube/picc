import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { CounterService } from '../api';
import type { UserCounterResponse, UpdateCounterRequest } from '../api';

/**
 * Counter API management hook
 * Provides counter value retrieval and update functionality
 */
export function useCounter() {
    const queryClient = useQueryClient();

    // GET /api/counter - Retrieve counter value
    const {
        data: counter,
        isLoading,
        isError,
        error,
    } = useQuery<UserCounterResponse>({
        queryKey: ['counter'],
        queryFn: () => CounterService.getUserCounterValue(),
        staleTime: 1000 * 60 * 5, // 5 minutes
        retry: 1,
    });

    // PUT /api/counter - Update counter value
    const updateMutation = useMutation({
        mutationFn: (value: number) =>
        CounterService.updateUserCounterValue({ value } as UpdateCounterRequest),
        onSuccess: (data) => {
        // Update cache with new value
        queryClient.setQueryData<UserCounterResponse>(['counter'], data);
        },
        onError: (error) => {
        console.error('Failed to update counter:', error);
        },
    });

    // Increment counter
    const increment = () => {
        const currentValue = counter?.value ?? 0;
        updateMutation.mutate(currentValue + 1);
    };

    // Decrement counter
    const decrement = () => {
        const currentValue = counter?.value ?? 0;
        updateMutation.mutate(currentValue - 1);
    };

    // Set counter to specific value
    const setValue = (value: number) => {
        updateMutation.mutate(value);
    };

    return {
        // Counter state
        value: counter?.value ?? 0,
        isLoading,
        isError,
        error,

        // Update operations
        increment,
        decrement,
        setValue,

        // Update state
        isUpdating: updateMutation.isPending,
        updateError: updateMutation.error,
    };
}