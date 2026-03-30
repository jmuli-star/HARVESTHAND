import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, Users, TrendingUp, FileText, MapPin, Download, 
  UserPlus, Bell, ArrowUpRight, ChevronRight, LogOut, Loader2,
  Sun, Moon, Sunrise, Activity, AlertCircle, RefreshCcw, Search
} from 'lucide-react';

// --- Global Axios Configuration ---
// This ensures every request from this component uses the latest token
const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

function FarminstitutDash() {
  const navigate = useNavigate();
  
  // --- State Management ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState({ text: 'Welcome', icon: <Activity size={20} /> });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State
  const [stats, setStats] = useState({
    managed_farms_count: 0,
    active_personnel: 0,
    avg_yield: '0%',
    pending_reports: 0
  });
  const [farms, setFarms] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // --- Utility: Get Headers ---
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return {};
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [navigate]);

  // --- Dynamic Greeting Logic ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: 'Good Morning', icon: <Sunrise className="text-amber-500" size={20} /> });
    else if (hour < 18) setGreeting({ text: 'Good Afternoon', icon: <Sun className="text-orange-500" size={20} /> });
    else setGreeting({ text: 'Good Evening', icon: <Moon className="text-indigo-400" size={20} /> });
  }, []);

  // --- Core Data Fetching ---
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    try {
      const headers = getAuthHeaders();
      
      const [statsRes, farmsRes, notifyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/institution/stats/`, headers),
        axios.get(`${API_BASE_URL}/institution/farms/`, headers),
        axios.get(`${API_BASE_URL}/institution/notifications/`, headers)
      ]);

      setStats(statsRes.data);
      setFarms(farmsRes.data);
      setNotifications(notifyRes.data);
      setError(null);
    } catch (err) {
      console.error("Dashboard Sync Error:", err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError("Network latency detected. Unable to sync with Central Command.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, getAuthHeaders]);

  useEffect(() => {
    fetchDashboardData();
    // Optional: Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchDashboardData(true), 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // --- Memoized Search Logic ---
  const filteredFarms = useMemo(() => {
    return farms.filter(farm => 
      farm.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (farm.lead_name && farm.lead_name.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [farms, searchTerm]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleExport = () => {
    // Logic for generating CSV or PDF
    console.log("Exporting farm data...");
    alert("Yield Index Exported to System Downloads");
  };

  const statCards = [
    { name: 'Managed Farms', value: stats.managed_farms_count, icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Active Personnel', value: stats.active_personnel, icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Avg. Annual Yield', value: stats.avg_yield, icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Pending Reports', value: stats.pending_reports, icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
      <p className="text-slate-400 font-black text-xs uppercase tracking-[0.3em]">Decrypting Ecosystem Data...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* --- ERROR BAR --- */}
        {error && (
          <div className="mb-6 bg-rose-600 text-white p-4 rounded-2xl flex items-center justify-between shadow-lg animate-in slide-in-from-top duration-300">
            <div className="flex items-center gap-3 font-bold text-sm">
              <AlertCircle size={20} /> {error}
            </div>
            <button onClick={() => fetchDashboardData()} className="bg-white/20 hover:bg-white/30 px-4 py-1 rounded-lg text-xs font-black transition-colors">RETRY SYNC</button>
          </div>
        )}

        {/* --- HEADER --- */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <div className="bg-white p-1.5 rounded-lg shadow-sm border border-slate-200">
                {greeting.icon}
              </div>
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                {greeting.text} | Institution Authority Admin
              </span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight flex items-center gap-3">
              Institutional Hub
              {refreshing && <RefreshCcw size={20} className="animate-spin text-slate-300" />}
            </h1>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleExport}
              className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm active:scale-95"
            >
              <Download size={18} /> Export Results
            </button>
            <button 
              onClick={handleLogout} 
              className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors border border-rose-100 shadow-sm active:scale-95"
              title="Sign Out"
            >
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* --- STATS GRID --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {statCards.map((item) => (
            <div key={item.name} className="bg-white rounded-3xl shadow-sm p-6 border border-slate-100 group hover:border-emerald-200 transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{item.name}</p>
                  <p className="mt-1 text-3xl font-black text-slate-800 tracking-tighter">
                    {item.value}
                  </p>
                </div>
                <div className={`${item.bg} ${item.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-[10px] font-black text-emerald-600 bg-emerald-50 w-fit px-2.5 py-1 rounded-lg">
                <ArrowUpRight size={14} className="mr-1" /> SYNCED LIVE
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- MAIN TABLE SECTION --- */}
          <div className="lg:col-span-8 bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
            <div className="px-8 py-6 border-b border-slate-50 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white">
              <h2 className="text-xl font-black text-slate-800 flex items-center gap-2 italic">
                <Building2 size={22} className="text-emerald-600" /> Managed Farm Status
              </h2>
              
              {/* Table Search */}
              <div className="relative w-full sm:w-64">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search farms..." 
                  className="w-full bg-slate-50 border-none rounded-xl py-2.5 pl-11 pr-4 text-sm font-bold focus:ring-2 focus:ring-emerald-500/20 transition-all"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest">
                    <th className="px-8 py-5">Farm Identity</th>
                    <th className="px-8 py-4">Correspondent</th>
                    <th className="px-8 py-4">Security Status</th>
                    <th className="px-8 py-4 text-right">Yield Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {filteredFarms.length > 0 ? filteredFarms.map((farm) => (
                    <tr 
                      key={farm.id} 
                      className="hover:bg-slate-50/50 transition-colors cursor-pointer group"
                      onClick={() => navigate(`/farm-analysis/${farm.id}`)}
                    >
                      <td className="px-8 py-5 font-bold text-slate-700">{farm.name}</td>
                      <td className="px-8 py-5 text-slate-500 font-bold text-sm">
                        {farm.lead_name || <span className="text-slate-300 italic">Unassigned</span>}
                      </td>
                      <td className="px-8 py-5">
                        <StatusBadge status={farm.status} />
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center justify-end gap-4 font-black text-slate-800">
                          {farm.yield_performance}%
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 group-hover:translate-x-1 transition-all" />
                        </div>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-20 text-center">
                        <div className="flex flex-col items-center opacity-40">
                          <Search size={40} className="mb-2" />
                          <p className="font-bold text-sm">No results match your current filter.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="mt-auto p-6 bg-slate-50/30 border-t border-slate-50 flex justify-center">
               <button className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-emerald-600 transition-colors">
                  View All Managed Assets
               </button>
            </div>
          </div>

          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white relative overflow-hidden shadow-2xl border border-slate-800">
              <div className="relative z-10">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-400 mb-2">Management Suite</h3>
                <h2 className="text-2xl font-black mb-6">Resource Hub</h2>
                <div className="space-y-3">
                  <button 
                    onClick={() => navigate('/register-farmhand')} 
                    className="flex items-center justify-center gap-3 w-full bg-emerald-600 font-black py-4 rounded-2xl transition-all text-sm border border-emerald-500 hover:bg-emerald-700 shadow-lg shadow-emerald-900/40 text-white active:scale-[0.98]"
                  >
                    <UserPlus size={18} /> Deploy Personnel
                  </button>
                  <button className="flex items-center justify-center gap-3 w-full bg-slate-800 font-black py-4 rounded-2xl transition-all text-sm border border-slate-700 text-slate-300 hover:bg-slate-700 active:scale-[0.98]">
                    <FileText size={18} /> Audit Reports
                  </button>
                </div>
              </div>
              <Building2 size={150} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 pointer-events-none" />
            </div>

            {/* --- NOTIFICATIONS --- */}
            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-2 uppercase tracking-widest">
                  <Bell size={18} className="text-rose-500" /> Operational Intel
                </h3>
                {notifications.length > 0 && (
                  <span className="bg-rose-100 text-rose-600 text-[10px] font-black px-2 py-0.5 rounded-full">
                    {notifications.length}
                  </span>
                )}
              </div>
              <div className="space-y-6 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className={`h-2 w-2 mt-2 rounded-full shrink-0 shadow-sm ${n.type === 'alert' ? 'bg-rose-500 ring-4 ring-rose-50' : 'bg-blue-500 ring-4 ring-blue-50'}`}></div>
                    <div>
                      <p className="text-sm text-slate-600 leading-snug font-medium group-hover:text-slate-900 transition-colors">{n.message}</p>
                      <span className="text-[10px] text-slate-400 font-black tracking-widest uppercase block mt-1">{n.timestamp}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center py-10 opacity-30">
                    <AlertCircle size={30} className="mx-auto mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">No intelligence found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Helper Components ---
const StatusBadge = ({ status }) => {
  const styles = {
    Optimal: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    Warning: 'bg-amber-50 text-amber-600 border-amber-100',
    Critical: 'bg-rose-50 text-rose-600 border-rose-100'
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase border shadow-sm ${styles[status] || 'bg-slate-50 text-slate-500 border-slate-100'}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default FarminstitutDash;