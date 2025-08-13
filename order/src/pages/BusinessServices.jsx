import { useState, useEffect } from 'react'
import apiService from '../services/api'

const BusinessServices = ({ business }) => {
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(false)
  const [newService, setNewService] = useState({
    name: '',
    duration: '',
    price: '',
    description: ''
  })

  // Business hours state - using individual time slots (30-minute increments)
  // Note: Slot numbers will be calculated dynamically based on 5:00 AM start time
  const [businessHours, setBusinessHours] = useState({
    monday: { selectedSlots: [], isOpen: true }, // Will auto-populate 9-5 on first click
    tuesday: { selectedSlots: [], isOpen: true },
    wednesday: { selectedSlots: [], isOpen: true },
    thursday: { selectedSlots: [], isOpen: true },
    friday: { selectedSlots: [], isOpen: true },
    saturday: { selectedSlots: [], isOpen: true },
    sunday: { selectedSlots: [], isOpen: false }
  })

  const [showTimeSelector, setShowTimeSelector] = useState(null) // { day: 'monday' }
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [closedDates, setClosedDates] = useState(new Set()) // Set of closed dates in YYYY-MM-DD format

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

  const getDateString = (date) => {
    return date.toISOString().split('T')[0] // YYYY-MM-DD format
  }

  const isDateClosed = (date) => {
    const dateString = getDateString(date)
    return closedDates.has(dateString)
  }

  const isDayAvailable = (date) => {
    if (isDateClosed(date)) return false
    const dayKey = getDayOfWeekKey(date)
    return businessHours[dayKey].isOpen && businessHours[dayKey].selectedSlots?.length > 0
  }

  const isDayOpen = (date) => {
    if (isDateClosed(date)) return false
    const dayKey = getDayOfWeekKey(date)
    return businessHours[dayKey].isOpen
  }

  const toggleDateClosed = (date) => {
    const dateString = getDateString(date)
    const newClosedDates = new Set(closedDates)
    
    if (newClosedDates.has(dateString)) {
      newClosedDates.delete(dateString)
    } else {
      newClosedDates.add(dateString)
    }
    
    setClosedDates(newClosedDates)
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

  // Load services for the business
  useEffect(() => {
    if (business?.id) {
      loadServices()
      loadBusinessHours()
    }
  }, [business?.id])

  const loadServices = async () => {
    try {
      setLoading(true)
      const servicesData = await apiService.getBusinessServices(business.id)
      setServices(servicesData)
    } catch (error) {
      console.error('Failed to load services:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadBusinessHours = async () => {
    try {
      if (business?.id) {
        console.log('🔄 Loading business hours for business ID:', business.id)
        
        // Load business hours (required)
        const hoursData = await apiService.getBusinessHours(business.id)
        console.log('✅ Loaded business hours:', hoursData)
        setBusinessHours(hoursData)
        
        // Try to load closed dates (optional - may fail if table doesn't exist)
        try {
          const closedDatesData = await apiService.getClosedDates(business.id)
          console.log('✅ Loaded closed dates:', closedDatesData)
          
          // Convert closed dates array to Set for faster lookup
          if (closedDatesData?.closed_dates) {
            setClosedDates(new Set(closedDatesData.closed_dates))
          }
        } catch (closedDatesError) {
          console.warn('⚠️ Could not load closed dates (table may not exist):', closedDatesError.message)
          // Keep using local state for closed dates until table is created
        }
      } else {
        console.log('❌ No business ID available for loading hours')
      }
    } catch (error) {
      console.error('❌ Failed to load business hours:', error)
      // Keep default empty state if loading fails
    }
  }

  const handleServiceChange = (index, field, value) => {
    const updatedServices = [...services]
    updatedServices[index] = {
      ...updatedServices[index],
      [field]: field === 'duration' || field === 'price' ? Number(value) : value
    }
    setServices(updatedServices)
  }

  const addService = async () => {
    if (newService.name && newService.duration && newService.price) {
      try {
        setLoading(true)
        const serviceData = {
          business_id: business.id,
          name: newService.name,
          description: newService.description || `Professional ${newService.name} service`,
          duration: Number(newService.duration),
          price: Number(newService.price)
        }
        
        await apiService.createService(serviceData)
        setNewService({ name: '', duration: '', price: '', description: '' })
        loadServices() // Reload services
      } catch (error) {
        console.error('Failed to add service:', error)
        alert('Failed to add service. Please try again.')
      } finally {
        setLoading(false)
      }
    }
  }

  const removeService = async (serviceId) => {
    try {
      setLoading(true)
      await apiService.deleteService(serviceId)
      loadServices() // Reload services
    } catch (error) {
      console.error('Failed to remove service:', error)
      alert('Failed to remove service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const updateService = async (serviceId, updates) => {
    try {
      setLoading(true)
      await apiService.updateService(serviceId, updates)
      loadServices() // Reload services
    } catch (error) {
      console.error('Failed to update service:', error)
      alert('Failed to update service. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const toggleTimeSlot = (day, slotNumber) => {
    setBusinessHours(prev => {
      const currentSlots = prev[day].selectedSlots || []
      const newSlots = currentSlots.includes(slotNumber)
        ? currentSlots.filter(slot => slot !== slotNumber)
        : [...currentSlots, slotNumber].sort((a, b) => a - b)
      
      return {
        ...prev,
        [day]: {
          ...prev[day],
          selectedSlots: newSlots
        }
      }
    })
  }

  const toggleDayOpen = (day) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        isOpen: !prev[day].isOpen,
        selectedSlots: prev[day].isOpen ? [] : prev[day].selectedSlots
      }
    }))
  }

  const openTimeSelector = (day) => {
    // If no slots are selected, auto-select 9 AM to 5 PM (slots 8-16: 9:00 AM to 5:00 PM)
    if (!businessHours[day].selectedSlots || businessHours[day].selectedSlots.length === 0) {
      const defaultSlots = []
      // Find 9:00 AM slot (should be slot 8: 5:00, 5:30, 6:00, 6:30, 7:00, 7:30, 8:00, 8:30, 9:00)
      const nineAmSlot = timeSlots.findIndex(slot => slot.time12 === '9:00 AM')
      // Find 5:00 PM slot 
      const fivePmSlot = timeSlots.findIndex(slot => slot.time12 === '5:00 PM')
      
      if (nineAmSlot !== -1 && fivePmSlot !== -1) {
        for (let i = nineAmSlot; i <= fivePmSlot; i++) {
          defaultSlots.push(i)
        }
        
        setBusinessHours(prev => ({
          ...prev,
          [day]: {
            ...prev[day],
            selectedSlots: defaultSlots
          }
        }))
      }
    }
    
    setShowTimeSelector(day)
  }

  const clearAllSlots = (day) => {
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        selectedSlots: []
      }
    }))
  }

  const selectAllSlots = (day) => {
    const allSlots = timeSlots.map(slot => slot.slot)
    setBusinessHours(prev => ({
      ...prev,
      [day]: {
        ...prev[day],
        selectedSlots: allSlots
      }
    }))
  }

  const selectDefaultHours = (day) => {
    const defaultSlots = []
    const nineAmSlot = timeSlots.findIndex(slot => slot.time12 === '9:00 AM')
    const fivePmSlot = timeSlots.findIndex(slot => slot.time12 === '5:00 PM')
    
    if (nineAmSlot !== -1 && fivePmSlot !== -1) {
      for (let i = nineAmSlot; i <= fivePmSlot; i++) {
        defaultSlots.push(i)
      }
      
      setBusinessHours(prev => ({
        ...prev,
        [day]: {
          ...prev[day],
          selectedSlots: defaultSlots
        }
      }))
    }
  }

  const saveBusinessHours = async () => {
    try {
      setLoading(true)
      if (business?.id) {
        console.log('💾 Saving business hours for business ID:', business.id)
        console.log('📊 Business hours data:', businessHours)
        console.log('📅 Closed dates data:', Array.from(closedDates))
        
        // Save business hours (required)
        const hoursResult = await apiService.updateBusinessHours(business.id, businessHours)
        console.log('✅ Hours save result:', hoursResult)
        
        // Try to save closed dates (optional - may fail if table doesn't exist)
        try {
          const closedDatesResult = await apiService.updateClosedDatesBulk(business.id, Array.from(closedDates))
          console.log('✅ Closed dates save result:', closedDatesResult)
          alert('Business hours and availability saved successfully!')
        } catch (closedDatesError) {
          console.warn('⚠️ Could not save closed dates (table may not exist):', closedDatesError.message)
          alert('Business hours saved successfully! (Note: Closed dates will be saved once database is updated)')
        }
      } else {
        console.log('❌ No business ID available for saving hours')
        alert('No business ID available. Please try logging in again.')
      }
    } catch (error) {
      console.error('❌ Failed to save business hours:', error)
      alert('Failed to save business hours. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-light text-gray-900">Services & Hours</h2>
        <p className="text-gray-500 font-light mt-1">
          Manage your services and business hours
        </p>
      </div>


      {/* Business Hours Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-light text-gray-900">Business Hours</h3>
          <p className="text-sm text-gray-500 font-light mt-1">
            Set your operating hours for each day of the week
          </p>
        </div>
        <div className="p-8">
          <div className="flex gap-8">
            {/* Monthly Availability Calendar - Left Side */}
            <div className="flex-1 max-w-md">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-4">
                <h4 className="text-sm font-light text-gray-900">Monthly Availability</h4>
                <div className="flex items-center space-x-2">
                  <button
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
                  const isClosed = isDateClosed(date)
                  const isAvailable = isDayAvailable(date)
                  const isOpen = isDayOpen(date)
                  const isPast = date < new Date().setHours(0, 0, 0, 0)
                  
                  return (
                    <button
                      key={index}
                      className={`
                        relative text-sm font-light min-h-[3.5rem] flex items-center justify-center p-3 border-0 
                        rounded-lg transition-all duration-200 cursor-pointer group
                        ${!isCurrentMonth 
                          ? 'text-gray-300 bg-transparent hover:bg-gray-25 hover:text-gray-400' 
                          : isPast
                            ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                            : isClosed
                              ? 'text-white bg-red-500 hover:bg-green-500'
                              : isAvailable 
                                ? 'text-white bg-green-500 hover:bg-red-500 font-medium'
                                : isOpen 
                                  ? 'text-amber-900 bg-yellow-400 hover:bg-red-500 hover:text-white'
                                  : 'text-gray-600 bg-transparent hover:bg-red-500 hover:text-white'
                        }
                        ${isToday && isCurrentMonth ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                      `}
                      onClick={() => {
                        if (isCurrentMonth && !isPast) {
                          toggleDateClosed(date)
                        }
                      }}
                      title={
                        !isCurrentMonth 
                          ? '' 
                          : isPast
                            ? `${date.getDate()} - Past date`
                            : isClosed
                              ? `${date.getDate()} - Closed (click to open)`
                              : isAvailable 
                                ? `${date.getDate()} - Available (click to close)`
                                : isOpen 
                                  ? `${date.getDate()} - Open but no times set (click to close)`
                                  : `${date.getDate()} - Follows ${getDayOfWeekKey(date)} schedule (click to close this date)`
                      }
                    >
                      <span className="group-hover:opacity-0 transition-opacity duration-200">
                        {date.getDate()}
                      </span>
                      
                      {/* Hover overlay with white checkmark or X */}
                      {isCurrentMonth && !isPast && (
                        <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                          <span className="text-white text-lg font-bold">
                            {isClosed ? '✓' : '✕'}
                          </span>
                        </div>
                      )}
                    </button>
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
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-600">Open</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span className="text-gray-600">Closed</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <div className="w-3 h-3 border-2 border-blue-400 rounded"></div>
                    <span className="text-gray-500">Today</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Business Hours Details - Right Side */}
            <div className="flex-1">
              <div className="space-y-3">
                {daysOfWeek.map(({ key, label }) => (
                  <div key={key} className="flex items-center justify-between py-2 border-l-4 pl-4" style={{
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
                      <div className="flex items-center space-x-2">
                        <button
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
                      <span className="text-xs text-gray-400 font-light">Closed</span>
                    )}
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between items-center">
                <p className="text-xs text-gray-500 font-light">Click calendar days or time buttons to change hours</p>
                <button
                  onClick={saveBusinessHours}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-light transition-colors disabled:opacity-50"
                >
                  {loading ? 'Saving...' : 'Save Hours'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Time Selector Modal */}
      {showTimeSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowTimeSelector(null)}>
          <div className="bg-white rounded-lg p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h4 className="text-lg font-light text-gray-900">
                Select Available Times
              </h4>
              <button
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
                onClick={() => selectDefaultHours(showTimeSelector)}
                className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded text-xs font-light border border-blue-200 transition-colors"
              >
                Default (9-5)
              </button>
              <button
                onClick={() => selectAllSlots(showTimeSelector)}
                className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-700 rounded text-xs font-light border border-green-200 transition-colors"
              >
                Select All
              </button>
              <button
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

      {/* Services Section */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-light text-gray-900">Services</h3>
          <p className="text-sm text-gray-500 font-light mt-1">
            Manage the services you offer to customers
          </p>
        </div>
        <div className="p-6 space-y-6">
          {/* Add New Service */}
          <div className="bg-gray-25 rounded-lg p-6 border border-gray-200">
            <h4 className="text-sm font-light text-gray-900 mb-4">Add New Service</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-light text-gray-600 mb-2">Service Name</label>
                <input
                  type="text"
                  placeholder="e.g., Haircut"
                  value={newService.name}
                  onChange={(e) => setNewService(prev => ({ ...prev, name: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                />
              </div>
              <div>
                <label className="block text-xs font-light text-gray-600 mb-2">Duration (minutes)</label>
                <input
                  type="number"
                  placeholder="30"
                  value={newService.duration}
                  onChange={(e) => setNewService(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                />
              </div>
              <div>
                <label className="block text-xs font-light text-gray-600 mb-2">Price ($)</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="25.00"
                  value={newService.price}
                  onChange={(e) => setNewService(prev => ({ ...prev, price: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                />
              </div>
              <div className="flex items-end">
                <button
                  onClick={addService}
                  disabled={loading || !newService.name || !newService.duration || !newService.price}
                  className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-light transition-colors disabled:opacity-50"
                >
                  {loading ? 'Adding...' : 'Add Service'}
                </button>
              </div>
            </div>
            <div className="mt-4">
              <label className="block text-xs font-light text-gray-600 mb-2">Description (optional)</label>
              <input
                type="text"
                placeholder="Brief description of the service"
                value={newService.description}
                onChange={(e) => setNewService(prev => ({ ...prev, description: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
              />
            </div>
          </div>

          {/* Existing Services */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-light text-gray-900">Current Services</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, index) => (
                  <div key={service.id} className="p-4 bg-white rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="text-sm font-light text-gray-900">{service.name}</h5>
                      <button
                        onClick={() => removeService(service.id)}
                        disabled={loading}
                        className="text-red-500 hover:text-red-600 text-xs font-light disabled:opacity-50"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-xs font-light text-gray-600 mb-1">Duration (minutes)</label>
                        <input
                          type="number"
                          value={service.duration}
                          onChange={(e) => handleServiceChange(index, 'duration', e.target.value)}
                          onBlur={() => updateService(service.id, { duration: service.duration })}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-light text-gray-600 mb-1">Price ($)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={service.price}
                          onChange={(e) => handleServiceChange(index, 'price', e.target.value)}
                          onBlur={() => updateService(service.id, { price: service.price })}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-light text-gray-600 mb-1">Description</label>
                        <input
                          type="text"
                          value={service.description || ''}
                          onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                          onBlur={() => updateService(service.id, { description: service.description })}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                          placeholder="Service description"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {services.length === 0 && !loading && (
            <div className="text-center py-8">
              <p className="text-gray-500 font-light">No services added yet</p>
              <p className="text-sm text-gray-400 font-light mt-1">Add your first service above to get started</p>
            </div>
          )}

          {loading && (
            <div className="text-center py-8">
              <p className="text-gray-500 font-light">Loading services...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default BusinessServices
