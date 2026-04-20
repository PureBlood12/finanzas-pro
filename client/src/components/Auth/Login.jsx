import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Lock, User, Loader2, ShieldCheck, ArrowLeft } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [token2fa, setToken2fa] = useState('');
  const [mfaRequired, setMfaRequired] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) {
    return <Navigate to="/" />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const result = await login(username, password, token2fa);
      if (result && result.mfaRequired) {
        setMfaRequired(true);
      } else {
        navigate('/');
      }
    } catch (err) {
      if (mfaRequired) {
        setError('Código 2FA incorrecto. Revisa tu aplicación.');
      } else {
        const rawError = err.response?.data?.message || err.response?.data?.error || err.response?.data || err.message;
        const errorString = typeof rawError === 'object' ? JSON.stringify(rawError) : String(rawError);
        setError(`⚠️ ERROR DEL SISTEMA: ${errorString}`);
        console.error('Full login error:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setMfaRequired(false);
    setToken2fa('');
    setError('');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      {/* Background patterns */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md relative z-10"
      >
        <div className="glass p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 dark:shadow-none border border-white/20 dark:border-slate-800">
          <AnimatePresence mode="wait">
            {!mfaRequired ? (
              <motion.div
                key="login-form"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 text-center">
                  <div className="inline-flex bg-gradient-to-br from-primary to-indigo-600 p-4 rounded-2xl shadow-lg shadow-primary/30 mb-4 transform hover:rotate-3 transition-transform">
                    <CreditCard className="text-white" size={32} />
                  </div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
                    Bienvenido
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Ingresa a tu portal de Finanzas Pro</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Usuario</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <User size={18} />
                      </div>
                      <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="Nombre de usuario"
                        required
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Contraseña</label>
                    <div className="relative group">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                        <Lock size={18} />
                      </div>
                      <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-10 pr-4 py-3.5 bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all"
                        placeholder="••••••••"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 dark:bg-red-500/10 text-red-500 text-sm p-4 rounded-xl text-center font-medium border border-red-100 dark:border-red-900/30"
                    >
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-primary to-indigo-600 hover:from-primary-hover hover:to-indigo-700 text-white font-bold py-4 rounded-2xl shadow-xl shadow-primary/20 transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-70"
                  >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar Sesión'}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="mfa-form"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="mb-8 text-center">
                  <div className="inline-flex bg-gradient-to-br from-emerald-500 to-teal-600 p-4 rounded-2xl shadow-lg shadow-emerald-500/30 mb-4">
                    <ShieldCheck className="text-white" size={32} />
                  </div>
                  <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
                    Doble Factor
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400 mt-2">Ingresa el código de 6 dígitos de tu App Authenticator</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="space-y-1.5">
                    <div className="relative group">
                      <input
                        type="text"
                        value={token2fa}
                        onChange={(e) => setToken2fa(e.target.value)}
                        className="w-full px-4 py-5 text-center text-3xl font-bold tracking-[0.5em] bg-slate-50/50 dark:bg-slate-700/30 border border-slate-200 dark:border-slate-700/50 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 transition-all placeholder:tracking-normal placeholder:text-sm placeholder:font-normal"
                        placeholder="000 000"
                        maxLength={6}
                        required
                        autoFocus
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-red-50 dark:bg-red-500/10 text-red-500 text-sm p-4 rounded-xl text-center font-medium border border-red-100 dark:border-red-900/30"
                    >
                      {error}
                    </motion.div>
                  )}

                  <div className="flex flex-col gap-3">
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-slate-800 dark:bg-white dark:text-slate-900 hover:bg-slate-900 text-white font-bold py-4 rounded-2xl shadow-xl transition-all duration-300 flex items-center justify-center gap-2 transform active:scale-[0.98] disabled:opacity-70"
                    >
                      {loading ? <Loader2 className="animate-spin" size={20} /> : 'Verificar y Entrar'}
                    </button>
                    
                    <button
                      type="button"
                      onClick={handleBack}
                      className="flex items-center justify-center gap-2 py-2 text-sm font-semibold text-slate-500 hover:text-primary transition-colors"
                    >
                      <ArrowLeft size={16} />
                      Volver al inicio
                    </button>
                  </div>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="mt-8 pt-6 border-t border-slate-200/50 dark:border-slate-700/50 text-center">
            <p className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-[0.2em] font-bold">
              Seguridad de Nivel Profesional • Finanzas Pro
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
