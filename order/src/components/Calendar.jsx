import { useState } from 'react'

const Calendar = ({ selectedDate, onDateSelect, scheduledOrders }) => {
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

  const isDateSelected = (day) => {
    if (!selectedDate) return false
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    return formatDate(dateToCheck) === formatDate(selectedDate)
  }

  const hasScheduledOrder = (day) => {
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = formatDate(dateToCheck)
    return scheduledOrders.some(order => formatDate(new Date(order.date)) === dateString)
  }

  const getOrdersForDate = (day) => {
    const dateToCheck = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    const dateString = formatDate(dateToCheck)
    return scheduledOrders.filter(order => formatDate(new Date(order.date)) === dateString)
  }

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentMonth)
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const handleDateClick = (day) => {
    const clickedDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day)
    onDateSelect(clickedDate)
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      {/* Calendar Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={getPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-xl font-semibold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h2>
        <button
          onClick={getNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-1">
        {/* Day Headers */}
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="text-center py-2 text-sm font-medium text-gray-500">
            {day}
          </div>
        ))}

        {/* Empty cells for days before the first day of the month */}
        {Array.from({ length: startingDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="h-12"></div>
        ))}

        {/* Calendar days */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1
          const ordersForDay = getOrdersForDate(day)
          const isSelected = isDateSelected(day)
          const hasOrders = hasScheduledOrder(day)
          const isToday = formatDate(new Date()) === formatDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day))

          return (
            <button
              key={day}
              onClick={() => handleDateClick(day)}
              className={`
                h-12 relative p-1 text-sm font-medium rounded-lg transition-colors
                ${isSelected 
                  ? 'bg-blue-100 text-blue-700 border-2 border-blue-300' 
                  : 'hover:bg-gray-50 text-gray-900'
                }
                ${isToday ? 'ring-2 ring-blue-200' : ''}
              `}
            >
              <span className="block">{day}</span>
              {hasOrders && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                </div>
              )}
              {ordersForDay.length > 0 && (
                <div className="absolute top-1 right-1">
                  <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded-full">
                    {ordersForDay.length}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-center space-x-6 text-sm text-gray-600">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-100 border border-blue-300 rounded"></div>
            <span>Selected</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span>Has Orders</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Calendar 