import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Trash2, 
  Plus, 
  Settings as SettingsIcon,
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../utils/api';

const Settings = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // New Category State
  const [newCatName, setNewCatName] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('📌');
  const [newCatColor, setNewCatColor] = useState('#6366f1');
  const [isAddingCategory, setIsAddingCategory] = useState(false);

  // Security State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordMessage, setPasswordMessage] = useState({ type: '', text: '' });

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      setCategories(res.data);
    } catch (err) {
      console.error('Error fetching categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleAddCategory = async (e) => {
    e.preventDefault();
    setIsAddingCategory(true);
    try {
      await api.post('/categories', { name: newCatName, icon: newCatIcon, color: newCatColor });
      setNewCatName('');
      setNewCatIcon('📌');
      setNewCatColor('#6366f1');
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al agregar categoría');
    } finally {
      setIsAddingCategory(false);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!window.confirm('¿Seguro que deseas eliminar esta categoría?')) return;
    try {
      await api.delete(`/categories/${id}`);
      fetchCategories();
    } catch (err) {
      alert(err.response?.data?.error || 'Error al eliminar categoría');
    }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordMessage({ type: 'error', text: 'Las nuevas contraseñas no coinciden' });
      return;
    }
    
    setPasswordLoading(true);
    setPasswordMessage({ type: '', text: '' });
    
    try {
      const res = await api.post('/auth/change-password', {
        currentPassword,
        newPassword
      });
      setPasswordMessage({ type: 'success', text: res.data.message });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setPasswordMessage({ 
        type: 'error', 
        text: err.response?.data?.error || 'Error al cambiar contraseña' 
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div className="p-3 bg-primary/10 rounded-2xl text-primary">
          <SettingsIcon size={28} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-slate-800 dark:text-white">Configuración</h1>
          <p className="text-slate-500 dark:text-slate-400">Personaliza y protege tu cuenta</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CATEGORÍAS PANEL */}
        <div className="glass p-8 rounded-3xl shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-3 mb-6">
            <Tag className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Categorías</h3>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-3 mb-6">
            <input
              type="text"
              placeholder="Ej: 🍕"
              className="w-16 text-center text-xl bg-slate-50 dark:bg-slate-700/50"
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Nueva Categoría"
              className="flex-1 px-4 bg-slate-50 dark:bg-slate-700/50"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
            <div className="relative w-12 h-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
              <input
                type="color"
                className="absolute -top-2 -left-2 w-16 h-16 cursor-pointer"
                value={newCatColor}
                onChange={(e) => setNewCatColor(e.target.value)}
              />
            </div>
            <button 
              type="submit" 
              disabled={isAddingCategory}
              className="px-4 bg-primary hover:bg-primary-hover text-white rounded-xl shadow-md transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isAddingCategory ? <Loader2 size={20} className="animate-spin" /> : <Plus size={20} />}
            </button>
          </form>

          <div className="flex-1 bg-slate-50/50 dark:bg-slate-800/30 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden">
            <div className="max-h-[400px] overflow-y-auto p-2">
              {loading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 className="animate-spin text-primary" size={32} />
                </div>
              ) : categories.length > 0 ? (
                <AnimatePresence>
                  {categories.map((cat) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={cat.id} 
                      className="flex items-center justify-between p-3 hover:bg-white dark:hover:bg-slate-700/50 rounded-xl transition-colors group"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-10 h-10 rounded-xl flex items-center justify-center text-xl shadow-sm"
                          style={{ backgroundColor: `${cat.color}20`, border: `1px solid ${cat.color}40` }}
                        >
                          {cat.icon}
                        </div>
                        <span className="font-semibold text-slate-700 dark:text-slate-200">{cat.name}</span>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <p className="text-center text-slate-400 py-10">No hay categorías configuradas.</p>
              )}
            </div>
          </div>
        </div>

        {/* SECURITY PANEL */}
        <div className="glass p-8 rounded-3xl shadow-sm h-fit">
          <div className="flex items-center gap-3 mb-6">
            <Key className="text-primary" size={24} />
            <h3 className="text-xl font-bold text-slate-800 dark:text-white">Seguridad</h3>
          </div>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">Contraseña Actual</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">Nueva Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1 ml-1">Confirmar Nueva Contraseña</label>
              <input
                type="password"
                className="w-full px-4 py-3 bg-slate-50 dark:bg-slate-700/50"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {passwordMessage.text && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-4 rounded-xl flex items-center gap-3 text-sm font-medium ${
                  passwordMessage.type === 'error' 
                    ? 'bg-red-50 text-red-600 dark:bg-red-500/10 dark:text-red-400'
                    : 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400'
                }`}
              >
                {passwordMessage.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                {passwordMessage.text}
              </motion.div>
            )}

            <button 
              type="submit" 
              disabled={passwordLoading}
              className="w-full py-3.5 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 mt-4"
            >
              {passwordLoading ? <Loader2 size={20} className="animate-spin" /> : 'Actualizar Contraseña'}
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};

export default Settings;
