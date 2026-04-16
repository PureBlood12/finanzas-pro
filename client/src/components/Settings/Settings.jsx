import React, { useState, useEffect } from 'react';
import { 
  Key, 
  Trash2, 
  Plus, 
  Settings as SettingsIcon,
  Tag,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ShieldCheck,
  ShieldOff,
  QrCode,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import api from '../../utils/api';
import { useAuth } from '../../context/AuthContext';

const Settings = () => {
  const { user } = useAuth();
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

  // 2FA State
  const [mfaData, setMfaData] = useState(null); // { secret, qrCodeUrl }
  const [mfaToken, setMfaToken] = useState('');
  const [mfaLoading, setMfaLoading] = useState(false);
  const [mfaMessage, setMfaMessage] = useState({ type: '', text: '' });
  const [is2faEnabled, setIs2faEnabled] = useState(user?.twoFactorEnabled || false);

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

  // 2FA Handlers
  const handleSetup2FA = async () => {
    setMfaLoading(true);
    setMfaMessage({ type: '', text: '' });
    try {
      const res = await api.post('/auth/setup-2fa');
      setMfaData(res.data);
    } catch (err) {
      setMfaMessage({ type: 'error', text: 'Error al iniciar configuración 2FA' });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleEnable2FA = async (e) => {
    e.preventDefault();
    setMfaLoading(true);
    try {
      await api.post('/auth/enable-2fa', { secret: mfaData.secret, token: mfaToken });
      setIs2faEnabled(true);
      setMfaData(null);
      setMfaToken('');
      setMfaMessage({ type: 'success', text: '¡Seguridad 2FA activada con éxito!' });
    } catch (err) {
      setMfaMessage({ type: 'error', text: err.response?.data?.error || 'Código incorrecto' });
    } finally {
      setMfaLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('¿Estás seguro de desactivar la seguridad de doble factor? Tu cuenta será menos segura.')) return;
    setMfaLoading(true);
    try {
      await api.post('/auth/disable-2fa');
      setIs2faEnabled(false);
      setMfaMessage({ type: 'success', text: 'Seguridad 2FA desactivada.' });
    } catch (err) {
      setMfaMessage({ type: 'error', text: 'Error al desactivar 2FA' });
    } finally {
      setMfaLoading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-7xl mx-auto px-4 py-8">
      <div className="flex items-center gap-4 border-b border-slate-200 dark:border-slate-700 pb-6">
        <div className="p-3.5 bg-primary/10 rounded-2xl text-primary shadow-sm shadow-primary/5">
          <SettingsIcon size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white tracking-tight">Configuración</h1>
          <p className="text-slate-500 dark:text-slate-400">Personaliza y protege tu cuenta financiera</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* CATEGORÍAS PANEL */}
        <div className="glass p-8 rounded-[2.5rem] shadow-sm flex flex-col h-full border border-white/40 dark:border-slate-800">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-500/10 rounded-xl text-indigo-600 dark:text-indigo-400">
                <Tag size={22} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Categorías</h3>
            </div>
          </div>

          <form onSubmit={handleAddCategory} className="flex gap-3 mb-8">
            <input
              type="text"
              placeholder="Ej: 🍕"
              className="w-16 text-center text-xl bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
              value={newCatIcon}
              onChange={(e) => setNewCatIcon(e.target.value)}
              required
            />
            <input
              type="text"
              placeholder="Nueva Categoría"
              className="flex-1 px-4 bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              required
            />
            <div className="relative w-12 h-12 flex-shrink-0 cursor-pointer overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700/50 shadow-sm transition-transform hover:scale-105">
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
              className="px-5 bg-primary hover:bg-primary-hover text-white rounded-2xl shadow-lg shadow-primary/20 transition-all flex items-center justify-center disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95"
            >
              {isAddingCategory ? <Loader2 size={20} className="animate-spin" /> : <Plus size={24} />}
            </button>
          </form>

          <div className="flex-1 bg-slate-50/50 dark:bg-slate-900/40 rounded-3xl border border-slate-200 dark:border-slate-800/50 overflow-hidden">
            <div className="max-h-[460px] overflow-y-auto p-3 scrollbar-hide">
              {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-3">
                  <Loader2 className="animate-spin text-primary" size={40} />
                  <p className="text-sm font-medium text-slate-400">Cargando categorías...</p>
                </div>
              ) : categories.length > 0 ? (
                <AnimatePresence>
                  {categories.map((cat) => (
                    <motion.div 
                      layout
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      key={cat.id} 
                      className="flex items-center justify-between p-3.5 mb-2 hover:bg-white dark:hover:bg-slate-800/60 rounded-2xl transition-all border border-transparent hover:border-slate-100 dark:hover:border-slate-700 group shadow-sm hover:shadow-md"
                    >
                      <div className="flex items-center gap-4">
                        <div 
                          className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm"
                          style={{ backgroundColor: `${cat.color}15`, border: `1.5px solid ${cat.color}30` }}
                        >
                          {cat.icon}
                        </div>
                        <div>
                          <span className="font-bold text-slate-700 dark:text-slate-200">{cat.name}</span>
                          <div className="flex gap-1.5 mt-0.5">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: cat.color }} />
                            <span className="text-[10px] text-slate-400 font-mono tracking-wider">{cat.color.toUpperCase()}</span>
                          </div>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleDeleteCategory(cat.id)}
                        className="p-2.5 text-slate-300 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                        title="Eliminar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              ) : (
                <p className="text-center text-slate-400 py-10 font-medium italic">No hay categorías configuradas.</p>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-8 flex flex-col h-full">
          {/* SECURITY PANEL (PASSWORD) */}
          <div className="glass p-8 rounded-[2.5rem] shadow-sm flex-1 border border-white/40 dark:border-slate-800">
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 bg-amber-50 dark:bg-amber-500/10 rounded-xl text-amber-600 dark:text-amber-400">
                <Key size={22} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white">Cambio de Contraseña</h3>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Contraseña Actual</label>
                  <input
                    type="password"
                    className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Nueva Contraseña</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-1.5 ml-1">Confirmar</label>
                    <input
                      type="password"
                      className="w-full px-4 py-3.5 bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      minLength={6}
                    />
                  </div>
                </div>
              </div>

              {passwordMessage.text && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border ${
                    passwordMessage.type === 'error' 
                      ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/30'
                      : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/30'
                  }`}
                >
                  {passwordMessage.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                  {passwordMessage.text}
                </motion.div>
              )}

              <button 
                type="submit" 
                disabled={passwordLoading}
                className="w-full py-4 bg-slate-800 dark:bg-slate-700 hover:bg-slate-900 dark:hover:bg-slate-600 text-white font-bold rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
              >
                {passwordLoading ? <Loader2 size={20} className="animate-spin" /> : 'Actualizar Contraseña'}
              </button>
            </form>
          </div>

          {/* 2FA PANEL */}
          <div className="glass p-8 rounded-[2.5rem] shadow-sm border border-white/40 dark:border-slate-800 overflow-hidden relative">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-xl transition-colors ${is2faEnabled ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                  {is2faEnabled ? <ShieldCheck size={22} /> : <ShieldOff size={22} />}
                </div>
                <div>
                  <h3 className="text-xl font-bold text-slate-800 dark:text-white leading-none">Doble Factor (2FA)</h3>
                  <span className={`text-[10px] font-bold uppercase tracking-widest ${is2faEnabled ? 'text-emerald-500' : 'text-slate-400'}`}>
                    {is2faEnabled ? 'Activado' : 'Desactivado'}
                  </span>
                </div>
              </div>
            </div>

            <AnimatePresence mode="wait">
              {!is2faEnabled && !mfaData && (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  className="space-y-4"
                >
                  <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                    Añade una capa extra de seguridad. Necesitarás un código de tu aplicación Authenticator cada vez que inicies sesión.
                  </p>
                  <button 
                    onClick={handleSetup2FA}
                    disabled={mfaLoading}
                    className="w-full py-4 bg-primary hover:bg-primary-hover text-white font-bold rounded-2xl shadow-xl shadow-primary/20 transition-all flex items-center justify-center gap-2 transform active:scale-[0.98]"
                  >
                    {mfaLoading ? <Loader2 size={20} className="animate-spin" /> : <><ShieldCheck size={20} /> Configurar 2FA</>}
                  </button>
                </motion.div>
              )}

              {!is2faEnabled && mfaData && (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6 bg-slate-50/50 dark:bg-slate-900/40 p-6 rounded-3xl border border-dashed border-slate-200 dark:border-slate-700"
                >
                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    <div className="p-3 bg-white rounded-2xl shadow-inner border border-slate-100">
                      <QRCodeSVG value={mfaData.qrCodeUrl} size={140} />
                    </div>
                    <div className="flex-1 space-y-3">
                      <h4 className="font-bold text-slate-700 dark:text-white text-sm">Escanea este código</h4>
                      <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
                        Usa Google Authenticator o Authy. Luego ingresa el código de 6 dígitos para confirmar.
                      </p>
                      <div className="p-3 bg-white/50 dark:bg-slate-800 rounded-xl border border-slate-100 dark:border-slate-700">
                        <span className="text-[10px] block text-slate-400 uppercase font-bold mb-1">O ingresa manualmente:</span>
                        <code className="text-xs font-mono font-bold text-primary break-all">{mfaData.secret}</code>
                      </div>
                    </div>
                  </div>

                  <form onSubmit={handleEnable2FA} className="flex gap-2">
                    <input 
                      type="text"
                      className="flex-1 px-4 py-3.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl outline-none focus:ring-2 focus:ring-primary h-[54px] text-center font-bold tracking-widest text-lg"
                      placeholder="000000"
                      maxLength={6}
                      value={mfaToken}
                      onChange={(e) => setMfaToken(e.target.value)}
                      required
                    />
                    <button 
                      type="submit"
                      disabled={mfaLoading}
                      className="bg-emerald-500 hover:bg-emerald-600 text-white p-4 rounded-xl shadow-lg transition-all disabled:opacity-50 h-[54px]"
                    >
                      {mfaLoading ? <Loader2 size={24} className="animate-spin" /> : <CheckCircle2 size={24} />}
                    </button>
                    <button 
                      type="button"
                      onClick={() => setMfaData(null)}
                      className="bg-slate-200 dark:bg-slate-800 text-slate-500 p-4 rounded-xl hover:bg-slate-300 dark:hover:bg-slate-700 transition-all h-[54px]"
                    >
                      <Trash2 size={24} />
                    </button>
                  </form>
                </motion.div>
              )}

              {is2faEnabled && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="space-y-4"
                >
                  <div className="flex items-start gap-4 p-5 bg-emerald-50 dark:bg-emerald-500/5 rounded-3xl border border-emerald-100 dark:border-emerald-500/20">
                    <div className="p-2 bg-emerald-500 text-white rounded-xl">
                      <ShieldCheck size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">Doble factor activo</h4>
                      <p className="text-xs text-emerald-600/70 dark:text-emerald-400/50 mt-1">
                        Tu cuenta tiene el máximo nivel de protección disponible.
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDisable2FA}
                    disabled={mfaLoading}
                    className="w-full py-4 bg-red-50 hover:bg-red-100 dark:bg-red-500/10 dark:hover:bg-red-500/20 text-red-600 font-bold rounded-2xl transition-all flex items-center justify-center gap-2"
                  >
                    {mfaLoading ? <Loader2 size={20} className="animate-spin" /> : <><ShieldOff size={20} /> Desactivar 2FA</>}
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            {mfaMessage.text && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`mt-4 p-4 rounded-2xl flex items-center gap-3 text-sm font-semibold border ${
                  mfaMessage.type === 'error' 
                    ? 'bg-red-50 text-red-600 border-red-100 dark:bg-red-500/10 dark:text-red-400 dark:border-red-900/30'
                    : 'bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-900/30'
                }`}
              >
                {mfaMessage.type === 'error' ? <AlertCircle size={20} /> : <CheckCircle2 size={20} />}
                {mfaMessage.text}
              </motion.div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default Settings;
