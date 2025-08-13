import { useState, useEffect } from 'react'

const Notification = ({ message, type = 'success', isVisible, onClose, duration = 2000 }) => {
  const [isAnimating, setIsAnimating] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsAnimating(true)
      if (duration > 0) {
        const timer = setTimeout(() => {
          handleClose()
        }, duration)
        return () => clearTimeout(timer)
      }
    }
  }, [isVisible, duration])

  const handleClose = () => {
    setIsAnimating(false)
    setTimeout(() => {
      onClose()
    }, 300) // Wait for animation to complete
  }

  if (!isVisible && !isAnimating) return null

  const getIcon = () => {
    switch (type) {
      case 'success':
        return (
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-green-100">
            <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )
      case 'error':
        return (
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-red-100">
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        )
      case 'warning':
        return (
          <div className="w-12 h-12 mx-auto mb-4 flex items-center justify-center rounded-full bg-yellow-100">
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
        )
      default:
        return null
    }
  }

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
      <div 
        className={`
          bg-white rounded-lg shadow-lg border border-gray-200 p-6 max-w-sm mx-4 pointer-events-auto
          transform transition-all duration-300 ease-out
          ${isAnimating && isVisible 
            ? 'opacity-100 scale-100 translate-y-0' 
            : 'opacity-0 scale-95 translate-y-2'
          }
        `}
      >
        <div className="text-center">
          {getIcon()}
          <p className="text-gray-900 font-light text-sm mb-4">
            {message}
          </p>
          <button
            onClick={handleClose}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors"
          >
            OK
          </button>
        </div>
      </div>
    </div>
  )
}

export default Notification
