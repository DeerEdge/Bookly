import { useState } from 'react'

const BusinessDashboard = ({ businesses, appointments, currentUser, onLoadAppointments }) => {
  const [selectedBusiness, setSelectedBusiness] = useState(null)

  const getBusinessUrl = (business) => {
    return `${window.location.origin}/${business.slug}`
  }

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
    alert('URL copied to clipboard!')
  }

  // Helper function to get appointment data with fallbacks
  const getAppointmentData = (appointment) => {
    return {
      id: appointment.id,
      customer_name: appointment.customers?.name || appointment.customer_name,
      customer_email: appointment.customers?.email || appointment.customer_email,
      service_name: appointment.services?.name || appointment.service_name,
      service_price: appointment.services?.price || appointment.service_price,
      date: appointment.appointment_date || appointment.date,
      time: appointment.appointment_time || appointment.time,
      status: appointment.status
    };
  };

  const businessAppointments = appointments
    .filter(apt => apt.business_id === currentUser.id)
    .map(getAppointmentData);

  const upcomingAppointments = businessAppointments
    .sort((a, b) => new Date(`${a.date} ${a.time}`) - new Date(`${b.date} ${b.time}`))
    .slice(0, 5)

  const recentAppointments = businessAppointments
    .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`))
    .slice(0, 10)

  return (
    <div className="space-y-8">
      {/* Header with Customer View Button */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 font-light">Welcome back, {currentUser.name}</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={() => window.open(getBusinessUrl(currentUser), '_blank')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors"
          >
            View Customer Page
          </button>
          <button
            onClick={() => copyToClipboard(getBusinessUrl(currentUser))}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-light text-sm transition-colors"
          >
            Copy URL
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">Total Appointments</h3>
          <p className="text-2xl font-light text-gray-900">{businessAppointments.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">This Month</h3>
          <p className="text-2xl font-light text-gray-900">
            {businessAppointments.filter(apt => {
              const aptDate = new Date(apt.date)
              const now = new Date()
              return aptDate.getMonth() === now.getMonth() && 
                     aptDate.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">Today</h3>
          <p className="text-2xl font-light text-gray-900">
            {businessAppointments.filter(apt => {
              const aptDate = new Date(apt.date)
              const today = new Date()
              return aptDate.toDateString() === today.toDateString()
            }).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">Services</h3>
          <p className="text-2xl font-light text-gray-900">{currentUser.services?.length || 0}</p>
        </div>
      </div>

      {/* Customer Page URL */}
      <div className="bg-white p-6 rounded-lg border border-gray-200">
        <h3 className="text-lg font-light text-gray-900 mb-4">Your Customer Booking Page</h3>
        <div className="flex items-center space-x-3">
          <input
            type="text"
            value={getBusinessUrl(currentUser)}
            readOnly
            className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm font-light bg-gray-50"
          />
          <button
            onClick={() => copyToClipboard(getBusinessUrl(currentUser))}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors"
          >
            Copy
          </button>
          <button
            onClick={() => window.open(getBusinessUrl(currentUser), '_blank')}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-light text-sm transition-colors"
          >
            View
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2 font-light">
          Share this URL with your customers so they can book appointments directly
        </p>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-light text-gray-900">Upcoming Appointments</h3>
        </div>
        <div className="p-6">
          {upcomingAppointments.length === 0 ? (
            <p className="text-gray-500 font-light">No upcoming appointments</p>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map(appointment => (
                <div key={appointment.id} className="flex items-center justify-between p-4 bg-gray-25 rounded-lg">
                  <div>
                    <h4 className="text-sm font-light text-gray-900">{appointment.customer_name}</h4>
                    <p className="text-xs text-gray-500">{appointment.service_name}</p>
                    <p className="text-xs text-gray-500">{appointment.date} at {appointment.time}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-light text-gray-900">${appointment.service_price}</p>
                    <span className="text-xs text-green-600 font-light">Confirmed</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-light text-gray-900">Recent Appointments</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-25">
              <tr>
                <th className="text-left p-4 text-xs font-light text-gray-500">Customer</th>
                <th className="text-left p-4 text-xs font-light text-gray-500">Service</th>
                <th className="text-left p-4 text-xs font-light text-gray-500">Date & Time</th>
                <th className="text-left p-4 text-xs font-light text-gray-500">Price</th>
                <th className="text-left p-4 text-xs font-light text-gray-500">Status</th>
              </tr>
            </thead>
            <tbody>
              {recentAppointments.map(appointment => (
                <tr key={appointment.id} className="border-b border-gray-200">
                  <td className="p-4">
                    <div>
                      <p className="text-sm font-light text-gray-900">{appointment.customer_name}</p>
                      <p className="text-xs text-gray-500">{appointment.customer_email}</p>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-light text-gray-900">{appointment.service_name}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-light text-gray-900">{appointment.date}</p>
                    <p className="text-xs text-gray-500">{appointment.time}</p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-light text-gray-900">${appointment.service_price}</p>
                  </td>
                  <td className="p-4">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-light bg-green-100 text-green-800">
                      Confirmed
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export default BusinessDashboard 