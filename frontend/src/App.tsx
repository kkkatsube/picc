import { useAuthStore } from './stores/authStore';
import AuthPage from './pages/AuthPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const { isAuthenticated } = useAuthStore();

  return (
    <>
      {isAuthenticated ? <DashboardPage /> : <AuthPage />}
    </>
  );
}

export default App