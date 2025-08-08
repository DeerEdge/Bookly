import { useState } from 'react'
import BusinessRegistration from './BusinessRegistration'

const Login = ({ onLogin, onRegister, activeTab, setActiveTab, onBusinessRegistered }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLoginSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    
    if (!loginData.email || !loginData.password) {
      setError('Please fill in all fields')
      setLoading(false)
      return
    }

    try {
      const success = await onLogin(loginData.email, loginData.password)
      if (!success) {
        setError('Invalid email or password')
      }
    } catch (error) {
      setError(error.message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (field, value) => {
    setLoginData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  if (activeTab === 'register') {
    return (
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-light text-gray-900 mb-2">Bookly</h1>
            <p className="text-gray-500 font-light">Register your business</p>
          </div>
          
          <BusinessRegistration 
            onBusinessRegistered={async (business) => {
              try {
                await onBusinessRegistered(business)
                setActiveTab('login')
              } catch (error) {
                console.error('Registration failed:', error)
              }
            }}
          />
          
          <div className="text-center mt-6">
            <button
              onClick={() => setActiveTab('login')}
              className="text-sm text-blue-600 hover:text-blue-500 font-light"
            >
              Already have an account? Sign in
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Bookly</h1>
          <p className="text-gray-500 font-light">Sign in to your business account</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-8">
          <form onSubmit={handleLoginSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-25 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600 font-light">{error}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-light text-gray-600 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={loginData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>

            <div>
              <label className="block text-xs font-light text-gray-600 mb-2">
                Password
              </label>
              <input
                type="password"
                value={loginData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                placeholder="Enter your password"
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`
                w-full py-3 px-4 rounded-lg font-light transition-colors text-sm
                ${loading
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 hover:bg-blue-600 text-white'
                }
              `}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setActiveTab('register')}
              className="text-sm text-blue-600 hover:text-blue-500 font-light"
              disabled={loading}
            >
              Don't have an account? Register your business
            </button>
          </div>

          {/* Demo Credentials */}
          <div className="mt-8 p-4 bg-gray-25 rounded-lg border border-gray-200">
            <h3 className="text-sm font-light text-gray-900 mb-2">Demo Credentials</h3>
            <div className="space-y-1 text-xs text-gray-600 font-light">
              <p><strong>Elegant Hair Salon:</strong> elegant@example.com / password123</p>
              <p><strong>Zen Massage Therapy:</strong> zen@example.com / password123</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Login 