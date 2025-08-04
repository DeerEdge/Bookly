const Navbar = ({ activeTab, setActiveTab }) => {
  return (
    <nav className="bg-white border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <h1 className="text-xl font-light text-gray-900">OrderAgain</h1>
            </div>
            <div className="ml-4 text-sm text-gray-500 font-light">
              Schedule your future orders
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-1">
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
              onClick={() => setActiveTab('orders')}
              className={`
                px-4 py-2 text-sm font-light rounded-md transition-colors duration-200
                ${activeTab === 'orders'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }
              `}
            >
              Scheduled Orders
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar 