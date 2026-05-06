import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  AlertCircle,
  CheckCircle2,
  ChevronRight
} from 'lucide-react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell,
  PieChart,
  Pie
} from 'recharts'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../contexts/AuthContext'

const Dashboard = () => {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    paidThisMonth: 0,
    pendingThisMonth: 0,
    upcomingPayments: [],
    monthlySpending: [],
    categoryDistribution: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    const now = new Date()
    const month = now.getMonth() + 1
    const year = now.getFullYear()

    try {
      // 1. Fetch payments for this month
      const { data: payments } = await supabase
        .from('payments')
        .select(`*, services(*)`)
        .eq('month', month)
        .eq('year', year)

      // 2. Fetch upcoming services (simplified for now)
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)

      // Calculate stats
      const paid = payments?.filter(p => p.status === 'paid').reduce((sum, p) => sum + Number(p.paid_amount || 0), 0) || 0
      const pending = payments?.filter(p => p.status !== 'paid').reduce((sum, p) => sum + Number(p.services.estimated_amount || 0), 0) || 0
      
      // Categorize for pie chart
      const categories = {}
      payments?.forEach(p => {
        const cat = p.services.category
        categories[cat] = (categories[cat] || 0) + Number(p.paid_amount || 0)
      })
      const pieData = Object.entries(categories).map(([name, value]) => ({ name, value }))

      setStats({
        paidThisMonth: paid,
        pendingThisMonth: pending,
        upcomingPayments: services?.slice(0, 5) || [],
        monthlySpending: [
          { name: 'Ene', amount: 45000 },
          { name: 'Feb', amount: 52000 },
          { name: 'Mar', amount: 48000 },
          { name: 'Abr', amount: 61000 },
          { name: 'May', amount: paid },
        ],
        categoryDistribution: pieData.length > 0 ? pieData : [
          { name: 'Vivienda', value: 30000 },
          { name: 'Servicios', value: 15000 },
          { name: 'Suscripciones', value: 5000 },
        ]
      })
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#6366f1']

  return (
    <div className="space-y-8 pb-10">
      <header>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Panel de Control</h1>
        <p className="text-slate-500 dark:text-slate-400">Bienvenido de nuevo a tu gestión financiera.</p>
      </header>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Pagado este mes', value: `$${stats.paidThisMonth.toLocaleString()}`, icon: CheckCircle2, color: 'bg-emerald-500', trend: '+12%' },
          { label: 'Pendiente', value: `$${stats.pendingThisMonth.toLocaleString()}`, icon: AlertCircle, color: 'bg-amber-500', trend: '-5%' },
          { label: 'Próximos 7 días', value: '4 vencimientos', icon: Calendar, color: 'bg-blue-500', trend: 'Neutral' },
          { label: 'Estado General', value: 'Al día', icon: TrendingUp, color: 'bg-violet-500', trend: 'Excelente' },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20`}>
                <stat.icon size={24} />
              </div>
              <span className={`text-xs font-bold px-2 py-1 rounded-lg ${
                stat.trend.startsWith('+') ? 'text-emerald-600 bg-emerald-50' : 
                stat.trend.startsWith('-') ? 'text-rose-600 bg-rose-50' : 
                'text-slate-600 bg-slate-50'
              }`}>
                {stat.trend}
              </span>
            </div>
            <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{stat.label}</p>
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold">Gastos Mensuales</h2>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-2 text-sm font-medium outline-none">
              <option>Últimos 6 meses</option>
              <option>Año actual</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.monthlySpending}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} tickFormatter={(v) => `$${v/1000}k`} />
                <Tooltip 
                  cursor={{fill: '#f8fafc'}}
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
                <Bar dataKey="amount" radius={[8, 8, 8, 8]} barSize={40}>
                  {stats.monthlySpending.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === stats.monthlySpending.length - 1 ? '#8b5cf6' : '#e2e8f0'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <h2 className="text-xl font-bold mb-8">Distribución</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={stats.categoryDistribution}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {stats.categoryDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)'}}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            {stats.categoryDistribution.map((item, i) => (
              <div key={i} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}} />
                  <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                </div>
                <span className="font-bold">${item.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming Payments */}
      <div className="bg-white dark:bg-slate-900 p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold">Próximos Vencimientos</h2>
          <button className="text-primary font-semibold text-sm flex items-center gap-1 hover:underline">
            Ver todos <ChevronRight size={16} />
          </button>
        </div>
        <div className="space-y-4">
          {stats.upcomingPayments.length > 0 ? stats.upcomingPayments.map((service, i) => (
            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center text-xl shadow-sm">
                  {service.icon || '💸'}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 dark:text-white">{service.name}</h4>
                  <p className="text-xs text-slate-500 capitalize">{service.category} • Vence el día {service.due_day}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="font-bold text-slate-900 dark:text-white">${service.estimated_amount?.toLocaleString()}</p>
                <span className="text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full">Pendiente</span>
              </div>
            </div>
          )) : (
            <p className="text-center text-slate-500 py-8 italic">No hay vencimientos próximos.</p>
          )}
        </div>
      </div>
    </div>
  )
}

export default Dashboard
