import { useState } from 'react'

const BusinessCalendar = ({ appointments, currentUser }) => {
  const [currentMonth, setCurrentMonth] = useState(new Date())

  const getDaysInMonth = (date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()
    
    return { daysInMonth, startingDayOfWeek }
  }

  const getPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  const getNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const formatDate = (date) => {
    return date.toISOString().split('T')[0]
  }

  const getAppointmentsForDate = (day) => {
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = formatDate(dateToCheck)
    return appointments.filter(appointment => formatDate(new Date(appointment.date)) === dateString)
  }

  const hasAppointments = (day) => {
    const appointmentsForDay = getAppointmentsForDate(day)
    return appointmentsForDay.length > 0
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Appointment Calendar</h1>
        <p className="text-gray-500 font-light">View and manage your appointments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            {/* Calendar Header */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={getPreviousMonth}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h2 className="text-lg font-light text-gray-900">
                {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
              </h2>
              <button
                onClick={getNextMonth}
                className="p-2 hover:bg-gray-50 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>

            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day Headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center py-2 text-xs font-light text-gray-400">
                  {day}
                </div>
              ))}

              {/* Empty cells for days before the first day of the month */}
              {Array.from({ length: startingDayOfWeek }, (_, i) => (
                <div key={`empty-${i}`} className="h-16"></div>
              ))}

              {/* Calendar days */}
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1
                const appointmentsForDay = getAppointmentsForDate(day)
                const hasAppts = hasAppointments(day)
                const isToday = formatDate(new Date()) === formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))

                return (
                  <div
                    key={day}
                    className={`
                      h-16 relative p-1 text-sm font-light rounded-lg transition-colors
                      ${isToday ? 'ring-1 ring-blue-200' : ''}
                      ${hasAppts ? 'bg-blue-25' : 'hover:bg-gray-50'}
                    `}
                  >
                    <span className="block text-gray-900">{day}</span>
                    {hasAppts && (
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                        <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      </div>
                    )}
                    {appointmentsForDay.length > 0 && (
                      <div className="absolute top-1 right-1">
                        <span className="text-xs bg-blue-50 text-blue-600 px-1 rounded-full font-light">
                          {appointmentsForDay.length}
                        </span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-400 font-light">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                  <span>Has Appointments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="text-lg font-light text-gray-900 mb-4">Today's Appointments</h2>
          
          {(() => {
            const today = formatDate(new Date())
            const todaysAppointments = appointments.filter(apt => formatDate(new Date(apt.date)) === today)
            
            if (todaysAppointments.length === 0) {
              return (
                <div className="text-center py-8">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 font-light">No appointments today</p>
                </div>
              )
            }

            return (
              <div className="space-y-3">
                {todaysAppointments
                  .sort((a, b) => a.time.localeCompare(b.time))
                  .map(appointment => (
                    <div key={appointment.id} className="p-4 bg-gray-25 rounded-lg border border-gray-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-sm font-light text-gray-900 mb-1">{appointment.customerName}</h3>
                          <p className="text-xs text-gray-600 mb-1">{appointment.serviceName}</p>
                          <p className="text-xs text-gray-500">${appointment.servicePrice}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-600 font-light">
                            {formatTime(appointment.time)}
                          </p>
                          <p className="text-xs text-gray-400">{appointment.customerEmail}</p>
                        </div>
                      </div>
                    </div>
                  ))}
              </div>
            )
          })()}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="mt-8 bg-white rounded-lg border border-gray-100 p-6">
        <h2 className="text-lg font-light text-gray-900 mb-4">Upcoming Appointments</h2>
        
        {(() => {
          const now = new Date()
          const upcoming = appointments
            .filter(apt => new Date(`${apt.date}T${apt.time}`) > now)
            .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
            .slice(0, 10)

          if (upcoming.length === 0) {
            return (
              <div className="text-center py-8">
                <p className="text-sm text-gray-500 font-light">No upcoming appointments</p>
              </div>
            )
          }

          return (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="text-left py-2 font-light text-gray-600">Customer</th>
                    <th className="text-left py-2 font-light text-gray-600">Service</th>
                    <th className="text-left py-2 font-light text-gray-600">Date & Time</th>
                    <th className="text-left py-2 font-light text-gray-600">Price</th>
                  </tr>
                </thead>
                <tbody>
                  {upcoming.map(appointment => (
                    <tr key={appointment.id} className="border-b border-gray-50">
                      <td className="py-3">
                        <div>
                          <p className="text-sm font-light text-gray-900">{appointment.customerName}</p>
                          <p className="text-xs text-gray-500">{appointment.customerEmail}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-light text-gray-900">{appointment.serviceName}</p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-light text-gray-900">
                          {new Date(`${appointment.date}T${appointment.time}`).toLocaleString('en-US', {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                          })}
                        </p>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-light text-gray-900">${appointment.servicePrice}</p>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        })()}
      </div>
    </div>
  )
}

export default BusinessCalendar 