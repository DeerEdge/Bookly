const BusinessDashboard = ({ businesses, appointments }) => {
  const formatDateTime = (date, time) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getUpcomingAppointments = () => {
    const now = new Date()
    return appointments
      .filter(appointment => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
        return appointmentDate > now
      })
      .sort((a, b) => new Date(`${a.date}T${a.time}`) - new Date(`${b.date}T${b.time}`))
  }

  const getPastAppointments = () => {
    const now = new Date()
    return appointments
      .filter(appointment => {
        const appointmentDate = new Date(`${appointment.date}T${appointment.time}`)
        return appointmentDate <= now
      })
      .sort((a, b) => new Date(`${b.date}T${b.time}`) - new Date(`${a.date}T${a.time}`))
  }

  const upcomingAppointments = getUpcomingAppointments()
  const pastAppointments = getPastAppointments()

  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-light text-gray-900 mb-2">Business Dashboard</h1>
        <p className="text-gray-500 font-light">Manage your appointments and business</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="text-2xl font-light text-gray-900">{businesses.length}</div>
          <div className="text-xs text-gray-500 font-light">Registered Businesses</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="text-2xl font-light text-gray-900">{appointments.length}</div>
          <div className="text-xs text-gray-500 font-light">Total Appointments</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="text-2xl font-light text-gray-900">{upcomingAppointments.length}</div>
          <div className="text-xs text-gray-500 font-light">Upcoming</div>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-4">
          <div className="text-2xl font-light text-gray-900">{pastAppointments.length}</div>
          <div className="text-xs text-gray-500 font-light">Completed</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Upcoming Appointments */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="text-lg font-light text-gray-900 mb-4">Upcoming Appointments</h2>
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-light">No upcoming appointments</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingAppointments.slice(0, 5).map(appointment => (
                <div key={appointment.id} className="p-4 bg-gray-25 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-light text-gray-900 mb-1">{appointment.customerName}</h3>
                      <p className="text-xs text-gray-600 mb-1">{appointment.businessName}</p>
                      <p className="text-xs text-gray-500">{appointment.serviceName} - ${appointment.servicePrice}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-600 font-light">
                        {formatDateTime(appointment.date, appointment.time)}
                      </p>
                      <p className="text-xs text-gray-400">{appointment.customerEmail}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Registered Businesses */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="text-lg font-light text-gray-900 mb-4">Registered Businesses</h2>
          {businesses.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg className="w-6 h-6 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <p className="text-sm text-gray-500 font-light">No businesses registered yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {businesses.map(business => (
                <div key={business.id} className="p-4 bg-gray-25 rounded-lg border border-gray-100">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-light text-gray-900 mb-1">{business.name}</h3>
                      <p className="text-xs text-gray-600 mb-1">{business.category}</p>
                      <p className="text-xs text-gray-500">{business.address}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded-full font-light">
                        {business.services.length} services
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Appointments */}
      {appointments.length > 0 && (
        <div className="mt-8 bg-white rounded-lg border border-gray-100 p-6">
          <h2 className="text-lg font-light text-gray-900 mb-4">Recent Appointments</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100">
                  <th className="text-left py-2 font-light text-gray-600">Customer</th>
                  <th className="text-left py-2 font-light text-gray-600">Business</th>
                  <th className="text-left py-2 font-light text-gray-600">Service</th>
                  <th className="text-left py-2 font-light text-gray-600">Date & Time</th>
                  <th className="text-left py-2 font-light text-gray-600">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 10).map(appointment => (
                  <tr key={appointment.id} className="border-b border-gray-50">
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-light text-gray-900">{appointment.customerName}</p>
                        <p className="text-xs text-gray-500">{appointment.customerEmail}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-light text-gray-900">{appointment.businessName}</p>
                    </td>
                    <td className="py-3">
                      <div>
                        <p className="text-sm font-light text-gray-900">{appointment.serviceName}</p>
                        <p className="text-xs text-gray-500">${appointment.servicePrice}</p>
                      </div>
                    </td>
                    <td className="py-3">
                      <p className="text-sm font-light text-gray-900">
                        {formatDateTime(appointment.date, appointment.time)}
                      </p>
                    </td>
                    <td className="py-3">
                      <span className="text-xs bg-green-50 text-green-600 px-2 py-1 rounded-full font-light">
                        {appointment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default BusinessDashboard 