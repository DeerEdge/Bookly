import { useState, useEffect, useCallback } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import BusinessManagement from './pages/BusinessManagement'
import AdminLogin from './pages/AdminLogin'
import LoadingPage from './pages/LoadingPage'
import BusinessBookingPage from './components/BusinessBookingPage'
import apiService from './services/api'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [businesses, setBusinesses] = useState([])
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  // Load businesses on component mount
  useEffect(() => {
    loadBusinesses()
  }, [])

  const loadBusinesses = async () => {
    try {
      setLoading(true)
      const businessesData = await apiService.getAllBusinesses()
      setBusinesses(businessesData)
    } catch (error) {
      console.error('Failed to load businesses:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogin = async (email, password) => {
    try {
      const business = await apiService.loginBusiness(email, password)
      setCurrentUser(business)
      setIsAuthenticated(true)
      
      // Refresh the business data to ensure we have the latest information
      await refreshCurrentUserData(business.id)
      
      return true
    } catch (error) {
      console.error('Login failed:', error)
      return false
    }
  }

  const refreshCurrentUserData = async (businessId) => {
    try {
      const updatedBusiness = await apiService.getBusiness(businessId)
      setCurrentUser(updatedBusiness)
      // Also update the businesses array
      setBusinesses(prev => prev.map(b => b.id === businessId ? updatedBusiness : b))
    } catch (error) {
      console.error('Failed to refresh user data:', error)
    }
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  const addBusiness = async (business) => {
    try {
      const newBusiness = await apiService.registerBusiness(business)
      setBusinesses([...businesses, newBusiness])
      return newBusiness
    } catch (error) {
      console.error('Failed to register business:', error)
      throw error
    }
  }

  const bookAppointment = async (appointment) => {
    try {
      const newAppointment = await apiService.createAppointment(appointment)
      setAppointments(prev => [...prev, newAppointment])
      return newAppointment
    } catch (error) {
      console.error('Failed to book appointment:', error)
      throw error
    }
  }

  // Load appointments for current user
  const loadAppointments = useCallback(async () => {
    if (!currentUser) return

    try {
      const appointmentsData = await apiService.getBusinessAppointments(currentUser.id)
      setAppointments(appointmentsData)
    } catch (error) {
      console.error('Failed to load appointments:', error)
    }
  }, [currentUser])

  // Load appointments when user changes
  useEffect(() => {
    if (currentUser) {
      loadAppointments()
    }
  }, [currentUser, loadAppointments])

  // Auto-refresh appointments every 2 minutes
  useEffect(() => {
    if (!currentUser) return

    const interval = setInterval(() => {
      loadAppointments()
    }, 2 * 60 * 1000) // 2 minutes

    return () => clearInterval(interval)
  }, [currentUser, loadAppointments])

  const updateBusinessProfile = async (businessId, updates) => {
    try {
      const updatedBusiness = await apiService.updateBusiness(businessId, updates)
      setBusinesses(businesses.map(b => b.id === businessId ? updatedBusiness : b))
      if (currentUser && currentUser.id === businessId) {
        setCurrentUser(updatedBusiness)
      }
      return updatedBusiness
    } catch (error) {
      console.error('Failed to update business:', error)
      throw error
    }
  }

  if (loading) {
    return <LoadingPage />
  }

  return (
    <Router>
      <Routes>
        {/* Business Management Routes */}
        <Route
          path="/manage"
          element={
            <BusinessManagement
              isAuthenticated={isAuthenticated}
              currentUser={currentUser}
              businesses={businesses}
              appointments={appointments}
              onLogout={handleLogout}
              onLoadAppointments={loadAppointments}
              onUpdateProfile={updateBusinessProfile}
            />
          }
        />
        <Route
          path="/manage/login"
          element={
            <AdminLogin
              isAuthenticated={isAuthenticated}
              onLogin={handleLogin}
              onBusinessRegistered={addBusiness}
            />
          }
        />

        {/* Public Business Booking Routes */}
        <Route
          path="/:businessSlug"
          element={
            <BusinessBookingPage
              businesses={businesses}
              onBookAppointment={bookAppointment}
            />
          }
        />

        {/* Default route - redirect to business login */}
        <Route path="/" element={<Navigate to="/manage/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
