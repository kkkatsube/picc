import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import Counter from './Counter';
import * as useCounterModule from '../../hooks/useCounter';

// useCounterフックをモック
vi.mock('../../hooks/useCounter');

describe('Counter', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('ローディング状態', () => {
    it('ローディング中はスピナーとメッセージを表示する', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 0,
        isLoading: true,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      expect(screen.getByText('Loading counter...')).toBeInTheDocument();
    });
  });

  describe('エラー状態', () => {
    it('エラー時はエラーメッセージを表示する', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 0,
        isLoading: false,
        isError: true,
        error: new Error('Network Error'),
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      expect(screen.getByText(/Failed to load counter: Network Error/)).toBeInTheDocument();
    });

    it('エラーメッセージがない場合はUnknown errorと表示する', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 0,
        isLoading: false,
        isError: true,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      expect(screen.getByText(/Failed to load counter: Unknown error/)).toBeInTheDocument();
    });
  });

  describe('通常状態', () => {
    it('カウンター値と+/-ボタンを表示する', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 42,
        isLoading: false,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      expect(screen.getByText('42')).toBeInTheDocument();
      expect(screen.getByLabelText('Increment counter')).toBeInTheDocument();
      expect(screen.getByLabelText('Decrement counter')).toBeInTheDocument();
    });

    it('値が0の場合も正しく表示する', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 0,
        isLoading: false,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('負の値も正しく表示する', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: -10,
        isLoading: false,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      expect(screen.getByText('-10')).toBeInTheDocument();
    });
  });

  describe('ボタン操作', () => {
    it('インクリメントボタンをクリックするとincrement関数が呼ばれる', async () => {
      const user = userEvent.setup();
      const incrementMock = vi.fn();

      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 5,
        isLoading: false,
        isError: false,
        error: null,
        increment: incrementMock,
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      const incrementButton = screen.getByLabelText('Increment counter');
      await user.click(incrementButton);

      expect(incrementMock).toHaveBeenCalledTimes(1);
    });

    it('デクリメントボタンをクリックするとdecrement関数が呼ばれる', async () => {
      const user = userEvent.setup();
      const decrementMock = vi.fn();

      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 10,
        isLoading: false,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: decrementMock,
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      const decrementButton = screen.getByLabelText('Decrement counter');
      await user.click(decrementButton);

      expect(decrementMock).toHaveBeenCalledTimes(1);
    });

    it('複数回クリックすると複数回関数が呼ばれる', async () => {
      const user = userEvent.setup();
      const incrementMock = vi.fn();

      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 0,
        isLoading: false,
        isError: false,
        error: null,
        increment: incrementMock,
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      const incrementButton = screen.getByLabelText('Increment counter');
      await user.click(incrementButton);
      await user.click(incrementButton);
      await user.click(incrementButton);

      expect(incrementMock).toHaveBeenCalledTimes(3);
    });
  });

  describe('更新中状態', () => {
    it('更新中はUpdating...メッセージを表示する', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 5,
        isLoading: false,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: true,
        updateError: null,
      });

      render(<Counter />);

      expect(screen.getByText('Updating...')).toBeInTheDocument();
    });

    it('更新中はボタンが無効化される', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 5,
        isLoading: false,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: true,
        updateError: null,
      });

      render(<Counter />);

      const incrementButton = screen.getByLabelText('Increment counter');
      const decrementButton = screen.getByLabelText('Decrement counter');

      expect(incrementButton).toBeDisabled();
      expect(decrementButton).toBeDisabled();
    });

    it('更新中でない場合はボタンが有効', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 5,
        isLoading: false,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      const incrementButton = screen.getByLabelText('Increment counter');
      const decrementButton = screen.getByLabelText('Decrement counter');

      expect(incrementButton).not.toBeDisabled();
      expect(decrementButton).not.toBeDisabled();
    });
  });

  describe('更新エラー状態', () => {
    it('更新エラー時はUpdate failedメッセージを表示する', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 5,
        isLoading: false,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: new Error('Update failed'),
      });

      render(<Counter />);

      expect(screen.getByText('Update failed')).toBeInTheDocument();
    });

    it('更新エラーがない場合はメッセージを表示しない', () => {
      vi.mocked(useCounterModule.useCounter).mockReturnValue({
        value: 5,
        isLoading: false,
        isError: false,
        error: null,
        increment: vi.fn(),
        decrement: vi.fn(),
        setValue: vi.fn(),
        isUpdating: false,
        updateError: null,
      });

      render(<Counter />);

      expect(screen.queryByText('Update failed')).not.toBeInTheDocument();
    });
  });
});
