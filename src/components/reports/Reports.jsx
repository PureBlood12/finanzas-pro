import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight,
  Filter,
  FileSpreadsheet
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { supabase } from '../../lib/supabase'

const Reports = () => {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchReportData()
  }, [year])

  const fetchReportData = async () => {
    setLoading(true)
    try {
      const { data: payments } = await supabase
        .from('payments')
        .select('month, paid_amount')
        .eq('year', year)
        .eq('status', 'paid')

      // Group by month
      const monthlyData = Array.from({ length: 12 }, (_, i) => ({
        month: i + 1,
        name: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'][i],
        amount: 0
      }))

      payments?.forEach(p => {
        monthlyData[p.month - 1].amount += Number(p.paid_amount || 0)
      })

      setData(monthlyData)
    } catch (err) {
      console.error('Error fetching report data:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalAnual = data.reduce((sum, m) => sum + m.amount, 0)
  const promedioMensual = totalAnual / 12

  return (
    <div className="space-y-8 pb-10">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Reportes y Análisis</h1>
          <p className="text-slate-500 dark:text-slate-400">Visualiza la evolución de tus finanzas.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-1 shadow-sm">
            <button onClick={() => setYear(year - 1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><ChevronLeft size={18} /></button>
            <div className="px-4 font-bold text-slate-900 dark:text-white">{year}</div>
            <button onClick={() => setYear(year + 1)} className="p-2 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl"><ChevronRight size={18} /></button>
          </div>
          <button className="bg-primary text-white p-3 rounded-2xl shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
            <Download size={20} />
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-primary to-purple-600 p-8 rounded-[32px] text-white shadow-xl shadow-primary/20">
          <p className="text-primary-foreground/80 font-bold text-xs uppercase tracking-widest mb-1">Gasto Total Anual</p>
          <h2 className="text-4xl font-black">${totalAnual.toLocaleString()}</h2>
          <div className="mt-4 flex items-center gap-2 text-primary-foreground/60 text-sm">
            <CalendarIcon size={16} /> Año {year}
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Promedio Mensual</p>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white">${promedioMensual.toLocaleString(undefined, {maximumFractionDigits: 0})}</h2>
          <p className="mt-4 text-emerald-500 text-sm font-bold flex items-center gap-1">
            <TrendingUp size={16} /> +4.2% vs año anterior
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1">Mes de Mayor Gasto</p>
          <h2 className="text-4xl font-black text-slate-900 dark:text-white">Abril</h2>
          <p className="mt-4 text-slate-500 text-sm font-medium">Suscripciones fue el mayor rubro</p>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-xl font-bold">Evolución de Gastos</h2>
          <div className="flex gap-2">
            <button className="px-4 py-2 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs font-bold uppercase tracking-wider">Línea</button>
            <button className="px-4 py-2 text-slate-400 text-xs font-bold uppercase tracking-wider">Área</button>
          </div>
        </div>
        
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data}>
              <defs>
                <linearGradient id="colorAmount" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.1}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
              <Tooltip 
                contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
              />
              <Area type="monotone" dataKey="amount" stroke="#8b5cf6" strokeWidth={4} fillOpacity={1} fill="url(#colorAmount)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Export Section */}
      <div className="bg-slate-900 rounded-[32px] p-8 text-white flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden relative">
        <div className="relative z-10 text-center md:text-left">
          <h3 className="text-2xl font-bold mb-2">Exporta tu Historial</h3>
          <p className="text-slate-400">Descarga un archivo CSV con todos tus pagos realizados en {year}.</p>
        </div>
        <button className="relative z-10 bg-white text-slate-900 px-8 py-4 rounded-2xl font-bold flex items-center gap-3 hover:scale-105 transition-all shadow-xl">
          <FileSpreadsheet size={24} /> Exportar CSV
        </button>
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 blur-[100px] rounded-full -mr-20 -mt-20"></div>
      </div>
    </div>
  )
}

const TrendingUp = ({ size, className }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" /><polyline points="17 6 23 6 23 12" />
  </svg>
)

export default Reports
