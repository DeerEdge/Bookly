import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import BusinessRegistration from './BusinessRegistration'

const Login = ({ onLogin, onRegister, activeTab, setActiveTab, onBusinessRegistered }) => {
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  // Animation variants for smooth form appearance
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  const itemVariants = {
    hidden: { 
      opacity: 0, 
      y: 20,
      scale: 0.95
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const headerVariants = {
    hidden: { 
      opacity: 0, 
      y: -20 
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

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
      <div className="min-h-screen bg-white">
        {/* Navigation */}
        <nav className="bg-transparent border-b border-transparent">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div className="flex items-center">
                
                              <Link to="/" className="flex items-center space-x-1 text-2xl text-gray-900 tracking-tight">
                <img 
                  src="/lilly.png" 
                  alt="Lilly Logo" 
                  className="w-8 h-8 object-contain"
                />
                <motion.span
                    whileHover={{ 
                      textShadow: "0 0 30px rgba(59, 130, 246, 0.8)"
                    }}
                    transition={{
                      duration: 0.2,
                      ease: "easeInOut"
                    }}
                  >
                    Lilly
                  </motion.span>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
          <div className="max-w-md w-full">
            <motion.div 
              className="text-center mb-8"
              variants={headerVariants}
              initial="hidden"
              animate="visible"
            >
              <div className="flex items-center justify-center space-x-3 mb-2">
                <img 
                  src="/lilly.png" 
                  alt="Lilly Logo" 
                  className="w-10 h-10 object-contain"
                />
                <h2 className="text-3xl font-light text-gray-900">Lilly</h2>
              </div>
              <p className="text-gray-500 font-light">Register your business</p>
            </motion.div>
            
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
            >
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
            </motion.div>
            
            <motion.div 
              className="text-center mt-6"
              variants={itemVariants}
              initial="hidden"
              animate="visible"
            >
              <button
                onClick={() => setActiveTab('login')}
                className="text-sm text-blue-600 hover:text-blue-500 font-light"
              >
                Already have an account? Sign in
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    )
  }

  // Default case: render login form
  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-transparent border-b border-transparent">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
                              <Link to="/" className="flex items-center space-x-1 text-2xl text-gray-900 tracking-tight">
                  <img 
                    src="/lilly.png" 
                    alt="Lilly Logo" 
                    className="w-10 h-10 object-contain"
                  />
                  <motion.span
                  whileHover={{ 
                    textShadow: "0 0 30px rgba(59, 130, 246, 0.8)"
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut"
                  }}
                >
                  Lilly
                </motion.span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <motion.div 
            className="text-center mb-8"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
          >
            <div className="flex items-center justify-center space-x-3 mb-2">
              <h2 className="text-3xl font-light text-gray-900">Lilly</h2>
            </div>
            <p className="text-gray-500 font-light">Sign in to your business account</p>
          </motion.div>

          <motion.div 
            className="bg-white rounded-lg border border-gray-200 p-8"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <form onSubmit={handleLoginSubmit} className="space-y-6">
              {error && (
                <motion.div 
                  className="bg-red-25 border border-red-200 rounded-lg p-3"
                  variants={itemVariants}
                >
                  <p className="text-sm text-red-600 font-light">{error}</p>
                </motion.div>
              )}

              <motion.div variants={itemVariants}>
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
              </motion.div>

              <motion.div variants={itemVariants}>
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
              </motion.div>

              <motion.button
                type="submit"
                disabled={loading}
                className={`
                  w-full py-3 px-4 rounded-lg font-light transition-colors text-sm
                  ${loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                  }
                `}
                variants={itemVariants}
                whileHover={{ 
                  scale: loading ? 1 : 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                {loading ? 'Signing In...' : 'Sign In'}
              </motion.button>
            </form>


            <motion.div 
              className="mt-6 text-center"
              variants={itemVariants}
            >
              <Link
                to="/manage/register"
                className="text-sm text-blue-600 hover:text-blue-500 font-light"
              >
                Don't have an account? Register your business
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Login 