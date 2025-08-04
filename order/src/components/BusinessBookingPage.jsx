import { useState } from 'react'
import { useParams, Navigate } from 'react-router-dom'

const BusinessBookingPage = ({ businesses, onBookAppointment }) => {
  const { businessSlug } = useParams()
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  // Find the business by slug
  const business = businesses.find(b => b.slug === businessSlug)

  if (!business) {
    return <Navigate to="/admin/login" replace />
  }

  const handleBookAppointment = (e) => {
    e.preventDefault()
    
    if (!selectedService || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields')
      return
    }

    if (!customerInfo.name || !customerInfo.email) {
      alert('Please provide your name and email')
      return
    }

    const appointment = {
      businessId: business.id,
      businessName: business.name,
      serviceName: selectedService.name,
      servicePrice: selectedService.price,
      date: selectedDate,
      time: selectedTime,
      customerName: customerInfo.name,
      customerEmail: customerInfo.email,
      customerPhone: customerInfo.phone
    }

    onBookAppointment(appointment)
    
    // Reset form
    setSelectedService(null)
    setSelectedDate('')
    setSelectedTime('')
    setCustomerInfo({ name: '', email: '', phone: '' })
    
    alert('Appointment booked successfully!')
  }

  const formatTime = (time) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  return (
    <div className="min-h-screen bg-gray-25">
      {/* Business Header */}
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="text-center">
            <h1 className="text-3xl font-light text-gray-900 mb-2">{business.name}</h1>
            <p className="text-gray-600 font-light mb-2">{business.description}</p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 font-light">
              <span>{business.address}</span>
              <span>{business.phone}</span>
              <span>{business.hours}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Booking Form */}
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg border border-gray-100 p-8">
          <h2 className="text-2xl font-light text-gray-900 mb-6 text-center">Book Your Appointment</h2>
          
          <form onSubmit={handleBookAppointment} className="space-y-6">
            {/* Service Selection */}
            <div>
              <label className="block text-sm font-light text-gray-700 mb-3">Select Service</label>
              <div className="grid gap-3">
                {business.services.map(service => (
                  <button
                    key={service.name}
                    type="button"
                    onClick={() => setSelectedService(service)}
                    className={`p-4 rounded-lg border text-left transition-colors ${
                      selectedService?.name === service.name
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
                />
              </div>
              <div>
                <label className="block text-xs font-light text-gray-600 mb-2">Time</label>
                <input
                  type="time"
                  value={selectedTime}
                  onChange={(e) => setSelectedTime(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
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
                />
              </div>
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
              disabled={!selectedService || !selectedDate || !selectedTime}
              className={`
                w-full py-3 px-4 rounded-lg font-light transition-colors text-sm
                ${selectedService && selectedDate && selectedTime
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }
              `}
            >
              Book Appointment
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default BusinessBookingPage 