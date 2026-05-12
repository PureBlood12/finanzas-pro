import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  ChevronLeft, 
  ChevronRight,
  FileText,
  Upload,
  MoreVertical,
  Calendar as CalendarIcon,
  Check
} from 'lucide-react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'
import PaymentModal from './PaymentModal'

const Payments = () => {
  const { user } = useAuth()
  const [services, setServices] = useState([])
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [currentMonth, setCurrentMonth] = useState(new Date().getMonth() + 1)
  const [currentYear, setCurrentYear] = useState(new Date().getFullYear())
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedService, setSelectedService] = useState(null)
  const [selectedPayment, setSelectedPayment] = useState(null)

  useEffect(() => {
    fetchData()
  }, [currentMonth, currentYear])

  const fetchData = async () => {
    setLoading(true)
    try {
      const { data: servicesData } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
      
      const { data: paymentsData } = await supabase
        .from('payments')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear)

      setServices(servicesData || [])
      setPayments(paymentsData || [])
    } catch (err) {
      console.error('Error fetching payments data:', err)
    } finally {
      setLoading(false)
    }
  }

  const getPaymentForService = (serviceId) => {
    return payments.find(p => p.service_id === serviceId)
  }

  const handleMonthChange = (increment) => {
    let nextMonth = currentMonth + increment
    let nextYear = currentYear
    if (nextMonth > 12) {
      nextMonth = 1
      nextYear++
    } else if (nextMonth < 1) {
      nextMonth = 12
      nextYear--
    }
    setCurrentMonth(nextMonth)
    setCurrentYear(nextYear)
  }

  const months = [
    'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
    'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Pagos Mensuales</h1>
          <p className="text-slate-500 dark:text-slate-400">Control de vencimientos y comprobantes.</p>
        </div>
        
        <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
          <button onClick={() => handleMonthChange(-1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronLeft size={20} /></button>
          <div className="px-4 py-2 text-center min-w-[150px]">
            <span className="font-bold text-slate-900 dark:text-white">{months[currentMonth - 1]} {currentYear}</span>
          </div>
          <button onClick={() => handleMonthChange(1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl transition-colors"><ChevronRight size={20} /></button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50 dark:bg-slate-800/50">
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Servicio</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Vencimiento</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Monto Est.</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Estado</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Pagado</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider">Comprobante</th>
                <th className="px-6 py-4 text-xs font-bold uppercase text-slate-400 tracking-wider"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                [1,2,3,4,5].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan="7" className="px-6 py-6 h-16 bg-slate-50/20 dark:bg-slate-800/20"></td>
                  </tr>
                ))
              ) : services.length > 0 ? services.map((service) => {
                const payment = getPaymentForService(service.id)
                const isPaid = payment?.status === 'paid'
                
                return (
                  <tr key={service.id} className={`group transition-all ${isPaid ? 'bg-emerald-50/30 dark:bg-emerald-900/10' : 'hover:bg-slate-50/50 dark:hover:bg-slate-800/50'}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all ${isPaid ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800'}`}>
                          {isPaid ? <Check size={20} strokeWidth={3} /> : (service.icon || '💸')}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <p className={`font-bold transition-all ${isPaid ? 'text-emerald-700 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>{service.name}</p>
                            {service.is_installment && (
                              <span className="px-1.5 py-0.5 bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400 rounded-md text-[9px] font-bold">
                                {service.current_installment}/{service.total_installments}
                              </span>
                            )}
                          </div>
                          <p className="text-[10px] text-slate-400 uppercase font-bold tracking-tighter">{service.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Día {service.due_day}</span>
                    </td>
                    <td className="px-6 py-4 text-sm font-bold text-slate-700 dark:text-slate-300">
                      ${service.estimated_amount?.toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      {isPaid ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                          <CheckCircle2 size={14} /> Pagado
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                          <Clock size={14} /> Pendiente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 dark:text-white">
                      {isPaid ? `$${payment.paid_amount?.toLocaleString()}` : '-'}
                    </td>
                    <td className="px-6 py-4">
                      {payment?.receipt_url ? (
                        <a 
                          href={payment.receipt_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-emerald-500 hover:text-emerald-600 font-bold text-xs uppercase tracking-wider transition-colors"
                        >
                          <FileText size={16} /> Ver Archivo
                        </a>
                      ) : (
                        <div className="text-slate-300 text-xs italic">Sin archivo</div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => {
                          setSelectedService(service)
                          setSelectedPayment(payment)
                          setIsModalOpen(true)
                        }}
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                          isPaid 
                            ? 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200' 
                            : 'bg-primary text-white shadow-lg shadow-primary/20 hover:scale-105 active:scale-95'
                        }`}
                      >
                        {isPaid ? 'Ver Detalles' : 'Pagar Ahora'}
                      </button>
                    </td>
                  </tr>
                )
              }) : (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center text-slate-500 italic">
                    No tienes servicios activos para este mes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <PaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
        payment={selectedPayment}
        month={currentMonth}
        year={currentYear}
        onSuccess={fetchData}
      />
    </div>
  )
}

export default Payments
