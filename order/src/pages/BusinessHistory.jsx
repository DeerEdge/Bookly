import { useState, useMemo } from 'react'

const BusinessHistory = ({ appointments, currentUser }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('all')
  const [selectedService, setSelectedService] = useState('all')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [hoveredBar, setHoveredBar] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const appointmentsPerPage = 10

  const getAppointmentStatus = (appointment) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const now = new Date()
    
    // Check if date parsing failed
    if (isNaN(appointmentDateTime.getTime())) {
      console.warn('Invalid appointment date/time:', {
        date: appointment.date,
        time: appointment.time,
        customer: appointment.customer_name
      })
      // Default to confirmed for invalid dates
      return { text: 'Confirmed', style: 'bg-green-100 text-green-800' }
    }
    
    const isPast = appointmentDateTime < now
    const result = isPast 
      ? { text: 'Completed', style: 'bg-gray-100 text-gray-800' }
      : { text: 'Confirmed', style: 'bg-green-100 text-green-800' }
    
    // Debug the first few to see what's happening
    if (appointment.customer_name && (appointment.customer_name.includes('John') || appointment.customer_name.includes('Jane') || appointment.customer_name.includes('Alice'))) {
      console.log('Status Debug for', appointment.customer_name, ':', {
        date: appointment.date,
        time: appointment.time,
        appointmentDateTime: appointmentDateTime.toISOString(),
        now: now.toISOString(),
        isPast,
        result
      })
    }
    
    return result
  }

  // Helper function to get appointment data with fallbacks
  const getAppointmentData = (appointment) => {
    return {
      id: appointment.id,
      customer_name: appointment.customers?.name || appointment.customer_name,
      customer_email: appointment.customers?.email || appointment.customer_email,
      service_name: appointment.services?.name || appointment.service_name,
      service_price: appointment.services?.price || appointment.service_price,
      date: appointment.appointment_date || appointment.date,
      time: appointment.appointment_time || appointment.time,
      status: appointment.status
    };
  };

  // Transform appointments to use consistent data structure
  const transformedAppointments = appointments?.map(getAppointmentData) || [];

  // Calculate analytics
  const analytics = useMemo(() => {
    const now = new Date()
    const currentMonth = now.getMonth()
    const currentYear = now.getFullYear()
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
    const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear

    const allAppointments = transformedAppointments
    const currentMonthAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear
    })
    const lastMonthAppointments = allAppointments.filter(apt => {
      const aptDate = new Date(apt.date)
      return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === lastYear
    })

    const totalRevenue = allAppointments.reduce((sum, apt) => sum + apt.service_price, 0)
    const currentMonthRevenue = currentMonthAppointments.reduce((sum, apt) => sum + apt.service_price, 0)
    const lastMonthRevenue = lastMonthAppointments.reduce((sum, apt) => sum + apt.service_price, 0)

    const revenueChange = lastMonthRevenue > 0 
      ? ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : 0

    const appointmentChange = lastMonthAppointments.length > 0 
      ? ((currentMonthAppointments.length - lastMonthAppointments.length) / lastMonthAppointments.length) * 100 
      : 0

    // Service breakdown
    const serviceBreakdown = allAppointments.reduce((acc, apt) => {
      acc[apt.service_name] = (acc[apt.service_name] || 0) + 1
      return acc
    }, {})

    // Year data - all 12 months starting from January for the selected year
    const yearData = []
    for (let month = 0; month < 12; month++) {
      const monthAppointments = allAppointments.filter(apt => {
        const aptDate = new Date(apt.date)
        return aptDate.getMonth() === month && aptDate.getFullYear() === selectedYear
      })
      
      yearData.push({
        month: new Date(selectedYear, month).toLocaleDateString('en-US', { month: 'short' }),
        appointments: monthAppointments.length,
        revenue: monthAppointments.reduce((sum, apt) => sum + apt.service_price, 0),
        year: selectedYear,
        monthIndex: month,
        fullDate: new Date(selectedYear, month)
      })
    }

    return {
      totalAppointments: allAppointments.length,
      totalRevenue,
      currentMonthAppointments: currentMonthAppointments.length,
      currentMonthRevenue,
      lastMonthAppointments: lastMonthAppointments.length,
      lastMonthRevenue,
      revenueChange,
      appointmentChange,
      serviceBreakdown,
      yearData
    }
  }, [transformedAppointments, selectedYear])

  // Filter appointments based on selected period and service
  const filteredAppointments = useMemo(() => {
    let filtered = transformedAppointments

    // Filter by period
    if (selectedPeriod !== 'all') {
      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      if (selectedPeriod === 'this-month') {
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.date)
          return aptDate.getMonth() === currentMonth && aptDate.getFullYear() === currentYear
        })
      } else if (selectedPeriod === 'last-month') {
        const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1
        const lastYear = currentMonth === 0 ? currentYear - 1 : currentYear
        filtered = filtered.filter(apt => {
          const aptDate = new Date(apt.date)
          return aptDate.getMonth() === lastMonth && aptDate.getFullYear() === lastYear
        })
      }
    }

    // Filter by service
    if (selectedService !== 'all') {
      filtered = filtered.filter(apt => apt.service_name === selectedService)
    }

    return filtered
  }, [transformedAppointments, selectedPeriod, selectedService])

  const getServices = () => {
    const services = [...new Set(transformedAppointments.map(apt => apt.service_name))]
    return ['all', ...services]
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(1)}%`
  }

  const getMaxAppointments = (data) => {
    return Math.max(...data.map(d => d.appointments), 1)
  }

  const getMaxRevenue = (data) => {
    return Math.max(...data.map(d => d.revenue), 1)
  }

  // Get available years from appointments
  const getAvailableYears = () => {
    const years = [...new Set(transformedAppointments.map(apt => new Date(apt.date).getFullYear()))]
    return years.sort((a, b) => b - a) // Sort descending
  }

  const navigateYear = (direction) => {
    const availableYears = getAvailableYears()
    const currentIndex = availableYears.indexOf(selectedYear)
    
    if (direction === 'prev' && currentIndex < availableYears.length - 1) {
      setSelectedYear(availableYears[currentIndex + 1])
    } else if (direction === 'next' && currentIndex > 0) {
      setSelectedYear(availableYears[currentIndex - 1])
    }
  }

  const availableYears = getAvailableYears()
  const currentYearIndex = availableYears.indexOf(selectedYear)
  const canGoPrev = currentYearIndex < availableYears.length - 1
  const canGoNext = currentYearIndex > 0

  // Generate Y-axis scale with proper scaling
  const maxAppointments = getMaxAppointments(analytics.yearData)
  const yAxisMax = Math.ceil(maxAppointments * 1.2) // 20% higher than max for nice scaling
  
  // Create 3 intuitive scale values: 0, mid, max
  const scaleValues = [0, Math.round(yAxisMax / 2), yAxisMax]

  // Pagination logic
  const totalPages = Math.ceil(filteredAppointments.length / appointmentsPerPage)
  const startIndex = (currentPage - 1) * appointmentsPerPage
  const endIndex = startIndex + appointmentsPerPage
  const paginatedAppointments = filteredAppointments.slice(startIndex, endIndex)

  const goToPage = (page) => {
    setCurrentPage(page)
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1)
  }

  const goToNextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1)
  }

  // Debug logging
  console.log('Chart Data:', {
    maxAppointments,
    yAxisMax,
    scaleValues,
    yearData: analytics.yearData.map(d => ({ month: d.month, appointments: d.appointments }))
  })

  // Bar height calculation formula:
  // barHeight = (appointments / yAxisMax) * chartHeight
  // This ensures bars scale properly relative to the Y-axis maximum

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-light text-gray-900 mb-2">History & Analytics</h1>
        <p className="text-gray-600 font-light">Track your business performance over time</p>
      </div>

      {/* Analytics Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">Total Appointments</h3>
          <p className="text-xl sm:text-2xl font-light text-gray-900">{analytics.totalAppointments}</p>
          <p className={`text-xs font-light ${analytics.appointmentChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(analytics.appointmentChange)} from last month
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">Total Revenue</h3>
          <p className="text-xl sm:text-2xl font-light text-gray-900">{formatCurrency(analytics.totalRevenue)}</p>
          <p className={`text-xs font-light ${analytics.revenueChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatPercentage(analytics.revenueChange)} from last month
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">This Month</h3>
          <p className="text-xl sm:text-2xl font-light text-gray-900">{analytics.currentMonthAppointments}</p>
          <p className="text-xs text-gray-500 font-light">appointments</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">This Month Revenue</h3>
          <p className="text-xl sm:text-2xl font-light text-gray-900">{formatCurrency(analytics.currentMonthRevenue)}</p>
          <p className="text-xs text-gray-500 font-light">earned</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <div className="flex flex-wrap gap-4">
          <div>
            <label className="block text-xs font-light text-gray-600 mb-2">Time Period</label>
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            >
              <option value="all">All Time</option>
              <option value="this-month">This Month</option>
              <option value="last-month">Last Month</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-light text-gray-600 mb-2">Service</label>
            <select
              value={selectedService}
              onChange={(e) => setSelectedService(e.target.value)}
              className="px-3 py-2 border border-gray-200 rounded-lg text-sm font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
            >
              {getServices().map(service => (
                <option key={service} value={service}>
                  {service === 'all' ? 'All Services' : service}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Service Breakdown */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-light text-gray-900">Service Breakdown</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Object.entries(analytics.serviceBreakdown).map(([service, count]) => (
              <div key={service} className="p-4 bg-gray-25 rounded-lg border border-gray-200">
                <h4 className="text-sm font-light text-gray-900 mb-1">{service}</h4>
                <p className="text-2xl font-light text-gray-900">{count}</p>
                <p className="text-xs text-gray-500 font-light">appointments</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Monthly Chart with Year Navigation */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-light text-gray-900">Monthly Overview</h3>
              <p className="text-sm text-gray-500 font-light mt-1">Complete year view - all 12 months starting from January</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigateYear('prev')}
                disabled={!canGoPrev}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canGoPrev 
                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-25' 
                    : 'text-gray-200 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <span className="text-lg font-light text-gray-900 min-w-[60px] text-center">{selectedYear}</span>
              <button
                onClick={() => navigateYear('next')}
                disabled={!canGoNext}
                className={`p-2 rounded-lg transition-all duration-200 ${
                  canGoNext 
                    ? 'text-gray-400 hover:text-gray-600 hover:bg-gray-25' 
                    : 'text-gray-200 cursor-not-allowed'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 pt-15">
          {/* Chart with Y-axis */}
          <div className="relative h-50">
            {/* Y-axis grid lines and labels */}
            {scaleValues.map((value, index) => (
              <div key={index} className="absolute w-full flex items-center" style={{ bottom: `${(index / 2) * 100 + 14}%` }}>
                {value > 0 && <span className="text-xs text-gray-500 font-light w-2 text-right mr-2">{value}</span>}
                <div className="flex-1 h-px bg-gray-200"></div>
              </div>
            ))}
            
            {/* Chart bars */}
            <div className="absolute inset-0 grid grid-cols-12 gap-2 items-end h-full" >
              {analytics.yearData.map((data, index) => (
                <div key={index} className="flex flex-col items-center relative group h-full justify-end">
                  {/* Hover Tooltip */}
                  {hoveredBar === index && (
                    <div className="absolute bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg shadow-lg z-10 whitespace-nowrap">
                      <div className="font-medium">{data.month} {data.year}</div>
                      <div className="text-gray-300">{data.appointments} appointments</div>
                      <div className="text-green-400">{formatCurrency(data.revenue)}</div>
                    </div>
                  )}

                  {/* Bar */}
                  <div 
                    className="w-full bg-blue-500 rounded-t transition-all duration-200 cursor-pointer hover:bg-blue-600 relative"
                    style={{ 
                      height: `${Math.max((data.appointments / maxAppointments) * 100, 4)}%`,
                      minHeight: '4px',
                      maxHeight: '100%'
                    }}
                    onMouseEnter={() => setHoveredBar(index)}
                    onMouseLeave={() => setHoveredBar(null)}
                  >
                    {/* Number on top of bar */}
                    <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs text-gray-600 font-light">
                      {data.appointments}
                    </div>
                  </div>

                  {/* Month label */}
                  <span className="text-xs text-gray-500 mt-3 font-light">{data.month}</span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Chart Legend */}
          <div className="mt-6 flex items-center justify-center space-x-6 text-xs text-gray-500 font-light">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>Appointments</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-500 rounded"></div>
              <span>Revenue (hover to see)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Appointment History Table */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-light text-gray-900">Appointment History</h3>
              <p className="text-sm text-gray-500 font-light mt-1">
                Showing {startIndex + 1}-{Math.min(endIndex, filteredAppointments.length)} of {filteredAppointments.length} appointments
              </p>
            </div>
            
            {/* Pagination Controls - Top Right */}
            {totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <div className="text-sm text-gray-500 font-light mr-3">
                  Page {currentPage} of {totalPages}
                </div>
                <button
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                  className="px-3 py-2 text-sm font-light text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <button
                        key={pageNum}
                        onClick={() => goToPage(pageNum)}
                        className={`px-3 py-2 text-sm font-light rounded-lg transition-colors ${
                          currentPage === pageNum
                            ? 'bg-blue-500 text-white'
                            : 'text-gray-600 bg-white border border-gray-300 hover:bg-gray-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    );
                  })}
                </div>
                
                <button
                  onClick={goToNextPage}
                  disabled={currentPage === totalPages}
                  className="px-3 py-2 text-sm font-light text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-25">
              <tr>
                <th className="text-left p-4 text-xs font-light text-gray-500">Customer</th>
                <th className="text-left p-4 text-xs font-light text-gray-500">Service</th>
                <th className="text-left p-4 text-xs font-light text-gray-500">Date & Time</th>
                <th className="text-left p-4 text-xs font-light text-gray-500">Price</th>
                <th className="text-left p-4 text-xs font-light text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginatedAppointments.map(appointment => (
                <tr key={appointment.id} className="border-b border-gray-200">
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-light text-gray-900">{appointment.customer_name}</p>
                      <p className="text-xs text-gray-500">{appointment.customer_email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-light text-gray-900">{appointment.service_name}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-light text-gray-900">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-light text-gray-900">{formatCurrency(appointment.service_price)}</p>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const status = getAppointmentStatus(appointment)
                      return (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-light ${status.style}`}>
                          {status.text}
                        </span>
                      )
                    })()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BusinessHistory 