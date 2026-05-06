import React, { useEffect, useState } from 'react'
import { X, Save, Upload, Trash2, FileText, Loader2, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const PaymentModal = ({ isOpen, onClose, service, payment, month, year, onSuccess }) => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    paid_amount: '',
    payment_date: new Date().toISOString().split('T')[0],
    status: 'paid',
    notes: '',
    receipt_url: ''
  })

  useEffect(() => {
    if (payment) {
      setFormData({
        paid_amount: payment.paid_amount || '',
        payment_date: payment.payment_date || new Date().toISOString().split('T')[0],
        status: payment.status || 'paid',
        notes: payment.notes || '',
        receipt_url: payment.receipt_url || ''
      })
    } else if (service) {
      setFormData({
        paid_amount: service.estimated_amount || '',
        payment_date: new Date().toISOString().split('T')[0],
        status: 'paid',
        notes: '',
        receipt_url: ''
      })
    }
  }, [payment, service, isOpen])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      const filePath = `receipts/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath)

      setFormData(prev => ({ ...prev, receipt_url: publicUrl }))
    } catch (err) {
      alert('Error al subir archivo: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      user_id: user.id,
      service_id: service.id,
      month,
      year,
      paid_amount: parseFloat(formData.paid_amount),
      payment_date: formData.payment_date,
      status: formData.status,
      notes: formData.notes,
      receipt_url: formData.receipt_url
    }

    try {
      let error
      if (payment) {
        ({ error } = await supabase.from('payments').update(payload).eq('id', payment.id))
      } else {
        ({ error } = await supabase.from('payments').insert([payload]))
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

  if (!isOpen || !service) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={onClose} className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
      />
      
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{service.icon || '💸'}</div>
            <div>
              <h2 className="text-xl font-bold">{service.name}</h2>
              <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Registro de Pago</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monto Pagado</label>
              <div className="relative">
                <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                <input 
                  type="number" step="0.01" required
                  className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-lg"
                  value={formData.paid_amount}
                  onChange={(e) => setFormData({...formData, paid_amount: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Fecha de Pago</label>
              <input 
                type="date" required
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all"
                value={formData.payment_date}
                onChange={(e) => setFormData({...formData, payment_date: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Estado del Pago</label>
            <div className="flex gap-2">
              {['paid', 'pending', 'overdue'].map(status => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setFormData({...formData, status})}
                  className={`flex-1 py-3 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all border-2 ${
                    formData.status === status 
                      ? 'border-primary bg-primary/10 text-primary' 
                      : 'border-transparent bg-slate-50 dark:bg-slate-800 text-slate-400'
                  }`}
                >
                  {status === 'paid' ? 'Pagado' : status === 'pending' ? 'Pendiente' : 'Vencido'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Comprobante (Imagen o PDF)</label>
            <div className="flex items-center gap-4">
              <label className={`flex-1 flex flex-col items-center justify-center border-2 border-dashed rounded-3xl p-6 transition-all cursor-pointer ${formData.receipt_url ? 'border-emerald-200 bg-emerald-50/30 text-emerald-600' : 'border-slate-200 dark:border-slate-700 hover:border-primary hover:bg-slate-50'}`}>
                {uploading ? (
                  <Loader2 className="animate-spin text-primary" size={32} />
                ) : formData.receipt_url ? (
                  <>
                    <Check size={32} className="text-emerald-500 mb-2" />
                    <span className="text-sm font-bold">¡Subido con éxito!</span>
                  </>
                ) : (
                  <>
                    <Upload size={32} className="text-slate-400 mb-2" />
                    <span className="text-sm font-bold text-slate-500">Haz click para subir</span>
                  </>
                )}
                <input type="file" className="hidden" accept="image/*,application/pdf" onChange={handleFileUpload} />
              </label>
              
              {formData.receipt_url && (
                <a href={formData.receipt_url} target="_blank" rel="noreferrer" className="p-4 bg-slate-100 dark:bg-slate-800 rounded-2xl text-slate-500 hover:text-primary transition-all shadow-sm">
                  <FileText size={24} />
                </a>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || uploading}
            className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? 'Guardando...' : <><Save size={20} /> Guardar Registro</>}
          </button>
        </form>
      </motion.div>
    </div>
  )
}

export default PaymentModal
