import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { User, Calendar, ShieldCheck, Mail, ClipboardList } from 'lucide-react';

const ProfilePage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/analytics')
      .then((res) => {
        setStats(res.data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Title */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">Account Profile</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Manage your personal settings and profile metrics.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        
        {/* Profile Card */}
        <div className="md:col-span-5 glass-card p-6 rounded-xl space-y-6 relative overflow-hidden">
          
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="h-20 w-20 rounded-full bg-brand-500 text-white font-extrabold text-2xl uppercase flex items-center justify-center border-4 border-white shadow">
              {user?.username.substring(0, 2)}
            </div>
            <div>
              <h3 className="text-lg font-bold dark:text-white">{user?.username}</h3>
              <span className="px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold bg-brand-50 text-brand-650 dark:bg-brand-950/20 dark:text-brand-400">
                {user?.role} Profile
              </span>
            </div>
          </div>

          <div className="space-y-4 border-t border-slate-200/50 dark:border-slate-800/30 pt-4 text-xs font-semibold">
            
            <div className="flex items-center gap-3">
              <Mail size={16} className="text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Email Address</p>
                <p className="dark:text-slate-250 mt-0.5">{user?.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <Calendar size={16} className="text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Member Since</p>
                <p className="dark:text-slate-250 mt-0.5">
                  {user ? new Date(user.created_at).toLocaleDateString() : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <ShieldCheck size={16} className="text-slate-400" />
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-400">Security Clearance</p>
                <p className="dark:text-slate-250 mt-0.5">
                  {user?.role === 'admin' ? 'Administrative Access' : 'Patient Read/Write access'}
                </p>
              </div>
            </div>

          </div>

        </div>

        {/* Diagnostic overview metrics shortcut */}
        <div className="md:col-span-7 space-y-4">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Scan Summary Statistics</h3>
            
            {loading ? (
              <div className="h-24 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"></div>
            ) : stats ? (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="p-4 rounded-xl bg-slate-50/50 dark:bg-slate-900 border border-slate-200/40 dark:border-slate-800/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Scans</span>
                  <p className="text-2xl font-extrabold mt-1 text-slate-800 dark:text-white">{stats.total_predictions}</p>
                </div>

                <div className="p-4 rounded-xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-250/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Healthy Scans</span>
                  <p className="text-2xl font-extrabold mt-1 text-emerald-600 dark:text-emerald-400">{stats.healthy_cases}</p>
                </div>

                <div className="p-4 rounded-xl bg-rose-50/40 dark:bg-rose-950/10 border border-rose-250/20">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Anomalies Detected</span>
                  <p className="text-2xl font-extrabold mt-1 text-rose-500">{stats.diseased_cases}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-450">Unable to load metrics.</p>
            )}
          </div>

          <div className="glass-card p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">DENTEX Platform Disclaimers</h3>
            <div className="flex items-start gap-2.5 text-xs text-slate-500 leading-5">
              <ClipboardList size={16} className="shrink-0 mt-0.5 text-brand-500" />
              <p>
                This clinical web application runs experimental computer vision models to screen and analyze dental diseases. All findings are structured as reference diagnostics. It is not an alternative to standard professional healthcare checkups. Ensure you schedule clinical examinations with a registered dentist periodically.
              </p>
            </div>
          </div>
        </div>

      </div>

    </div>
  );
};

export default ProfilePage;
