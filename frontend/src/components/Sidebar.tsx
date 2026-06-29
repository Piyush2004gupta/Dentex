import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileHeart, History, User, LogOut } from 'lucide-react';

const Sidebar: React.FC = () => {
  const { logout } = useAuth();

  const links = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/predict', label: 'Scan & Predict', icon: FileHeart },
    { to: '/history', label: 'Prediction History', icon: History },
    { to: '/profile', label: 'My Profile', icon: User },
  ];

  return (
    <aside className="w-64 shrink-0 hidden md:block bg-white dark:bg-slate-900 border-r border-slate-200/50 dark:border-slate-800/30 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-wider text-slate-400 font-bold px-3">
          Platform Navigation
        </div>
        <nav className="space-y-1">
          {links.map((link) => {
            const IconComponent = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-50 text-brand-600 dark:bg-brand-950/30 dark:text-brand-400 shadow-sm border-l-4 border-brand-500'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/50 dark:hover:text-slate-200'
                  }`
                }
              >
                <IconComponent size={18} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      <div className="pt-4 border-t border-slate-200/50 dark:border-slate-800/30">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/20 dark:hover:text-rose-350 transition-all duration-200"
        >
          <LogOut size={18} />
          <span>Log Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;

