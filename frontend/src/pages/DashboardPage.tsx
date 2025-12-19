import { PlusIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { Counter } from '../components/counter';
import { useCanvases } from '../hooks/useCanvases';

export default function DashboardPage() {
  const navigate = useNavigate();
  const { user, clearAuth } = useAuthStore();
  const { canvases, isLoading, createCanvas, isCreating } = useCanvases();

  const handleLogout = () => {
    // TODO: API連携でログアウト処理を実装
    clearAuth();
  };

  const handleCreateCanvas = () => {
    createCanvas({
      name: 'New Canvas',
      width: 1920,
      height: 1080,
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header - with safe area support for PWA */}
      <header className="bg-white shadow" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">PICC Canvas</h1>
              <p className="text-sm text-gray-600">Dashboard</p>
            </div>
            <div className="flex items-center space-x-6">
              <div className="text-sm text-gray-700">
                Welcome, <span className="font-medium">{user?.name}</span>
              </div>

              {/* Counter Component */}
              <div className="border-l border-gray-300 pl-6">
                <Counter />
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <ArrowRightOnRectangleIcon className="h-4 w-4 mr-1" />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          
          {/* Create New Canvas Section */}
          <div className="mb-8">
            <button
              onClick={handleCreateCanvas}
              className="flex items-center justify-center w-full max-w-md mx-auto lg:mx-0 px-6 py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:border-gray-400 hover:text-gray-700 transition-colors duration-200"
            >
              <PlusIcon className="h-8 w-8 mr-3" />
              <span className="text-lg font-medium">Create New Canvas</span>
            </button>
          </div>

          {/* Your Canvases Section */}
          <div>
            <h2 className="text-lg font-medium text-gray-900 mb-4">Your Canvases</h2>

            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-gray-500">Loading canvases...</p>
              </div>
            ) : canvases.length === 0 ? (
              /* Empty State */
              <div className="text-center py-12">
                <div className="bg-white rounded-lg shadow p-6">
                  <div className="mx-auto h-12 w-12 text-gray-400 mb-4">
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No canvases yet</h3>
                  <p className="text-gray-600 mb-4">
                    Create your first canvas to start building beautiful image compositions.
                  </p>
                  <button
                    onClick={handleCreateCanvas}
                    disabled={isCreating}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                  >
                    <PlusIcon className="h-4 w-4 mr-2" />
                    {isCreating ? 'Creating...' : 'Create Canvas'}
                  </button>
                </div>
              </div>
            ) : (
              /* Canvas Grid */
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {canvases.map((canvas) => (
                  <button
                    key={canvas.id}
                    onClick={() => navigate(`/canvases/${canvas.id}`)}
                    className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition-shadow text-left w-full"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{canvas.name || 'Untitled Canvas'}</h3>
                    {canvas.memo && (
                      <p className="text-sm text-gray-600 mb-4">{canvas.memo}</p>
                    )}
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{canvas.width} × {canvas.height}</span>
                      <span>{new Date(canvas.created_at).toLocaleDateString()}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}