import React, { useState, useEffect, useMemo } from 'react';
import { 
  PieChart as PieChartIcon, 
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Download
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Tooltip as RechartsTooltip,
  Legend
} from 'recharts';
import { motion } from 'framer-motion';
import api from '../../utils/api';
import { exportToPDF } from '../../utils/exportUtils'; // We can reuse it or create a specific one, but let's just make sure it works if we add it

const Reports = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  useEffect(() => {
    const fetchReportData = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/stats/categories?year=${year}&month=${month}`);
        setData(res.data);
      } catch (err) {
        console.error('Error fetching report data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReportData();
  }, [year, month]);

  const changeMonth = (offset) => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentDate(newDate);
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const totalExpense = useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  const handleExport = () => {
    // Generate a simple export format
    const exportData = data.map(item => ({
      name: item.name,
      amount: item.value,
      status: 'paid', // just for the export table
      payment_date: '-',
      notes: 'Análisis de categoría'
    }));
    exportToPDF(exportData, `Reporte_Categorias_${monthNames[month-1]}_${year}`);
  };

  // Custom Label for Pie Chart
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // Don't show label for very small slices

    return (
      <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize="12" fontWeight="bold">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Reportes Analíticos</h1>
          <p className="text-slate-500 dark:text-slate-400">Distribución de tus gastos por categoría</p>
        </div>
        
        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1.5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
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
          <button 
            onClick={handleExport}
            disabled={data.length === 0}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover disabled:bg-slate-300 disabled:cursor-not-allowed text-white px-4 py-2.5 rounded-xl font-bold shadow-sm transition-all"
          >
            <Download size={18} />
            PDF
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* Gráfico Donut */}
        <div className="glass p-8 rounded-3xl shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-6">Gráfico de Distribución</h3>
          {loading ? (
             <div className="flex-1 flex flex-col items-center justify-center min-h-[300px]">
               <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
             </div>
          ) : data.length > 0 ? (
            <div className="flex-1 min-h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={80}
                    outerRadius={120}
                    paddingAngle={5}
                    dataKey="value"
                    labelLine={false}
                    label={renderCustomizedLabel}
                  >
                    {data.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip 
                    formatter={(value) => [`$${value.toLocaleString('es-AR')}`, 'Total']}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center min-h-[300px] text-slate-400">
               <PieChartIcon size={48} className="mb-4 opacity-50" />
               <p>No hay gastos registrados en este mes.</p>
            </div>
          )}
        </div>

        {/* Lista de Detalles Bar */}
        <div className="glass p-8 rounded-3xl shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Desglose Detallado</h3>
            <div className="text-sm px-3 py-1 bg-primary/10 text-primary font-bold rounded-lg">
              Total: ${totalExpense.toLocaleString('es-AR')}
            </div>
          </div>

          <div className="space-y-6">
            {loading ? (
               <div className="space-y-4">
                 {[1,2,3].map(i => <div key={i} className="h-12 bg-slate-200 dark:bg-slate-700 animate-pulse rounded-xl w-full"></div>)}
               </div>
            ) : data.length > 0 ? (
              data.map((item, i) => {
                const percentage = totalExpense > 0 ? ((item.value / totalExpense) * 100).toFixed(1) : 0;
                return (
                  <motion.div 
                    key={item.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                       <div className="flex items-center gap-3">
                          <span className="text-2xl">{item.icon}</span>
                          <div>
                            <p className="font-bold text-slate-800 dark:text-white">{item.name}</p>
                            <p className="text-xs text-slate-500">{percentage}% del total</p>
                          </div>
                       </div>
                       <p className="font-bold text-slate-800 dark:text-white text-lg">
                         ${item.value.toLocaleString('es-AR')}
                       </p>
                    </div>
                    {/* Progress Bar */}
                    <div className="w-full bg-slate-100 dark:bg-slate-700 h-3 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: 'easeOut' }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: item.color }}
                      />
                    </div>
                  </motion.div>
                )
              })
            ) : (
              <div className="text-center text-slate-400 py-10">
                Añade transacciones en "Mis Finanzas" para ver el detalle.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Reports;
