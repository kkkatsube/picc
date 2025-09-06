import { useState } from 'react'
import { CheckCircleIcon } from '@heroicons/react/24/solid'

function App() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('loading')

  // APIヘルスチェック（後で実装）
  const checkAPI = async () => {
    try {
      const response = await fetch('/api/health')
      if (response.ok) {
        setApiStatus('success')
      } else {
        setApiStatus('error')
      }
    } catch (error) {
      setApiStatus('error')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            PICC Development Environment
          </h1>
          
          <div className="space-y-4">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <CheckCircleIcon className="h-6 w-6 text-green-500 mr-3" />
                <span className="text-lg text-gray-900">Frontend (React + Vite)</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Running on port 3000</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="flex items-center">
                <div className={`h-6 w-6 rounded-full mr-3 ${
                  apiStatus === 'success' ? 'bg-green-500' : 
                  apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                }`}></div>
                <span className="text-lg text-gray-900">Backend API</span>
              </div>
              <p className="text-sm text-gray-500 mt-2">Laravel + PostgreSQL</p>
              <button 
                onClick={checkAPI}
                className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Test Connection
              </button>
            </div>
          </div>
          
          <div className="mt-8 text-sm text-gray-500">
            <p>🚀 Full Stack Learning Project</p>
            <p>Docker + Laravel 11 + React 18 + TypeScript</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App