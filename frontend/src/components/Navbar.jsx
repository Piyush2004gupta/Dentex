import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, X, Sparkles } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Force light mode for the landing page to match the clean aesthetic
  useEffect(() => {
    document.documentElement.classList.remove('dark');
  }, []);

  const isAuthPage = ['/login', '/register'].includes(location.pathname);
  const isDashboard = ['/dashboard', '/predict', '/history', '/profile'].some((path) => location.pathname.startsWith(path));

  return (
    <nav className="sticky top-0 z-50 w-full bg-white/80 backdrop-blur-md border-b border-slate-100 transition-all duration-300">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between">

          {/* Logo Area */}
          <div className="flex items-center gap-4">
            <Link to="/" className="flex items-center">
              <span className="text-3xl font-extrabold tracking-tight text-[#0f172a] font-sans">
                SmileGuard
              </span>
            </Link>
            {!isDashboard &&
            <div className="hidden md:flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-500 border border-slate-100 shadow-sm">
                <Sparkles size={12} className="text-rose-400" />
                <span>AI-Powered Insights</span>
              </div>
            }
          </div>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center flex-1 justify-center gap-2">
            {!isDashboard && !isAuthPage &&
            <>
                <a href="#" className="px-5 py-2 rounded-full text-sm font-semibold text-slate-900 bg-slate-100/80 hover:bg-slate-200 transition-colors">Home</a>
                <a href="#about" className="px-5 py-2 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">About</a>
                <a href="#features" className="px-5 py-2 rounded-full text-sm font-semibold text-slate-500 hover:text-slate-900 hover:bg-slate-50 transition-colors">How It Works</a>
              </>
            }
          </div>

          {/* Desktop Auth / Right Side */}
          <div className="hidden md:flex items-center justify-end gap-6 min-w-[200px]">
            {!user ?
            <>
                <Link
                to="/login"
                className="text-sm font-bold text-slate-900 hover:text-brand-600 transition-colors">
                
                  Log In
                </Link>
                <Link
                to="/register"
                className="rounded-xl bg-[#0f172a] px-6 py-2.5 text-sm font-bold text-white hover:bg-slate-800 active:scale-[0.98] transition-all">
                
                  Sign Up
                </Link>
              </> :

            <div className="flex items-center gap-4">
                {!isDashboard &&
              <Link
                to="/dashboard"
                className="text-sm font-semibold text-brand-600 hover:underline">
                
                    Dashboard
                  </Link>
              }
                <div className="flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 border border-slate-200">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-500 text-white text-xs font-bold uppercase">
                    {user.username.substring(0, 2)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold text-slate-700 leading-none">{user.username}</span>
                  </div>
                </div>
                <button
                onClick={logout}
                className="text-xs font-bold text-rose-600 hover:text-rose-500 hover:underline transition-all">
                
                  Log Out
                </button>
              </div>
            }
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center gap-4 md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 transition-all">
              
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Panel */}
      {mobileMenuOpen &&
      <div className="md:hidden bg-white border-t border-slate-100 px-4 pt-2 pb-6 space-y-2 shadow-lg">
          {!isDashboard && !isAuthPage &&
        <div className="flex flex-col gap-2 py-4">
              <a href="#" onClick={() => setMobileMenuOpen(false)} className="text-base font-bold text-slate-900 py-2">Home</a>
              <a href="#about" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-600 py-2">About</a>
              <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-base font-medium text-slate-600 py-2">How It Works</a>
            </div>
        }

          {!user &&
        <div className="flex flex-col gap-3 border-t border-slate-100 pt-6">
              <Link to="/login" onClick={() => setMobileMenuOpen(false)} className="flex justify-center rounded-xl bg-slate-100 px-6 py-3 text-sm font-bold text-slate-900">Log In</Link>
              <Link to="/register" onClick={() => setMobileMenuOpen(false)} className="flex justify-center rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-bold text-white">Sign Up</Link>
            </div>
        }

          {user &&
        <div className="flex flex-col gap-4 border-t border-slate-100 pt-6">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-500 text-white font-bold">
                  {user.username.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="text-base font-bold text-slate-900">{user.username}</div>
                  <div className="text-xs font-medium text-slate-500">{user.role}</div>
                </div>
              </div>
              <Link to="/dashboard" onClick={() => setMobileMenuOpen(false)} className="flex justify-center rounded-xl bg-[#0f172a] px-6 py-3 text-sm font-bold text-white">Go to Dashboard</Link>
              <button onClick={() => {logout();setMobileMenuOpen(false);}} className="text-sm font-bold text-rose-600 py-2">Log Out</button>
            </div>
        }
        </div>
      }
    </nav>);

};

export default Navbar;