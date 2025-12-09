import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useCounter } from './useCounter';
import { CounterService } from '../api';

// CounterServiceのモック
vi.mock('../api', () => ({
  CounterService: {
    getUserCounterValue: vi.fn(),
    updateUserCounterValue: vi.fn(),
  },
}));

// テスト用のWrapper（React Queryのプロバイダー）
function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false, // テスト時はリトライしない
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}

describe('useCounter', () => {
  beforeEach(() => {
    // 各テスト前にモックをクリア
    vi.clearAllMocks();
  });

  describe('初期状態', () => {
    it('カウンター値を取得できる', async () => {
      // モックの設定: サーバーから値10を返す
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 10,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      // 初期状態: ローディング中
      expect(result.current.isLoading).toBe(true);
      expect(result.current.value).toBe(0); // デフォルト値

      // API呼び出し完了を待つ
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      // 取得した値が反映される
      expect(result.current.value).toBe(10);
      expect(result.current.isError).toBe(false);
      expect(CounterService.getUserCounterValue).toHaveBeenCalledTimes(1);
    });

    it('カウンター未作成時はデフォルト値0を返す', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 0,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.isLoading).toBe(false));

      expect(result.current.value).toBe(0);
    });

    it('取得エラー時はエラー状態になる', async () => {
      const error = new Error('Network Error');
      vi.mocked(CounterService.getUserCounterValue).mockRejectedValue(error);

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(
        () => {
          expect(result.current.isError).toBe(true);
        },
        { timeout: 3000 }
      );

      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeTruthy();
      expect(result.current.value).toBe(0); // エラー時もデフォルト値
    });
  });

  describe('increment機能', () => {
    it('カウンターをインクリメントできる', async () => {
      // 初期取得: 値5
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 5,
      });
      // 更新: 値6
      vi.mocked(CounterService.updateUserCounterValue).mockResolvedValue({
        value: 6,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      // 初期読み込み完了を待つ
      await waitFor(() => expect(result.current.value).toBe(5));

      // インクリメント実行
      result.current.increment();

      // 更新完了を待つ
      await waitFor(() => expect(result.current.value).toBe(6));

      // 値が更新されている
      expect(result.current.isUpdating).toBe(false);
      expect(CounterService.updateUserCounterValue).toHaveBeenCalledWith({
        value: 6,
      });
    });

    it('0から1にインクリメントできる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 0,
      });
      vi.mocked(CounterService.updateUserCounterValue).mockResolvedValue({
        value: 1,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(0));

      result.current.increment();

      await waitFor(() => expect(result.current.value).toBe(1));
    });

    it('負の値からインクリメントできる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: -5,
      });
      vi.mocked(CounterService.updateUserCounterValue).mockResolvedValue({
        value: -4,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(-5));

      result.current.increment();

      await waitFor(() => expect(result.current.value).toBe(-4));
    });
  });

  describe('decrement機能', () => {
    it('カウンターをデクリメントできる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 10,
      });
      vi.mocked(CounterService.updateUserCounterValue).mockResolvedValue({
        value: 9,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(10));

      result.current.decrement();

      await waitFor(() => expect(result.current.value).toBe(9));

      expect(CounterService.updateUserCounterValue).toHaveBeenCalledWith({
        value: 9,
      });
    });

    it('1から0にデクリメントできる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 1,
      });
      vi.mocked(CounterService.updateUserCounterValue).mockResolvedValue({
        value: 0,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(1));

      result.current.decrement();

      await waitFor(() => expect(result.current.value).toBe(0));
    });

    it('0から負の値にデクリメントできる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 0,
      });
      vi.mocked(CounterService.updateUserCounterValue).mockResolvedValue({
        value: -1,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(0));

      result.current.decrement();

      await waitFor(() => expect(result.current.value).toBe(-1));
    });
  });

  describe('setValue機能', () => {
    it('任意の値に設定できる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 5,
      });
      vi.mocked(CounterService.updateUserCounterValue).mockResolvedValue({
        value: 100,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(5));

      result.current.setValue(100);

      await waitFor(() => expect(result.current.value).toBe(100));

      expect(CounterService.updateUserCounterValue).toHaveBeenCalledWith({
        value: 100,
      });
    });

    it('0に設定できる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 42,
      });
      vi.mocked(CounterService.updateUserCounterValue).mockResolvedValue({
        value: 0,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(42));

      result.current.setValue(0);

      await waitFor(() => expect(result.current.value).toBe(0));
    });

    it('負の値に設定できる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 10,
      });
      vi.mocked(CounterService.updateUserCounterValue).mockResolvedValue({
        value: -50,
      });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(10));

      result.current.setValue(-50);

      await waitFor(() => expect(result.current.value).toBe(-50));
    });
  });

  describe('エラーハンドリング', () => {
    it('更新エラー時はupdateErrorに設定される', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 5,
      });

      const error = new Error('Update failed');
      vi.mocked(CounterService.updateUserCounterValue).mockRejectedValue(error);

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(5));

      result.current.increment();

      await waitFor(() => expect(result.current.updateError).toBeTruthy());

      expect(result.current.isUpdating).toBe(false);
      // エラー時は値が変わらない
      expect(result.current.value).toBe(5);
    });
  });

  describe('複数回の操作', () => {
    it('increment → decrement を連続で実行できる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 5,
      });

      // 1回目: 5 → 6
      vi.mocked(CounterService.updateUserCounterValue)
        .mockResolvedValueOnce({ value: 6 })
        // 2回目: 6 → 5
        .mockResolvedValueOnce({ value: 5 });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(5));

      // Increment
      result.current.increment();
      await waitFor(() => expect(result.current.value).toBe(6));

      // Decrement
      result.current.decrement();
      await waitFor(() => expect(result.current.value).toBe(5));

      expect(CounterService.updateUserCounterValue).toHaveBeenCalledTimes(2);
    });

    it('setValue → increment を連続で実行できる', async () => {
      vi.mocked(CounterService.getUserCounterValue).mockResolvedValue({
        value: 0,
      });

      vi.mocked(CounterService.updateUserCounterValue)
        .mockResolvedValueOnce({ value: 100 })
        .mockResolvedValueOnce({ value: 101 });

      const { result } = renderHook(() => useCounter(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => expect(result.current.value).toBe(0));

      result.current.setValue(100);
      await waitFor(() => expect(result.current.value).toBe(100));

      result.current.increment();
      await waitFor(() => expect(result.current.value).toBe(101));
    });
  });
});
