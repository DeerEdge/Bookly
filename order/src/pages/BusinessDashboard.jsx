import { useState } from 'react'

const BusinessDashboard = ({ businesses, appointments, currentUser, onLoadAppointments }) => {
  const [selectedBusiness, setSelectedBusiness] = useState(null)

  const getBusinessUrl = (business) => {
    return `${window.location.origin}/${business.slug}`
  }

  const getAppointmentStatus = (appointment) => {
    const appointmentDateTime = new Date(`${appointment.date}T${appointment.time}`)
    const now = new Date()
    
    if (appointmentDateTime < now) {
      return { text: 'Completed', style: 'bg-gray-100 text-gray-800' }
    } else {
      return { text: 'Confirmed', style: 'bg-green-100 text-green-800' }
    }
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
    .filter(apt => new Date(`${apt.date}T${apt.time}`) > new Date())
    .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
    .slice(0, 5)

  const recentAppointments = businessAppointments
    .sort((a, b) => new Date(`${b.date} ${b.time}`) - new Date(`${a.date} ${a.time}`))
    .slice(0, 8)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-light text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600 font-light">Welcome back, {currentUser.name}</p>
        </div>
        <div>
          <button
            onClick={() => window.open(getBusinessUrl(currentUser), '_blank')}
            className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-light text-sm transition-colors"
          >
            View Customer Page
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">Total Appointments</h3>
          <p className="text-xl sm:text-2xl font-light text-gray-900">{businessAppointments.length}</p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">This Month</h3>
          <p className="text-xl sm:text-2xl font-light text-gray-900">
            {businessAppointments.filter(apt => {
              const aptDate = new Date(apt.date)
              const now = new Date()
              return aptDate.getMonth() === now.getMonth() && 
                     aptDate.getFullYear() === now.getFullYear()
            }).length}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">Today</h3>
          <p className="text-xl sm:text-2xl font-light text-gray-900">
            {businessAppointments.filter(apt => {
              const aptDate = new Date(apt.date)
              const today = new Date()
              return aptDate.toDateString() === today.toDateString()
            }).length}
          </p>
        </div>
        <div className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200">
          <h3 className="text-sm font-light text-gray-500 mb-2">Services</h3>
          <p className="text-xl sm:text-2xl font-light text-gray-900">{currentUser.services?.length || 0}</p>
        </div>
      </div>

      {/* Upcoming Appointments */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-light text-gray-900">Upcoming Appointments</h3>
        </div>
        {upcomingAppointments.length === 0 ? (
          <div className="p-6">
            <p className="text-gray-500 font-light">No upcoming appointments</p>
          </div>
        ) : (
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
                {upcomingAppointments.map(appointment => (
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
                      <p className="text-sm font-light text-gray-900">
                        {new Date(appointment.date).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric'
                        })}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', {
                          hour: 'numeric',
                          minute: '2-digit',
                          hour12: true
                        })}
                      </p>
                    </td>
                    <td className="p-4">
                      <p className="text-sm font-light text-gray-900">${appointment.service_price}</p>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-light bg-blue-100 text-blue-800">
                        Upcoming
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Future Appointments */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-light text-gray-900">Future Appointments</h3>
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
                    <p className="text-sm font-light text-gray-900">
                      {new Date(appointment.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(`2000-01-01T${appointment.time}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit',
                        hour12: true
                      })}
                    </p>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-light text-gray-900">${appointment.service_price}</p>
                  </td>
                  <td className="p-4">
                    {(() => {
                      const status = getAppointmentStatus(appointment)
                      return (
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-light ${status.style}`}>
                          {status.text}
                        </span>
                      )
                    })()}
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