import React, { useEffect, useState } from 'react';
import api from '../services/api';
import { 
  Search, Trash2, Printer, ChevronLeft, ChevronRight, Calendar,
  AlertCircle, CheckCircle2, RefreshCw
} from 'lucide-react';

const HistoryPage: React.FC = () => {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  
  // Filters
  const [search, setSearch] = useState('');
  const [disease, setDisease] = useState('');
  const [severity, setSeverity] = useState('');
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistory = () => {
    setLoading(true);
    api.get('/predictions/history', {
      params: {
        page,
        size: 8,
        search: search || undefined,
        disease: disease || undefined,
        severity: severity || undefined
      }
    })
      .then((res) => {
        setPredictions(res.data.predictions);
        setTotal(res.data.total);
        setPages(res.data.pages);
        setError(null);
      })
      .catch((err) => {
        setError('Failed to load prediction history.');
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchHistory();
  }, [page, disease, severity]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchHistory();
  };

  const deleteRecord = async (id: number) => {
    if (!window.confirm('Are you sure you want to permanently delete this diagnostic scan record?')) {
      return;
    }
    try {
      await api.delete(`/predictions/prediction/${id}`);
      fetchHistory();
    } catch (err) {
      alert('Failed to delete the record.');
      console.error(err);
    }
  };

  const printReport = (id: number) => {
    window.open(`http://localhost:8000/api/predictions/prediction/${id}/report`, '_blank');
  };

  return (
    <div className="flex-1 p-6 space-y-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight dark:text-white">Diagnostic History</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Browse and manage your previous dental diagnostic reports.
          </p>
        </div>
        <button 
          onClick={fetchHistory}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-brand-500 transition-colors"
        >
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Filters Bar */}
      <div className="glass-card p-4 rounded-xl">
        <form onSubmit={handleSearchSubmit} className="flex flex-col md:flex-row gap-3">
          
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search scan by filename..."
              className="w-full rounded-lg border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 pl-10 pr-4 py-2 text-xs focus:border-brand-500 focus:outline-none dark:text-white"
            />
          </div>

          {/* Disease Filter */}
          <select
            value={disease}
            onChange={(e) => {
              setDisease(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none dark:text-white"
          >
            <option value="">All Diseases</option>
            <option value="Dental Caries">Dental Caries</option>
            <option value="Cavity">Cavity</option>
            <option value="Gingivitis">Gingivitis</option>
            <option value="Periodontitis">Periodontitis</option>
            <option value="Plaque">Plaque</option>
            <option value="Tartar">Tartar</option>
            <option value="Healthy Tooth">Healthy Tooth</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severity}
            onChange={(e) => {
              setSeverity(e.target.value);
              setPage(1);
            }}
            className="rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 px-3 py-2 text-xs focus:border-brand-500 focus:outline-none dark:text-white"
          >
            <option value="">All Severities</option>
            <option value="Healthy">Healthy</option>
            <option value="Mild">Mild</option>
            <option value="Moderate">Moderate</option>
            <option value="Severe">Severe</option>
          </select>

          <button
            type="submit"
            className="rounded-lg bg-brand-500 text-white px-4 py-2 text-xs font-bold shadow-sm shadow-brand-500/10 hover:bg-brand-600 transition-all"
          >
            Filter
          </button>

        </form>
      </div>

      {/* Main Content (Table) */}
      {loading ? (
        <div className="space-y-3 animate-pulse">
          {[1,2,3,4].map((i) => (
            <div key={i} className="h-14 bg-slate-200 dark:bg-slate-800 rounded-lg"></div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center text-rose-500 py-10 font-bold">{error}</div>
      ) : predictions.length === 0 ? (
        <div className="glass-card text-center py-20 text-slate-400 rounded-xl">
          <Calendar size={32} className="mx-auto text-slate-300 dark:text-slate-700 mb-2" />
          <p className="text-sm font-semibold">No Scan History Found</p>
          <p className="text-xs max-w-xs mx-auto mt-1">Adjust search parameters or execute a new AI diagnostic scan from the prediction tool.</p>
        </div>
      ) : (
        <div className="glass-card rounded-xl overflow-hidden border border-slate-250 dark:border-slate-850">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50/50 dark:bg-slate-900/30 text-slate-400 border-b border-slate-250 dark:border-slate-850">
                  <th className="p-4 font-semibold">Diagnostic ID</th>
                  <th className="p-4 font-semibold">Filename</th>
                  <th className="p-4 font-semibold">Condition</th>
                  <th className="p-4 font-semibold">Severity</th>
                  <th className="p-4 font-semibold">Confidence</th>
                  <th className="p-4 font-semibold">Quality Validation</th>
                  <th className="p-4 font-semibold">Date Created</th>
                  <th className="p-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {predictions.map((pred) => (
                  <tr key={pred.id} className="hover:bg-slate-50/30 dark:hover:bg-slate-800/10">
                    <td className="p-4 font-bold text-slate-400">#{pred.id}</td>
                    <td className="p-4 font-medium text-slate-800 dark:text-slate-200 max-w-[150px] truncate">{pred.filename}</td>
                    <td className="p-4 font-medium">{pred.disease}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        pred.severity === 'Healthy' ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/20 dark:text-emerald-400' :
                        pred.severity === 'Mild' ? 'bg-yellow-50 text-yellow-600 dark:bg-yellow-950/20 dark:text-yellow-400' :
                        pred.severity === 'Moderate' ? 'bg-orange-50 text-orange-600 dark:bg-orange-950/20' :
                        'bg-rose-50 text-rose-600 dark:bg-rose-950/20 dark:text-rose-400'
                      }`}>
                        {pred.severity}
                      </span>
                    </td>
                    <td className="p-4 font-bold">{pred.confidence}%</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1 text-[10px] font-semibold ${
                        pred.is_valid ? 'text-emerald-600 dark:text-emerald-400' : 'text-yellow-600'
                      }`}>
                        {pred.is_valid ? (
                          <>
                            <CheckCircle2 size={12} />
                            <span>Passed</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle size={12} />
                            <span>Low Quality</span>
                          </>
                        )}
                      </span>
                    </td>
                    <td className="p-4 text-slate-400">
                      {new Date(pred.created_at).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => printReport(pred.id)}
                          className="p-1.5 rounded text-slate-500 hover:text-brand-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Print report"
                        >
                          <Printer size={15} />
                        </button>
                        <button
                          onClick={() => deleteRecord(pred.id)}
                          className="p-1.5 rounded text-slate-500 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete scan"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {pages > 1 && (
            <div className="flex items-center justify-between border-t border-slate-200 dark:border-slate-800 px-4 py-3 bg-slate-50/50 dark:bg-slate-900/30 text-xs">
              <span className="text-slate-500 dark:text-slate-400">
                Showing page <span className="font-bold text-slate-700 dark:text-slate-350">{page}</span> of <span className="font-bold text-slate-700 dark:text-slate-350">{pages}</span> ({total} total records)
              </span>
              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(page - 1)}
                  className="inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-800 px-3 py-1.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
                >
                  <ChevronLeft size={14} />
                  <span>Previous</span>
                </button>
                <button
                  disabled={page === pages}
                  onClick={() => setPage(page + 1)}
                  className="inline-flex items-center gap-0.5 rounded border border-slate-200 dark:border-slate-800 px-3 py-1.5 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 transition-all disabled:opacity-40"
                >
                  <span>Next</span>
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};

export default HistoryPage;
