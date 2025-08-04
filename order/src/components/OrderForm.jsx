import { useState } from 'react'

const OrderForm = ({ selectedDate, onOrderScheduled }) => {
  const [formData, setFormData] = useState({
    platform: 'grubhub',
    restaurant: '',
    items: '',
    time: '12:00',
    notes: ''
  })

  const platforms = [
    { id: 'grubhub', name: 'Grubhub', color: 'bg-orange-100 text-orange-700' },
    { id: 'doordash', name: 'DoorDash', color: 'bg-red-100 text-red-700' },
    { id: 'amazon', name: 'Amazon', color: 'bg-blue-100 text-blue-700' }
  ]

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!selectedDate) {
      alert('Please select a date first')
      return
    }

    if (!formData.restaurant || !formData.items) {
      alert('Please fill in restaurant and items')
      return
    }

    const orderDateTime = new Date(selectedDate)
    const [hours, minutes] = formData.time.split(':')
    orderDateTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

    const order = {
      ...formData,
      date: orderDateTime,
      status: 'scheduled'
    }

    onOrderScheduled(order)
    
    // Reset form
    setFormData({
      platform: 'grubhub',
      restaurant: '',
      items: '',
      time: '12:00',
      notes: ''
    })
  }

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const formatSelectedDate = () => {
    if (!selectedDate) return 'No date selected'
    return selectedDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="bg-white rounded-lg shadow-sm border p-6">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Schedule Order</h2>
      
      {/* Selected Date Display */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-gray-600 mb-1">Selected Date:</p>
        <p className="font-medium text-blue-900">{formatSelectedDate()}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Platform Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Platform
          </label>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map(platform => (
              <button
                key={platform.id}
                type="button"
                onClick={() => handleInputChange('platform', platform.id)}
                className={`
                  p-3 rounded-lg border-2 transition-colors text-sm font-medium
                  ${formData.platform === platform.id
                    ? `${platform.color} border-current`
                    : 'border-gray-200 text-gray-600 hover:border-gray-300'
                  }
                `}
              >
                {platform.name}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Restaurant
          </label>
          <input
            type="text"
            value={formData.restaurant}
            onChange={(e) => handleInputChange('restaurant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter restaurant name"
          />
        </div>

        {/* Items */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Items
          </label>
          <textarea
            value={formData.items}
            onChange={(e) => handleInputChange('items', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Enter your order items..."
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Time
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="Special instructions, delivery notes..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedDate}
          className={`
            w-full py-3 px-4 rounded-lg font-medium transition-colors
            ${selectedDate
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          Schedule Order
        </button>
      </form>
    </div>
  )
}

export default OrderForm 