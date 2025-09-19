import { useState } from 'react';
import LoginForm from '../components/auth/LoginForm';
import RegisterForm from '../components/auth/RegisterForm';
import { useAuthStore } from '../stores/authStore';
import { AuthService, type AuthError } from '../services/authService';
import { LoginForm as LoginFormData, RegisterForm as RegisterFormData } from '../components/auth/schemas';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { setAuth, setLoading, isLoading } = useAuthStore();

  const handleLogin = async (data: LoginFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.login({
        email: data.email,
        password: data.password,
      });

      // 認証トークンを設定
      AuthService.setAuthToken(response.access_token);
      
      // ユーザー情報をストアに保存
      setAuth(response.user, response.access_token);
      
    } catch (error) {
      console.error('Login failed:', error);
      const authError = error as AuthError;
      setError(authError.message);
      setLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await AuthService.register({
        name: data.name,
        email: data.email,
        password: data.password,
        password_confirmation: data.password_confirmation,
      });

      // 認証トークンを設定
      AuthService.setAuthToken(response.access_token);
      
      // ユーザー情報をストアに保存
      setAuth(response.user, response.access_token);
      
    } catch (error) {
      console.error('Registration failed:', error);
      const authError = error as AuthError;
      setError(authError.message);
      setLoading(false);
    }
  };

  return (
    <>
      {/* エラー表示 */}
      {error && (
        <div className="fixed top-4 left-4 right-4 z-50 mx-auto max-w-md">
          <div className="bg-red-50 border border-red-200 rounded-md p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  type="button"
                  className="text-red-400 hover:text-red-600"
                  onClick={() => setError(null)}
                >
                  <span className="sr-only">閉じる</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* フォーム */}
      {isLogin ? (
        <LoginForm
          onSubmit={handleLogin}
          onSwitchToRegister={() => {
            setIsLogin(false);
            setError(null);
          }}
          isLoading={isLoading}
        />
      ) : (
        <RegisterForm
          onSubmit={handleRegister}
          onSwitchToLogin={() => {
            setIsLogin(true);
            setError(null);
          }}
          isLoading={isLoading}
        />
      )}
    </>
  );
}