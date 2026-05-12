import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  X, 
  Upload, 
  CheckCircle, 
  AlertCircle, 
  Loader2, 
  FileText,
  Copy,
  Info,
  CreditCard,
  ExternalLink,
  Trash2
} from 'lucide-react'
import { supabase } from '../../lib/supabase'

const PaymentModal = ({ isOpen, onClose, service, payment, month, year, onSuccess }) => {
  const [paidAmount, setPaidAmount] = useState('')
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0])
  const [status, setStatus] = useState('paid')
  const [notes, setNotes] = useState('')
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (payment) {
      setFile(payment.receipt_url || null)
    }
  }, [payment])

  useEffect(() => {
    if (payment) {
      setPaidAmount(payment.paid_amount || '')
      setPaymentDate(payment.payment_date || new Date().toISOString().split('T')[0])
      setStatus(payment.status || 'paid')
      setNotes(payment.notes || '')
    } else if (service) {
      setPaidAmount(service.estimated_amount || '')
    }
  }, [payment, service])

  const handleFileUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    setUploading(true)
    try {
      const fileExt = file.name.split('.').pop()
      const fileName = `${Math.random()}.${fileExt}`
      const filePath = `${service.id}/${fileName}`

      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file)

      if (uploadError) throw uploadError

      const { data: { publicUrl } } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath)

      setFile(publicUrl)
    } catch (error) {
      alert('Error al subir archivo: ' + error.message)
    } finally {
      setUploading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      
      const payload = {
        user_id: user.id,
        service_id: service.id,
        month,
        year,
        paid_amount: parseFloat(paidAmount),
        payment_date: paymentDate,
        status,
        notes,
        receipt_url: file
      }

      let error
      if (payment) {
        const { error: updateError } = await supabase
          .from('payments')
          .update(payload)
          .eq('id', payment.id)
        error = updateError
      } else {
        const { error: insertError } = await supabase
          .from('payments')
          .insert([payload])
        error = insertError
      }

      if (error) throw error

      // If it's an installment service and it was just marked as paid, increment the current_installment
      if (service?.is_installment && status === 'paid') {
        const nextInstallment = (service.current_installment || 0) + 1
        if (nextInstallment <= (service.total_installments || 999)) {
          await supabase
            .from('services')
            .update({ current_installment: nextInstallment })
            .eq('id', service.id)
        }
      }

      onSuccess()
      onClose()
    } catch (error) {
      alert('Error al guardar: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteReceipt = async () => {
    if (!confirm('¿Estás seguro de que quieres borrar este comprobante?')) return
    
    try {
      if (payment) {
        const { error } = await supabase
          .from('payments')
          .update({ receipt_url: null })
          .eq('id', payment.id)
        
        if (error) throw error
      }
      
      setFile(null)
      alert('Comprobante borrado')
    } catch (error) {
      alert('Error al borrar: ' + error.message)
    }
  }

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text)
    alert(`${label} copiado al portapapeles`)
  }

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
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
          className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[32px] shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
        >
          {/* Header */}
          <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-2xl">
                {service?.icon || '💸'}
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{service?.name}</h2>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Registro de Pago</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
            
            {/* Payment Info / Transfer Details */}
            {(service?.cbu || service?.alias || service?.notes) && (
              <div className="p-4 bg-primary/5 dark:bg-primary/10 rounded-2xl border border-primary/10 space-y-3">
                <div className="flex items-center gap-2 text-primary mb-1">
                  <CreditCard size={16} />
                  <span className="text-xs font-bold uppercase tracking-wider">Datos para pagar</span>
                </div>
                
                {service.cbu && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">CBU / CVU</p>
                      <p className="text-sm font-mono font-bold dark:text-slate-200">{service.cbu}</p>
                    </div>
                    <button type="button" onClick={() => copyToClipboard(service.cbu, 'CBU')} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                )}

                {service.alias && (
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold">Alias</p>
                      <p className="text-sm font-bold dark:text-slate-200">{service.alias}</p>
                    </div>
                    <button type="button" onClick={() => copyToClipboard(service.alias, 'Alias')} className="p-2 hover:bg-primary/10 rounded-lg text-primary transition-colors">
                      <Copy size={16} />
                    </button>
                  </div>
                )}

                {service.notes && (
                  <div className="flex gap-2 pt-1 border-t border-primary/10 mt-1">
                    <Info size={14} className="text-primary shrink-0 mt-0.5" />
                    <p className="text-xs text-slate-600 dark:text-slate-400 italic">{service.notes}</p>
                  </div>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Monto Pagado</label>
                <div className="relative">
                  <span className="absolute left-4 top-3 text-slate-400 font-bold">$</span>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paidAmount}
                    onChange={(e) => setPaidAmount(e.target.value)}
                    className="w-full pl-8 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Fecha de Pago</label>
                <input
                  type="date"
                  required
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary transition-all font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Estado del Pago</label>
              <div className="grid grid-cols-3 gap-2">
                {['paid', 'pending', 'overdue'].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus(s)}
                    className={`py-3 rounded-2xl text-[10px] font-bold uppercase tracking-widest transition-all ${
                      status === s 
                        ? 'bg-primary text-white shadow-lg shadow-primary/20 scale-105' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    {s === 'paid' ? 'Pagado' : s === 'pending' ? 'Pendiente' : 'Vencido'}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">Comprobante (Imagen o PDF)</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileUpload}
                  className="hidden"
                  id="receipt-upload"
                />
                <div className="flex flex-col gap-3">
                  <label
                    htmlFor="receipt-upload"
                    className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-[24px] cursor-pointer transition-all ${
                      file || payment?.receipt_url
                        ? 'border-emerald-500 bg-emerald-50/30 dark:bg-emerald-900/10'
                        : 'border-slate-200 dark:border-slate-800 hover:border-primary hover:bg-primary/5'
                    }`}
                  >
                    {uploading ? (
                      <Loader2 className="animate-spin text-primary" size={32} />
                    ) : file || payment?.receipt_url ? (
                      <>
                        <CheckCircle className="text-emerald-500 mb-2" size={32} />
                        <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">¡Comprobante Cargado!</span>
                        <span className="text-[10px] text-slate-400 mt-1">Haz clic para cambiar</span>
                      </>
                    ) : (
                      <>
                        <Upload className="text-slate-400 mb-2" size={32} />
                        <span className="text-sm font-bold text-slate-500">Haz click para subir</span>
                        <span className="text-[10px] text-slate-400">JPG, PNG o PDF</span>
                      </>
                    )
                  }
                  </label>

                  {(file) && (
                    <div className="flex gap-2">
                      <a 
                        href={file} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex-1 flex items-center justify-center gap-2 py-3 bg-emerald-500/10 text-emerald-600 rounded-2xl text-xs font-bold hover:bg-emerald-500/20 transition-all border border-emerald-500/20"
                      >
                        <ExternalLink size={16} /> Ver Actual
                      </a>
                      <button
                        type="button"
                        onClick={handleDeleteReceipt}
                        className="p-3 bg-rose-500/10 text-rose-600 rounded-2xl hover:bg-rose-500/20 transition-all border border-rose-500/10"
                        title="Borrar Comprobante"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || uploading}
              className="w-full py-4 bg-primary text-white font-bold rounded-2xl shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:scale-100 hover:scale-[1.02] active:scale-95"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : <><FileText size={20} /> Guardar Registro</>}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}

export default PaymentModal
