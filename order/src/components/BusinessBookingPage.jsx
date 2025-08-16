import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import apiService from '../services/api';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import Notification from './Notification';
import useNotification from '../hooks/useNotification';

/** Utils */
const toLocalYYYYMMDD = (d) => {
  const dt = new Date(d);
  const yyyy = dt.getFullYear();
  const mm = String(dt.getMonth() + 1).padStart(2, '0');
  const dd = String(dt.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
};

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

const getCalendarDays = (currentMonth) => {
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

const navigateMonth = (currentMonth, setCurrentMonth, direction) => {
  const newMonth = new Date(currentMonth)
  newMonth.setMonth(currentMonth.getMonth() + direction)
  setCurrentMonth(newMonth)
}
const fmt12h = (hhmm) => {
  const [h, m] = hhmm.split(':').map(Number);
  return new Date(2000, 0, 1, h, m).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
};

/** Main Page */
const BusinessBookingPage = ({ onBookAppointment }) => {
  const { businessSlug } = useParams();
  const { notification, showError, hideNotification } = useNotification();

  // Config - now using real business hours from API

  const [business, setBusiness] = useState(null);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedDate, setSelectedDate] = useState(() => new Date());
  const [selectedTime, setSelectedTime] = useState('');

  const [customerInfo, setCustomerInfo] = useState({ name: '', email: '', phone: '' });

  const [submitting, setSubmitting] = useState(false);

  const [showQRPopup, setShowQRPopup] = useState(false);
  const [showAppointmentPopup, setShowAppointmentPopup] = useState(false);
  const [bookedAppointment, setBookedAppointment] = useState(null);
  
  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedCalendarDate, setSelectedCalendarDate] = useState(null);
  
  // Service search state
  const [serviceSearchTerm, setServiceSearchTerm] = useState('');

  const [bookings, setBookings] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);

  const apiDate = useMemo(() => toLocalYYYYMMDD(selectedDate), [selectedDate]);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!serviceSearchTerm.trim()) return services;
    return services.filter(service =>
      service.name.toLowerCase().includes(serviceSearchTerm.toLowerCase()) ||
      service.description?.toLowerCase().includes(serviceSearchTerm.toLowerCase())
    );
  }, [services, serviceSearchTerm]);

  // Normalize times for display
  const formatTime = (time) =>
    new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });

  useEffect(() => {
    const loadBusiness = async () => {
      try {
        setLoading(true);
        setError(null);
        const businessData = await apiService.getBusinessBySlug(businessSlug);
        setBusiness(businessData);

        if (businessData?.id) {
          try {
            const servicesData = await apiService.getBusinessServices(businessData.id);
            setServices(servicesData);
          } catch {
            setServices([]);
          }
        }
      } catch {
        setError('Business not found');
      } finally {
        setLoading(false);
      }
    };
    loadBusiness();
  }, [businessSlug]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (business?.id && apiDate) {
        try {
          const bookingsData = await apiService.getBookingsForBusiness(business.id, apiDate);
          setBookings(Array.isArray(bookingsData) ? bookingsData : []);
        } catch {
          setBookings([]);
        }
      } else {
        setBookings([]);
      }
    };
    fetchBookings();
  }, [business?.id, apiDate]);

  // Load available slots from business hours API
  useEffect(() => {
    const fetchAvailableSlots = async () => {
      if (business?.id && apiDate) {
        try {
          setSlotsLoading(true);
          const availabilityData = await apiService.getAvailableSlots(business.id, apiDate);
          setAvailableSlots(availabilityData.available_slots || []);
        } catch (error) {
          setAvailableSlots([]);
        } finally {
          setSlotsLoading(false);
        }
      } else {
        setAvailableSlots([]);
      }
    };
    fetchAvailableSlots();
  }, [business?.id, apiDate]);

  // Also load available slots when calendar date changes
  useEffect(() => {
    if (selectedCalendarDate && business?.id) {
      const calendarDateString = getDateString(selectedCalendarDate);
      
      const fetchSlotsForCalendarDate = async () => {
        try {
          setSlotsLoading(true);
          const availabilityData = await apiService.getAvailableSlots(business.id, calendarDateString);
          setAvailableSlots(availabilityData.available_slots || []);
        } catch (error) {
          setAvailableSlots([]);
        } finally {
          setSlotsLoading(false);
        }
      };
      
      fetchSlotsForCalendarDate();
    }
  }, [selectedCalendarDate, business?.id]);

  const handleBookAppointment = async (e) => {
    e.preventDefault();
    if (!selectedService || !apiDate || !selectedTime) {
      showError('Please choose a service, date, and time.');
      return;
    }
    if (!customerInfo.name || !customerInfo.email) {
      showError('Please provide your name and email.');
      return;
    }

    try {
      setSubmitting(true);


      const appointment = {
        business_id: business.id,
        business_name: business.name,
        service_name: selectedService.name,
        service_price: selectedService.price,
        date: apiDate,
        time: selectedTime,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        send_email_confirmation: true,
        status: 'confirmed',
      };

      await onBookAppointment(appointment);
      
      // Set the booked appointment data for the popup
      setBookedAppointment({
        ...appointment,
        businessName: business.name,
        formattedDate: selectedDate.toLocaleDateString('en-US', { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        }),
        formattedTime: fmt12h(selectedTime)
      });
      
      // Show the appointment confirmation popup
      setShowAppointmentPopup(true);

      // refresh bookings and available slots so the slot becomes unavailable
      try {
        const [refreshedBookings, refreshedAvailability] = await Promise.all([
          apiService.getBookingsForBusiness(business.id, apiDate),
          apiService.getAvailableSlots(business.id, apiDate)
        ]);
        setBookings(Array.isArray(refreshedBookings) ? refreshedBookings : []);
        setAvailableSlots(refreshedAvailability.available_slots || []);
      } catch (error) {
        // Silently handle refresh errors
      }

      // reset fields (keep date)
      setSelectedService(null);
      setSelectedTime('');
      setCustomerInfo({ name: '', email: '', phone: '' });

    } catch (err) {
      showError('Failed to book appointment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-25 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading business...</p>
        </div>
      </div>
    );
  }

  if (error || !business) {
    return <Navigate to="/manage/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header (kept) */}
        <div className="bg-white rounded-lg border border-gray-200 p-8 mb-8">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-light text-gray-900 mb-2">{business.name}</h1>
              <p className="text-gray-600 mb-4">{business.description}</p>
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>{business.category}</span>
                {business.address && (
                  <button
                    onClick={() => {
                      const encodedAddress = encodeURIComponent(business.address);
                      window.open(`https://maps.google.com/?q=${encodedAddress}`, '_blank');
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center space-x-1"
                    title="Click to open in Google Maps"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span>{business.address}</span>
                  </button>
                )}
                {business.phone && (
                  <button
                    onClick={() => {
                      window.open(`tel:${business.phone}`, '_self');
                    }}
                    className="text-blue-600 hover:text-blue-800 hover:underline cursor-pointer flex items-center space-x-1"
                    title="Click to call"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{business.phone}</span>
                  </button>
                )}
              </div>
            </div>

            {/* Share button modal is optional — keep if you use it */}
            {false && (
              <button
                onClick={() => setShowQRPopup(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-light flex items-center space-x-2"
              >
                Share
              </button>
            )}
          </div>
        </div>

        {/* Booking Section */}
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          {/* Section Header */}
          <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-8 py-6 border-b border-gray-200">
            <h2 className="text-2xl font-light text-gray-900 mb-2">Book Your Appointment</h2>
            <p className="text-gray-600 text-sm">Select your preferred date, time, and service</p>
          </div>



          {/* Main Booking Content */}
          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column - Calendar */}
              <div className="space-y-6">
                <div className="flex items-center space-x-2 mb-4">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <h3 className="text-lg font-light text-gray-900">Select Date & Time</h3>
                </div>
                
                {/* Monthly Calendar */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  {/* Calendar Header */}
                  <div className="flex items-center justify-between mb-6">
                    <button
                      onClick={() => navigateMonth(currentMonth, setCurrentMonth, -1)}
                      className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-lg hover:bg-gray-50 border-0 bg-transparent"
                      aria-label="Previous month"
                    >
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    
                    <h3 className="text-lg font-medium text-gray-900">
                      {getMonthName(currentMonth)}
                    </h3>
                    
                    <button
                      onClick={() => navigateMonth(currentMonth, setCurrentMonth, 1)}
                      className="text-gray-400 hover:text-gray-600 transition-all duration-200 p-2 rounded-lg hover:bg-gray-50 border-0 bg-transparent"
                      aria-label="Next month"
                    >
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Day Headers */}
                  <div className="grid grid-cols-7 gap-1 mb-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                      <div key={day} className="text-center text-xs font-medium text-gray-500 py-2">
                        {day}
                      </div>
                    ))}
                  </div>

                  {/* Calendar Grid */}
                  <div className="grid grid-cols-7 gap-1">
                    {getCalendarDays(currentMonth).map((date, index) => {
                      const isCurrentMonth = date.getMonth() === currentMonth.getMonth()
                      const isToday = date.toDateString() === new Date().toDateString()
                      const isPast = date < new Date().setHours(0, 0, 0, 0)
                      const isSelected = selectedCalendarDate && selectedCalendarDate.toDateString() === date.toDateString()
                      const dateString = getDateString(date)
                      const dayKey = getDayOfWeekKey(date)
                      
                      // Make all future days clickable so users can check availability
                      // We'll show actual availability when they click on a day
                      const isAvailable = isCurrentMonth && !isPast
                      
                      return (
                        <button
                          key={index}
                          className={`
                            relative text-sm font-light min-h-[3rem] flex items-center justify-center p-2 border-0 
                            rounded-lg transition-all duration-200 cursor-pointer
                            ${!isCurrentMonth 
                              ? 'text-gray-300 bg-transparent' 
                              : isPast
                                ? 'text-gray-400 bg-gray-50 cursor-not-allowed'
                                : isSelected
                                  ? 'text-white bg-blue-600 ring-2 ring-blue-300'
                                  : isAvailable
                                    ? 'text-gray-600 bg-gray-200 hover:bg-gray-400'
                                    : 'text-gray-400 bg-gray-100 cursor-not-allowed'
                            }
                            ${isToday && isCurrentMonth ? 'ring-2 ring-blue-400 ring-offset-1' : ''}
                          `}
                          onClick={() => {
                            if (isAvailable) {
                              setSelectedCalendarDate(date)
                              setSelectedDate(date)
                              setSelectedTime('')
                            }
                          }}
                          disabled={!isCurrentMonth || isPast || !isAvailable}
                          title={
                            !isCurrentMonth 
                              ? '' 
                              : isPast
                                ? `${date.getDate()} - Past date`
                                : isAvailable
                                  ? `${date.getDate()} - Available for booking`
                                  : `${date.getDate()} - Business closed`
                          }
                        >
                          <span>{date.getDate()}</span>
                        </button>
                      )
                    })}
                  </div>
                  
                  {/* Legend */}
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-3 text-xs">
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        <span className="text-gray-600">Selected</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-200 rounded-full"></div>
                        <span className="text-gray-600">Available</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 bg-gray-100 rounded-full"></div>
                        <span className="text-gray-600">Not Available</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <div className="w-3 h-3 border-2 border-blue-400 rounded"></div>
                        <span className="text-gray-500">Today</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Time Slots Display - Always Visible */}
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h4 className="text-lg font-medium text-gray-900">
                      {selectedCalendarDate 
                        ? `Available Times for ${selectedCalendarDate.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}`
                        : 'Select a date to view available times'
                      }
                    </h4>
                  </div>
                  
                  {(() => {
                    if (!selectedCalendarDate) {
                      return (
                        <div className="text-center py-8">
                          <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                          <p className="text-gray-500 font-medium">No date selected</p>
                          <p className="text-sm text-gray-400">Click on a calendar date above to see available time slots</p>
                        </div>
                      );
                    }
                    
                    const dateString = getDateString(selectedCalendarDate);
                    
                    // Handle different data structures
                    let timesForDate = [];
                    
                    if (Array.isArray(availableSlots) && availableSlots.length > 0) {
                      // Check if availableSlots is an array of time strings (direct format)
                      if (typeof availableSlots[0] === 'string') {
                        timesForDate = availableSlots;
                      } else {
                        // Check if it's an array of objects with date and available_times
                        const slotsForDate = availableSlots.filter(slot => slot.date === dateString);
                        timesForDate = slotsForDate.flatMap(slot => slot.available_times || []);
                      }
                    }
                    

                    
                    if (slotsLoading) {
                      return (
                        <div className="text-center py-4">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
                          <p className="text-gray-500">Loading time slots...</p>
                        </div>
                      );
                    }
                    
                    if (timesForDate.length > 0) {
                      return (
                        <div className="space-y-3">
                          <div className="grid grid-cols-3 gap-2">
                            {timesForDate.map((time, index) => (
                              <button
                                key={index}
                                onClick={() => setSelectedTime(time)}
                                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all duration-200 ${
                                  selectedTime === time
                                    ? 'border-blue-500 bg-blue-50 text-blue-700 ring-2 ring-blue-200'
                                    : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 text-gray-700'
                                }`}
                              >
                                {fmt12h(time)}
                              </button>
                            ))}
                          </div>
                        </div>
                      );
                    } else {
                      return (
                        <div className="text-center py-4">
                          <p className="text-gray-500">No available time slots for this date</p>
                        </div>
                      );
                    }
                  })()}
                </div>
              </div>

              {/* Right Column - Booking Form */}
              <div className="space-y-6">

                {/* Service Selection */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    <h4 className="text-lg font-light text-gray-900">Choose Your Service</h4>
                  </div>
                  
                  {/* Search Bar */}
                  <div className="mb-4">
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                      <input
                        type="text"
                        placeholder="Search services..."
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                        value={serviceSearchTerm}
                        onChange={(e) => setServiceSearchTerm(e.target.value)}
                      />
                    </div>
                  </div>
                  
                  {services.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                      {filteredServices.map((service) => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedService(service)}
                          className={`p-4 rounded-lg border-2 text-left transition-all duration-200 ${
                            selectedService?.id === service.id
                              ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200 shadow-md'
                              : 'border-gray-200 hover:border-blue-300 hover:bg-blue-25 hover:shadow-sm'
                          }`}
                        >
                          <div className="space-y-2">
                            <div className="flex justify-between items-start">
                              <h5 className={`text-sm font-medium ${selectedService?.id === service.id ? 'text-blue-900' : 'text-gray-900'}`}>
                                {service.name}
                              </h5>
                              <span className={`text-base font-medium ${selectedService?.id === service.id ? 'text-blue-700' : 'text-gray-900'}`}>
                                ${service.price}
                              </span>
                            </div>
                            <p className="text-xs text-gray-500">{service.duration} minutes</p>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg">
                      <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.34 0-4.47-.881-6.08-2.33" />
                      </svg>
                      <p className="font-medium">No services available</p>
                      <p className="text-sm">Please contact the business directly</p>
                    </div>
                  )}
                </div>

                {/* Appointment Summary */}
                {(selectedService || selectedTime) && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-center space-x-2 mb-3">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h4 className="text-sm font-medium text-blue-900">Appointment Summary</h4>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <span className="text-gray-600">Date:</span>
                        <span className="ml-2 font-medium text-gray-900">{apiDate}</span>
                      </div>
                      <div>
                        <span className="text-gray-600">Time:</span>
                        <span className="ml-2 font-medium text-gray-900">
                          {selectedTime ? fmt12h(selectedTime) : '—'}
                        </span>
                      </div>
                      {selectedService && (
                        <div className="col-span-2">
                          <span className="text-gray-600">Service:</span>
                          <span className="ml-2 font-medium text-gray-900">
                            {selectedService.name} (${selectedService.price})
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Customer Information Form */}
                <form onSubmit={handleBookAppointment} className="space-y-5">
                  <div className="flex items-center space-x-2 mb-4">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h4 className="text-lg font-light text-gray-900">Your Information</h4>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Full Name *</label>
                      <input
                        type="text"
                        value={customerInfo.name}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                        placeholder="Enter your full name"
                        disabled={submitting}
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-2">Email *</label>
                      <input
                        type="email"
                        value={customerInfo.email}
                        onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                        className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                        placeholder="your@email.com"
                        disabled={submitting}
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Phone Number</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      className="w-full px-3 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-colors"
                      placeholder="(555) 123-4567"
                      disabled={submitting}
                    />
                  </div>

                  {/* Email Confirmation - Now Mandatory */}
                  <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <div className="text-sm text-blue-800">
                      <p className="font-medium">Email confirmation will be sent automatically</p>
                      <p className="text-blue-600">You'll receive your appointment details via email</p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={!selectedService || !apiDate || !selectedTime || submitting}
                    className={`w-full py-3.5 px-6 rounded-lg font-medium transition-all duration-200 text-sm ${
                      selectedService && apiDate && selectedTime && !submitting
                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transform hover:-translate-y-0.5'
                        : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }`}
                  >
                    {submitting ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Booking Appointment...</span>
                      </div>
                    ) : (
                      'Book Appointment'
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>

        {/* Appointment Confirmation Popup */}
        {showAppointmentPopup && bookedAppointment && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 text-center">
              {/* Success Icon */}
              <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
                <svg className="h-8 w-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              {/* Success Message */}
              <h3 className="text-2xl font-light text-gray-900 mb-4">
                Appointment Booked!
              </h3>
              
              {/* Appointment Details */}
              <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Business:</span>
                    <span className="font-medium text-gray-900">{bookedAppointment.businessName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Service:</span>
                    <span className="font-medium text-gray-900">{bookedAppointment.service_name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Date:</span>
                    <span className="font-medium text-gray-900">{bookedAppointment.formattedDate}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="font-medium text-gray-900">{bookedAppointment.formattedTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-medium text-gray-900">${bookedAppointment.service_price}</span>
                  </div>
                </div>
              </div>
              
              {/* Email Confirmation Message */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 mb-2">
                  <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="text-sm font-medium text-blue-800">Check Your Email</span>
                </div>
                <p className="text-sm text-blue-700">
                  A confirmation email has been sent to <span className="font-medium">{bookedAppointment.customer_email}</span>
                </p>
              </div>
              
              {/* Close Button */}
              <button 
                onClick={() => setShowAppointmentPopup(false)}
                className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
              >
                Got it!
              </button>
            </div>
          </div>
        )}

        {/* Optional QR modal */}
        {showQRPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              {/* Your QR content here */}
              <button onClick={() => setShowQRPopup(false)} className="mt-4 w-full py-2 border rounded-lg">
                Close
              </button>
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
    </div>
  );
};

export default BusinessBookingPage;