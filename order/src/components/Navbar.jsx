import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'

const Navbar = ({ activeTab, setActiveTab, currentUser, onLogout, isAdmin, isPublic }) => {
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handlePublicTabClick = (tab) => {
    if (isPublic) {
      navigate(`/${tab}`)
    } else if (setActiveTab) {
      setActiveTab(tab)
    }
  }

  const handleLogoClick = (e) => {
    // If user is logged in (either admin or regular user), prevent navigation to landing page
    if (currentUser || isAdmin) {
      e.preventDefault()
      // Optionally, you can navigate to a dashboard or do nothing
      // For now, we'll just prevent the navigation
      return
    }
    // If not logged in, allow normal navigation to landing page
  }

  const handleMobileTabClick = (tab) => {
    if (isPublic) {
      navigate(`/${tab}`)
    } else if (setActiveTab) {
      setActiveTab(tab)
    }
    setIsMobileMenuOpen(false) // Close mobile menu after selection
  }

  return (
    <nav className="bg-white border-b border-gray-200 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link 
              to={currentUser || isAdmin ? "#" : "/"} 
              onClick={handleLogoClick}
              className={`flex items-center space-x-1 text-2xl text-gray-900 tracking-tight ${currentUser || isAdmin ? 'cursor-default' : 'cursor-pointer'}`}
            >
              <img 
                src="/lilly.png" 
                alt="Lilly Logo" 
                className="w-10 h-10 object-contain"
              />
              <motion.span
                whileHover={{ 
                  textShadow: currentUser || isAdmin ? "none" : "0 0 30px rgba(59, 130, 246, 0.8)"
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {isAdmin && currentUser ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`
                                          px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                      ${activeTab === 'dashboard'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }
                  `}
                >
                  Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('calendar')}
                  className={`
                                          px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                      ${activeTab === 'calendar'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }
                  `}
                >
                  Calendar
                </button>
                <button
                  onClick={() => setActiveTab('history')}
                  className={`
                                          px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                      ${activeTab === 'history'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }
                  `}
                >
                  History
                </button>
                <button
                  onClick={() => setActiveTab('services')}
                  className={`
                                          px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                      ${activeTab === 'services'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }
                  `}
                >
                  Services
                </button>
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`
                                          px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                      ${activeTab === 'profile'
                        ? 'text-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                      }
                  `}
                >
                  Profile
                </button>
                <div className="ml-2 mr-3 border-l border-gray-200 h-7"></div>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-sm font-light bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors duration-200"
                >
                  Logout
                </button>
              </>
            ) : isAdmin ? (
              <>
                <button
                  onClick={() => setActiveTab('login')}
                  className={`
                    px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                    ${activeTab === 'login'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }
                  `}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`
                    px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                    ${activeTab === 'register'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }
                  `}
                >
                  Register Business
                </button>
              </>
            ) : isPublic ? (
              <>
                {/*<button
                  onClick={() => handlePublicTabClick('find-service')}
                  className={`
                    px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                    ${activeTab === 'find-service'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }
                  `}
                >
                  Find a Service
                </button>*/}
                <button
                  onClick={() => handlePublicTabClick('business-pricing')}
                  className={`
                    px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                    ${activeTab === 'business-pricing'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-200'
                    }
                  `}
                >
                  Pricing
                </button>
                <div className="ml-2 mr-3 border-l border-gray-200 h-7"></div>
                <button
                  onClick={() => navigate('/manage/login')}
                  className="px-4 py-2 text-sm font-light bg-gray-800 hover:bg-gray-900 text-white rounded-md transition-colors duration-200"
                >
                  Sign In
                </button>
              </>
            ) : null}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors duration-200"
            >
              <svg
                className={`w-6 h-6 transform transition-transform duration-200 ${isMobileMenuOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu Accordion */}
        {isMobileMenuOpen && (
                      <motion.div 
              className="absolute top-16 left-0 right-0 md:hidden bg-white bg-opacity-95 backdrop-blur-sm border-t border-gray-200 shadow-lg z-50"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
            >
            <div className="pt-1 space-y-1">
              {isAdmin && currentUser ? (
                <>
                  <button
                    onClick={() => handleMobileTabClick('dashboard')}
                    className={`
                      w-full text-left px-4 py-3 text-sm font-light transition-colors duration-200
                      ${activeTab === 'dashboard'
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    Dashboard
                  </button>
                  <button
                    onClick={() => handleMobileTabClick('calendar')}
                    className={`
                      w-full text-left px-4 py-3 text-sm font-light transition-colors duration-200
                      ${activeTab === 'calendar'
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    Calendar
                  </button>
                  <button
                    onClick={() => handleMobileTabClick('history')}
                    className={`
                      w-full text-left px-4 py-3 text-sm font-light transition-colors duration-200
                      ${activeTab === 'history'
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    History
                  </button>
                  <button
                    onClick={() => handleMobileTabClick('services')}
                    className={`
                      w-full text-left px-4 py-3 text-sm font-light transition-colors duration-200
                      ${activeTab === 'services'
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    Services
                  </button>
                  <button
                    onClick={() => handleMobileTabClick('profile')}
                    className={`
                      w-full text-left px-4 py-3 text-sm font-light transition-colors duration-200
                      ${activeTab === 'profile'
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    Profile
                  </button>
                  <div className="border-t ">
                    <button
                      onClick={() => { onLogout(); setIsMobileMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-light bg-gray-800 hover:bg-gray-900 text-white transition-colors duration-200"
                    >
                      Logout
                    </button>
                  </div>
                </>
              ) : isAdmin ? (
                <>
                  <button
                    onClick={() => handleMobileTabClick('login')}
                    className={`
                      w-full text-left px-4 py-3 text-sm font-light transition-colors duration-200
                      ${activeTab === 'login'
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => navigate('/manage/register')}
                    className="w-full text-left px-4 py-3 text-sm font-light text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors duration-200"
                  >
                    Register Business
                  </button>
                </>
              ) : isPublic ? (
                <>
                  <button
                    onClick={() => handleMobileTabClick('find-service')}
                    className={`
                      w-full text-left px-4 py-3 text-sm font-light transition-colors duration-200
                      ${activeTab === 'find-service'
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    Find a Service
                  </button>
                  <button
                    onClick={() => handleMobileTabClick('business-pricing')}
                    className={`
                      w-full text-left px-4 py-3 text-sm font-light transition-colors duration-200
                      ${activeTab === 'business-pricing'
                        ? 'text-blue-600 bg-blue-50 border-l-4 border-blue-600'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                      }
                    `}
                  >
                    Pricing
                  </button>
                  <div className="border-t ">
                    <button
                      onClick={() => { navigate('/manage/login'); setIsMobileMenuOpen(false); }}
                      className="w-full text-left px-4 py-3 text-sm font-light bg-gray-800 hover:bg-gray-900 text-white transition-colors duration-200"
                    >
                      Sign In
                    </button>
                  </div>
                </>
                              ) : null}
              </div>
            </motion.div>
          )}
      </div>
    </nav>
  )
}

export default Navbar 