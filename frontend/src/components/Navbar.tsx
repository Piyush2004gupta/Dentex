import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Sun, Moon, LogOut, Menu, X, Shield, Activity, User as UserIcon } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('theme') === 'dark' || 
      (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
  });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isDashboard = ['/dashboard', '/predict', '/history', '/profile', '/admin'].some(path => location.pathname.startsWith(path));

  return (
    <nav className="sticky top-0 z-50 w-full glass-panel border-b border-slate-200/50 dark:border-slate-800/30 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 text-white shadow-md shadow-brand-500/20">
                <Activity size={22} className="animate-pulse" />
              </div>
              <span className="text-xl font-bold tracking-tight bg-gradient-to-r from-brand-600 to-brand-400 bg-clip-text text-transparent dark:from-brand-400 dark:to-cyan-400">
                Dentex
              </span>
            </Link>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-6">
            {!isDashboard && !isAuthPage && (
              <>
                <a href="#about" className="text-sm font-medium text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">AI Overview</a>
                <a href="#features" className="text-sm font-medium text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">Features</a>
                <a href="#stats" className="text-sm font-medium text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">Statistics</a>
                <a href="#faq" className="text-sm font-medium text-slate-600 hover:text-brand-500 dark:text-slate-300 dark:hover:text-brand-400 transition-colors">FAQ</a>
              </>
            )}

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
              aria-label="Toggle theme"
            >
              {darkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            {user ? (
              <div className="flex items-center gap-4">
                {/* Dashboard Shortcut link */}
                {!isDashboard && (
                  <Link
                    to="/dashboard"
                    className="text-sm font-semibold text-brand-600 dark:text-brand-400 hover:underline"
                  >
                    Go to Dashboard
                  </Link>
                )}

                {/* Profile Badge */}
                <div className="flex items-center gap-2 rounded-full bg-slate-100/50 dark:bg-slate-800/50 px-3 py-1.5 border border-slate-200/40 dark:border-slate-700/20">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold uppercase">
                    {user.username.substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none">{user.username}</span>
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold leading-none mt-0.5">{user.role}</span>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                >
                  <LogOut size={16} />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              !isAuthPage && (
                <div className="flex items-center gap-3">
                  <Link to="/login" className="text-sm font-semibold text-slate-700 dark:text-slate-200 hover:text-brand-500 transition-colors">Sign In</Link>
                  <Link
                    to="/register"
                    className="rounded-lg bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-brand-500/20 hover:from-brand-500 hover:to-brand-400 hover:shadow-lg hover:shadow-brand-500/30 transition-all duration-300"
                  >
                    Register
                  </Link>
                </div>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-all"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen && (
        <div className="md:hidden glass-panel border-t border-slate-200/50 dark:border-slate-800/30 px-4 pt-2 pb-4 space-y-2">
          {!isDashboard && !isAuthPage && (
            <div className="flex flex-col gap-2 py-2">
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 dark:text-slate-300 py-1.5">AI Overview</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 dark:text-slate-300 py-1.5">Features</a>
              <a href="#stats" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 dark:text-slate-300 py-1.5">Statistics</a>
              <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-sm font-medium text-slate-600 dark:text-slate-300 py-1.5">FAQ</a>
            </div>
          )}

          {user ? (
            <div className="flex flex-col gap-3 border-t border-slate-200/50 dark:border-slate-800/30 pt-3">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-500 text-white font-bold">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-700 dark:text-slate-200">{user.username}</div>
                  <div className="text-[10px] uppercase font-bold text-brand-500">{user.role}</div>
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-brand-600 dark:text-brand-400">Dashboard</Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-1.5 w-full text-left text-sm font-semibold text-rose-600 py-1"
              >
                <LogOut size={16} />
                <span>Logout</span>
              </button>
            </div>
          ) : (
            !isAuthPage && (
              <div className="flex flex-col gap-2 border-t border-slate-200/50 dark:border-slate-800/30 pt-3">
                <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="text-sm font-semibold text-slate-700 dark:text-slate-200 py-2">Sign In</Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg bg-brand-500 py-2 text-center text-sm font-semibold text-white"
                >
                  Register
                </Link>
              </div>
            )
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
