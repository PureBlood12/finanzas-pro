import React, { useState } from 'react'
import { 
  User, 
  Bell, 
  Shield, 
  Database, 
  Trash2, 
  Save, 
  Mail, 
  Smartphone, 
  Lock, 
  Key, 
  EyeOff,
  BellRing
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'

const Settings = () => {
  const { user } = useAuth()
  const [activeSubTab, setActiveSubTab] = useState('profile')
  const [name, setName] = useState('Usuario de Prueba')
  const [loading, setLoading] = useState(false)
  
  const [notifSettings, setNotifSettings] = useState({
    due_reminders: true,
    monthly_report: false,
    push_notifications: false
  })

  const handleSave = () => {
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      alert('Ajustes guardados correctamente')
    }, 1000)
  }

  const clearData = () => {
    if (window.confirm('¿Estás seguro de que quieres borrar todos los datos locales? Esto no se puede deshacer.')) {
      localStorage.removeItem('finanzas_pro_mock_data')
      window.location.reload()
    }
  }

  const subTabs = [
    { id: 'profile', label: 'Perfil', icon: User },
    { id: 'notifications', label: 'Notificaciones', icon: Bell },
    { id: 'security', label: 'Seguridad', icon: Shield },
    { id: 'data', label: 'Datos', icon: Database },
  ]

  const renderSubContent = () => {
    switch (activeSubTab) {
      case 'profile':
        return (
          <div className="space-y-6">
            <div className="flex items-center gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-2xl">👤</div>
              <div>
                <h3 className="font-bold text-lg">{name}</h3>
                <p className="text-sm text-slate-500">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre Completo</label>
                <input 
                  type="text" 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Correo Electrónico</label>
                <input 
                  type="email" 
                  disabled
                  className="w-full px-4 py-3 bg-slate-100 dark:bg-slate-800/50 text-slate-400 border-none rounded-2xl outline-none cursor-not-allowed"
                  value={user?.email || ''}
                />
              </div>
            </div>
          </div>
        )
      case 'notifications':
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg mb-4">Preferencias de Aviso</h3>
            <div className="space-y-4">
              {[
                { id: 'due_reminders', title: 'Vencimientos próximos', desc: 'Avisar 2 días antes de cada vencimiento', icon: BellRing },
                { id: 'monthly_report', title: 'Email mensual', desc: 'Resumen de gastos al finalizar el mes', icon: Mail },
                { id: 'push_notifications', title: 'Notificaciones Push', desc: 'Alertas en el navegador o móvil', icon: Smartphone }
              ].map((item) => (
                <label key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white dark:bg-slate-800 rounded-lg text-primary"><item.icon size={18} /></div>
                    <div>
                      <p className="text-sm font-bold">{item.title}</p>
                      <p className="text-xs text-slate-500">{item.desc}</p>
                    </div>
                  </div>
                  <div className="relative inline-flex items-center">
                    <input 
                      type="checkbox" 
                      className="sr-only peer" 
                      checked={notifSettings[item.id]} 
                      onChange={() => setNotifSettings({...notifSettings, [item.id]: !notifSettings[item.id]})}
                    />
                    <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                  </div>
                </label>
              ))}
            </div>
          </div>
        )
      case 'security':
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg mb-4">Seguridad de la Cuenta</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Contraseña Actual</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nueva Contraseña</label>
                <div className="relative">
                  <Key className="absolute left-3 top-3.5 text-slate-400" size={18} />
                  <input type="password" placeholder="••••••••" className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all" />
                </div>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-900/10 rounded-2xl border border-amber-100 dark:border-amber-900/30 flex gap-3">
                <div className="text-amber-500"><Shield size={20} /></div>
                <p className="text-xs text-amber-700 dark:text-amber-400">Te recomendamos cambiar tu contraseña cada 6 meses para mantener tu cuenta segura.</p>
              </div>
            </div>
          </div>
        )
      case 'data':
        return (
          <div className="space-y-6">
            <h3 className="font-bold text-lg mb-4">Gestión de Datos</h3>
            <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Exportar todos mis datos (JSON)</span>
                <button className="text-primary font-bold text-sm hover:underline">Descargar</button>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Sincronización en la nube</span>
                <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-1 rounded-md font-bold">Activa</span>
              </div>
            </div>
            <div className="bg-red-50 dark:bg-red-900/10 rounded-3xl p-6 border border-red-100 dark:border-red-900/30">
              <h4 className="text-red-600 dark:text-red-400 font-bold mb-2 flex items-center gap-2">
                <Trash2 size={18} /> Zona de Peligro
              </h4>
              <p className="text-sm text-red-500/80 mb-4">Borrar todos los datos locales restablecerá la aplicación a su estado inicial.</p>
              <button 
                onClick={clearData}
                className="px-4 py-2 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 text-sm font-bold rounded-xl hover:bg-red-600 hover:text-white transition-all"
              >
                Borrar Datos Locales
              </button>
            </div>
          </div>
        )
      default: return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Ajustes</h1>
        <p className="text-slate-500 dark:text-slate-400">Gestiona tu perfil y preferencias de la app.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Navigation */}
        <div className="space-y-2">
          {subTabs.map((tab) => (
            <button 
              key={tab.id}
              onClick={() => setActiveSubTab(tab.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-bold transition-all ${
                activeSubTab === tab.id
                  ? 'bg-primary/10 text-primary shadow-sm'
                  : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <tab.icon size={20} /> {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2">
          <motion.div 
            key={activeSubTab}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200 dark:border-slate-800 shadow-sm min-h-[400px] flex flex-col"
          >
            <div className="flex-1">
              {renderSubContent()}
            </div>

            {activeSubTab !== 'data' && (
              <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800">
                <button 
                  onClick={handleSave}
                  disabled={loading}
                  className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
                >
                  {loading ? 'Guardando...' : <><Save size={20} /> Guardar Cambios</>}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Settings
