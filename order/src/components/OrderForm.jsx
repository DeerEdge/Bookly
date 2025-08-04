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
    { id: 'grubhub', name: 'Grubhub', color: 'bg-orange-50 text-orange-600 border-orange-200' },
    { id: 'doordash', name: 'DoorDash', color: 'bg-red-50 text-red-600 border-red-200' },
    { id: 'amazon', name: 'Amazon', color: 'bg-blue-50 text-blue-600 border-blue-200' }
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
    <div className="bg-white rounded-lg border border-gray-100 p-6">
      <h2 className="text-lg font-light text-gray-900 mb-6">Schedule Order</h2>
      
      {/* Selected Date Display */}
      <div className="mb-6 p-4 bg-blue-25 rounded-lg border border-blue-100">
        <p className="text-xs text-gray-500 mb-1 font-light">Selected Date:</p>
        <p className="font-light text-blue-700">{formatSelectedDate()}</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Platform Selection */}
        <div>
          <label className="block text-xs font-light text-gray-600 mb-2">
            Platform
          </label>
          <div className="grid grid-cols-3 gap-2">
            {platforms.map(platform => (
              <button
                key={platform.id}
                type="button"
                onClick={() => handleInputChange('platform', platform.id)}
                className={`
                  p-3 rounded-lg border transition-colors text-xs font-light
                  ${formData.platform === platform.id
                    ? `${platform.color} border-current`
                    : 'border-gray-200 text-gray-500 hover:border-gray-300'
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
          <label className="block text-xs font-light text-gray-600 mb-2">
            Restaurant
          </label>
          <input
            type="text"
            value={formData.restaurant}
            onChange={(e) => handleInputChange('restaurant', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
            placeholder="Enter restaurant name"
          />
        </div>

        {/* Items */}
        <div>
          <label className="block text-xs font-light text-gray-600 mb-2">
            Items
          </label>
          <textarea
            value={formData.items}
            onChange={(e) => handleInputChange('items', e.target.value)}
            rows="3"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
            placeholder="Enter your order items..."
          />
        </div>

        {/* Time */}
        <div>
          <label className="block text-xs font-light text-gray-600 mb-2">
            Time
          </label>
          <input
            type="time"
            value={formData.time}
            onChange={(e) => handleInputChange('time', e.target.value)}
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="block text-xs font-light text-gray-600 mb-2">
            Notes (Optional)
          </label>
          <textarea
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            rows="2"
            className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:ring-1 focus:ring-blue-400 focus:border-blue-400 text-sm font-light"
            placeholder="Special instructions, delivery notes..."
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={!selectedDate}
          className={`
            w-full py-3 px-4 rounded-lg font-light transition-colors text-sm
            ${selectedDate
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
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