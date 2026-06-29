import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, Lock, LogIn, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { login, token } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (token) {
      navigate('/dashboard');
    }
  }, [token, navigate]);


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    try {
      await login({ email, password });
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center p-6 bg-slate-50 dark:bg-slate-950 overflow-hidden">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full bg-brand-500/10 dark:bg-brand-500/20 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-80 h-80 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md glass-card rounded-2xl border border-slate-200/50 dark:border-slate-800/30 p-8 shadow-xl relative z-10">
        
        {/* Header */}
        <div className="text-center mb-8 space-y-2">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-brand-600 to-cyan-500 bg-clip-text text-transparent dark:from-brand-400 dark:to-cyan-300">
            Welcome Back
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Sign in to access your DENTEX dental health diagnostics dashboard
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/40 dark:border-rose-800/20 text-xs font-semibold text-rose-600 dark:text-rose-400 animate-in fade-in slide-in-from-top-1 duration-200">
            <AlertCircle size={16} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          
          {/* Email */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500/50 dark:focus:ring-brand-400/50 focus:border-brand-500 transition-all"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 hover:from-brand-500 hover:to-brand-400 text-white font-bold text-sm shadow-lg shadow-brand-500/10 hover:shadow-xl hover:shadow-brand-500/20 active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
          >
            {loading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <LogIn size={16} />
            )}
            <span>{loading ? 'Signing you in...' : 'Sign In'}</span>
          </button>

        </form>

        {/* Footer Links */}
        <div className="mt-8 text-center border-t border-slate-200/50 dark:border-slate-800/20 pt-5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-brand-600 dark:text-brand-400 font-bold hover:underline"
          >
            Sign Up
          </Link>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
