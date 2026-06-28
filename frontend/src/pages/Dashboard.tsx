import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Activity, ShieldCheck, Heart, Sparkles, AlertTriangle, 
  ArrowRight, FileHeart, Calendar, HelpCircle 
} from 'lucide-react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend, BarChart, Bar
} from 'recharts';
import { Link } from 'react-router-dom';

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/analytics')
      .then((res) => {
        setData(res.data);
      })
      .catch((err) => {
        setError('Failed to fetch analytics data.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex-1 p-6 space-y-6 animate-pulse">
        <div className="h-8 w-48 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-28 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
          <div className="h-80 bg-slate-200 dark:bg-slate-800 rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 p-6 text-center text-rose-500 font-semibold">
        {error || 'No data found.'}
      </div>
    );
  }

  // Pie chart parameters
  const COLORS = ['#10b981', '#ef4444', '#f97316', '#3b82f6', '#8b5cf6', '#ec4899', '#f59e0b'];
  const pieData = Object.entries(data.disease_distribution).map(([name, value]) => ({
    name,
    value
  }));

  const barData = Object.entries(data.severity_distribution).map(([name, value]) => ({
    name,
    value
  }));

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">
            Welcome back, {user?.username}!
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Here's a review of your dental diagnostic metrics.
          </p>
        </div>
        <Link
          to="/predict"
          className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-600 transition-all"
        >
          <FileHeart size={16} />
          <span>New Diagnostic Scan</span>
        </Link>
      </div>

      {/* Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Total Predictions */}
        <div className="glass-card p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Total Scans</span>
            <h3 className="text-3xl font-extrabold text-slate-800 dark:text-white mt-1">{data.total_predictions}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-brand-100 dark:bg-brand-950/40 text-brand-650 dark:text-brand-400 flex items-center justify-center">
            <Activity size={24} />
          </div>
        </div>

        {/* Healthy cases */}
        <div className="glass-card p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Healthy Cases</span>
            <h3 className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">{data.healthy_cases}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
        </div>

        {/* Diseased cases */}
        <div className="glass-card p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Diseased Cases</span>
            <h3 className="text-3xl font-extrabold text-rose-500 mt-1">{data.diseased_cases}</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-rose-100 dark:bg-rose-950/40 text-rose-500 flex items-center justify-center">
            <AlertTriangle size={24} />
          </div>
        </div>

        {/* AI Confidence */}
        <div className="glass-card p-6 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Avg Confidence</span>
            <h3 className="text-3xl font-extrabold text-cyan-600 dark:text-cyan-400 mt-1">{data.detection_accuracy}%</h3>
          </div>
          <div className="h-12 w-12 rounded-xl bg-cyan-100 dark:bg-cyan-950/40 text-cyan-500 flex items-center justify-center">
            <Sparkles size={24} />
          </div>
        </div>

      </div>

      {/* Chart Rows */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Weekly scan count */}
        <div className="glass-card p-6 rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Scan & Diagnostic Trend</h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.weekly_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-850" />
                <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Area type="monotone" dataKey="total" stroke="#0ea5e9" strokeWidth={2} fillOpacity={1} fill="url(#totalColor)" name="Total Scans" />
                <Area type="monotone" dataKey="diseased" stroke="#ef4444" strokeWidth={1.5} fillOpacity={0} name="Diseased" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Disease distribution */}
        <div className="glass-card p-6 rounded-xl space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Conditions Distribution</h4>
          <div className="h-72 flex items-center justify-center">
            {pieData.length === 0 ? (
              <p className="text-xs text-slate-400">No conditions detected yet.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px' }} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Severity distribution bar chart */}
        <div className="glass-card p-6 rounded-xl space-y-4 lg:col-span-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Severity Levels</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-850" />
                <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                <YAxis tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ fontSize: '11px', borderRadius: '8px' }} />
                <Bar dataKey="value" fill="#0ea5e9" radius={[4, 4, 0, 0]}>
                  {barData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.name === 'Healthy' ? '#10b981' : entry.name === 'Severe' ? '#ef4444' : entry.name === 'Moderate' ? '#f97316' : '#eab308'} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Uploads */}
        <div className="glass-card p-6 rounded-xl space-y-4 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Recent Diagnostic Scans</h4>
            <Link to="/history" className="text-xs font-semibold text-brand-650 hover:underline flex items-center gap-1">
              <span>View all history</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                  <th className="pb-3 font-semibold">Filename</th>
                  <th className="pb-3 font-semibold">Disease</th>
                  <th className="pb-3 font-semibold">Severity</th>
                  <th className="pb-3 font-semibold">Confidence</th>
                  <th className="pb-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {data.recent_uploads.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-6 text-center text-slate-400">
                      No diagnostic records found. Upload a scan to begin.
                    </td>
                  </tr>
                ) : (
                  data.recent_uploads.map((rec: any) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20">
                      <td className="py-3 font-medium text-slate-800 dark:text-slate-200 max-w-[120px] truncate">{rec.filename}</td>
                      <td className="py-3 font-medium">{rec.disease}</td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          rec.severity === 'Healthy' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                          rec.severity === 'Mild' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400' :
                          rec.severity === 'Moderate' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' :
                          'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {rec.severity}
                        </span>
                      </td>
                      <td className="py-3 font-bold text-slate-700 dark:text-slate-350">{rec.confidence}%</td>
                      <td className="py-3 text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        <span>{new Date(rec.created_at).toLocaleDateString()}</span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;
