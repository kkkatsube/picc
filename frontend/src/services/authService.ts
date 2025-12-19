import { AuthenticationService } from '../api/services/AuthenticationService';
import { OpenAPI } from '../api/core/OpenAPI';
import { ApiError } from '../api/core/ApiError';
import type { LoginRequest, RegisterRequest, AuthResponse, UserResponse } from '../api';

// OpenAPI設定（ベースURL）
// 開発環境では相対パスを使用（Viteプロキシ経由）
OpenAPI.BASE = '/api';

export interface AuthError {
  message: string;
  errors?: Record<string, string[]>;
  status: number;
}

export class AuthService {
  /**
   * ユーザー登録
   */
  static async register(data: {
    name: string;
    email: string;
    password: string;
    password_confirmation: string;
  }): Promise<AuthResponse> {
    try {
      const request: RegisterRequest = {
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      };

      const response = await AuthenticationService.register(request);
      return response;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * ユーザーログイン
   */
  static async login(data: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      const request: LoginRequest = {
        email: data.email,
        password: data.password,
      };

      const response = await AuthenticationService.login(request);
      return response;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * ユーザーログアウト
   */
  static async logout(): Promise<void> {
    try {
      await AuthenticationService.logout();
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * 現在のユーザー情報取得
   */
  static async getCurrentUser(): Promise<UserResponse> {
    try {
      const response = await AuthenticationService.getCurrentUser();
      return response;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }

  /**
   * 認証トークンを設定
   */
  static setAuthToken(token: string): void {
    OpenAPI.TOKEN = token;
  }

  /**
   * 認証トークンをクリア
   */
  static clearAuthToken(): void {
    OpenAPI.TOKEN = undefined;
  }

  /**
   * APIエラーをユーザーフレンドリーなエラーに変換
   */
  private static handleApiError(error: unknown): AuthError {
    if (error instanceof ApiError) {
      const { status, message, body } = error;

      // バリデーションエラー (422)
      if (status === 422 && body?.errors) {
        return {
          message: body.message || 'バリデーションエラーが発生しました',
          errors: body.errors,
          status,
        };
      }

      // 認証エラー (401)
      if (status === 401) {
        return {
          message: 'メールアドレスまたはパスワードが間違っています',
          status,
        };
      }

      // その他のエラー
      return {
        message: body?.message || message || 'エラーが発生しました',
        status,
      };
    }

    // ネットワークエラーなど
    return {
      message: 'ネットワークエラーが発生しました。しばらく時間をおいてから再度お試しください。',
      status: 0,
    };
  }
}