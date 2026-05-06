import React, { useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { Mail, Lock, LogIn, User, Globe } from 'lucide-react'
import { motion } from 'framer-motion'

const Login = () => {
  const [isLogin, setIsLogin] = useState(true)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  
  const { signIn, signUp, signInWithGoogle } = useAuth()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      if (isLogin) {
        const { error } = await signIn({ email, password })
        if (error) throw error
      } else {
        const { error } = await signUp({ email, password })
        if (error) throw error
        alert('Revisa tu email para confirmar el registro!')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white dark:bg-slate-900 rounded-3xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800"
      >
        <div className="p-8">
          <div className="flex justify-center mb-8">
            <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-lg shadow-primary/30">
              <LogIn size={32} />
            </div>
          </div>
          
          <h2 className="text-3xl font-bold text-center mb-2 text-slate-900 dark:text-white">
            {isLogin ? '¡Bienvenido de nuevo!' : 'Crea tu cuenta'}
          </h2>
          <p className="text-center text-slate-500 dark:text-slate-400 mb-8">
            {isLogin ? 'Gestiona tus finanzas de forma profesional' : 'Comienza a tomar el control de tus gastos'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="email"
                placeholder="Correo electrónico"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-3 top-3.5 text-slate-400" size={18} />
              <input
                type="password"
                placeholder="Contraseña"
                className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-primary outline-none transition-all"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <p className="text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg border border-red-100 dark:border-red-900/30">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-primary hover:bg-primary/90 text-white font-semibold rounded-xl transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2"
            >
              {loading ? 'Procesando...' : isLogin ? 'Entrar' : 'Registrarse'}
            </button>
          </form>

          <div className="mt-8 relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200 dark:border-slate-800"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-slate-900 text-slate-500">O continúa con</span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={signInWithGoogle}
              className="w-full py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-3"
            >
              <Globe size={20} className="text-red-500" />
              Google
            </button>
          </div>

          <p className="mt-8 text-center text-slate-600 dark:text-slate-400">
            {isLogin ? '¿No tienes cuenta?' : '¿Ya tienes cuenta?'}
            <button
              onClick={() => setIsLogin(!isLogin)}
              className="ml-2 text-primary font-semibold hover:underline"
            >
              {isLogin ? 'Regístrate gratis' : 'Inicia sesión'}
            </button>
          </p>
        </div>
      </motion.div>
    </div>
  )
}

export default Login
