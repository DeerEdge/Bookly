import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Notification from '../components/Notification'
import useNotification from '../hooks/useNotification'

const BusinessRegistration = ({ onBusinessRegistered }) => {
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [businessInfo, setBusinessInfo] = useState({
    name: '',
    category: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    password: ''
  })
  const [services, setServices] = useState([])
  const [newService, setNewService] = useState({
    name: '',
    duration: '',
    price: ''
  })

  // Business hours state - using individual time slots (30-minute increments)
  const [businessHours, setBusinessHours] = useState({
    monday: { selectedSlots: [], isOpen: true },
    tuesday: { selectedSlots: [], isOpen: true },
    wednesday: { selectedSlots: [], isOpen: true },
    thursday: { selectedSlots: [], isOpen: true },
    friday: { selectedSlots: [], isOpen: true },
    saturday: { selectedSlots: [], isOpen: true },
    sunday: { selectedSlots: [], isOpen: false }
  })

  const [showTimeSelector, setShowTimeSelector] = useState(null) // { day: 'monday' }
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const categories = [
    'Hair Salon',
    'Massage',
    'Dental',
    'Medical',
    'Spa',
    'Beauty',
    'Fitness',
    'Consulting',
    'Other'
  ]

  // Generate time slots (30-minute increments from 5:00 AM to 11:30 PM)
  const generateTimeSlots = () => {
    const slots = []
    for (let hour = 5; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
        const hour12 = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
        const ampm = hour < 12 ? 'AM' : 'PM'
        const time12 = `${hour12}:${minute.toString().padStart(2, '0')} ${ampm}`
        slots.push({ time24, time12, slot: slots.length })
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  // Helper function to get time range display from selected slots
  const getTimeRangeDisplay = (selectedSlots) => {
    if (!selectedSlots || selectedSlots.length === 0) return 'No times selected'
    
    const sortedSlots = [...selectedSlots].sort((a, b) => a - b)
    const ranges = []
    let start = sortedSlots[0]
    let end = sortedSlots[0]
    
    for (let i = 1; i < sortedSlots.length; i++) {
      if (sortedSlots[i] === end + 1) {
        end = sortedSlots[i]
      } else {
        ranges.push(start === end ? 
          timeSlots[start]?.time12 : 
          `${timeSlots[start]?.time12} - ${timeSlots[end]?.time12}`
        )
        start = end = sortedSlots[i]
      }
    }
    ranges.push(start === end ? 
      timeSlots[start]?.time12 : 
      `${timeSlots[start]?.time12} - ${timeSlots[end]?.time12}`
    )
    
    return ranges.join(', ')
  }

  const daysOfWeek = [
    { key: 'monday', label: 'Monday' },
    { key: 'tuesday', label: 'Tuesday' },
    { key: 'wednesday', label: 'Wednesday' },
    { key: 'thursday', label: 'Thursday' },
    { key: 'friday', label: 'Friday' },
    { key: 'saturday', label: 'Saturday' },
    { key: 'sunday', label: 'Sunday' }
  ]

  // Calendar helper functions
  const getMonthName = (date) => {
    return date.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  }

  const getDayOfWeekKey = (date) => {
    const dayNames = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    return dayNames[date.getDay()]
  }

  const getCalendarDays = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    
    // Get first day of month
    const firstDay = new Date(year, month, 1)
    // Get last day of month
    const lastDay = new Date(year, month + 1, 0)
    
    // Get first day of calendar (might be from previous month)
    const calendarStart = new Date(firstDay)
    calendarStart.setDate(firstDay.getDate() - firstDay.getDay())
    
    // Generate 42 days (6 weeks)
    const days = []
    const currentDate = new Date(calendarStart)
    
    for (let i = 0; i < 42; i++) {
      days.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }
    
    return days
  }

  const navigateMonth = (direction) => {
    const newMonth = new Date(currentMonth)
    newMonth.setMonth(currentMonth.getMonth() + direction)
    setCurrentMonth(newMonth)
  }

  const toggleDayOpen = (dayKey) => {
    setBusinessHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        isOpen: !prev[dayKey].isOpen,
        selectedSlots: !prev[dayKey].isOpen ? prev[dayKey].selectedSlots : []
      }
    }))
  }

  const openTimeSelector = (dayKey) => {
    setShowTimeSelector(dayKey)
  }

  const toggleTimeSlot = (dayKey, slotIndex) => {
    setBusinessHours(prev => {
      const currentSlots = prev[dayKey].selectedSlots || []
      const newSlots = currentSlots.includes(slotIndex)
        ? currentSlots.filter(slot => slot !== slotIndex)
        : [...currentSlots, slotIndex].sort((a, b) => a - b)
      
      return {
        ...prev,
        [dayKey]: {
          ...prev[dayKey],
          selectedSlots: newSlots
        }
      }
    })
  }

  const selectDefaultHours = (dayKey) => {
    // Default 9 AM to 5 PM (18 slots: 9:00 AM to 5:00 PM)
    const defaultSlots = Array.from({ length: 18 }, (_, i) => i + 8) // Starting from 9 AM (slot 8)
    setBusinessHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        selectedSlots: defaultSlots
      }
    }))
  }

  const selectAllSlots = (dayKey) => {
    const allSlots = timeSlots.map((_, index) => index)
    setBusinessHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        selectedSlots: allSlots
      }
    }))
  }

  const clearAllSlots = (dayKey) => {
    setBusinessHours(prev => ({
      ...prev,
      [dayKey]: {
        ...prev[dayKey],
        selectedSlots: []
      }
    }))
  }

  const handleAddService = () => {
    if (newService.name && newService.duration && newService.price) {
      const service = {
        id: Date.now(),
        ...newService
      }
      setServices([...services, service])
      setNewService({ name: '', duration: '', price: '' })
    }
  }

  const handleRemoveService = (serviceId) => {
    setServices(services.filter(service => service.id !== serviceId))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!businessInfo.name || !businessInfo.category || !businessInfo.address || !businessInfo.email || !businessInfo.password) {
      showError('Please fill in all required fields')
      return
    }

    // Check if at least one day has business hours set
    const hasBusinessHours = Object.values(businessHours).some(day => 
      day.isOpen && day.selectedSlots && day.selectedSlots.length > 0
    )

    if (!hasBusinessHours) {
      showError('Please set business hours for at least one day')
      return
    }

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      const businessData = {
        ...businessInfo,
        services,
        businessHours,
        id: Date.now()
      }
      
      onBusinessRegistered(businessData)
      showSuccess('Business registered successfully!')
      
      // Reset form
      setBusinessInfo({
        name: '',
        category: '',
        description: '',
        address: '',
        phone: '',
        email: '',
        password: ''
      })
      setServices([])
      setBusinessHours({
        monday: { selectedSlots: [], isOpen: true },
        tuesday: { selectedSlots: [], isOpen: true },
        wednesday: { selectedSlots: [], isOpen: true },
        thursday: { selectedSlots: [], isOpen: true },
        friday: { selectedSlots: [], isOpen: true },
        saturday: { selectedSlots: [], isOpen: true },
        sunday: { selectedSlots: [], isOpen: false }
      })
    } catch (error) {
      showError('Failed to register business. Please try again.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navigation Bar */}
      <nav className="bg-white border-b border-gray-200 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo and Brand */}
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
            
            {/* Right side navigation */}
            <div className="flex items-center space-x-4">
              <Link
                to="/manage/login"
                className="text-sm text-blue-600 hover:text-blue-500 font-light"
              >
                Already have an account? Sign in
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-gray-900 mb-2">Register Your Business</h1>
          <p className="text-gray-500 font-light">Set up your business profile and services</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div>
              <h2 className="text-lg font-light text-gray-900 mb-4">Business Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-light text-gray-600 mb-2">Business Name *</label>
                  <input
                    type="text"
                    value={businessInfo.name}
                    onChange={(e) => setBusinessInfo({...businessInfo, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                    placeholder="Your business name"
                  />
                </div>
                <div>
                  <label className="block text-xs font-light text-gray-600 mb-2">Category *</label>
                  <select
                    value={businessInfo.category}
                    onChange={(e) => setBusinessInfo({...businessInfo, category: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                  >
                    <option value="">Select category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-light text-gray-600 mb-2">Description</label>
                  <textarea
                    value={businessInfo.description}
                    onChange={(e) => setBusinessInfo({...businessInfo, description: e.target.value})}
                    rows="3"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                    placeholder="Brief description of your business"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-light text-gray-600 mb-2">Address *</label>
                  <input
                    type="text"
                    value={businessInfo.address}
                    onChange={(e) => setBusinessInfo({...businessInfo, address: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                    placeholder="Full business address"
                  />
                </div>
                <div>
                  <label className="block text-xs font-light text-gray-600 mb-2">Phone</label>
                  <input
                    type="tel"
                    value={businessInfo.phone}
                    onChange={(e) => setBusinessInfo({...businessInfo, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <label className="block text-xs font-light text-gray-600 mb-2">Email *</label>
                  <input
                    type="email"
                    value={businessInfo.email}
                    onChange={(e) => setBusinessInfo({...businessInfo, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                    placeholder="contact@business.com"
                  />
                </div>
                <div>
                  <label className="block text-xs font-light text-gray-600 mb-2">Password *</label>
                  <input
                    type="password"
                    value={businessInfo.password}
                    onChange={(e) => setBusinessInfo({...businessInfo, password: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                    placeholder="Create a password"
                  />
                </div>
              </div>
            </div>

            {/* Business Hours Section */}
            <div className="mt-8">
              <h2 className="text-lg font-light text-gray-900 mb-4">Business Hours</h2>
              <p className="text-sm text-gray-500 font-light mb-6">Set your operating hours for each day of the week</p>
              
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Monthly Availability Calendar - Left Side */}
                <div className="flex-1 max-w-md">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-light text-gray-900">Monthly Availability</h4>
                    <div className="flex items-center space-x-2">
                      <button
                        type="button"
                        onClick={() => navigateMonth(-1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Previous month"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <span className="text-sm font-medium text-gray-900 min-w-32 text-center">
                        {getMonthName(currentMonth)}
                      </span>
                      <button
                        type="button"
                        onClick={() => navigateMonth(1)}
                        className="p-1 hover:bg-gray-100 rounded transition-colors"
                        title="Next month"
                      >
                        <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays().map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                      const isToday = date.toDateString() === new Date().toDateString()
                      const dayKey = getDayOfWeekKey(date)
                      const isOpen = businessHours[dayKey].isOpen
                      const hasHours = businessHours[dayKey].selectedSlots?.length > 0
                      
                      return (
                        <div
                          key={index}
                          className={`
                            relative text-sm font-light min-h-[3.5rem] flex items-center justify-center p-3 border-0 
                            rounded-lg transition-all duration-200
                            ${!isCurrentMonth 
                              ? 'text-gray-300 bg-transparent' 
                              : isOpen && hasHours
                                ? 'text-white bg-green-500'
                                : isOpen
                                  ? 'text-amber-900 bg-yellow-400'
                                  : 'text-gray-600 bg-gray-100'
                            }
                            ${isToday && isCurrentMonth ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                            ${isOpen && !hasHours && isCurrentMonth ? 'animate-pulse' : ''}
                          `}
                        >
                          <span>{date.getDate()}</span>
                        </div>
                      )
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-4 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
                        <span className="text-gray-600">Closed</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 border-2 border-blue-400 rounded"></div>
                        <span className="text-gray-500">Today</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span className="text-gray-600">Please Select Times</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Business Hours Details - Right Side */}
                <div className="flex-1">
                  <div className="space-y-3">
                    {daysOfWeek.map(({ key, label }) => {
                      const isOpenWithoutHours = businessHours[key].isOpen && (!businessHours[key].selectedSlots || businessHours[key].selectedSlots.length === 0);
                      
                      return (
                      <div key={key} className={`flex items-center justify-between py-2 border-l-4 pl-4 ${isOpenWithoutHours ? 'animate-pulse' : ''}`} style={{
                        borderColor: businessHours[key].isOpen && businessHours[key].selectedSlots?.length > 0 
                          ? '#10b981' 
                          : businessHours[key].isOpen 
                            ? '#f59e0b'
                            : '#9ca3af'
                      }}>
                        <div className="flex items-center space-x-3">
                          <div className="w-20">
                            <span className="text-sm font-light text-gray-900">{label}</span>
                          </div>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={businessHours[key].isOpen}
                              onChange={() => toggleDayOpen(key)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="ml-2 text-xs text-gray-600">Open</span>
                          </label>
                        </div>
                        
                        {businessHours[key].isOpen ? (
                          <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-2">
                            <button
                              type="button"
                              onClick={() => openTimeSelector(key)}
                              className="px-3 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded text-xs font-light border border-blue-200 transition-colors max-w-48 truncate"
                              title={getTimeRangeDisplay(businessHours[key].selectedSlots)}
                            >
                              {businessHours[key].selectedSlots?.length > 0 
                                ? `${businessHours[key].selectedSlots.length} slots selected`
                                : 'Select times'
                              }
                            </button>
                            {businessHours[key].selectedSlots?.length > 0 && (
                              <span className="text-xs text-gray-500 font-light">
                                {getTimeRangeDisplay(businessHours[key].selectedSlots).length > 30 
                                  ? getTimeRangeDisplay(businessHours[key].selectedSlots).substring(0, 30) + '...'
                                  : getTimeRangeDisplay(businessHours[key].selectedSlots)
                                }
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500 font-light">Closed</span>
                        )}
                      </div>
                    )})}
                  </div>
                </div>
              </div>
            </div>

            {/* Services */}
            <div>
              <h2 className="text-lg font-light text-gray-900 mb-4">Services</h2>
              
              {/* Add Service Form */}
              <div className="bg-gray-25 rounded-lg p-4 mb-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Service Name</label>
                    <input
                      type="text"
                      value={newService.name}
                      onChange={(e) => setNewService({...newService, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      placeholder="e.g., Haircut"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Duration (minutes)</label>
                    <input
                      type="number"
                      value={newService.duration}
                      onChange={(e) => setNewService({...newService, duration: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      placeholder="30"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Price ($)</label>
                    <input
                      type="number"
                      value={newService.price}
                      onChange={(e) => setNewService({...newService, price: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      placeholder="45"
                    />
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleAddService}
                  className="mt-3 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors"
                >
                  Add Service
                </button>
              </div>

              {/* Services List */}
              {services.length > 0 && (
                <div className="space-y-2">
                  {services.map(service => (
                    <div key={service.id} className="flex items-center justify-between p-3 bg-gray-25 rounded-lg border border-gray-200">
                      <div>
                        <span className="text-sm font-light text-gray-900">{service.name}</span>
                        <span className="text-xs text-gray-500 ml-2">{service.duration} min</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-light text-gray-900">${service.price}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveService(service.id)}
                          className="text-red-400 hover:text-red-600"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light transition-colors text-sm"
            >
              Register Business
            </button>
          </form>
        </div>
      </div>

      {/* Time Selector Modal */}
      {showTimeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={() => setShowTimeSelector(null)}>
          <div className="bg-white rounded-lg p-4 sm:p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-light text-gray-900">
                Select Available Times
              </h4>
              <button
                type="button"
                onClick={() => setShowTimeSelector(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <p className="text-sm text-gray-500 font-light mb-4">
              {daysOfWeek.find(d => d.key === showTimeSelector)?.label} - Click multiple time slots to select when you're available
            </p>
            
            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 mb-4">
              <button
                type="button"
                onClick={() => selectDefaultHours(showTimeSelector)}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-light border border-blue-200 transition-colors"
              >
                Default (9-5)
              </button>
              <button
                type="button"
                onClick={() => selectAllSlots(showTimeSelector)}
                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-light border border-green-200 transition-colors"
              >
                Select All
              </button>
              <button
                type="button"
                onClick={() => clearAllSlots(showTimeSelector)}
                className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 rounded text-xs font-light border border-red-200 transition-colors"
              >
                Clear All
              </button>
              <span className="text-xs text-gray-500 font-light self-center">
                {businessHours[showTimeSelector]?.selectedSlots?.length || 0} slots selected
              </span>
            </div>
            
            <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
              {timeSlots.map((slot) => {
                const isSelected = businessHours[showTimeSelector]?.selectedSlots?.includes(slot.slot)
                
                return (
                  <button
                    key={slot.slot}
                    type="button"
                    onClick={() => toggleTimeSlot(showTimeSelector, slot.slot)}
                    className={`p-2 text-xs font-light rounded border transition-colors ${
                      isSelected
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white hover:bg-blue-50 text-gray-700 border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    {slot.time12}
                  </button>
                )
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-500 font-light mb-2">Selected times:</p>
              <p className="text-sm text-gray-700 font-light">
                {getTimeRangeDisplay(businessHours[showTimeSelector]?.selectedSlots)}
              </p>
            </div>
          </div>
        </div>
      )}

      <Notification
        message={notification.message}
        type={notification.type}
        isVisible={notification.isVisible}
        onClose={hideNotification}
        duration={notification.duration}
      />
    </div>
  )
}

export default BusinessRegistration 