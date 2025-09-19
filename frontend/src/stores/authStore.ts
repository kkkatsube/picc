import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthService } from '../services/authService';

// ユーザー情報の型定義（APIレスポンスと統一）
export interface User {
  id: number;
  name: string;
  email: string;
  email_verified_at?: string | null;
  created_at: string;
  updated_at: string;
}

// 認証状態の型定義
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// 認証アクションの型定義
interface AuthActions {
  setAuth: (_user: User, _token: string) => void;
  clearAuth: () => void;
  setLoading: (_loading: boolean) => void;
}

// Zustand ストア作成
export const useAuthStore = create<AuthState & AuthActions>()(
  persist(
    (set) => ({
      // 初期状態
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      // アクション
      setAuth: (user: User, token: string) => {
        // APIクライアントにトークンを設定
        AuthService.setAuthToken(token);
        
        set({
          user,
          token,
          isAuthenticated: true,
          isLoading: false,
        });
      },

      clearAuth: () => {
        // APIクライアントのトークンをクリア
        AuthService.clearAuthToken();
        
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          isLoading: false,
        });
      },

      setLoading: (loading: boolean) =>
        set({
          isLoading: loading,
        }),
    }),
    {
      name: 'auth-storage', // ローカルストレージのキー名
      // トークンのみ永続化（セキュリティ上、必要最小限）
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      // ストア復元時にAPIクライアントにトークンを設定
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          AuthService.setAuthToken(state.token);
        }
      },
    }
  )
);