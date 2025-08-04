import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl mx-auto text-center">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Welcome to <span className="text-blue-600">Vite</span> + <span className="text-cyan-500">React</span>
          </h1>
          <p className="text-lg text-gray-600">
            Your modern development environment is ready!
          </p>
        </div>

        {/* Logo Section */}
        <div className="flex justify-center items-center gap-8 mb-8">
          <a 
            href="https://vite.dev" 
            target="_blank" 
            className="group transition-transform hover:scale-110"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <img src={viteLogo} className="h-16 w-16" alt="Vite logo" />
              <p className="text-sm text-gray-600 mt-2">Vite</p>
            </div>
          </a>
          <a 
            href="https://react.dev" 
            target="_blank" 
            className="group transition-transform hover:scale-110"
          >
            <div className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <img src={reactLogo} className="h-16 w-16 animate-spin-slow" alt="React logo" />
              <p className="text-sm text-gray-600 mt-2">React</p>
            </div>
          </a>
        </div>

        {/* Counter Card */}
        <div className="bg-white rounded-2xl p-8 shadow-lg max-w-md mx-auto mb-8">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Interactive Counter</h2>
          <div className="text-4xl font-bold text-blue-600 mb-6">{count}</div>
          <button 
            onClick={() => setCount((count) => count + 1)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 transform hover:scale-105 active:scale-95"
          >
            Increment Count
          </button>
        </div>

        {/* Info Section */}
        <div className="bg-white rounded-2xl p-6 shadow-lg">
          <h3 className="text-xl font-semibold text-gray-800 mb-4">Getting Started</h3>
          <p className="text-gray-600 mb-4">
            Edit <code className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">src/App.jsx</code> and save to test HMR
          </p>
          <p className="text-gray-600">
            Click on the Vite and React logos to learn more
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
