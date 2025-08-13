import { useState, useEffect } from 'react'
import apiService from '../services/api'
import Notification from '../components/Notification'
import useNotification from '../hooks/useNotification'

const BusinessProfile = ({ business, onUpdateProfile }) => {
  const [loading, setLoading] = useState(false)
  const [showSharePopup, setShowSharePopup] = useState(false)
  const [isMobileActionsOpen, setIsMobileActionsOpen] = useState(false)
  const { notification, showSuccess, showError, hideNotification } = useNotification()
  const [businessData, setBusinessData] = useState({
    name: business?.name || '',
    category: business?.category || '',
    description: business?.description || '',
    address: business?.address || '',
    phone: business?.phone || '',
    email: business?.email || ''
  })

  const getBusinessUrl = (business) => {
    return `${window.location.origin}/${business.slug}`
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    showSuccess('URL copied to clipboard')
  }

  // Update local state when business prop changes
  useEffect(() => {
    if (business) {
      setBusinessData({
        name: business.name || '',
        category: business.category || '',
        description: business.description || '',
        address: business.address || '',
        phone: business.phone || '',
        email: business.email || ''
      })
    }
  }, [business])

  const handleInputChange = (field, value) => {
    setBusinessData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const updatedBusiness = await apiService.updateBusiness(business.id, businessData)
      onUpdateProfile(updatedBusiness)
      showSuccess('Profile updated successfully')
    } catch (error) {
      console.error('Error updating profile:', error)
      showError('Failed to update profile. Please try again.')
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
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-light text-gray-900 mb-2">Business Profile</h1>
          <p className="text-gray-600 font-light">Manage your business information and services</p>
        </div>
        
        {/* Desktop Actions */}
        <div className="hidden sm:flex space-x-3">
          <button
            onClick={() => window.open(getBusinessUrl(business), '_blank')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors"
          >
            View Customer Page
          </button>
          <button
            onClick={() => setShowSharePopup(true)}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-light text-sm transition-colors"
          >
            View QR Code
          </button>
          <button
            onClick={() => copyToClipboard(getBusinessUrl(business))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-light text-sm transition-colors"
          >
            Copy URL
          </button>
        </div>

        {/* Mobile Actions Button */}
        <div className="sm:hidden">
          <button
            onClick={() => setIsMobileActionsOpen(!isMobileActionsOpen)}
            className="flex items-center justify-center w-full px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-light text-sm transition-colors"
          >
            <span>Actions</span>
            <svg
              className={`ml-2 w-4 h-4 transform transition-transform duration-200 ${isMobileActionsOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Actions Accordion */}
      {isMobileActionsOpen && (
        <div className="sm:hidden bg-gray-50 rounded-lg border border-gray-200 p-3 space-y-2">
          <button
            onClick={() => {
              window.open(getBusinessUrl(business), '_blank')
              setIsMobileActionsOpen(false)
            }}
            className="w-full px-4 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors text-left"
          >
            View Customer Page
          </button>
          <button
            onClick={() => {
              setShowSharePopup(true)
              setIsMobileActionsOpen(false)
            }}
            className="w-full px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-light text-sm transition-colors text-left"
          >
            View QR Code
          </button>
          <button
            onClick={() => {
              copyToClipboard(getBusinessUrl(business))
              setIsMobileActionsOpen(false)
            }}
            className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-light text-sm transition-colors text-left"
          >
            Copy URL
          </button>
        </div>
      )}

      {/* Business Information */}
      <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
        <h3 className="text-lg font-light text-gray-900 mb-4">Business Information</h3>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Business Name</label>
            <input
              type="text"
              value={businessData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-light"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Category</label>
            <input
              type="text"
              value={businessData.category}
              onChange={(e) => handleInputChange('category', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-light"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Phone</label>
            <input
              type="tel"
              value={businessData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-light"
            />
          </div>

          <div>
            <label className="block text-sm font-light text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={businessData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-light"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-light text-gray-700 mb-2">Address</label>
            <input
              type="text"
              value={businessData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-light"
            />
          </div>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleCancel}
            className="w-full sm:w-auto px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-light text-sm transition-colors"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="w-full sm:w-auto px-6 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>



      {/* Share Links Popup */}
      {showSharePopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setShowSharePopup(false)}>
          <div className="bg-white rounded-lg p-8 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-light text-gray-900">Share Your Business</h2>
              <button
                onClick={() => setShowSharePopup(false)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="text-center">
              <h3 className="text-lg font-light text-gray-900 mb-4">Your Customer Booking Page</h3>
              
              {/* QR Code Display */}
              {business?.qr_code_url ? (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-white mb-6">
                  <img
                    src={business.qr_code_url}
                    alt="Business QR Code"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              ) : (
                <div className="border-2 border-gray-200 rounded-lg p-4 bg-gray-50 mb-6">
                  <div className="w-48 h-48 mx-auto flex items-center justify-center">
                    <p className="text-gray-500 text-sm">QR Code not available</p>
                  </div>
                </div>
              )}
              
              {/* Booking URL */}
              <p className="text-sm font-mono text-blue-600 break-all mb-4 bg-gray-50 p-3 rounded-lg">
                {getBusinessUrl(business)}
              </p>
              
              <p className="text-sm text-gray-600 mb-6">
                Share this URL with your customers so they can book appointments directly
              </p>
              
              {/* Action Buttons */}
              <div className="flex space-x-3">
                <button
                  onClick={() => copyToClipboard(getBusinessUrl(business))}
                  className="flex-1 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors"
                >
                  Copy URL
                </button>
                <button
                  onClick={() => window.open(getBusinessUrl(business), '_blank')}
                  className="flex-1 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-light text-sm transition-colors"
                >
                  View Page
                </button>
              </div>
              
              {/* QR Code Actions */}
              {business?.qr_code_url && (
                <div className="mt-4">
                  <button
                    onClick={() => window.open(business.qr_code_url, '_blank')}
                    className="w-full px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg font-light text-sm transition-colors"
                  >
                    View Full Size QR Code
                  </button>
                </div>
              )}
            </div>
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
  )
}

export default BusinessProfile