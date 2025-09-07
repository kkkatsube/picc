import { useState } from 'react'
import { CheckCircleIcon, XCircleIcon, ClockIcon } from '@heroicons/react/24/solid'
import { HealthCheck, HealthResponse } from './api'

function App() {
  const [apiStatus, setApiStatus] = useState<'loading' | 'success' | 'error'>('error')
  const [healthData, setHealthData] = useState<HealthResponse | null>(null)

  const checkAPI = async () => {
    setApiStatus('loading')
    try {
      const response = await fetch('/api/health')
      const data: HealthResponse = await response.json()
      
      setHealthData(data)
      setApiStatus(data.status === HealthResponse.status.OK ? 'success' : 'error')
    } catch (error) {
      setApiStatus('error')
      setHealthData(null)
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
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className={`h-6 w-6 rounded-full mr-3 ${
                    apiStatus === 'success' ? 'bg-green-500' : 
                    apiStatus === 'error' ? 'bg-red-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="text-lg text-gray-900">Backend API</span>
                </div>
                <button 
                  onClick={checkAPI}
                  disabled={apiStatus === 'loading'}
                  className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
                >
                  {apiStatus === 'loading' ? 'Testing...' : 'Test Connection'}
                </button>
              </div>
              
              {healthData && (
                <div className="mt-4 space-y-3">
                  <div className="text-sm text-gray-600">
                    Status: <span className={`font-medium ${healthData.status === HealthResponse.status.OK ? 'text-green-600' : 'text-red-600'}`}>
                      {healthData.message}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    Version: {healthData.version} • Updated: {new Date(healthData.timestamp).toLocaleString()}
                  </div>
                  
                  <div className="grid gap-2">
                    {Object.entries(healthData.checks).map(([service, check]) => (
                      <div key={service} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center">
                          {check.status === HealthCheck.status.OK ? (
                            <CheckCircleIcon className="h-4 w-4 text-green-500 mr-2" />
                          ) : check.status === HealthCheck.status.ERROR ? (
                            <XCircleIcon className="h-4 w-4 text-red-500 mr-2" />
                          ) : (
                            <ClockIcon className="h-4 w-4 text-yellow-500 mr-2" />
                          )}
                          <span className="text-sm font-medium capitalize">{service}</span>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-600">{check.message}</div>
                          {check.connection_time_ms && (
                            <div className="text-xs text-gray-500">{check.connection_time_ms}ms</div>
                          )}
                          {check.driver && (
                            <div className="text-xs text-gray-500">{check.driver}</div>
                          )}
                          {check.error && (
                            <div className="text-xs text-red-500">{check.error}</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
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