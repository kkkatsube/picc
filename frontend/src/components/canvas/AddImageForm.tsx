import { useState } from 'react';
import { PlusIcon } from '@heroicons/react/24/outline';

interface AddImageFormProps {
  isAddingImage: boolean;
  onAddImage: (url: string) => void;
}

export function AddImageForm({ isAddingImage, onAddImage }: AddImageFormProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [urlError, setUrlError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setUrlError('');

    // URL validation
    if (!imageUrl) {
      setUrlError('Please enter an image URL');
      return;
    }

    if (!imageUrl.startsWith('https://')) {
      setUrlError('Only HTTPS URLs are allowed');
      return;
    }

    try {
      new URL(imageUrl); // Validate URL format
      onAddImage(imageUrl);
      setImageUrl(''); // Clear input on success
    } catch {
      setUrlError('Invalid URL format');
    }
  };

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-semibold mb-4">Add Image</h3>

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="image-url" className="block text-sm font-medium text-gray-700 mb-2">
            Image URL (HTTPS)
          </label>
          <input
            id="image-url"
            type="url"
            value={imageUrl}
            onChange={(e) => {
              setImageUrl(e.target.value);
              setUrlError('');
            }}
            placeholder="https://example.com/image.jpg"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            disabled={isAddingImage}
          />
          {urlError && (
            <p className="mt-1 text-sm text-red-600">{urlError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isAddingImage || !imageUrl}
          className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors"
        >
          {isAddingImage ? (
            <>
              <svg
                className="animate-spin h-4 w-4 mr-2"
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
              Adding Image...
            </>
          ) : (
            <>
              <PlusIcon className="h-4 w-4 mr-2" />
              Add Image
            </>
          )}
        </button>
      </form>
    </div>
  );
}
