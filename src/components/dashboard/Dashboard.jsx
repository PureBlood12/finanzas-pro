import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar, 
  DollarSign, 
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react'
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts'
import { supabase } from '../../lib/supabase'
import PendingListModal from './PendingListModal'

const Dashboard = () => {
  const [stats, setStats] = useState({
    paid: 0,
    pending: 0,
    upcoming: 0,
    status: 'Al día'
  })
  const [loading, setLoading] = useState(true)
  const [chartData, setChartData] = useState([])
  const [categoryData, setCategoryData] = useState([])
  const [pendingServices, setPendingServices] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const now = new Date()
      const currentMonth = now.getMonth() + 1
      const currentYear = now.getFullYear()
      const currentDay = now.getDate()

      // 1. Get all active services
      const { data: services } = await supabase
        .from('services')
        .select('*')
        .eq('active', true)
      
      // 2. Get payments for current month
      const { data: payments } = await supabase
        .from('payments')
        .select('*')
        .eq('month', currentMonth)
        .eq('year', currentYear)

      const activeServices = services || []
      const monthlyPayments = payments || []

      // --- CALCULATE STATS ---
      
      // Paid this month
      const totalPaid = monthlyPayments.reduce((acc, p) => acc + (p.paid_amount || 0), 0)
      
      // Pending amount (Services without payment record this month)
      const paidServiceIds = new Set(monthlyPayments.map(p => p.service_id))
      const pendingAmount = activeServices
        .filter(s => !paidServiceIds.has(s.id))
        .reduce((acc, s) => acc + (s.estimated_amount || 0), 0)

      // Upcoming expirations (next 7 days)
      const upcomingCount = activeServices.filter(s => {
        // If not paid yet AND due_day is between today and today + 7
        if (paidServiceIds.has(s.id)) return false
        return s.due_day >= currentDay && s.due_day <= currentDay + 7
      }).length

      const pendingList = activeServices.filter(s => !paidServiceIds.has(s.id))
      setPendingServices(pendingList)

      // Overdue items check
      const overdueCount = activeServices.filter(s => {
        if (paidServiceIds.has(s.id)) return false
        return s.due_day < currentDay
      }).length

      setStats({
        paid: totalPaid,
        pending: pendingAmount,
        upcoming: upcomingCount,
        status: overdueCount > 0 ? '¡Vencido!' : (pendingAmount === 0 ? 'Excelente' : (upcomingCount > 0 ? 'Atención' : 'Al día'))
      })

      // --- PREPARE CHART DATA (Real historical data) ---
      const { data: historicalPayments } = await supabase
        .from('payments')
        .select('month, paid_amount')
        .eq('year', currentYear)
        .order('month', { ascending: true })

      const months = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      const monthlyTotals = new Array(12).fill(0)
      
      historicalPayments?.forEach(p => {
        if (p.month >= 1 && p.month <= 12) {
          monthlyTotals[p.month - 1] += (p.paid_amount || 0)
        }
      })

      // Show only up to current month or last 6 months
      const trend = months.map((m, i) => ({
        name: m,
        value: monthlyTotals[i]
      })).slice(0, currentMonth)
      
      setChartData(trend.length > 0 ? trend : [{ name: months[currentMonth-1], value: 0 }])

      // --- PREPARE CATEGORY DATA ---
      const cats = {}
      activeServices.forEach(s => {
        cats[s.category] = (cats[s.category] || 0) + (s.estimated_amount || 0)
      })
      const pieData = Object.keys(cats).map(name => ({ name, value: cats[name] }))
      setCategoryData(pieData.length > 0 ? pieData : [{name: 'Sin datos', value: 1}])

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#8b5cf6', '#ec4899', '#3b82f6', '#10b981', '#f59e0b']

  const statCards = [
    { 
      label: 'Pagado este mes', 
      value: `$${stats.paid.toLocaleString()}`, 
      icon: CheckCircle2, 
      color: 'bg-emerald-500', 
      trend: '+12%', 
      isUp: true 
    },
    { 
      label: 'Pendiente', 
      value: `$${stats.pending.toLocaleString()}`, 
      icon: Clock, 
      color: 'bg-amber-500', 
      trend: stats.pending > 0 ? 'Acción' : '-5%', 
      isUp: false 
    },
    { 
      label: 'Próximos 7 días', 
      value: `${stats.upcoming} vencimientos`, 
      icon: Calendar, 
      color: 'bg-blue-500', 
      trend: 'Actual', 
      isUp: null 
    },
    { 
      label: 'Estado General', 
      value: stats.status, 
      icon: TrendingUp, 
      color: 'bg-purple-500', 
      trend: 'Óptimo', 
      isUp: true 
    },
  ]

  const handleCardClick = (label) => {
    if (label === 'Pendiente') {
      setIsModalOpen(true)
    }
  }

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Panel de Control</h1>
          <p className="text-slate-500 dark:text-slate-400">Bienvenido de nuevo a tu gestión financiera.</p>
        </div>
        <button 
          onClick={fetchDashboardData}
          className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-slate-50 transition-colors"
        >
          Actualizar Datos
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleCardClick(stat.label)}
            className={`bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-md transition-all group ${stat.label === 'Pendiente' ? 'cursor-pointer hover:border-amber-500/50' : ''}`}
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`${stat.color} p-3 rounded-2xl text-white shadow-lg shadow-${stat.color.split('-')[1]}-500/20 group-hover:scale-110 transition-transform`}>
                <stat.icon size={24} />
              </div>
              {stat.trend && (
                <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                  stat.isUp === true ? 'bg-emerald-100 text-emerald-600' : 
                  stat.isUp === false ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'
                }`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{stat.label}</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stat.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Gastos Mensuales</h3>
              <p className="text-xs text-slate-500">Historial de pagos acumulados</p>
            </div>
            <select className="bg-slate-50 dark:bg-slate-800 border-none rounded-xl text-xs font-bold px-3 py-2 outline-none">
              <option>Últimos 6 meses</option>
              <option>Este año</option>
            </select>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 12, fill: '#94a3b8'}} dy={10} />
                <YAxis hide />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '16px', 
                    border: 'none', 
                    boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#8b5cf6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories Chart */}
        <div className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1">Distribución</h3>
          <p className="text-xs text-slate-500 mb-6">Por categoría de servicio</p>
          
          <div className="h-[200px] w-full mb-6">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryData}
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-3 mt-auto">
            {categoryData.slice(0, 4).map((cat, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">{cat.name}</span>
                </div>
                <span className="text-xs font-bold text-slate-900 dark:text-white">
                  ${cat.value.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PendingListModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        services={pendingServices}
      />
    </div>
  )
}

export default Dashboard
