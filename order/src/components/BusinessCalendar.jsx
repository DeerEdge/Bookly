import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BusinessCalendar = ({ appointments, currentUser }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  const formatDate = (date) => {
    return date.toISOString().split('T')[0];
  };

  const getAppointmentsForDate = (date) => {
    const dateString = formatDate(date);
    return appointments.filter(appointment => {
      // Handle both old and new data structure
      const appointmentDate = appointment.appointment_date || appointment.date;
      return formatDate(new Date(appointmentDate)) === dateString;
    });
  };

  const getDaysInMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getPreviousMonthDays = (date) => {
    const firstDay = getFirstDayOfMonth(date);
    const prevMonth = new Date(date.getFullYear(), date.getMonth() - 1, 0);
    const prevMonthDays = prevMonth.getDate();
    const days = [];
    
    for (let i = firstDay - 1; i >= 0; i--) {
      days.push(prevMonthDays - i);
    }
    return days;
  };

  const getNextMonthDays = (date) => {
    const daysInMonth = getDaysInMonth(date);
    const firstDay = getFirstDayOfMonth(date);
    const totalCells = 42; // 6 rows × 7 days
    const usedCells = firstDay + daysInMonth;
    const remainingCells = totalCells - usedCells;
    
    return Array.from({ length: remainingCells }, (_, i) => i + 1);
  };

  const navigateMonth = (direction) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(currentDate.getMonth() + direction);
    setCurrentDate(newDate);
  };

  const selectDate = (day, isPrevMonth = false, isNextMonth = false) => {
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();
    
    if (isPrevMonth) {
      month = month === 0 ? 11 : month - 1;
      year = month === 11 ? year - 1 : year;
    } else if (isNextMonth) {
      month = month === 11 ? 0 : month + 1;
      year = month === 0 ? year + 1 : year;
    }
    
    const newSelectedDate = new Date(year, month, day);
    setSelectedDate(newSelectedDate);
    
    if (isPrevMonth || isNextMonth) {
      setCurrentDate(newSelectedDate);
    }
  };

  const isToday = (day, isPrevMonth = false, isNextMonth = false) => {
    const today = new Date();
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();
    
    if (isPrevMonth) {
      month = month === 0 ? 11 : month - 1;
      year = month === 11 ? year - 1 : year;
    } else if (isNextMonth) {
      month = month === 11 ? 0 : month + 1;
      year = month === 0 ? year + 1 : year;
    }
    
    return (
      today.getDate() === day &&
      today.getMonth() === month &&
      today.getFullYear() === year
    );
  };

  const isSelected = (day, isPrevMonth = false, isNextMonth = false) => {
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();
    
    if (isPrevMonth) {
      month = month === 0 ? 11 : month - 1;
      year = month === 11 ? year - 1 : year;
    } else if (isNextMonth) {
      month = month === 11 ? 0 : month + 1;
      year = month === 0 ? year + 1 : year;
    }
    
    return (
      selectedDate.getDate() === day &&
      selectedDate.getMonth() === month &&
      selectedDate.getFullYear() === year
    );
  };

  const hasAppointments = (day, isPrevMonth = false, isNextMonth = false) => {
    let month = currentDate.getMonth();
    let year = currentDate.getFullYear();
    
    if (isPrevMonth) {
      month = month === 0 ? 11 : month - 1;
      year = month === 11 ? year - 1 : year;
    } else if (isNextMonth) {
      month = month === 11 ? 0 : month + 1;
      year = month === 0 ? year + 1 : year;
    }
    
    const date = new Date(year, month, day);
    return getAppointmentsForDate(date).length > 0;
  };

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatSelectedDate = () => {
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const prevMonthDays = getPreviousMonthDays(currentDate);
    const nextMonthDays = getNextMonthDays(currentDate);
    const days = [];

    // Previous month days
    prevMonthDays.forEach((day) => {
      const hasApts = hasAppointments(day, true);
      days.push(
        <button
          key={`prev-${day}`}
          onClick={() => selectDate(day, true)}
          className={`
            relative text-sm font-light min-h-[3.5rem] flex items-center justify-center p-3 border-0 bg-transparent 
            rounded-lg transition-all duration-200 cursor-pointer text-gray-300
            hover:bg-gray-25 hover:text-gray-400
            ${isSelected(day, true) ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-300' : ''}
            ${isToday(day, true) ? 'bg-blue-25 text-blue-600 ring-1 ring-blue-200' : ''}
            ${hasApts ? 'font-medium' : ''}
          `}
        >
          {day}
          {hasApts && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            </div>
          )}
        </button>
      );
    });

    // Current month days
    for (let day = 1; day <= daysInMonth; day++) {
      const hasApts = hasAppointments(day);
      days.push(
        <button
          key={day}
          onClick={() => selectDate(day)}
          className={`
            relative text-sm font-light min-h-[3.5rem] flex items-center justify-center p-3 border-0 bg-transparent 
            rounded-lg transition-all duration-200 cursor-pointer
            hover:bg-gray-25
            ${isSelected(day) ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-300' : ''}
            ${isToday(day) ? 'bg-blue-25 text-blue-600 ring-1 ring-blue-200' : ''}
            ${hasApts ? 'font-medium' : ''}
          `}
        >
          {day}
          {hasApts && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            </div>
          )}
        </button>
      );
    }

    // Next month days
    nextMonthDays.forEach((day) => {
      const hasApts = hasAppointments(day, false, true);
      days.push(
        <button
          key={`next-${day}`}
          onClick={() => selectDate(day, false, true)}
          className={`
            relative text-sm font-light min-h-[3.5rem] flex items-center justify-center p-3 border-0 bg-transparent 
            rounded-lg transition-all duration-200 cursor-pointer text-gray-300
            hover:bg-gray-25 hover:text-gray-400
            ${isSelected(day, false, true) ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-300' : ''}
            ${isToday(day, false, true) ? 'bg-blue-25 text-blue-600 ring-1 ring-blue-200' : ''}
            ${hasApts ? 'font-medium' : ''}
          `}
        >
          {day}
          {hasApts && (
            <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
              <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
            </div>
          )}
        </button>
      );
    });

    return days;
  };

  const selectedAppointments = getAppointmentsForDate(selectedDate);

  return (
    <div className="space-y-8">
      {/* Header - matching dashboard layout */}
      <div>
        <h1 className="text-3xl font-light text-gray-900 mb-2">Calendar</h1>
        <p className="text-gray-600 font-light">View and manage your appointments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg border border-gray-200 p-8">
            {/* Navigation */}
            <div className="mb-6 flex justify-between items-center">
              <button
                onClick={() => navigateMonth(-1)}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-lg hover:bg-gray-25 border-0 bg-transparent"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <h2 className="text-xl font-light text-gray-900">
                {months[currentDate.getMonth()]} {currentDate.getFullYear()}
              </h2>
              
              <button
                onClick={() => navigateMonth(1)}
                className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-lg hover:bg-gray-25 border-0 bg-transparent"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            {/* Weekday headers */}
            <div className="mb-4 grid grid-cols-7">
              {weekdays.map((day) => (
                <div
                  key={day}
                  className="text-xs font-light text-gray-400 p-2 text-center uppercase tracking-wider"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div className="grid grid-cols-7 gap-2">
              {renderCalendarDays()}
            </div>
            
            {/* Legend */}
            <div className="mt-8 pt-6 border-t border-gray-200">
              <div className="flex items-center justify-center space-x-6 text-xs text-gray-400 font-light">
                <div className="flex items-center space-x-2">
                  <div className="w-1 h-1 bg-blue-400 rounded-full"></div>
                  <span>Has Appointments</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h2 className="text-lg font-light text-gray-900 mb-4">
            Appointments for {formatSelectedDate()}
          </h2>
          
          {selectedAppointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-25 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-light">No appointments on this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedAppointments
                .map(getAppointmentData)
                .sort((a, b) => a.time.localeCompare(b.time))
                .map(appointment => (
                  <div key={appointment.id} className="p-4 bg-gray-25 rounded-lg border border-gray-200">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-sm font-light text-gray-900 mb-1">{appointment.customer_name}</h3>
                        <p className="text-xs text-gray-600 mb-1">{appointment.service_name}</p>
                        <p className="text-xs text-gray-500">${appointment.service_price}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-gray-600 font-light">
                          {formatTime(appointment.time)}
                        </p>
                        <p className="text-xs text-gray-400">{appointment.customer_email}</p>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <h2 className="text-lg font-light text-gray-900 mb-4">Upcoming Appointments</h2>
        
        {(() => {
          const now = new Date()
          const upcoming = appointments
            .map(getAppointmentData)
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
                  <tr className="border-b border-gray-200">
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
                          <p className="text-sm font-light text-gray-900">{appointment.customer_name}</p>
                          <p className="text-xs text-gray-500">{appointment.customer_email}</p>
                        </div>
                      </td>
                      <td className="py-3">
                        <p className="text-sm font-light text-gray-900">{appointment.service_name}</p>
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
                        <p className="text-sm font-light text-gray-900">${appointment.service_price}</p>
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
  );
};

export default BusinessCalendar; 