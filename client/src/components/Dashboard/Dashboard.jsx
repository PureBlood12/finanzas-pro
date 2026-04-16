import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Cell
} from 'recharts';
import api from '../../utils/api';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const [stats, setStats] = useState({ total_expenses: 0, total_paid: 0, total_pending: 0, trend: 0 });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [statsRes, historyRes] = await Promise.all([
          api.get(`/stats/summary?year=${year}&month=${month}`),
          api.get('/stats/history')
        ]);
        setStats(statsRes.data);
        setHistory(historyRes.data);
      } catch (err) {
        console.error('Error fetching dashboard data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [year, month]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const cards = [
    { 
      label: 'Total Gastos', 
      value: stats.total_expenses || 0, 
      icon: <Wallet className="text-primary" />, 
      trend: stats.trend,
      color: 'bg-primary/10'
    },
    { 
      label: 'Total Pagado', 
      value: stats.total_paid || 0, 
      icon: <CheckCircle2 className="text-emerald-500" />, 
      status: 'success',
      color: 'bg-emerald-500/10'
    },
    { 
      label: 'Pendiente', 
      value: stats.total_pending || 0, 
      icon: <Clock className="text-amber-500" />, 
      status: 'warning',
      color: 'bg-amber-500/10'
    },
  ];

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Resumen Financiero</h1>
          <p className="text-slate-500 dark:text-slate-400">Panel de control de tus gastos personales</p>
        </div>
        
        <div className="flex items-center gap-2 bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <button onClick={() => changeMonth(-1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <ChevronLeft size={20} />
          </button>
          <div className="px-4 flex items-center gap-2 font-semibold text-slate-700 dark:text-slate-200 min-w-[140px] justify-center">
            <CalendarIcon size={18} className="text-primary" />
            {monthNames[month - 1]} {year}
          </div>
          <button onClick={() => changeMonth(1)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all">
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cards.map((card, i) => (
          <motion.div 
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass p-6 rounded-3xl shadow-sm hover:shadow-md transition-all group"
          >
            <div className="flex items-center justify-between mb-4">
              <div className={`p-3 rounded-2xl ${card.color} transition-transform group-hover:scale-110`}>
                {card.icon}
              </div>
              {card.trend !== undefined && (
                <div className={`flex items-center gap-1 text-sm font-bold ${parseFloat(card.trend) > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                  {parseFloat(card.trend) > 0 ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                  {Math.abs(card.trend)}%
                </div>
              )}
            </div>
            <p className="text-slate-500 dark:text-slate-400 font-medium">{card.label}</p>
            <h3 className="text-3xl font-bold text-slate-800 dark:text-white mt-1">
              ${(card.value).toLocaleString('es-AR')}
            </h3>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Evolución Anual</h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={history}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 12}}
                  tickFormatter={(val) => monthNames[val - 1]?.substring(0, 3)}
                />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  formatter={(value) => [`$${value.toLocaleString()}`, 'Gasto']}
                  labelFormatter={(index) => monthNames[history[index]?.month - 1]}
                />
                <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass p-8 rounded-3xl shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Estado de Pagos</h3>
          <div className="h-[300px] w-full flex items-center justify-center">
            {stats.total_expenses > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={[
                  { name: 'Pagado', value: stats.total_paid },
                  { name: 'Pendiente', value: stats.total_pending },
                ]}>
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8'}} />
                  <Tooltip cursor={{fill: 'transparent'}} />
                  <Bar dataKey="value" radius={[10, 10, 0, 0]} barSize={60}>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-slate-400 italic">No hay datos para este mes</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
