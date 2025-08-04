import { useState } from 'react'
import Calendar from './components/Calendar'
import OrderForm from './components/OrderForm'
import ScheduledOrders from './components/ScheduledOrders'

function App() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [scheduledOrders, setScheduledOrders] = useState([])
  const [activeTab, setActiveTab] = useState('calendar')

  const addScheduledOrder = (order) => {
    setScheduledOrders([...scheduledOrders, { ...order, id: Date.now() }])
  }

  const deleteOrder = (orderId) => {
    setScheduledOrders(scheduledOrders.filter(order => order.id !== orderId))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">OrderAgain</h1>
              <p className="text-gray-600">Schedule your future orders</p>
            </div>
            <div className="flex space-x-4">
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'calendar'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Calendar
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === 'orders'
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Scheduled Orders
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Calendar */}
            <div className="lg:col-span-2">
              <Calendar 
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                scheduledOrders={scheduledOrders}
              />
            </div>
            
            {/* Order Form */}
            <div>
              <OrderForm 
                selectedDate={selectedDate}
                onOrderScheduled={addScheduledOrder}
              />
            </div>
          </div>
        ) : (
          <ScheduledOrders 
            orders={scheduledOrders}
            onDeleteOrder={deleteOrder}
          />
        )}
      </main>
    </div>
  )
}

export default App
