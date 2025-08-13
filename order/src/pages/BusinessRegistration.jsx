import { useState } from 'react'
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
    hours: '',
    email: '',
    password: ''
  })
  const [services, setServices] = useState([])
  const [newService, setNewService] = useState({
    name: '',
    duration: '',
    price: ''
  })

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

  const handleAddService = () => {
    if (newService.name && newService.duration && newService.price) {
      setServices([...services, { ...newService, id: Date.now() }])
      setNewService({ name: '', duration: '', price: '' })
    }
  }

  const handleRemoveService = (serviceId) => {
    setServices(services.filter(service => service.id !== serviceId))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!businessInfo.name || !businessInfo.category || !businessInfo.address || !businessInfo.email || !businessInfo.password) {
      showError('Please fill in all required fields')
      return
    }

    if (services.length === 0) {
      showError('Please add at least one service')
      return
    }

    const business = {
      ...businessInfo,
      services: services
    }

    onBusinessRegistered(business)
    
    // Reset form
    setBusinessInfo({
      name: '',
      category: '',
      description: '',
      address: '',
      phone: '',
      hours: '',
      email: '',
      password: ''
    })
    setServices([])
    
    showSuccess('Business registered successfully!')
  }

  return (
    <div className="max-w-2xl mx-auto">
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
                <label className="block text-xs font-light text-gray-600 mb-2">Business Hours</label>
                <input
                  type="text"
                  value={businessInfo.hours}
                  onChange={(e) => setBusinessInfo({...businessInfo, hours: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
                  placeholder="Mon-Fri: 9AM-6PM, Sat: 10AM-4PM"
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