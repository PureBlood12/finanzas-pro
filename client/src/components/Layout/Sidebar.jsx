import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  TableProperties, 
  PieChart, 
  Settings, 
  LogOut, 
  CreditCard,
  TrendingDown,
  TrendingUp,
  Moon,
  Sun
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const Sidebar = ({ darkMode, toggleDarkMode }) => {
  const { logout, user } = useAuth();

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: 'Dashboard', path: '/' },
    { icon: <TableProperties size={20} />, label: 'Mis Finanzas', path: '/finance' },
    { icon: <PieChart size={20} />, label: 'Reportes', path: '/reports' },
    { icon: <Settings size={20} />, label: 'Configuración', path: '/settings' },
  ];

  return (
    <div className="w-64 h-screen glass border-r flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3">
        <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/30">
          <CreditCard className="text-white" size={24} />
        </div>
        <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white">
          Finanzas<span className="text-primary">Pro</span>
        </h1>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-1">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `
              flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group
              ${isActive 
                ? 'bg-primary text-white shadow-lg shadow-primary/20' 
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50'}
            `}
          >
            {item.icon}
            <span className="font-medium">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="px-4 py-6 border-t border-slate-200 dark:border-slate-700 space-y-2">
        <button
          onClick={toggleDarkMode}
          className="w-full flex items-center gap-3 px-4 py-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 rounded-xl transition-all"
        >
          {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          <span className="font-medium">{darkMode ? 'Modo Claro' : 'Modo Oscuro'}</span>
        </button>
        
        <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl mb-4">
          <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Usuario</p>
          <p className="text-sm font-semibold truncate text-slate-800 dark:text-white">{user?.username || 'Admin'}</p>
        </div>

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-all"
        >
          <LogOut size={20} />
          <span className="font-medium">Cerrar Sesión</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
