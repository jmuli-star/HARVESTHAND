import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Building2, Users, TrendingUp, MapPin, 
  UserPlus, Bell, LogOut, Loader2,
  Sun, Moon, Sunrise, Activity, RefreshCcw, Search,
  Mail, ShieldCheck, AlertCircle 
} from 'lucide-react';

// --- CONFIGURATION ---
// Dynamically switches between your Render backend and local testing
const API_ROOT = import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000';
const API_BASE_URL = `${API_ROOT}/api/v1`;

function FarminstitutDash() {
  const navigate = useNavigate();
  
  // --- 1. STATE MANAGEMENT ---
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [greeting, setGreeting] = useState({ text: 'Welcome', icon: <Activity size={20} /> });
  const [searchTerm, setSearchTerm] = useState('');
  
  const [stats, setStats] = useState({
    managed_farms_count: 0,
    active_personnel: 0, 
    avg_yield: '0 kg',
    pending_reports: 0
  });
  const [farms, setFarms] = useState([]);
  const [personnel, setPersonnel] = useState([]); 
  const [notifications, setNotifications] = useState([]);

  // --- 2. AUTH UTILITY ---
  // Ensure the key 'access_token' matches what you save during login
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      navigate('/login');
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [navigate]);

  // --- 3. DYNAMIC GREETING ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting({ text: 'Good Morning', icon: <Sunrise className="text-amber-500" size={20} /> });
    else if (hour < 18) setGreeting({ text: 'Good Afternoon', icon: <Sun className="text-orange-500" size={20} /> });
    else setGreeting({ text: 'Good Evening', icon: <Moon className="text-indigo-400" size={20} /> });
  }, []);

  // --- 4. DATA FETCHING ---
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);

    const config = getAuthHeaders();
    if (!config) return;

    try {
      const [statsRes, farmsRes, personnelRes, notifyRes] = await Promise.all([
        axios.get(`${API_BASE_URL}/institution/stats/`, config),
        axios.get(`${API_BASE_URL}/institution/farms/`, config),
        axios.get(`${API_BASE_URL}/institution/personnel/`, config),
        axios.get(`${API_BASE_URL}/institution/notifications/`, config)
      ]);

      setStats(statsRes.data);
      setFarms(Array.isArray(farmsRes.data) ? farmsRes.data : []);
      setPersonnel(Array.isArray(personnelRes.data) ? personnelRes.data : []);
      setNotifications(Array.isArray(notifyRes.data) ? notifyRes.data : []);
      setError(null);
    } catch (err) {
      console.error("Authority Hub Sync Error:", err);
      if (err.response?.status === 401) {
        localStorage.clear();
        navigate('/login');
      } else {
        setError("System connectivity interrupted. Retrying...");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [navigate, getAuthHeaders]);

  useEffect(() => {
    fetchDashboardData();
    // Auto-refresh every 5 minutes
    const interval = setInterval(() => fetchDashboardData(true), 300000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  // --- 5. SEARCH LOGIC ---
  const filteredFarms = useMemo(() => {
    return farms.filter(f => (f.name || '').toLowerCase().includes(searchTerm.toLowerCase()));
  }, [farms, searchTerm]);

  const filteredPersonnel = useMemo(() => {
    return personnel.filter(p => 
      (p.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.email || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.role || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [personnel, searchTerm]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-emerald-800 mt-6 font-black uppercase text-[10px] tracking-widest">Verifying Institutional Credentials...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#FDFDFD] p-6 lg:p-12 font-sans text-stone-900">
      <div className="max-w-7xl mx-auto">
        
        {/* TOP NAVIGATION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              {greeting.icon}
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-700">
                {greeting.text} • {localStorage.getItem('institution_name') || 'Authority Hub'}
              </span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black tracking-tighter text-stone-950">
              Estate <span className="text-emerald-600 underline decoration-stone-100">Control</span>
              {refreshing && <RefreshCcw size={24} className="inline ml-6 animate-spin text-emerald-300" />}
            </h1>
          </div>

          <div className="flex gap-3">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-emerald-500 transition-colors" size={16} />
              <input 
                type="text" 
                placeholder="Search estate assets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 pr-6 py-4 bg-stone-50 rounded-2xl border border-stone-100 text-xs font-bold focus:bg-white focus:ring-2 focus:ring-emerald-500 w-72 transition-all outline-none shadow-inner"
              />
            </div>
            <button onClick={handleLogout} className="p-4 bg-white border border-stone-100 rounded-2xl text-stone-400 hover:text-rose-500 hover:shadow-lg transition-all">
              <LogOut size={20} />
            </button>
          </div>
        </header>

        {/* METRICS PANEL */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-16">
          {[
            { label: 'Managed Units', val: stats.managed_farms_count, icon: MapPin },
            { label: 'Active Personnel', val: stats.active_personnel, icon: Users },
            { label: 'Gross Yield', val: stats.avg_yield, icon: TrendingUp },
            { label: 'Audit Alerts', val: stats.pending_reports, icon: AlertCircle }
          ].map((card, i) => (
            <div key={i} className="bg-white p-8 rounded-[2rem] border border-stone-50 shadow-sm hover:shadow-md transition-all border-b-4 border-b-stone-100 hover:border-b-emerald-500">
              <div className="w-10 h-10 rounded-xl bg-stone-50 flex items-center justify-center mb-6">
                <card.icon size={20} className="text-stone-400" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 mb-2">{card.label}</p>
              <h3 className="text-4xl font-black text-stone-900">{card.val}</h3>
            </div>
          ))}
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* PRIMARY CONTENT TABLES */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* OPERATIONAL UNITS */}
            <section className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-stone-50 flex items-center bg-stone-50/30">
                <h3 className="font-black text-stone-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
                   <Building2 size={16} className="text-emerald-600" /> Operational Farming Units
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-[10px] font-black uppercase tracking-widest text-stone-400 text-left">
                      <th className="px-8 py-6">Identity</th>
                      <th className="px-8 py-6">Field Staff</th>
                      <th className="px-8 py-6 text-right">Yield Health</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-50">
                    {filteredFarms.map((farm) => (
                      <tr key={farm.id} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-8 py-6">
                          <p className="font-black text-stone-800">{farm.name}</p>
                          <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">{farm.location}</p>
                        </td>
                        <td className="px-8 py-6 text-stone-500 text-sm font-bold">{farm.farmhand_name || 'Unassigned'}</td>
                        <td className="px-8 py-6">
                          <div className="flex items-center justify-end gap-3">
                            <span className="font-black text-stone-900 text-[10px]">{farm.yield_performance || 0}%</span>
                            <div className="w-24 h-1.5 bg-stone-100 rounded-full overflow-hidden">
                               <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${farm.yield_performance || 0}%` }} />
                            </div>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            {/* PERSONNEL DIRECTORY */}
            <section className="bg-white rounded-[2.5rem] border border-stone-100 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-stone-50 flex items-center bg-stone-50/30">
                <h3 className="font-black text-stone-900 uppercase tracking-widest text-[11px] flex items-center gap-2">
                   <ShieldCheck size={16} className="text-blue-600" /> Human Capital
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <tbody className="divide-y divide-stone-50">
                    {filteredPersonnel.map((p, i) => (
                      <tr key={i} className="hover:bg-stone-50/50 transition-colors">
                        <td className="px-8 py-6 flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400">
                            <Mail size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-black text-stone-800">{p.full_name}</p>
                            <p className="text-[10px] text-stone-400 font-bold uppercase tracking-tighter">{p.email}</p>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <span className="px-3 py-1 bg-stone-100 text-stone-600 rounded-lg text-[9px] font-black uppercase tracking-widest">
                            {p.role}
                          </span>
                        </td>
                        <td className="px-8 py-6 text-right">
                           <div className="inline-flex items-center gap-2 bg-emerald-50 px-3 py-1 rounded-full">
                             <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                             <span className="text-[9px] font-black text-emerald-700 uppercase">{p.status || 'Active'}</span>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* SIDEBAR STRATEGY & LOGS */}
          <aside className="space-y-8">
            <div className="bg-emerald-600 rounded-[2.5rem] p-10 text-white shadow-2xl shadow-emerald-200/50 relative overflow-hidden group">
              <div className="relative z-10">
                <h4 className="text-emerald-200 font-black uppercase tracking-widest text-[10px] mb-4">Deployment</h4>
                <h2 className="text-3xl font-black mb-8 leading-[1.1] tracking-tighter">Expand Your<br/>Field Force</h2>
                <button 
                  onClick={() => navigate('/register-farmhand')}
                  className="w-full py-5 bg-white text-emerald-700 rounded-2xl font-black text-xs transition-all flex items-center justify-center gap-3 hover:shadow-xl active:scale-95"
                >
                  <UserPlus size={18} /> DEPLOY STAFF
                </button>
              </div>
              <Users size={140} className="absolute -bottom-10 -right-10 text-emerald-500/30 rotate-12 group-hover:scale-110 transition-transform" />
            </div>

            {/* LOGS / NOTIFICATIONS */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-sm">
              <h4 className="font-black uppercase tracking-widest text-[11px] text-stone-900 mb-8 flex items-center gap-3">
                <Bell size={16} className="text-rose-500" /> Estate Intelligence
              </h4>
              <div className="space-y-8">
                {notifications.length > 0 ? notifications.map((n, i) => (
                  <div key={i} className="flex gap-4 group">
                    <div className="w-1 bg-stone-100 group-hover:bg-emerald-400 transition-colors rounded-full h-auto" />
                    <div>
                      <p className="text-xs font-bold text-stone-800 leading-snug">{n.message}</p>
                      <p className="text-[9px] font-black text-stone-300 uppercase mt-2 tracking-widest">{n.timestamp}</p>
                    </div>
                  </div>
                )) : (
                  <p className="text-[10px] font-bold text-stone-300 uppercase tracking-widest text-center py-10">No recent logs found</p>
                )}
              </div>
            </div>
          </aside>

        </div>
      </div>
    </div>
  );
}

export default FarminstitutDash;