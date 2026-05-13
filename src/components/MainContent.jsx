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
import { supabase } from '../lib/supabase'
import { AlertTriangle, ChevronRight, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

const MainContent = () => {
  const { user, signOut } = useAuth()
  const [activeTab, setActiveTab] = useState('dashboard')
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('theme') === 'dark'
  })
  const [hasOverdue, setHasOverdue] = useState(false)
  const [overdueCount, setOverdueCount] = useState(0)
  const [showBanner, setShowBanner] = useState(true)

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }, [darkMode])

  useEffect(() => {
    if (user) {
      checkOverdue()
    }
  }, [user, activeTab])

  const checkOverdue = async () => {
    try {
      const now = new Date()
      const currentDay = now.getDate()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()

      const { data: services } = await supabase
        .from('services')
        .select('id, due_day')
        .eq('user_id', user.id)
        .eq('active', true)
      
      const { data: payments } = await supabase
        .from('payments')
        .select('service_id')
        .eq('user_id', user.id)
        .eq('month', currentMonth)
        .eq('year', currentYear)
        .eq('status', 'paid')

      const paidIds = new Set(payments?.map(p => p.service_id))
      const overdue = services?.filter(s => !paidIds.has(s.id) && s.due_day < currentDay)
      
      setHasOverdue(overdue?.length > 0)
      setOverdueCount(overdue?.length || 0)
    } catch (err) {
      console.error('Error checking overdue:', err)
    }
  }

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
        <AnimatePresence>
          {hasOverdue && showBanner && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-rose-500 text-white"
            >
              <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-white/20 p-1.5 rounded-lg animate-pulse">
                    <AlertTriangle size={18} />
                  </div>
                  <p className="text-sm font-bold">
                    ¡Atención! Tienes {overdueCount} {overdueCount === 1 ? 'pago vencido' : 'pagos vencidos'}.
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="hidden sm:flex items-center gap-1 text-xs font-black uppercase tracking-widest bg-white/20 px-3 py-1.5 rounded-lg hover:bg-white/30 transition-all"
                  >
                    Ver Ahora <ChevronRight size={14} />
                  </button>
                  <button onClick={() => setShowBanner(false)} className="p-1 hover:bg-white/20 rounded-full">
                    <X size={18} />
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

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
