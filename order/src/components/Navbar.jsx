const Navbar = ({ activeTab, setActiveTab, currentUser, onLogout, isAdmin }) => {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-light text-gray-900">BookMyAppointment</h1>
            </div>
            <div className="ml-4 text-sm text-gray-500 font-light">
              {currentUser ? `Welcome, ${currentUser.name}` : 'Easy appointment booking for businesses'}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center space-x-1">
            {isAdmin && currentUser ? (
              <>
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`
                    px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                    ${activeTab === 'dashboard'
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  Calendar
                </button>
                <button
                  onClick={onLogout}
                  className="px-4 py-2 text-sm font-light text-gray-600 hover:text-red-600 hover:bg-red-25 rounded-md transition-colors duration-200"
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
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
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
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }
                  `}
                >
                  Register Business
                </button>
              </>
            ) : null}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 