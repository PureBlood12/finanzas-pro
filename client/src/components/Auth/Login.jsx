import React, { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { CreditCard, Lock, User, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
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
      await login(username, password);
      navigate('/');
    } catch (err) {
      setError('Credenciales inválidas. Intenta con admin/admin123');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900 px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
        <div className="absolute -bottom-[10%] -right-[10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="glass p-8 rounded-3xl shadow-2xl shadow-slate-200/50 dark:shadow-none relative overflow-hidden">
          <div className="mb-8 text-center">
            <div className="inline-flex bg-primary p-4 rounded-2xl shadow-lg shadow-primary/30 mb-4">
              <CreditCard className="text-white" size={32} />
            </div>
            <h2 className="text-3xl font-bold text-slate-800 dark:text-white">Bienvenido</h2>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Ingresa a tu portal de Finanzas Pro</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Usuario</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-none outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 dark:text-slate-300 ml-1">Contraseña</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-700/50 border-none outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-sm text-red-500 text-center font-medium"
              >
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primary-hover text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-primary/30 transition-all duration-200 flex items-center justify-center gap-2 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : 'Iniciar Sesión'}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-700 text-center">
            <p className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-widest font-bold">
              Uso Privado • Finanzas Pro
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
