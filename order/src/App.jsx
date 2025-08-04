import { useState } from 'react'
import Calendar from './components/Calendar'
import OrderForm from './components/OrderForm'
import ScheduledOrders from './components/ScheduledOrders'
import Navbar from './components/Navbar'

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
    <div className="min-h-screen bg-gray-25">
      {/* Navbar */}
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />

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
