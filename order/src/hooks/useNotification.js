import { useState } from 'react'

export const useNotification = () => {
  const [notification, setNotification] = useState({
    isVisible: false,
    message: '',
    type: 'success'
  })

  const showNotification = (message, type = 'success', duration = 2000) => {
    setNotification({
      isVisible: true,
      message,
      type,
      duration
    })
  }

  const hideNotification = () => {
    setNotification(prev => ({
      ...prev,
      isVisible: false
    }))
  }

  const showSuccess = (message, duration) => showNotification(message, 'success', duration)
  const showError = (message, duration) => showNotification(message, 'error', duration)
  const showWarning = (message, duration) => showNotification(message, 'warning', duration)

  return {
    notification,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showWarning
  }
}

export default useNotification
