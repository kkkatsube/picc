import { PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useCounter } from '../../hooks/useCounter';

export default function Counter() {
  const {
    value,
    isLoading,
    isError,
    error,
    increment,
    decrement,
    isUpdating,
    updateError,
  } = useCounter();

  if (isLoading) {
    return (
      <div className="flex items-center space-x-2">
        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
        <span className="text-sm text-gray-500">Loading counter...</span>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-sm text-red-600">
        Failed to load counter: {error?.message || 'Unknown error'}
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      {/* Decrement Button */}
      <button
        onClick={decrement}
        disabled={isUpdating}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        aria-label="Decrement counter"
      >
        <MinusIcon className="h-5 w-5" />
      </button>

      {/* Counter Display */}
      <div className="flex flex-col items-center justify-center min-w-[80px]">
        <span className="text-3xl font-bold leading-none text-gray-900">
          {value}
        </span>
        {updateError && (
          <span className="text-xs mt-1 text-red-600">
            Update failed
          </span>
        )}
      </div>

      {/* Increment Button */}
      <button
        onClick={increment}
        disabled={isUpdating}
        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        aria-label="Increment counter"
      >
        <PlusIcon className="h-5 w-5" />
      </button>
    </div>
  );
}
