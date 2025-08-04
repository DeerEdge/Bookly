const ScheduledOrders = ({ orders, onDeleteOrder }) => {
  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'grubhub':
        return 'bg-orange-100 text-orange-700 border-orange-200'
      case 'doordash':
        return 'bg-red-100 text-red-700 border-red-200'
      case 'amazon':
        return 'bg-blue-100 text-blue-700 border-blue-200'
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200'
    }
  }

  const getPlatformName = (platform) => {
    switch (platform) {
      case 'grubhub':
        return 'Grubhub'
      case 'doordash':
        return 'DoorDash'
      case 'amazon':
        return 'Amazon'
      default:
        return platform
    }
  }

  const formatDateTime = (date) => {
    return new Date(date).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getTimeUntilOrder = (date) => {
    const now = new Date()
    const orderDate = new Date(date)
    const diff = orderDate - now

    if (diff < 0) {
      return 'Past due'
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (days > 0) {
      return `${days}d ${hours}h`
    } else if (hours > 0) {
      return `${hours}h ${minutes}m`
    } else {
      return `${minutes}m`
    }
  }

  const sortedOrders = [...orders].sort((a, b) => new Date(a.date) - new Date(b.date))

  if (orders.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm border p-8">
        <div className="text-center">
          <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Scheduled Orders</h3>
          <p className="text-gray-600">You haven't scheduled any orders yet. Select a date on the calendar and create your first order!</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Scheduled Orders</h2>
        <span className="text-sm text-gray-600">{orders.length} order{orders.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="grid gap-4">
        {sortedOrders.map((order) => (
          <div key={order.id} className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                {/* Header */}
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getPlatformColor(order.platform)}`}>
                    {getPlatformName(order.platform)}
                  </span>
                  <span className="text-sm text-gray-500">
                    {formatDateTime(order.date)}
                  </span>
                </div>

                {/* Restaurant and Items */}
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {order.restaurant}
                </h3>
                <p className="text-gray-600 mb-3 whitespace-pre-wrap">
                  {order.items}
                </p>

                {/* Notes */}
                {order.notes && (
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">
                      <span className="font-medium">Notes:</span> {order.notes}
                    </p>
                  </div>
                )}

                {/* Time until order */}
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-sm text-gray-600">
                    {getTimeUntilOrder(order.date)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => onDeleteOrder(order.id)}
                  className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                  title="Delete order"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ScheduledOrders 