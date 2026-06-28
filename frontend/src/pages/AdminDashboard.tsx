import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { 
  Users, Download, UserMinus, ShieldAlert, Sparkles, 
  Activity, Calendar, Heart, ShieldCheck 
} from 'lucide-react';

const AdminDashboard: React.FC = () => {
  const { user: currentAdmin } = useAuth();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUsers = () => {
    setLoading(true);
    api.get('/admin/users')
      .then((res) => {
        setUsersList(res.data);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to fetch user list from database.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const deleteUser = async (id: number, username: string) => {
    if (username === currentAdmin?.username) {
      alert('You cannot delete your own admin account.');
      return;
    }
    if (!window.confirm(`Are you sure you want to permanently delete user account "${username}"? All their diagnostic files and scans will be deleted.`)) {
      return;
    }
    try {
      await api.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      alert('Failed to delete the user profile.');
      console.error(err);
    }
  };

  const downloadCSVLogs = () => {
    window.open('http://localhost:8000/api/admin/predictions/export', '_blank');
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">Admin Directory Controls</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Export clinical logs, manage user accounts, and examine platform metrics.
          </p>
        </div>
        <button
          onClick={downloadCSVLogs}
          className="inline-flex items-center gap-1.5 rounded-xl bg-cyan-600 hover:bg-cyan-700 text-white px-4 py-2.5 text-xs font-bold shadow shadow-cyan-600/10 transition-all"
        >
          <Download size={15} />
          <span>Export Scans CSV Logs</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* User directory lists */}
        <div className="lg:col-span-8 glass-card rounded-xl overflow-hidden border border-slate-250 dark:border-slate-850">
          <div className="p-4 border-b border-slate-250 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30 flex items-center gap-2">
            <Users size={16} className="text-brand-500" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">Registered Users Profile List</h3>
          </div>

          {loading ? (
            <div className="p-6 space-y-3 animate-pulse">
              {[1,2,3].map((i) => (
                <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded"></div>
              ))}
            </div>
          ) : error ? (
            <div className="p-6 text-center text-rose-500 font-bold">{error}</div>
          ) : usersList.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No users found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800">
                    <th className="p-4 font-semibold">User ID</th>
                    <th className="p-4 font-semibold">Username</th>
                    <th className="p-4 font-semibold">Email</th>
                    <th className="p-4 font-semibold">Account Role</th>
                    <th className="p-4 font-semibold">Register Date</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {usersList.map((usr) => (
                    <tr key={usr.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                      <td className="p-4 font-bold text-slate-400">#{usr.id}</td>
                      <td className="p-4 font-semibold dark:text-white">{usr.username}</td>
                      <td className="p-4 font-medium">{usr.email}</td>
                      <td className="p-4">
                        <span className={`px-2.5 py-0.5 rounded-full text-[9px] uppercase tracking-wider font-bold ${
                          usr.role === 'admin' ? 'bg-cyan-50 text-cyan-600 dark:bg-cyan-950/20 dark:text-cyan-400' : 'bg-slate-100 text-slate-650 dark:bg-slate-800'
                        }`}>
                          {usr.role}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 flex items-center gap-1 mt-0.5">
                        <Calendar size={12} />
                        <span>{new Date(usr.created_at).toLocaleDateString()}</span>
                      </td>
                      <td className="p-4">
                        <div className="flex justify-center">
                          <button
                            disabled={usr.username === currentAdmin?.username}
                            onClick={() => deleteUser(usr.id, usr.username)}
                            className="p-1.5 rounded text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                            title={usr.username === currentAdmin?.username ? 'Self profile cannot be deleted' : 'Delete user profile'}
                          >
                            <UserMinus size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Info panel */}
        <div className="lg:col-span-4 space-y-4">
          <div className="glass-card p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">System Logs Summary</h3>
            <div className="space-y-3 font-semibold text-xs text-slate-600 dark:text-slate-400">
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <span>Core Framework:</span>
                <span className="dark:text-white font-bold">FastAPI / Uvicorn</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <span>Total Registered Accounts:</span>
                <span className="dark:text-white font-bold">{usersList.length}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 dark:border-slate-850 pb-2">
                <span>Security Encryption:</span>
                <span className="dark:text-white font-bold">JWT / bcrypt (256-bit)</span>
              </div>
              <div className="flex justify-between pb-1">
                <span>Inference Fallback Flag:</span>
                <span className="text-emerald-500 font-bold flex items-center gap-0.5">
                  <ShieldCheck size={14} />
                  <span>Active Simulation</span>
                </span>
              </div>
            </div>
          </div>

          <div className="glass-card p-6 rounded-xl space-y-4 text-xs text-slate-500 leading-5">
            <h3 className="text-sm font-bold text-slate-850 dark:text-slate-200">Clinician Privacy Rules</h3>
            <p>
              As a clinic administrator, you are responsible for maintaining diagnostic records compliance. Access to user scans and user account deletions should correspond to direct clinic operational logs. Exported CSV diagnostic records contain patient-identified metadata. Protect records locally in accordance with healthcare confidentiality rules.
            </p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminDashboard;
