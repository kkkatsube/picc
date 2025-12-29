import { useState, useCallback } from 'react';
import axios from 'axios';

export interface LocalImage {
  id: string;
  url: string;
}

const LOCAL_IMAGE_SERVER_URL = 'http://localhost:4000';

export function useLocalImages() {
  const [images, setImages] = useState<LocalImage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchRandomImages = useCallback(async (count: number = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<LocalImage[]>(`${LOCAL_IMAGE_SERVER_URL}/random`, {
        params: { count },
      });
      setImages(response.data);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch local images');
      setError(error);
      console.error('Error fetching local images:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMore = useCallback(async (count: number = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await axios.get<LocalImage[]>(`${LOCAL_IMAGE_SERVER_URL}/random`, {
        params: { count },
      });
      setImages((prev) => [...prev, ...response.data]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load more images');
      setError(error);
      console.error('Error loading more images:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    images,
    isLoading,
    error,
    fetchRandomImages,
    loadMore,
  };
}
