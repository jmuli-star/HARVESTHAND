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
  
  // --- 1. State Management ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState({ text: 'Welcome', icon: <Activity size={20} /> });
  const [searchTerm, setSearchTerm] = useState('');
  
  // Data State: Synchronized with the Django InstitutionStatsView & FarmListView
  const [stats, setStats] = useState({
    managed_farms_count: 0,
    active_personnel: 0, 
    avg_yield: '0 kg', // Updated to match the string formatting from backend
    pending_reports: 0
  });
  const [farms, setFarms] = useState([]);
  const [notifications, setNotifications] = useState([]);

  // --- 2. Auth Header Utility ---
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [navigate]);

  // --- 3. Dynamic Greeting Logic ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: 'Good Morning', icon: <Sunrise className="text-amber-500" size={20} /> });
    else if (hour < 18) setGreeting({ text: 'Good Afternoon', icon: <Sun className="text-orange-500" size={20} /> });
    else setGreeting({ text: 'Good Evening', icon: <Moon className="text-indigo-400" size={20} /> });
  }, []);

  // --- 4. CORE FETCH LOGIC (Database Sync) ---
  // Updated: Now hits the specific Institution hierarchy endpoints
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      // Parallel Fetching: Pulls specific stats, farms, and intel logs for THIS institution
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
      if (err.response?.status === 401) {
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

  // --- 5. Dynamic Stat Card Mapping ---
  // Updated: Values now map to the new keys returned by InstitutionStatsView
  const statCards = [
    { name: 'Managed Farms', value: stats.managed_farms_count, icon: MapPin, color: 'emerald' },
    { name: 'Active Personnel', value: stats.active_personnel, icon: Users, color: 'teal' }, 
    { name: 'Yield Performance', value: stats.avg_yield, icon: TrendingUp, color: 'amber' },
    { name: 'Pending Reports', value: stats.pending_reports, icon: FileText, color: 'rose' },
  ];

  // --- 6. Search Filtering ---
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

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-emerald-800 mt-6 font-bold tracking-widest uppercase text-xs">Syncing Command Hub...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-stone-50 p-6 lg:p-12 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              {greeting.icon}
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">
                {greeting.text} • Institutional Authority
              </span>
            </div>
            <h1 className="text-5xl font-black text-stone-900 tracking-tighter">
              Control <span className="text-emerald-600">Center</span>
              {refreshing && <RefreshCcw size={20} className="inline ml-4 animate-spin text-emerald-400" />}
            </h1>
          </div>

          <div className="flex gap-3">
            <button onClick={handleLogout} className="px-6 py-3 bg-white border border-stone-200 rounded-2xl font-bold text-stone-400 hover:text-rose-500 hover:border-rose-100 transition-all flex items-center gap-2 shadow-sm">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {statCards.map((card, i) => (
            <div key={i} className="bg-white p-8 rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/50 group hover:border-emerald-500 transition-all">
              <div className="flex justify-between items-start mb-6">
                <div className={`p-4 rounded-2xl bg-${card.color}-50 text-${card.color}-600 group-hover:scale-110 transition-transform`}>
                  <card.icon size={24} />
                </div>
                <ArrowUpRight className="text-stone-200 group-hover:text-emerald-500" size={20} />
              </div>
              <p className="text-xs font-black uppercase tracking-widest text-stone-400 mb-1">{card.name}</p>
              <h3 className="text-4xl font-black text-stone-900">{card.value}</h3>
            </div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Farms Table - Updated to display lead correspondents and progress index */}
          <div className="lg:col-span-2 bg-white rounded-[3rem] border border-stone-100 shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-stone-50 flex justify-between items-center bg-stone-50/50">
              <h3 className="font-black text-stone-800 uppercase tracking-widest text-sm">Managed Estate Units</h3>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300" size={16} />
                <input 
                  type="text" 
                  placeholder="Filter farms..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-6 py-2 bg-white rounded-full border border-stone-100 text-xs font-bold focus:ring-2 focus:ring-emerald-500 w-48 transition-all outline-none"
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] font-black uppercase tracking-widest text-stone-400 border-b border-stone-50">
                    <th className="px-8 py-6">Farm Unit</th>
                    <th className="px-8 py-6">Lead Correspondent</th>
                    <th className="px-8 py-6">Yield Perf. Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-50">
                  {filteredFarms.map((farm) => (
                    <tr key={farm.id} className="hover:bg-emerald-50/30 transition-colors cursor-pointer group">
                      <td className="px-8 py-6 font-bold text-stone-800">{farm.name}</td>
                      <td className="px-8 py-6 text-stone-500 font-medium">{farm.lead_name || 'Unassigned'}</td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-2 bg-stone-100 rounded-full w-24 overflow-hidden">
                             <div 
                               className="h-full bg-emerald-500 rounded-full" 
                               style={{ width: `${Math.min(farm.yield_performance, 100)}%` }} 
                             />
                          </div>
                          <span className="font-black text-emerald-600 text-xs">{farm.yield_performance}%</span>
                          <ChevronRight size={14} className="text-stone-300 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Action Sidebar */}
          <div className="space-y-6">
            {/* Call to Action: Personnel Deployment */}
            <div className="bg-stone-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-emerald-400 font-black uppercase tracking-widest text-[10px] mb-4">Operations</h4>
                <h2 className="text-3xl font-black mb-8 leading-tight">Deploy New<br/>Personnel</h2>
                <button 
                  onClick={() => navigate('/register-farmhand')}
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-sm transition-all flex items-center justify-center gap-3 active:scale-95 shadow-lg shadow-emerald-900/20"
                >
                  <UserPlus size={20} /> BEGIN DEPLOYMENT
                </button>
              </div>
              <Users size={150} className="absolute -bottom-10 -right-10 text-white/5 rotate-12 group-hover:scale-110 transition-transform" />
            </div>

            {/* Operational Intel: Dynamic Notification Feed */}
            <div className="bg-white rounded-[3rem] p-10 border border-stone-100 shadow-xl">
              <h4 className="font-black uppercase tracking-widest text-[10px] text-stone-400 mb-8 flex items-center gap-2">
                <Bell size={14} className="text-rose-500" /> Operational Intel
              </h4>
              <div className="space-y-8">
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div key={i} className="flex gap-4">
                    <div className={`w-2 h-2 rounded-full shrink-0 mt-2 ${n.type === 'error' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                    <div>
                      <p className="text-sm font-bold text-stone-700 leading-snug">{n.message}</p>
                      <p className="text-[10px] font-black text-stone-300 uppercase mt-1">{n.timestamp}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-xs font-bold text-stone-300 text-center py-4 italic">No recent activity recorded.</p>
                )}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FarminstitutDash;