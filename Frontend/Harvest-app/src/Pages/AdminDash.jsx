import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, Users, Activity, UserPlus, Settings, Lock, 
  AlertTriangle, LogOut, Loader2, Trash2, Globe,
  Briefcase, Landmark, BookOpen, PlusCircle, Sun, Moon, Sunrise
} from 'lucide-react';

function AdminDash() {
  const navigate = useNavigate();
  
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null); 
  const [activeTab, setActiveTab] = useState('all'); 
  const [isDeleting, setIsDeleting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total_users: 0, admin_count: 0, farmhand_count: 0, correspondent_count: 0, institution_count: 0 });
  const [allUsers, setAllUsers] = useState([]);

  // --- Dynamic Greeting Logic ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: <Sunrise size={16} className="text-amber-500" /> };
    if (hour < 18) return { text: "Good Afternoon", icon: <Sun size={16} className="text-orange-500" /> };
    return { text: "Good Evening", icon: <Moon size={16} className="text-indigo-400" /> };
  };
  const greeting = getGreeting();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchDashboardData = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) { navigate('/login'); return; }
    try {
      const [statsRes, usersRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/admin/stats/', getAuthHeaders()),
        axios.get('http://127.0.0.1:8000/api/v1/users/', getAuthHeaders())
      ]);
      if (statsRes.status === 200) setStats(statsRes.data);
      if (usersRes.status === 200) setAllUsers(usersRes.data);
    } catch (err) {
      if (err.response?.status === 401 || err.response?.status === 403) navigate('/login');
    } finally { setLoading(false); }
  }, [navigate, getAuthHeaders]);

  useEffect(() => { fetchDashboardData(); }, [fetchDashboardData]);

  const handleDeleteUser = async () => {
    setIsDeleting(true);
    try {
      await axios.delete(`http://127.0.0.1:8000/api/v1/admin/stats/${userToDelete.id}/`, getAuthHeaders());
      setUserToDelete(null);
      fetchDashboardData();
    } catch (err) { alert("Operation Failed."); } 
    finally { setIsDeleting(false); }
  };

  const filteredUsers = allUsers.filter(u => activeTab === 'all' || u.role === activeTab);

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 font-sans text-slate-900 relative">
      
      {/* --- DELETE MODAL --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setUserToDelete(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in duration-200 border border-slate-100">
             <div className="flex flex-col items-center text-center">
                <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6"><Trash2 size={32} /></div>
                <h2 className="text-xl font-black text-slate-900">Confirm Deletion</h2>
                <p className="text-slate-500 text-sm mb-8 font-medium">Erase <span className="text-slate-800 font-bold">{userToDelete.email}</span>?</p>
                <div className="flex gap-3 w-full">
                  <button onClick={() => setUserToDelete(null)} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm">Cancel</button>
                  <button onClick={handleDeleteUser} className="flex-1 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm shadow-lg shadow-rose-200">
                    {isDeleting ? <Loader2 className="animate-spin mx-auto" size={18} /> : 'Delete'}
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* --- HEADER --- */}
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <div className="flex items-center gap-1.5 bg-white border border-slate-200 px-2.5 py-1 rounded-full shadow-sm">
                {greeting.icon}
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500">{greeting.text}</span>
              </div>
              <div className="h-1 w-1 bg-slate-300 rounded-full"></div>
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">Root Authority</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Ecosystem Control</h1>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 bg-white text-rose-600 px-5 py-2.5 rounded-xl font-bold border border-slate-200 shadow-sm hover:bg-rose-50 transition-colors">
            <LogOut size={18} /> <span>Logout</span>
          </button>
        </header>

        {/* --- STATS --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
          <StatCard icon={<Users />} label="Total" value={stats.total_users} color="violet" />
          <StatCard icon={<ShieldCheck />} label="Admins" value={stats.admin_count} color="indigo" />
          <StatCard icon={<Briefcase />} label="Farmhands" value={stats.farmhand_count} color="emerald" />
          <StatCard icon={<BookOpen />} label="Correspondents" value={stats.correspondent_count} color="blue" />
          <StatCard icon={<Landmark />} label="Institutions" value={stats.institution_count} color="amber" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* --- MAIN TABLE --- */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-2 bg-slate-50/50 border-b border-slate-100 flex gap-1 overflow-x-auto scrollbar-hide">
              {['all', 'admin', 'farmhand', 'correspondent', 'institution'].map(t => (
                <TabBtn key={t} active={activeTab === t} onClick={() => setActiveTab(t)} label={t} />
              ))}
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <tr>
                    <th className="px-8 py-5">Entity</th>
                    <th className="px-8 py-5">Role</th>
                    <th className="px-8 py-5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="3" className="px-8 py-20 text-center"><Loader2 className="animate-spin mx-auto text-violet-600" /></td></tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr><td colSpan="3" className="px-8 py-10 text-center text-slate-400 font-bold">No records found.</td></tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="px-8 py-5">
                          <div className="flex flex-col">
                            <span className="font-bold text-slate-700">{user.email}</span>
                            <span className="text-[10px] text-slate-400 font-mono">UID: {String(user.id)}</span>
                          </div>
                        </td>
                        <td className="px-8 py-5"><RoleBadge role={user.role} /></td>
                        <td className="px-8 py-5 text-right">
                          <button onClick={() => setUserToDelete(user)} className="p-2 text-slate-300 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                            <Trash2 size={18} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* --- SIDEBAR --- */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-slate-800">
              <div className="relative z-10">
                <h3 className="font-black text-xl mb-6 tracking-tight">Provisioning Suite</h3>
                <div className="space-y-3">
                  <ProvisionBtn icon={<ShieldCheck />} label="Admin" color="violet" onClick={() => navigate('/register-admin')} />
                  <ProvisionBtn icon={<Briefcase />} label="Farmhand" color="emerald" onClick={() => navigate('/register-farmhand')} />
                  <ProvisionBtn icon={<BookOpen />} label="Correspondent" color="blue" onClick={() => navigate('/register-correspondent')} />
                  <ProvisionBtn icon={<Landmark />} label="Institution" color="amber" onClick={() => navigate('/register-institution')} />
                </div>
              </div>
              <Globe size={180} className="absolute -bottom-20 -right-20 text-white/[0.03] rotate-12 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUB-COMPONENTS ---

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm">
    <div className={`inline-flex p-2.5 rounded-2xl mb-3 bg-${color}-50 text-${color}-600`}>
      {React.cloneElement(icon, { size: 20 })}
    </div>
    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</p>
    <p className="text-2xl font-black text-slate-800">{value}</p>
  </div>
);

const TabBtn = ({ active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-tighter transition-all whitespace-nowrap ${
      active ? 'bg-white text-violet-600 shadow-sm border border-slate-100' : 'text-slate-400 hover:text-slate-600'
    }`}
  >
    {label}
  </button>
);

const RoleBadge = ({ role }) => {
  const styles = { 
    admin: 'bg-violet-50 text-violet-600', 
    farmhand: 'bg-emerald-50 text-emerald-600', 
    correspondent: 'bg-blue-50 text-blue-600', 
    institution: 'bg-amber-50 text-amber-600' 
  };
  return (
    <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${styles[role] || 'bg-slate-100 text-slate-500'}`}>
      {role}
    </span>
  );
};

const ProvisionBtn = ({ icon, label, onClick, color }) => (
  <button 
    onClick={onClick} 
    className="w-full flex items-center gap-4 bg-slate-800/40 hover:bg-slate-800 p-4 rounded-3xl transition-all border border-slate-800/50 group"
  >
    <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-${color}-500/10 text-${color}-400 group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 18 })}
    </div>
    <div className="flex-1 text-left">
      <p className="text-sm font-black text-white">New {label}</p>
    </div>
    <PlusCircle size={16} className="text-slate-600 group-hover:text-white transition-colors" />
  </button>
);

export default AdminDash;