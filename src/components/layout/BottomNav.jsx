import React from 'react'
import { 
  LayoutDashboard, 
  Receipt, 
  Calendar, 
  CreditCard 
} from 'lucide-react'

const BottomNav = ({ activeTab, setActiveTab }) => {
  const menuItems = [
    { id: 'dashboard', label: 'Inicio', icon: LayoutDashboard },
    { id: 'services', label: 'Servicios', icon: CreditCard },
    { id: 'payments', label: 'Pagos', icon: Receipt },
    { id: 'reports', label: 'Reportes', icon: Calendar },
  ]

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-lg border-t border-slate-200 dark:border-slate-800 px-6 py-3 flex justify-between items-center z-50">
      {menuItems.map((item) => {
        const Icon = item.icon
        const isActive = activeTab === item.id
        return (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`flex flex-col items-center gap-1 transition-all ${
              isActive ? 'text-primary' : 'text-slate-400'
            }`}
          >
            <div className={`p-1.5 rounded-xl transition-all ${isActive ? 'bg-primary/10' : ''}`}>
              <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
            </div>
            <span className="text-[10px] font-bold uppercase tracking-tight">{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

export default BottomNav
