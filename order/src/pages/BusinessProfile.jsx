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
              <p className="text-gray-500 font-light text-center">Services are now managed in the Services tab</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BusinessProfile 