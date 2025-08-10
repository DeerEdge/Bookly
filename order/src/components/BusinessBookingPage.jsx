import React, { useState, useEffect } from 'react'
import { useParams, Navigate } from 'react-router-dom'
import apiService from '../services/api'

const BusinessBookingPage = ({ businesses, onBookAppointment }) => {
  const { businessSlug } = useParams()
  const [business, setBusiness] = useState(null)
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })
  const [sendEmailConfirmation, setSendEmailConfirmation] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState(false)
  const [showQRPopup, setShowQRPopup] = useState(false)

  // Load business data and services
  useEffect(() => {
    loadBusiness()
  }, [businessSlug])

  const loadBusiness = async () => {
    try {
      setLoading(true)
      setError(null)
      const businessData = await apiService.getBusinessBySlug(businessSlug)
      setBusiness(businessData)
      
      // Load services for this business
      if (businessData?.id) {
        try {
          const servicesData = await apiService.getBusinessServices(businessData.id)
          setServices(servicesData)
        } catch (servicesError) {
          console.error('Failed to load services:', servicesError)
          setServices([])
        }
      }
    } catch (error) {
      console.error('Failed to load business:', error)
      setError('Business not found')
    } finally {
      setLoading(false)
    }
  }

  const handleBookAppointment = async (e) => {
    e.preventDefault()
    
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields')
      return
    }

    if (!customerInfo.name || !customerInfo.email) {
      alert('Please provide your name and email')
      return
    }

    try {
      setSubmitting(true)
      setBookingSuccess(false)
      
      const appointment = {
        business_id: business.id,
        business_name: business.name,
        service_name: selectedService.name,
        service_price: selectedService.price,
        date: selectedDate,
        time: selectedTime,
        customer_name: customerInfo.name,
        customer_email: customerInfo.email,
        customer_phone: customerInfo.phone,
        send_email_confirmation: sendEmailConfirmation,
        status: 'confirmed'
      }

      console.log('Submitting appointment:', appointment)
      console.log('Business ID:', business.id)
      console.log('Business data:', business)
      
      const result = await onBookAppointment(appointment)
      console.log('Appointment booking result:', result)
      
      // Show success message
      setBookingSuccess(true)
      
      // Reset form after a short delay
      setTimeout(() => {
        setSelectedService(null)
        setSelectedDate('')
        setSelectedTime('')
        setCustomerInfo({ name: '', email: '', phone: '' })
        setSendEmailConfirmation(true)
        setBookingSuccess(false)
      }, 3000)
      
    } catch (error) {
      console.error('Failed to book appointment:', error)
      console.error('Error details:', {
        message: error.message,
        stack: error.stack,
        business: business,
        appointment: {
          business_id: business?.id,
          service_name: selectedService?.name,
          date: selectedDate,
          time: selectedTime,
          customer_name: customerInfo.name,
          customer_email: customerInfo.email
        }
      })
      alert(`Failed to book appointment: ${error.message}`)
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-25 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-light">Loading business...</p>
        </div>
      </div>
    )
  }

  if (error || !business) {
    return <Navigate to="/manage/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {business ? (
          <>
            {/* Header */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-light text-gray-900 mb-2">{business.name}</h1>
                  <p className="text-gray-600 mb-4">{business.description}</p>
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>{business.category}</span>
                    {business.address && <span>{business.address}</span>}
                    {business.phone && <span>{business.phone}</span>}
                  </div>
                </div>
                
                {/* Share Button */}
                <button
                  onClick={() => setShowQRPopup(true)}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-light flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                  </svg>
                  <span>Share</span>
                </button>
              </div>
            </div>

            {/* QR Code Popup */}
            {showQRPopup && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg p-6 max-w-md w-full">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-light text-gray-900">Share {business.name}</h3>
                    <button
                      onClick={() => setShowQRPopup(false)}
                      className="text-gray-400 hover:text-gray-600"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="text-center">
                    <div className="border-2 border-gray-200 rounded-lg p-4 bg-white mb-4">
                      <img
                        src={business.qr_code_url}
                        alt="Business QR Code"
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-2">Scan this QR code to book an appointment</p>
                    <p className="text-sm font-mono text-blue-600 break-all mb-4">
                      {window.location.origin}/{business.slug}
                    </p>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`${window.location.origin}/${business.slug}`);
                          // You could add a toast notification here
                        }}
                        className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-light"
                      >
                        Copy Link
                      </button>
                      <button
                        onClick={() => window.open(business.qr_code_url, '_blank')}
                        className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm font-light"
                      >
                        View Full Size
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Booking Form */}
            <div className="bg-white rounded-lg border border-gray-200 p-8">
              <h2 className="text-2xl font-light text-gray-900 mb-6 text-center">Book Your Appointment</h2>
              
              {/* Success Message */}
              {bookingSuccess && (
                <div className="mb-6 p-4 bg-green-25 border border-green-200 rounded-lg">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 text-green-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <p className="text-green-800 font-light">Appointment booked successfully! You will receive a confirmation email shortly.</p>
                  </div>
                </div>
              )}
              
              <form onSubmit={handleBookAppointment} className="space-y-6">
                {/* Service Selection */}
                <div>
                  <label className="block text-sm font-light text-gray-700 mb-3">Select Service</label>
                  {services.length > 0 ? (
                    <div className="grid gap-3">
                      {services.map(service => (
                        <button
                          key={service.id}
                          type="button"
                          onClick={() => setSelectedService(service)}
                          className={`p-4 rounded-lg border text-left transition-colors ${
                            selectedService?.id === service.id
                              ? 'border-blue-200 bg-blue-25'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="text-sm font-light text-gray-900">{service.name}</h4>
                              <p className="text-xs text-gray-500">{service.duration} minutes</p>
                            </div>
                            <span className="text-sm font-light text-gray-900">${service.price}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p>No services available at this time.</p>
                      <p className="text-sm">Please contact the business directly.</p>
                    </div>
                  )}
                </div>

                {/* Date and Time Selection */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Date</label>
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Time</label>
                    <input
                      type="time"
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Customer Information */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Name *</label>
                    <input
                      type="text"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({...customerInfo, name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      placeholder="Your full name"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Email *</label>
                    <input
                      type="email"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({...customerInfo, email: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      placeholder="your@email.com"
                      disabled={submitting}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-gray-600 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({...customerInfo, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                      placeholder="(555) 123-4567"
                      disabled={submitting}
                    />
                  </div>
                </div>

                {/* Email Confirmation Checkbox */}
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="sendEmailConfirmation"
                    checked={sendEmailConfirmation}
                    onChange={(e) => setSendEmailConfirmation(e.target.checked)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    disabled={submitting}
                  />
                  <label htmlFor="sendEmailConfirmation" className="ml-2 block text-sm text-gray-700 font-light">
                    Send me my appointment details via email
                  </label>
                </div>

                {/* Selected Service Summary */}
                {selectedService && (
                  <div className="p-4 bg-blue-25 rounded-lg border border-blue-100">
                    <h3 className="text-sm font-light text-gray-900 mb-2">Selected Service</h3>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-light text-gray-900">{selectedService.name}</p>
                        <p className="text-xs text-gray-500">{selectedService.duration} minutes</p>
                      </div>
                      <span className="text-lg font-light text-gray-900">${selectedService.price}</span>
                    </div>
                  </div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={!selectedService || !selectedDate || !selectedTime || submitting}
                  className={`
                    w-full py-3 px-4 rounded-lg font-light transition-colors text-sm
                    ${selectedService && selectedDate && selectedTime && !submitting
                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  {submitting ? 'Booking Appointment...' : 'Book Appointment'}
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="text-center py-16 text-gray-500">
            <p>Business not found.</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default BusinessBookingPage 