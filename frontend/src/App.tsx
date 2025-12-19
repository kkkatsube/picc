import { useState, useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './stores/authStore';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';
import CanvasEditorPage from './pages/CanvasEditorPage';
import { PullToRefresh } from './components/PullToRefresh';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 1,
    },
  },
});

function App() {
  const { isAuthenticated } = useAuthStore();
  const [isFullscreen, setIsFullscreen] = useState(false);

  // フルスクリーン状態を検出
  useEffect(() => {
    const checkFullscreen = () => {
      setIsFullscreen(document.body.classList.contains('fullscreen-active'));
    };

    // MutationObserverでbodyのclassの変更を監視
    const observer = new MutationObserver(checkFullscreen);
    observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

    return () => observer.disconnect();
  }, []);

  const handleRefresh = async () => {
    // ページをリロード
    window.location.reload();
  };

  return (
    <QueryClientProvider client={queryClient}>
      <PullToRefresh onRefresh={handleRefresh} disabled={isFullscreen}>
        <BrowserRouter>
          <Routes>
            {isAuthenticated ? (
              <>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/canvases/:id" element={<CanvasEditorPage />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            ) : (
              <>
                <Route path="/auth" element={<AuthPage />} />
                <Route path="*" element={<Navigate to="/auth" replace />} />
              </>
            )}
          </Routes>
        </BrowserRouter>
      </PullToRefresh>
    </QueryClientProvider>
  );
}

export default App