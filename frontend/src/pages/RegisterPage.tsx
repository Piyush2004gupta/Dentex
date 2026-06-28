import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus } from 'lucide-react';

const RegisterPage: React.FC = () => {
  const { register: registerAuth } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: any) => {
    setLoading(true);
    setErrorMsg(null);
    try {
      await registerAuth(data);
      navigate('/dashboard');
    } catch (err: any) {
      if (err.response && err.response.data && err.response.data.detail) {
        setErrorMsg(err.response.data.detail);
      } else {
        setErrorMsg('Failed to register. Username or Email may already exist.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 py-8">
      <div className="w-full max-w-md p-8 glass-card rounded-2xl relative overflow-hidden">
        
        {/* Glow Effects */}
        <div className="absolute -top-24 -left-24 h-48 w-48 rounded-full bg-brand-500/10 blur-3xl"></div>
        <div className="absolute -bottom-24 -right-24 h-48 w-48 rounded-full bg-cyan-500/10 blur-3xl"></div>

        <div className="relative">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white text-center">
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 text-center">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500 dark:text-brand-400">
              Sign in
            </Link>
          </p>

          {errorMsg && (
            <div className="mt-4 flex items-center gap-2 rounded-lg bg-rose-50 dark:bg-rose-950/20 px-3 py-2.5 text-xs font-semibold text-rose-600 border border-rose-250/20">
              <ShieldAlert size={16} />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-4">
            
            {/* Username */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Username</label>
              <input
                type="text"
                {...register('username', { 
                  required: 'Username is required',
                  minLength: { value: 3, message: 'Username must be at least 3 characters' }
                })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none dark:text-white transition-all"
                placeholder="Enter username"
              />
              {errors.username && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{errors.username.message as string}</span>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Email Address</label>
              <input
                type="email"
                {...register('email', { 
                  required: 'Email is required',
                  pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none dark:text-white transition-all"
                placeholder="email@example.com"
              />
              {errors.email && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{errors.email.message as string}</span>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Password</label>
              <input
                type="password"
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none dark:text-white transition-all"
                placeholder="Min 6 characters"
              />
              {errors.password && (
                <span className="text-[10px] text-rose-500 font-semibold mt-0.5 block">{errors.password.message as string}</span>
              )}
            </div>

            {/* Role selection */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Select Account Type</label>
              <select
                {...register('role')}
                className="w-full rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-4 py-3 text-sm focus:border-brand-500 focus:outline-none dark:text-white transition-all"
              >
                <option value="patient">Patient Profile</option>
                <option value="admin">Clinic Administrator</option>
              </select>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand-600 to-brand-500 px-4 py-3 text-sm font-bold text-white shadow-md shadow-brand-500/10 hover:from-brand-500 hover:to-brand-400 transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
              ) : (
                <>
                  <UserPlus size={16} />
                  <span>Create Account</span>
                </>
              )}
            </button>

          </form>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
