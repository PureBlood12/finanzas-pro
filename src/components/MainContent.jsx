import React, { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import Login from './auth/Login'
import Dashboard from './dashboard/Dashboard'
import Sidebar from './layout/Sidebar'
import BottomNav from './layout/BottomNav'
import Services from './services/Services'
import Payments from './payments/Payments'
import Reports from './reports/Reports'
import Settings from './settings/Settings'

const MainContent = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  if (!user) {
    return <Login />
  }

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />
      case 'services': return <Services />
      case 'payments': return <Payments />
      case 'reports': return <Reports />
      case 'settings': return <Settings />
      default: return <Dashboard />
    }
  }

  return (
    <div className="flex min-h-screen bg-background text-foreground transition-colors duration-300">
      {/* Desktop Sidebar */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        signOut={signOut} 
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      {/* Main Content Area */}
      <main className="flex-1 pb-20 md:pb-0 md:ml-64 transition-all duration-300">
        <div className="p-4 md:p-8 max-w-7xl mx-auto">
          {renderContent()}
        </div>
      </main>

      {/* Mobile Bottom Nav */}
      <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

export default MainContent
