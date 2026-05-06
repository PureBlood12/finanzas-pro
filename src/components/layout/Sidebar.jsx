import React from 'react'
import { 
  LayoutDashboard, 
  Receipt, 
  Calendar, 
  CreditCard, 
  LogOut, 
  Settings,
  Wallet,
  Sun,
  Moon
} from 'lucide-react'
import { motion } from 'framer-motion'

const Sidebar = ({ activeTab, setActiveTab, signOut, darkMode, setDarkMode }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'services', label: 'Servicios', icon: CreditCard },
    { id: 'payments', label: 'Pagos', icon: Receipt },
    { id: 'reports', label: 'Reportes', icon: Calendar },
  ]

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 fixed h-full transition-colors duration-300">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-10">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/20">
            <Wallet size={24} />
          </div>
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600">
            Finanzas Pro
          </span>
        </div>

        <nav className="space-y-1">
          {menuItems.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                  activeTab === item.id
                    ? 'bg-primary/10 text-primary shadow-sm'
                    : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon size={20} className={activeTab === item.id ? 'text-primary' : 'group-hover:scale-110 transition-transform'} />
                <span className="font-medium">{item.label}</span>
                {activeTab === item.id && (
                  <motion.div 
                    layoutId="activeTab"
                    className="ml-auto w-1.5 h-1.5 rounded-full bg-primary"
                  />
                )}
              </button>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto p-6 space-y-4">
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Cuenta</p>
          
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            className="w-full flex items-center gap-3 px-2 py-2 text-slate-600 dark:text-slate-300 hover:text-primary transition-colors"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            <span className="text-sm font-medium">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
          </button>

          <button 
            onClick={() => setActiveTab('settings')} 
            className={`w-full flex items-center gap-3 px-2 py-2 rounded-xl transition-all ${
              activeTab === 'settings'
                ? 'bg-primary/10 text-primary shadow-sm'
                : 'text-slate-600 dark:text-slate-300 hover:text-primary'
            }`}
          >
            <Settings size={18} />
            <span className="text-sm font-medium">Ajustes</span>
          </button>
          
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-2 py-2 text-red-500 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} />
            <span className="text-sm font-medium">Cerrar sesión</span>
          </button>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
