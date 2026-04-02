import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, Users, TrendingUp, FileText, MapPin, Download, 
  UserPlus, Bell, ArrowUpRight, ChevronRight, LogOut, Loader2,
  Sun, Moon, Sunrise, Activity, AlertCircle, RefreshCcw, Search
} from 'lucide-react';

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
    console.log("Exporting farm data...");
    alert("Yield Index Exported to System Downloads");
  };

  const statCards = [
    { name: 'Managed Farms', value: stats.managed_farms_count, icon: MapPin, color: 'emerald' },
    { name: 'Active Personnel', value: stats.active_personnel, icon: Users, color: 'teal' },
    { name: 'Avg. Annual Yield', value: stats.avg_yield, icon: TrendingUp, color: 'amber' },
    { name: 'Pending Reports', value: stats.pending_reports, icon: FileText, color: 'rose' },
  ];

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-emerald-700 mt-6 text-sm font-semibold">Syncing Institutional Command...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 text-stone-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* ERROR BAR */}
        {error && (
          <div className="mb-8 bg-rose-600 text-white px-6 py-4 rounded-3xl flex items-center justify-between shadow-xl">
            <div className="flex items-center gap-3">
              <AlertCircle size={22} />
              <span className="font-semibold">{error}</span>
            </div>
            <button 
              onClick={() => fetchDashboardData()} 
              className="bg-white text-rose-600 px-5 py-2 rounded-2xl font-bold text-sm hover:bg-rose-50 transition-all"
            >
              RETRY SYNC
            </button>
          </div>
        )}

        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🏛️</div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                {greeting.icon}
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  {greeting.text} • Institution Authority
                </span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-emerald-900 flex items-center gap-3">
                Institutional Hub
                {refreshing && <RefreshCcw size={22} className="animate-spin text-emerald-500" />}
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={handleExport}
              className="flex items-center gap-3 bg-white border border-emerald-200 text-emerald-700 px-6 py-3 rounded-3xl font-semibold hover:bg-emerald-50 transition-all shadow-sm"
            >
              <Download size={20} /> Export Yield Data
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 bg-white text-rose-600 px-6 py-3 rounded-3xl font-semibold hover:bg-rose-50 border border-rose-200 transition-all shadow-sm"
            >
              <LogOut size={20} /> Logout
            </button>
          </div>
        </header>

        {/* STATS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((item, i) => (
            <div key={i} className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest text-stone-500">{item.name}</p>
                  <p className="text-4xl font-bold text-emerald-900 mt-2">{item.value}</p>
                </div>
                <div className={`w-12 h-12 flex items-center justify-center rounded-2xl bg-${item.color}-100 text-${item.color}-600`}>
                  <item.icon size={28} />
                </div>
              </div>
              <div className="mt-6 text-xs font-bold flex items-center gap-2 text-emerald-600">
                <ArrowUpRight size={14} /> LIVE SYNCED
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* MAIN FARMS TABLE */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
            <div className="px-8 py-6 border-b border-emerald-100 flex flex-col sm:flex-row justify-between items-center gap-4 bg-emerald-50">
              <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-3">
                <Building2 size={26} /> Managed Farms
              </h2>
              
              <div className="relative w-full sm:w-72">
                <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-emerald-400" />
                <input 
                  type="text"
                  placeholder="Search farms or leads..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-white border border-emerald-100 focus:border-emerald-300 rounded-3xl py-4 pl-12 pr-6 text-stone-700 outline-none transition-all"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-6 text-left">Farm</th>
                    <th className="px-8 py-6 text-left">Lead Correspondent</th>
                    <th className="px-8 py-6 text-left">Status</th>
                    <th className="px-8 py-6 text-right">Yield Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {filteredFarms.length > 0 ? filteredFarms.map((farm) => (
                    <tr 
                      key={farm.id} 
                      className="hover:bg-emerald-50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/farm-analysis/${farm.id}`)}
                    >
                      <td className="px-8 py-6 font-semibold text-emerald-900">{farm.name}</td>
                      <td className="px-8 py-6 text-stone-600 font-medium">
                        {farm.lead_name || <span className="italic text-stone-400">Unassigned</span>}
                      </td>
                      <td className="px-8 py-6">
                        <StatusBadge status={farm.status} />
                      </td>
                      <td className="px-8 py-6 text-right font-bold text-emerald-900 flex items-center justify-end gap-2">
                        {farm.yield_performance}%
                        <ChevronRight size={18} className="text-emerald-300 group-hover:text-emerald-500 transition" />
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan="4" className="px-8 py-16 text-center text-stone-400 font-medium">
                        No farms match your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* RESOURCE HUB */}
            <div className="bg-emerald-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="uppercase text-emerald-300 text-xs font-bold tracking-widest mb-2">Management Suite</h3>
                <h2 className="text-3xl font-bold mb-8">Resource Hub</h2>
                <div className="space-y-4">
                  <button 
                    onClick={() => navigate('/register-farmhand')}
                    className="w-full bg-white text-emerald-900 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 hover:scale-105 transition-all"
                  >
                    <UserPlus size={24} /> Deploy New Personnel
                  </button>
                  <button className="w-full bg-white/20 hover:bg-white/30 py-5 rounded-3xl font-bold flex items-center justify-center gap-3 transition-all">
                    <FileText size={24} /> View Audit Reports
                  </button>
                </div>
              </div>
              <Building2 size={180} className="absolute -bottom-12 -right-12 text-white/10 rotate-12 pointer-events-none" />
            </div>

            {/* NOTIFICATIONS */}
            <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-bold text-emerald-900 flex items-center gap-3">
                  <Bell size={24} className="text-rose-500" /> Operational Intel
                </h3>
                {notifications.length > 0 && (
                  <span className="bg-rose-100 text-rose-600 text-xs font-bold px-4 py-1 rounded-3xl">
                    {notifications.length}
                  </span>
                )}
              </div>

              <div className="space-y-6 max-h-96 overflow-y-auto">
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`shrink-0 w-3 h-3 mt-1.5 rounded-full ${n.type === 'alert' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <div className="flex-1">
                      <p className="text-sm text-stone-700">{n.message}</p>
                      <p className="text-xs text-stone-400 font-medium mt-1">{n.timestamp}</p>
                    </div>
                  </div>
                )) : (
                  <div className="py-12 text-center text-stone-400">
                    <AlertCircle size={32} className="mx-auto mb-3" />
                    <p className="text-sm font-medium">All clear — no alerts</p>
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

// --- Helper Component ---
const StatusBadge = ({ status }) => {
  const styles = {
    Optimal: 'bg-emerald-100 text-emerald-700',
    Warning: 'bg-amber-100 text-amber-700',
    Critical: 'bg-rose-100 text-rose-700'
  };
  return (
    <span className={`inline-block text-xs font-bold uppercase px-5 py-2 rounded-3xl ${styles[status] || 'bg-stone-100 text-stone-500'}`}>
      {status || 'Unknown'}
    </span>
  );
};

export default FarminstitutDash;