import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Navbar from './components/Navbar'
import Login from './components/Login'
import BusinessRegistration from './components/BusinessRegistration'
import AppointmentBooking from './components/AppointmentBooking'
import BusinessDashboard from './components/BusinessDashboard'
import BusinessCalendar from './components/BusinessCalendar'
import BusinessBookingPage from './components/BusinessBookingPage'

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [currentUser, setCurrentUser] = useState(null)
  const [businesses, setBusinesses] = useState([
    {
      id: 1,
      name: 'Elegant Hair Salon',
      slug: 'elegant-hair-salon',
      category: 'Hair Salon',
      description: 'Professional hair styling and beauty services',
      address: '123 Main St, Downtown',
      phone: '(555) 123-4567',
      hours: 'Mon-Fri: 9AM-7PM, Sat: 10AM-5PM',
      email: 'elegant@example.com',
      password: 'password123',
      services: [
        { name: 'Haircut', duration: 30, price: 45 },
        { name: 'Hair Color', duration: 120, price: 120 },
        { name: 'Styling', duration: 45, price: 60 },
        { name: 'Manicure', duration: 30, price: 35 }
      ]
    },
    {
      id: 2,
      name: 'Zen Massage Therapy',
      slug: 'zen-massage-therapy',
      category: 'Massage',
      description: 'Relaxing therapeutic massage services',
      address: '456 Wellness Ave, Uptown',
      phone: '(555) 987-6543',
      hours: 'Mon-Sat: 10AM-8PM',
      email: 'zen@example.com',
      password: 'password123',
      services: [
        { name: 'Swedish Massage', duration: 60, price: 80 },
        { name: 'Deep Tissue', duration: 60, price: 90 },
        { name: 'Hot Stone', duration: 90, price: 120 }
      ]
    }
  ])
  const [appointments, setAppointments] = useState([])

  const handleLogin = (email, password) => {
    const business = businesses.find(b => b.email === email && b.password === password)
    if (business) {
      setCurrentUser(business)
      setIsAuthenticated(true)
      return true
    }
    return false
  }

  const handleLogout = () => {
    setCurrentUser(null)
    setIsAuthenticated(false)
  }

  const addBusiness = (business) => {
    const newBusiness = {
      ...business,
      id: Date.now(),
      slug: business.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    }
    setBusinesses([...businesses, newBusiness])
  }

  const bookAppointment = (appointment) => {
    const newAppointment = {
      ...appointment,
      id: Date.now(),
      status: 'confirmed'
    }
    setAppointments([...appointments, newAppointment])
  }

  // Business Management Routes
  const BusinessManagement = () => {
    const [activeTab, setActiveTab] = useState('dashboard')

    if (!isAuthenticated) {
      return <Navigate to="/admin/login" replace />
    }

    return (
      <div className="min-h-screen bg-gray-25">
        <Navbar 
          activeTab={activeTab} 
          setActiveTab={setActiveTab}
          currentUser={currentUser}
          onLogout={handleLogout}
          isAdmin={true}
        />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {activeTab === 'dashboard' && (
            <BusinessDashboard 
              businesses={businesses}
              appointments={appointments}
              currentUser={currentUser}
            />
          )}
          {activeTab === 'calendar' && (
            <BusinessCalendar 
              appointments={appointments.filter(apt => apt.businessId === currentUser.id)}
              currentUser={currentUser}
            />
          )}
        </main>
      </div>
    )
  }

  // Admin Login Route
  const AdminLogin = () => {
    const [activeTab, setActiveTab] = useState('login')

    if (isAuthenticated) {
      return <Navigate to="/admin" replace />
    }

    return (
      <div className="min-h-screen bg-gray-25">
        <Login 
          onLogin={handleLogin}
          onRegister={() => setActiveTab('register')}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onBusinessRegistered={addBusiness}
        />
      </div>
    )
  }

  return (
    <Router>
      <Routes>
        {/* Business Management Routes */}
        <Route path="/admin" element={<BusinessManagement />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        
        {/* Public Business Booking Routes */}
        <Route path="/:businessSlug" element={
          <BusinessBookingPage 
            businesses={businesses}
            onBookAppointment={bookAppointment}
          />
        } />
        
        {/* Default route - redirect to admin */}
        <Route path="/" element={<Navigate to="/admin/login" replace />} />
      </Routes>
    </Router>
  )
}

export default App
