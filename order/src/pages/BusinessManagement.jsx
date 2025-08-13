import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Navbar from '../components/Navbar'
import BusinessDashboard from './BusinessDashboard'
import BusinessCalendar from '../components/BusinessCalendar'
import BusinessHistory from './BusinessHistory'
import BusinessProfile from './BusinessProfile'
import BusinessServices from './BusinessServices'
import BusinessRegistration from './BusinessRegistration'

const BusinessManagement = ({ 
  isAuthenticated, 
  currentUser, 
  businesses, 
  appointments, 
  onLogout, 
  onLoadAppointments,
  onUpdateProfile 
}) => {
  const [activeTab, setActiveTab] = useState('dashboard')
  const [lastRefresh, setLastRefresh] = useState(new Date())

  const handleManualRefresh = async () => {
    try {
      await onLoadAppointments()
      setLastRefresh(new Date())
    } catch (error) {
      console.error('Manual refresh failed:', error)
    }
  }

  if (!isAuthenticated) {
    return <Navigate to="/manage/login" replace />
  }

  return (
    <div className="min-h-screen bg-gray-25">
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        onLogout={onLogout}
        isAdmin={true}
      />
      
      {/* Refresh Status Bar */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex justify-between items-center">
          <div className="text-xs text-gray-500 font-light">
            Last updated: {lastRefresh.toLocaleTimeString()}
          </div>
          <button
            onClick={handleManualRefresh}
            className="px-3 py-1 text-xs bg-blue-500 hover:bg-blue-600 text-white rounded font-light transition-colors"
          >
            Refresh Data
          </button>
        </div>
      </div>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && (
          <BusinessDashboard 
            businesses={businesses}
            appointments={appointments}
            currentUser={currentUser}
            onLoadAppointments={onLoadAppointments}
          />
        )}
        {activeTab === 'calendar' && (
          <BusinessCalendar 
            appointments={appointments.filter(apt => apt.business_id === currentUser.id)}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'history' && (
          <BusinessHistory 
            appointments={appointments.filter(apt => apt.business_id === currentUser.id)}
            currentUser={currentUser}
          />
        )}
        {activeTab === 'services' && (
          <BusinessServices 
            business={currentUser}
          />
        )}
        {activeTab === 'profile' && (
          <BusinessProfile 
            business={currentUser}
            onUpdateProfile={onUpdateProfile}
          />
        )}
      </main>
    </div>
  )
}

export default BusinessManagement 