import { useState, useCallback } from 'react';
import axios from 'axios';

export interface LocalImage {
  id: string;
  url: string;
}

export interface Folder {
  name: string;
  path: string;
}

const LOCAL_IMAGE_SERVER_URL = 'http://localhost:4000';

export type SortOrder = 'random' | 'asc' | 'desc';

export function useLocalImages() {
  const [images, setImages] = useState<LocalImage[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [currentPath, setCurrentPath] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<SortOrder>('random');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchFolders = useCallback(async (path: string = '') => {
    try {
      const response = await axios.get<{ folders: Folder[]; currentPath: string }>(
        `${LOCAL_IMAGE_SERVER_URL}/folders`,
        {
          params: { path },
        }
      );
      setFolders(response.data.folders);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch folders');
      console.error('Error fetching folders:', error);
    }
  }, []);

  const fetchRandomImages = useCallback(async (count: number = 10, path: string = '', sort: SortOrder = 'random') => {
    setIsLoading(true);
    setError(null);
    // Clear images when changing folders
    setImages([]);

    try {
      const response = await axios.get<LocalImage[]>(`${LOCAL_IMAGE_SERVER_URL}/random`, {
        params: { count, path, sort },
      });
      setImages(response.data);
      setCurrentPath(path);
      await fetchFolders(path);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to fetch local images');
      setError(error);
      console.error('Error fetching local images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [fetchFolders]);

  const loadMore = useCallback(async (count: number = 10) => {
    setIsLoading(true);
    setError(null);

    try {
      // ソート時はskipパラメータで続きから取得、ランダム時はskipなし
      const skip = sortOrder !== 'random' ? images.length : undefined;
      const response = await axios.get<LocalImage[]>(`${LOCAL_IMAGE_SERVER_URL}/random`, {
        params: { count, path: currentPath, sort: sortOrder, skip },
      });
      setImages((prev) => [...prev, ...response.data]);
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to load more images');
      setError(error);
      console.error('Error loading more images:', error);
    } finally {
      setIsLoading(false);
    }
  }, [currentPath, sortOrder, images.length]);

  const navigateToFolder = useCallback(async (path: string) => {
    await fetchRandomImages(10, path, sortOrder);
  }, [fetchRandomImages, sortOrder]);

  const changeSortOrder = useCallback(async (newSortOrder: SortOrder) => {
    setSortOrder(newSortOrder);
    await fetchRandomImages(10, currentPath, newSortOrder);
  }, [fetchRandomImages, currentPath]);

  return {
    images,
    folders,
    currentPath,
    sortOrder,
    isLoading,
    error,
    fetchRandomImages,
    loadMore,
    navigateToFolder,
    changeSortOrder,
  };
}
