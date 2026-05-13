import React, { useEffect, useState } from 'react'
import { X, Save, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const ServiceModal = ({ isOpen, onClose, onSuccess, editingService }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    category: 'Servicios',
    estimated_amount: '',
    due_day: '10',
    cbu: '',
    alias: '',
    notes: '',
    icon: '💸',
    color: '#8b5cf6',
    payment_url: '',
    is_installment: false,
    total_installments: '',
    current_installment: ''
  })

  useEffect(() => {
    if (editingService) {
      setFormData({
        name: editingService.name,
        category: editingService.category,
        estimated_amount: editingService.estimated_amount,
        due_day: editingService.due_day.toString(),
        cbu: editingService.cbu || '',
        alias: editingService.alias || '',
        notes: editingService.notes || '',
        icon: editingService.icon || '💸',
        color: editingService.color || '#8b5cf6',
        payment_url: editingService.payment_url || '',
        is_installment: editingService.is_installment || false,
        total_installments: editingService.total_installments || '',
        current_installment: editingService.current_installment || ''
      })
    } else {
      setFormData({
        name: '',
        category: 'Servicios',
        estimated_amount: '',
        due_day: '10',
        cbu: '',
        alias: '',
        notes: '',
        icon: '💸',
        color: '#8b5cf6',
        payment_url: '',
        is_installment: false,
        total_installments: '',
        current_installment: ''
      })
    }
  }, [editingService, isOpen])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      user_id: user.id,
      estimated_amount: parseFloat(formData.estimated_amount),
      due_day: parseInt(formData.due_day),
      total_installments: formData.is_installment ? parseInt(formData.total_installments) : null,
      current_installment: formData.is_installment ? parseInt(formData.current_installment) : null
    }

    try {
      let error
      if (editingService) {
        ({ error } = await supabase.from('services').update(payload).eq('id', editingService.id))
      } else {
        ({ error } = await supabase.from('services').insert([payload]))
      }

      if (error) throw error
      onSuccess()
      onClose()
    } catch (err) {
      alert('Error: ' + err.message)
    } finally {
      setLoading(false)
    }
  }

  const icons = ['💸', '🏠', '⚡', '💧', '🔥', '🌐', '📺', '📱', '🛡️', '🚗', '🎓', '🏥', '🛒', '🍔', '🏋️', '🎮', '✈️', '🎁']

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-2xl bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-2xl font-bold">{editingService ? 'Editar Servicio' : 'Nuevo Servicio'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[70vh]">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Nombre del Servicio</label>
                <input 
                  type="text" 
                  required
                  placeholder="Ej: Alquiler, Luz, Netflix"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Categoría</label>
                <select 
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={formData.category}
                  onChange={(e) => setFormData({...formData, category: e.target.value})}
                >
                  <option>Vivienda</option>
                  <option>Servicios</option>
                  <option>Suscripciones</option>
                  <option>Transporte</option>
                  <option>Tarjetas</option>
                  <option>Otro</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monto Est.</label>
                  <input 
                    type="number" 
                    required
                    placeholder="0.00"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    value={formData.estimated_amount}
                    onChange={(e) => setFormData({...formData, estimated_amount: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Día Venc.</label>
                  <input 
                    type="number" 
                    min="1" max="31"
                    required
                    placeholder="1-31"
                    className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                    value={formData.due_day}
                    onChange={(e) => setFormData({...formData, due_day: e.target.value})}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">CBU / CVU Destino (Opcional)</label>
                <input 
                  type="text" 
                  placeholder="000000..."
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={formData.cbu}
                  onChange={(e) => setFormData({...formData, cbu: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Alias Destinatario</label>
                <input 
                  type="text" 
                  placeholder="Ej: juan.perez.mp"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={formData.alias}
                  onChange={(e) => setFormData({...formData, alias: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Web de Pago (Link)</label>
                <input 
                  type="url" 
                  placeholder="https://pagos.edesa.com.ar"
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                  value={formData.payment_url}
                  onChange={(e) => setFormData({...formData, payment_url: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Icono</label>
                <div className="flex flex-wrap gap-2 p-2 bg-slate-50 dark:bg-slate-800 rounded-2xl max-h-32 overflow-y-auto">
                  {icons.map(icon => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setFormData({...formData, icon})}
                      className={`w-10 h-10 flex items-center justify-center rounded-xl transition-all ${formData.icon === icon ? 'bg-primary text-white scale-110' : 'hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                    >
                      {icon}
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between mb-4">
                  <label className="text-sm font-bold text-slate-700 dark:text-slate-300">¿Es un pago en cuotas?</label>
                  <button 
                    type="button"
                    onClick={() => setFormData({...formData, is_installment: !formData.is_installment})}
                    className={`w-12 h-6 rounded-full transition-all relative ${formData.is_installment ? 'bg-primary' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${formData.is_installment ? 'left-7' : 'left-1'}`} />
                  </button>
                </div>
                
                <AnimatePresence>
                  {formData.is_installment && (
                    <motion.div 
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="grid grid-cols-2 gap-4 overflow-hidden"
                    >
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Cuota Actual</label>
                        <input 
                          type="number" 
                          placeholder="1"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-1 focus:ring-primary transition-all text-sm font-bold"
                          value={formData.current_installment}
                          onChange={(e) => setFormData({...formData, current_installment: e.target.value})}
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">Total Cuotas</label>
                        <input 
                          type="number" 
                          placeholder="12"
                          className="w-full px-3 py-2 bg-white dark:bg-slate-900 border-none rounded-xl outline-none focus:ring-1 focus:ring-primary transition-all text-sm font-bold"
                          value={formData.total_installments}
                          onChange={(e) => setFormData({...formData, total_installments: e.target.value})}
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Notas Adicionales</label>
            <textarea 
              rows="3"
              className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all resize-none"
              placeholder="Algún detalle importante..."
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="mt-8 flex gap-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold rounded-2xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-[2] py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2"
            >
              {loading ? 'Guardando...' : <><Save size={20} /> Guardar Servicio</>}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

export default ServiceModal
