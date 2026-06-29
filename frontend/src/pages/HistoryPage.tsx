import React, { useEffect, useState, useCallback } from 'react';
import api from '../services/api';
import {
  Search, Filter, Trash2, ChevronLeft, ChevronRight,
  Calendar, Activity, AlertTriangle, ShieldCheck, HelpCircle
} from 'lucide-react';
import { Link } from 'react-router-dom';

const DISEASE_OPTIONS = ['Dental Caries', 'Cavity', 'Gingivitis', 'Periodontitis', 'Plaque', 'Tartar', 'Healthy Tooth'];
const SEVERITY_OPTIONS = ['Healthy', 'Mild', 'Moderate', 'Severe'];

const severityStyle = (s: string) => {
  switch (s) {
    case 'Healthy':   return 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400';
    case 'Mild':      return 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400';
    case 'Moderate':  return 'bg-orange-50 text-orange-600 dark:bg-orange-950/20 dark:text-orange-500';
    case 'Severe':    return 'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400';
    default:          return 'bg-slate-100 text-slate-500';
  }
};

const HistoryPage: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [total, setTotal]             = useState(0);
  const [page, setPage]               = useState(1);
  const [pages, setPages]             = useState(1);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState<string | null>(null);
  const [search, setSearch]           = useState('');
  const [diseaseFilter, setDiseaseFilter] = useState('');
  const [deletingId, setDeletingId]   = useState<number | null>(null);

  const fetchHistory = useCallback(() => {
    setLoading(true);
    setError(null);
    const params: any = { page, size: 10 };
    if (search)         params.search   = search;
    if (diseaseFilter)  params.disease  = diseaseFilter;

    api.get('/predictions/history', { params })
      .then((res) => {
        setPredictions(res.data.predictions);
        setTotal(res.data.total);
        setPages(res.data.pages);
      })
      .catch(() => setError('Failed to load prediction history.'))
      .finally(() => setLoading(false));
  }, [page, search, diseaseFilter]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const handleDelete = async (id: number) => {
    if (!window.confirm('Delete this diagnostic record permanently?')) return;
    setDeletingId(id);
    try {
      await api.delete(`/predictions/prediction/${id}`);
      fetchHistory();
    } catch {
      alert('Failed to delete record.');
    } finally {
      setDeletingId(null);
    }
  };


  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">

      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">Diagnostic History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse, filter, and manage your past dental scan records.
          </p>
        </div>
        <Link
          to="/predict"
          className="inline-flex items-center gap-1.5 rounded-xl bg-brand-500 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-brand-500/10 hover:bg-brand-600 transition-all"
        >
          <Activity size={15} />
          <span>New Scan</span>
        </Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 rounded-xl flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by filename..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-8 pr-3 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-800 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all"
          />
        </div>

        {/* Disease filter */}
        <div className="relative">
          <Filter size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <select
            value={diseaseFilter}
            onChange={(e) => { setDiseaseFilter(e.target.value); setPage(1); }}
            className="pl-8 pr-3 py-2.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 text-slate-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500/30 transition-all appearance-none cursor-pointer"
          >
            <option value="">All Diseases</option>
            {DISEASE_OPTIONS.map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-card rounded-xl overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-3 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-10 bg-slate-200 dark:bg-slate-800 rounded" />
            ))}
          </div>
        ) : error ? (
          <div className="p-12 text-center text-rose-500 font-semibold">{error}</div>
        ) : predictions.length === 0 ? (
          <div className="p-16 text-center">
            <HelpCircle size={40} className="mx-auto mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-semibold text-slate-400">No diagnostic records found.</p>
            <p className="text-xs text-slate-350 dark:text-slate-500 mt-1">
              Upload a dental scan on the Scan &amp; Predict page to get started.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/30">
                    <th className="p-4 font-semibold">ID</th>
                    <th className="p-4 font-semibold">Filename</th>
                    <th className="p-4 font-semibold">Condition</th>
                    <th className="p-4 font-semibold">Confidence</th>
                    <th className="p-4 font-semibold">Quality</th>
                    <th className="p-4 font-semibold">Date</th>
                    <th className="p-4 font-semibold text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                  {predictions.map((rec: any) => (
                    <tr key={rec.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors">
                      <td className="p-4 font-bold text-slate-400">#{rec.id}</td>
                      <td className="p-4 font-medium text-slate-800 dark:text-slate-200 max-w-[130px] truncate" title={rec.filename}>
                        {rec.filename}
                      </td>
                      <td className="p-4 font-medium text-slate-700 dark:text-slate-300">{rec.disease}</td>
                      <td className="p-4 font-bold text-slate-700 dark:text-slate-300">{rec.confidence}%</td>
                      <td className="p-4">
                        {rec.is_valid ? (
                          <span className="flex items-center gap-1 text-emerald-500 font-bold">
                            <ShieldCheck size={12} /> Valid
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-rose-500 font-bold">
                            <AlertTriangle size={12} /> Low Quality
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-slate-400">
                        <span className="flex items-center gap-1">
                          <Calendar size={11} />
                          {new Date(rec.created_at).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="p-4">
                        <div className="flex items-center justify-center gap-2">
                          {/* Delete */}
                          <button
                            onClick={() => handleDelete(rec.id)}
                            disabled={deletingId === rec.id}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all disabled:opacity-40"
                            title="Delete Record"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between px-4 py-3 border-t border-slate-100 dark:border-slate-800">
              <p className="text-xs text-slate-400">
                Showing <span className="font-semibold text-slate-600 dark:text-slate-300">{predictions.length}</span> of{' '}
                <span className="font-semibold text-slate-600 dark:text-slate-300">{total}</span> records
              </p>
              <div className="flex items-center gap-2">
                <button
                  disabled={page <= 1}
                  onClick={() => setPage(p => p - 1)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                >
                  <ChevronLeft size={16} />
                </button>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                  Page {page} of {pages}
                </span>
                <button
                  disabled={page >= pages}
                  onClick={() => setPage(p => p + 1)}
                  className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30 transition-all"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

    </div>
  );
};

export default HistoryPage;
