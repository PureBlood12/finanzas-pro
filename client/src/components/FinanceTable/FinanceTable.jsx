import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Save, 
  Table as TableIcon, 
  Check, 
  X, 
  FileDown, 
  RefreshCw,
  AlertCircle,
  Calendar,
  Paperclip,
  ExternalLink,
  Loader2
} from 'lucide-react';
import api from '../../utils/api';
import { exportToExcel, exportToPDF } from '../../utils/exportUtils';
import { motion, AnimatePresence } from 'framer-motion';

const FinanceTable = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});
  const [currentDate, setCurrentDate] = useState(new Date());
  const [uploadingId, setUploadingId] = useState(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth() + 1;

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/transactions?year=${year}&month=${month}`);
      setTransactions(res.data);
    } catch (err) {
      console.error('Error fetching transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [year, month]);

  const handleGenerate = async () => {
    try {
      await api.post('/transactions/generate', { year, month });
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al generar el mes');
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditValues({
      amount: item.amount,
      status: item.status,
      notes: item.notes || '',
      payment_date: item.payment_date || ''
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditValues({});
  };

  const saveEdit = async (id) => {
    try {
      await api.patch(`/transactions/${id}`, editValues);
      setEditingId(null);
      fetchTransactions();
    } catch (err) {
      console.error('Error saving transaction', err);
    }
  };

  const toggleStatus = async (item) => {
    const newStatus = item.status === 'paid' ? 'pending' : 'paid';
    const paymentDate = newStatus === 'paid' ? new Date().toISOString().split('T')[0] : '';
    try {
      await api.patch(`/transactions/${item.id}`, { 
        status: newStatus,
        payment_date: paymentDate
      });
      fetchTransactions();
    } catch (err) {
      console.error('Error toggling status', err);
    }
  };

  const handleUpload = async (id, file) => {
    if (!file) return;
    setUploadingId(id);
    const formData = new FormData();
    formData.append('receipt', file);
    try {
      await api.post(`/transactions/${id}/receipt`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al subir el comprobante');
    } finally {
      setUploadingId(null);
    }
  };
  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Finanzas Mensuales</h1>
          <p className="text-slate-500 dark:text-slate-400">Gestiona y actualiza tus gastos en tiempo real</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex bg-white dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
            <button 
              onClick={() => exportToExcel(transactions, `Finanzas_${monthNames[month-1]}_${year}`)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all tooltip"
              title="Exportar a Excel"
            >
              <FileDown size={20} />
            </button>
            <button 
              onClick={() => exportToPDF(transactions, `Resumen ${monthNames[month-1]} ${year}`)}
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-600 dark:text-slate-300 transition-all"
              title="Exportar a PDF"
            >
              <FileDown size={20} className="rotate-180" />
            </button>
          </div>

          <select 
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium shadow-sm"
            value={month}
            onChange={(e) => {
              const newDate = new Date(currentDate);
              newDate.setMonth(parseInt(e.target.value) - 1);
              setCurrentDate(newDate);
            }}
          >
            {monthNames.map((name, i) => (
              <option key={name} value={i + 1}>{name}</option>
            ))}
          </select>

          <select 
            className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2 text-sm font-medium shadow-sm"
            value={year}
            onChange={(e) => {
              const newDate = new Date(currentDate);
              newDate.setFullYear(parseInt(e.target.value));
              setCurrentDate(newDate);
            }}
          >
            {[2024, 2025, 2026].map(y => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="glass rounded-3xl shadow-sm overflow-hidden border border-slate-200 dark:border-slate-700">
        {loading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            <p className="text-slate-500 font-medium">Cargando registros...</p>
          </div>
        ) : transactions.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                  <th className="banking-table-header">Categoría</th>
                  <th className="banking-table-header text-right">Monto</th>
                  <th className="banking-table-header">Estado</th>
                  <th className="banking-table-header">Fecha Pago</th>
                  <th className="banking-table-header">Notas</th>
                  <th className="banking-table-header text-center">Comprobante</th>
                  <th className="banking-table-header text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50">
                <AnimatePresence mode="popLayout">
                  {transactions.map((item) => (
                    <motion.tr 
                      key={item.id}
                      layout
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group"
                    >
                      <td className="banking-table-cell">
                        <div className="flex items-center gap-3">
                          <span className="text-xl" role="img" aria-label={item.name}>{item.icon}</span>
                          <span className="font-semibold text-slate-700 dark:text-slate-200">{item.name}</span>
                        </div>
                      </td>
                      <td className="banking-table-cell text-right">
                        {editingId === item.id ? (
                          <input 
                            type="number" 
                            className="w-24 text-right px-2 py-1 rounded border-primary"
                            value={editValues.amount}
                            onChange={(e) => setEditValues({...editValues, amount: e.target.value})}
                            autoFocus
                          />
                        ) : (
                          <span className="font-mono font-bold text-slate-800 dark:text-white">
                            ${parseFloat(item.amount).toLocaleString('es-AR')}
                          </span>
                        )}
                      </td>
                      <td className="banking-table-cell">
                        <button 
                          onClick={() => toggleStatus(item)}
                          className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                            ${item.status === 'paid' 
                              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-400' 
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400'}
                          `}
                        >
                          {item.status === 'paid' ? 'Pagado' : 'Pendiente'}
                        </button>
                      </td>
                      <td className="banking-table-cell text-slate-500 dark:text-slate-400">
                        {editingId === item.id ? (
                          <input 
                            type="date" 
                            className="px-2 py-1 rounded border-slate-300 dark:bg-slate-700 text-xs"
                            value={editValues.payment_date}
                            onChange={(e) => setEditValues({...editValues, payment_date: e.target.value})}
                          />
                        ) : (
                          <div className="flex items-center gap-2">
                             <Calendar size={14} className="opacity-50" />
                             {item.payment_date || '-'}
                          </div>
                        )}
                      </td>
                      <td className="banking-table-cell max-w-[200px] truncate">
                        {editingId === item.id ? (
                          <input 
                            type="text" 
                            className="w-full px-2 py-1 rounded border-slate-300 dark:bg-slate-700"
                            value={editValues.notes}
                            onChange={(e) => setEditValues({...editValues, notes: e.target.value})}
                          />
                        ) : (
                          <span className="text-slate-500 dark:text-slate-400 text-xs">{item.notes || '-'}</span>
                        )}
                      </td>
                      <td className="banking-table-cell text-center">
                        {item.receipt_url ? (
                          <a 
                            href={item.receipt_url} 
                            target="_blank" 
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-xs font-semibold rounded-lg transition-all text-slate-700 dark:text-slate-300"
                          >
                            <ExternalLink size={14} /> Ver
                          </a>
                        ) : (
                          uploadingId === item.id ? (
                            <Loader2 size={16} className="animate-spin mx-auto text-primary" />
                          ) : (
                            <label className="cursor-pointer inline-flex items-center gap-1 px-3 py-1 text-xs font-bold text-primary hover:bg-primary/10 rounded-lg transition-all">
                              <Paperclip size={14} /> Adjuntar
                              <input 
                                type="file" 
                                accept="image/jpeg, image/png, application/pdf"
                                className="hidden" 
                                onChange={(e) => handleUpload(item.id, e.target.files[0])}
                              />
                            </label>
                          )
                        )}
                      </td>
                      <td className="banking-table-cell text-center">
                        <div className="flex items-center justify-center gap-2">
                          {editingId === item.id ? (
                            <>
                              <button onClick={() => saveEdit(item.id)} className="p-1.5 text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded-lg transition-all">
                                <Check size={18} />
                              </button>
                              <button onClick={cancelEdit} className="p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all">
                                <X size={18} />
                              </button>
                            </>
                          ) : (
                            <button 
                              onClick={() => startEdit(item)}
                              className="p-2 text-slate-400 hover:text-primary hover:bg-primary/5 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                            >
                              <RefreshCw size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-20 text-center space-y-6">
            <div className="inline-flex p-6 bg-slate-50 dark:bg-slate-800 rounded-full text-slate-400">
              <TableIcon size={48} />
            </div>
            <div className="max-w-xs mx-auto">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">Sin registros</h3>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">No hay gastos registrados para este mes. Genera el mes basado en el anterior.</p>
            </div>
            <button 
              onClick={handleGenerate}
              className="inline-flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-primary/20 transition-all transform hover:scale-105 active:scale-95"
            >
              <Plus size={20} />
              Generar Mes de {monthNames[month-1]}
            </button>
          </div>
        )}
      </div>

      <div className="p-4 bg-primary/5 rounded-2xl flex items-center gap-3 border border-primary/10">
        <AlertCircle className="text-primary shrink-0" size={20} />
        <p className="text-xs text-primary/80 font-medium leading-relaxed">
          <strong>Consejo Pro:</strong> Haz click en el estado (Pagado/Pendiente) para cambiarlo rápidamente. Los cambios de monto y notas se guardan al presionar el ícono de edición.
        </p>
      </div>
    </div>
  );
};

export default FinanceTable;
