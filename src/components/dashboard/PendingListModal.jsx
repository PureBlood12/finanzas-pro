import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Clock, AlertCircle, ChevronRight } from 'lucide-react'

const PendingListModal = ({ isOpen, onClose, services }) => {
  if (!isOpen) return null

  const today = new Date().getDate()

  const categories = {
    Vivienda: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
    Servicios: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
    Suscripciones: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
    Transporte: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
    Tarjetas: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
    Otro: 'bg-slate-100 text-slate-700 dark:bg-slate-900/30 dark:text-slate-400',
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        />
        
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[80vh]"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-500">
                <Clock size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Cuentas Pendientes</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Este mes</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors text-slate-400">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
            {services.length > 0 ? (
              services.map((service) => (
                <div 
                  key={service.id}
                  className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800 hover:border-amber-500/30 transition-all group"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                      {service.icon || '💸'}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-slate-900 dark:text-white leading-tight">{service.name}</h4>
                        {service.is_installment && (
                          <div className="flex flex-col items-center bg-amber-500 px-2 py-0.5 rounded-lg">
                            <span className="text-[9px] font-black text-white leading-none">
                              {service.current_installment}/{service.total_installments}
                            </span>
                            <span className="text-[5px] font-black text-white/80 uppercase tracking-tighter">Cuotas</span>
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${categories[service.category] || categories.Otro}`}>
                          {service.category}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 uppercase">Vence: Día {service.due_day}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-slate-900 dark:text-white">${Number(service.estimated_amount).toLocaleString()}</p>
                    <div className={`flex items-center justify-end gap-1 ${service.due_day < today ? 'text-rose-500' : 'text-amber-500'}`}>
                      <AlertCircle size={12} />
                      <span className="text-[10px] font-bold uppercase">
                        {service.due_day < today ? 'Vencido' : 'Pendiente'}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="py-12 text-center">
                <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-500 mb-4">
                  <Clock size={32} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">¡Todo al día!</h3>
                <p className="text-slate-500">No tienes cuentas pendientes para este mes.</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {services.length > 0 && (
            <div className="p-6 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/50 flex justify-between items-center">
              <div>
                <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Total Pendiente</p>
                <p className="text-xl font-black text-amber-500">
                  ${services.reduce((acc, s) => acc + (s.estimated_amount || 0), 0).toLocaleString()}
                </p>
              </div>
              <button 
                onClick={onClose}
                className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg hover:opacity-90 transition-all active:scale-95"
              >
                Cerrar
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PendingListModal
