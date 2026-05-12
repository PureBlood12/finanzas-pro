import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Search, Filter, MoreVertical, Edit2, Trash2, ExternalLink } from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import ServiceModal from './ServiceModal'

const Services = () => {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingService, setEditingService] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .order('name', { ascending: true })
      
      if (error) throw error
      setServices(data || [])
    } catch (err) {
      console.error('Error fetching services:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este servicio?')) return
    
    try {
      const { error } = await supabase.from('services').delete().eq('id', id)
      if (error) throw error
      setServices(services.filter(s => s.id !== id))
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  const filteredServices = services.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.category.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const categories = {
    Vivienda: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Servicios: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Suscripciones: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Transporte: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Tarjetas: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    Otro: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Mis Servicios</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestiona tus gastos recurrentes y suscripciones.</p>
        </div>
        <button 
          onClick={() => { setEditingService(null); setIsModalOpen(true); }}
          className="bg-primary hover:bg-primary/90 text-white px-6 py-3 rounded-2xl font-semibold shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95"
        >
          <Plus size={20} />
          Nuevo Servicio
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Buscar por nombre o categoría..."
            className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button className="px-4 py-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl flex items-center gap-2 text-slate-600 dark:text-slate-400 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm">
          <Filter size={18} />
          Filtros
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-pulse">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="h-48 bg-slate-100 dark:bg-slate-800 rounded-3xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {filteredServices.map((service, i) => (
              <motion.div
                key={service.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
              >
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-3xl shadow-inner group-hover:scale-110 transition-transform duration-300">
                    {service.icon || '💸'}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={() => { setEditingService(service); setIsModalOpen(true); }}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-primary transition-colors"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button 
                      onClick={() => handleDelete(service.id)}
                      className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl text-slate-400 hover:text-rose-500 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white truncate">{service.name}</h3>
                    {service.is_installment && (
                      <div className="flex flex-col items-center bg-amber-500 px-3 py-1 rounded-xl shadow-lg shadow-amber-500/20 scale-110">
                        <span className="text-[10px] font-black text-white leading-tight">
                          {service.current_installment}/{service.total_installments}
                        </span>
                        <span className="text-[6px] font-black text-white/80 uppercase tracking-tighter">Cuotas</span>
                      </div>
                    )}
                  </div>
                  <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${categories[service.category] || categories.Otro}`}>
                    {service.category}
                  </span>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 dark:border-slate-800 flex justify-between items-end">
                  <div>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Estimado</p>
                    <p className="text-2xl font-black text-slate-900 dark:text-white">${Number(service.estimated_amount).toLocaleString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Vence</p>
                    <p className="font-bold text-slate-700 dark:text-slate-300">Día {service.due_day}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredServices.length === 0 && !loading && (
            <div className="col-span-full py-20 text-center">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 mb-4">
                <Search size={32} />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">No se encontraron servicios</h3>
              <p className="text-slate-500">Intenta con otros términos de búsqueda o crea uno nuevo.</p>
            </div>
          )}
        </div>
      )}

      <ServiceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchServices}
        editingService={editingService}
      />
    </div>
  )
}

export default Services
