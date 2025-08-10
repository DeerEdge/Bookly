import React, { useState } from 'react'
import { Navigate } from 'react-router-dom'
import Login from './Login'

const AdminLogin = ({ 
  isAuthenticated, 
  onLogin, 
  onBusinessRegistered 
}) => {
  const [activeTab, setActiveTab] = useState('login')

  if (isAuthenticated) {
    return <Navigate to="/manage" replace />
  }

  return (
    <div className="min-h-screen bg-gray-25">
      <Login 
        onLogin={onLogin}
        onRegister={() => setActiveTab('register')}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onBusinessRegistered={onBusinessRegistered}
      />
    </div>
  )
}

export default AdminLogin 