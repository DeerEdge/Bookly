import { useState } from 'react'

const AppointmentBooking = ({ businesses, onBookAppointment }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedBusiness, setSelectedBusiness] = useState(null)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedTime, setSelectedTime] = useState('')
  const [customerInfo, setCustomerInfo] = useState({
    name: '',
    email: '',
    phone: ''
  })

  const filteredBusinesses = businesses.filter(business =>
    business.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    business.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleBookAppointment = (e) => {
    e.preventDefault()
    
    if (!selectedBusiness || !selectedService || !selectedDate || !selectedTime) {
      alert('Please fill in all required fields')
      return
    }

    if (!customerInfo.name || !customerInfo.email) {
      alert('Please provide your name and email')
      return
    }

    const appointment = {
      businessId: selectedBusiness.id,
      businessName: selectedBusiness.name,
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
    setSelectedBusiness(null)
    setSelectedService(null)
    setSelectedDate('')
    setSelectedTime('')
    setCustomerInfo({ name: '', email: '', phone: '' })
    
    alert('Appointment booked successfully!')
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Book Your Appointment</h1>
        <p className="text-gray-500 font-light">Find and book appointments with local businesses</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-100 p-6 mb-6">
        <h2 className="text-lg font-light text-gray-900 mb-4">Search Businesses</h2>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by business name or category..."
          className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
        />
      </div>

      {/* Business List */}
      {searchTerm && (
        <div className="grid gap-4 mb-8">
          {filteredBusinesses.map(business => (
            <div 
              key={business.id}
              className={`bg-white rounded-lg border border-gray-100 p-6 cursor-pointer transition-colors ${
                selectedBusiness?.id === business.id 
                  ? 'border-blue-200 bg-blue-25' 
                  : 'hover:border-gray-200'
              }`}
              onClick={() => setSelectedBusiness(business)}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-lg font-light text-gray-900 mb-1">{business.name}</h3>
                  <p className="text-sm text-gray-500 mb-2">{business.category}</p>
                  <p className="text-sm text-gray-600 mb-2">{business.description}</p>
                  <div className="flex items-center space-x-4 text-xs text-gray-400">
                    <span>{business.address}</span>
                    <span>{business.phone}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-gray-400 font-light">{business.hours}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Booking Form */}
      {selectedBusiness && (
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="text-lg font-light text-gray-900 mb-6">Book Appointment with {selectedBusiness.name}</h2>
          
          <form onSubmit={handleBookAppointment} className="space-y-6">
            {/* Service Selection */}
            <div>
              <label className="block text-xs font-light text-gray-600 mb-2">Select Service</label>
              <div className="grid gap-2">
                {selectedBusiness.services.map(service => (
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

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light transition-colors text-sm"
            >
              Book Appointment
            </button>
          </form>
        </div>
      )}
    </div>
  )
}

export default AppointmentBooking 