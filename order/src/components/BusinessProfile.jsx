import { useState, useEffect } from 'react'
import apiService from '../services/api'

const BusinessProfile = ({ business, onUpdateProfile }) => {
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(false)
  const [businessData, setBusinessData] = useState({
    name: business?.name || '',
    category: business?.category || '',
    description: business?.description || '',
    address: business?.address || '',
    phone: business?.phone || '',
    email: business?.email || ''
  })

  const [services, setServices] = useState([])
  const [newService, setNewService] = useState({
    name: '',
    duration: '',
    price: ''
  })

  // Load services for the business
  useEffect(() => {
    if (business?.id) {
      loadServices()
    }
  }, [business?.id])

  const loadServices = async () => {
    try {
      const servicesData = await apiService.getBusinessServices(business.id)
      setServices(servicesData)
    } catch (error) {
      console.error('Failed to load services:', error)
    }
  }

  // Update local state when business prop changes (but only if not editing)
  useEffect(() => {
    if (!isEditing && business) {
      setBusinessData({
        name: business.name || '',
        category: business.category || '',
        description: business.description || '',
        address: business.address || '',
        phone: business.phone || '',
        email: business.email || ''
      })
    }
  }, [business, isEditing])

  const handleInputChange = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }))
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
        const serviceData = {
          business_id: business.id,
          name: newService.name,
          description: `Professional ${newService.name} service`,
          duration: Number(newService.duration),
          price: Number(newService.price)
        }
        
        await apiService.createService(serviceData)
        setNewService({ name: '', duration: '', price: '' })
        loadServices() // Reload services
      } catch (error) {
        console.error('Failed to add service:', error)
        alert('Failed to add service. Please try again.')
      }
    }
  }

  const removeService = async (serviceId) => {
    try {
      await apiService.deleteService(serviceId)
      loadServices() // Reload services
    } catch (error) {
      console.error('Failed to remove service:', error)
      alert('Failed to remove service. Please try again.')
    }
  }

  const updateService = async (serviceId, updates) => {
    try {
      await apiService.updateService(serviceId, updates)
      loadServices() // Reload services
    } catch (error) {
      console.error('Failed to update service:', error)
      alert('Failed to update service. Please try again.')
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      // Update business information (excluding services and hours)
      const updateData = {
        name: businessData.name,
        category: businessData.category,
        description: businessData.description,
        address: businessData.address,
        phone: businessData.phone,
        email: businessData.email
      }
      
      await onUpdateProfile(business.id, updateData)
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update profile:', error)
      alert('Failed to update profile. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    // Reset to original business data
    setBusinessData({
      name: business?.name || '',
      category: business?.category || '',
      description: business?.description || '',
      address: business?.address || '',
      phone: business?.phone || '',
      email: business?.email || ''
    })
    setNewService({ name: '', duration: '', price: '' })
    setIsEditing(false)
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Business Profile</h1>
          <p className="text-gray-600 font-light">Manage your business information and services</p>
        </div>
        <div className="flex space-x-3">
          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors"
            >
              Edit Profile
            </button>
          ) : (
            <>
              <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-light text-sm transition-colors"
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className={`px-4 py-2 rounded-lg font-light text-sm transition-colors ${
                  loading
                    ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Business Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-light text-gray-900 mb-4">Business Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              value={businessData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={businessData.email || ''}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={businessData.phone || ''}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
              disabled={loading}
            />
          </div>
          
          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={businessData.address || ''}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
              disabled={loading}
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-sm font-light text-gray-700 mb-2">Description</label>
            <textarea
              value={businessData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
              disabled={loading}
            />
          </div>
        </div>
        
        <div className="mt-6 flex justify-end">
          <button
            onClick={handleSave}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-light"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      {/* QR Code Section */}
      {business?.qr_code_url && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
          <h3 className="text-lg font-light text-gray-900 mb-4">Business QR Code</h3>
          <p className="text-sm text-gray-600 mb-4">
            Customers can scan this QR code to book appointments directly.
          </p>
          
          <div className="flex flex-col items-center space-y-4">
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
              <img 
                src={business?.qr_code_url} 
                alt="Business QR Code" 
                className="w-48 h-48"
              />
            </div>
            
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Booking URL:</p>
              <p className="text-sm font-mono text-blue-600 break-all">
                {window.location.origin}/{business?.slug}
              </p>
            </div>
            
            <button
              onClick={() => window.open(business?.qr_code_url, '_blank')}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-light"
            >
              View Full Size
            </button>
          </div>
        </div>
      )}

      {/* Services */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-light text-gray-900">Services</h3>
          <p className="text-sm text-gray-500 font-light mt-1">
            Manage the services you offer to customers
          </p>
        </div>
        <div className="p-6 space-y-6">
          {/* Existing Services */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h4 className="text-sm font-light text-gray-900">Current Services</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {services.map((service, index) => (
                  <div key={service.id} className="p-4 bg-gray-25 rounded-lg border border-gray-200">
                    <div className="flex justify-between items-start mb-3">
                      <h5 className="text-sm font-light text-gray-900">{service.name}</h5>
                      <button
                        onClick={() => removeService(service.id)}
                        className="text-red-500 hover:text-red-600 text-xs font-light"
                      >
                        Remove
                      </button>
                    </div>
                    <div className="space-y-2">
                      <div>
                        <label htmlFor={`service-duration-${service.id}`} className="block text-xs font-light text-gray-600 mb-1">Duration (minutes)</label>
                        <input
                          id={`service-duration-${service.id}`}
                          name={`service-duration-${service.id}`}
                          type="number"
                          value={service.duration}
                          onChange={(e) => {
                            const updatedService = { ...service, duration: Number(e.target.value) }
                            updateService(service.id, updatedService)
                          }}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        />
                      </div>
                      <div>
                        <label htmlFor={`service-price-${service.id}`} className="block text-xs font-light text-gray-600 mb-1">Price ($)</label>
                        <input
                          id={`service-price-${service.id}`}
                          name={`service-price-${service.id}`}
                          type="number"
                          value={service.price}
                          onChange={(e) => {
                            const updatedService = { ...service, price: Number(e.target.value) }
                            updateService(service.id, updatedService)
                          }}
                          className="w-full px-2 py-1 border border-gray-200 rounded text-xs font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Add New Service */}
          <div className="p-4 bg-blue-25 rounded-lg border border-blue-100">
            <h4 className="text-sm font-light text-gray-900 mb-4">Add New Service</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label htmlFor="new-service-name" className="block text-xs font-light text-gray-600 mb-2">Service Name</label>
                <input
                  id="new-service-name"
                  name="new-service-name"
                  type="text"
                  value={newService.name}
                  onChange={(e) => setNewService({...newService, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="e.g., Haircut, Massage"
                />
              </div>
              <div>
                <label htmlFor="new-service-duration" className="block text-xs font-light text-gray-600 mb-2">Duration (minutes)</label>
                <input
                  id="new-service-duration"
                  name="new-service-duration"
                  type="number"
                  value={newService.duration}
                  onChange={(e) => setNewService({...newService, duration: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="30"
                />
              </div>
              <div>
                <label htmlFor="new-service-price" className="block text-xs font-light text-gray-600 mb-2">Price ($)</label>
                <input
                  id="new-service-price"
                  name="new-service-price"
                  type="number"
                  value={newService.price}
                  onChange={(e) => setNewService({...newService, price: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm font-light focus:ring-1 focus:ring-blue-400 focus:border-blue-400"
                  placeholder="50"
                />
              </div>
            </div>
            <button
              onClick={addService}
              disabled={!newService.name || !newService.duration || !newService.price}
              className={`mt-4 px-4 py-2 rounded-lg font-light text-sm transition-colors ${
                newService.name && newService.duration && newService.price
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              Add Service
            </button>
          </div>

          {services.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 font-light">No services added yet</p>
            </div>
          )}
        </div>
      </div>

      {/* Customer Page Preview */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-light text-gray-900">Customer Page Preview</h3>
          <p className="text-sm text-gray-500 font-light mt-1">
            This is how your business appears to customers
          </p>
        </div>
        <div className="p-6">
          <div className="bg-gray-25 rounded-lg p-6 border border-gray-200">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-light text-gray-900 mb-2">{businessData.name}</h2>
              <p className="text-gray-600 font-light mb-2">{businessData.description}</p>
              <div className="flex items-center justify-center space-x-6 text-sm text-gray-500 font-light">
                <span>{businessData.address}</span>
                <span>{businessData.phone}</span>
              </div>
            </div>
            
            <div className="space-y-4">
              <h3 className="text-lg font-light text-gray-900 mb-4">Available Services</h3>
              {services.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {services.map((service) => (
                    <div key={service.id} className="p-4 bg-white rounded-lg border border-gray-200">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-light text-gray-900">{service.name}</h4>
                          <p className="text-xs text-gray-500">{service.duration} minutes</p>
                        </div>
                        <span className="text-sm font-light text-gray-900">${service.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 font-light text-center">No services available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessProfile 