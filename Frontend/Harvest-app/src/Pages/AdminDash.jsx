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

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const filteredUsers = allUsers.filter(u => activeTab === 'all' || u.role === activeTab);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 p-6 lg:p-10 font-sans text-stone-900">
      
      {/* --- DELETE USER MODAL --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={() => setUserToDelete(null)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in duration-200 border border-emerald-100">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                <Trash2 size={32} />
              </div>
              <h2 className="text-xl font-bold text-emerald-900">Confirm Deletion</h2>
              <p className="text-stone-500 text-sm mb-8 font-medium">
                Erase <span className="text-emerald-800 font-bold">{userToDelete.email}</span> from the farm?
              </p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setUserToDelete(null)} 
                  className="flex-1 py-3 rounded-2xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200 transition"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleDeleteUser} 
                  className="flex-1 py-3 rounded-2xl bg-rose-600 text-white font-semibold shadow-lg shadow-rose-200 hover:bg-rose-700 transition flex items-center justify-center"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={20} /> : 'Delete User'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LOGOUT MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 animate-in zoom-in duration-200 border border-emerald-100">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6">
                <LogOut size={32} />
              </div>
              <h2 className="text-xl font-bold text-emerald-900">Ready to leave the field?</h2>
              <p className="text-stone-500 text-sm mb-8">You will be logged out of the HarvestHub admin panel.</p>
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowLogoutModal(false)} 
                  className="flex-1 py-3 rounded-2xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200 transition"
                >
                  Stay Here
                </button>
                <button 
                  onClick={handleLogout} 
                  className="flex-1 py-3 rounded-2xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-4xl shadow-inner">🌾</div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-1.5 bg-white border border-emerald-200 px-3 py-1 rounded-3xl shadow-sm">
                  {greeting.icon}
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">{greeting.text}</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest bg-amber-100 text-amber-700 px-3 py-1 rounded-3xl">ADMIN</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-emerald-900">Farm Command Center</h1>
            </div>
          </div>

          <button 
            onClick={() => setShowLogoutModal(true)} 
            className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-3xl font-semibold shadow-sm transition-all hover:shadow-md"
          >
            <LogOut size={18} /> Logout
          </button>
        </header>

        {/* --- STATS CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <StatCard icon={<Users />} label="Total Users" value={stats.total_users} color="emerald" />
          <StatCard icon={<ShieldCheck />} label="Admins" value={stats.admin_count} color="violet" />
          <StatCard icon={<Briefcase />} label="Farmhands" value={stats.farmhand_count} color="teal" />
          <StatCard icon={<BookOpen />} label="Correspondents" value={stats.correspondent_count} color="amber" />
          <StatCard icon={<Landmark />} label="Institutions" value={stats.institution_count} color="stone" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* --- MAIN TABLE --- */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
            <div className="p-4 bg-emerald-50 border-b border-emerald-100 flex gap-2 overflow-x-auto">
              {['all', 'admin', 'farmhand', 'correspondent', 'institution'].map(t => (
                <TabBtn key={t} active={activeTab === t} onClick={() => setActiveTab(t)} label={t} />
              ))}
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-emerald-50 text-emerald-700 text-xs font-bold uppercase tracking-widest">
                    <th className="px-8 py-6 text-left">User</th>
                    <th className="px-8 py-6 text-left">Role</th>
                    <th className="px-8 py-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-emerald-50">
                  {loading ? (
                    <tr>
                      <td colSpan="3" className="px-8 py-20 text-center">
                        <Loader2 className="animate-spin mx-auto text-emerald-600" size={28} />
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan="3" className="px-8 py-12 text-center text-stone-400 font-medium">No users found in this category.</td>
                    </tr>
                  ) : (
                    filteredUsers.map(user => (
                      <tr key={user.id} className="hover:bg-emerald-50/70 transition-colors">
                        <td className="px-8 py-6">
                          <div>
                            <div className="font-semibold text-emerald-900">{user.email}</div>
                            <div className="text-xs text-stone-400 font-mono">ID: {user.id}</div>
                          </div>
                        </td>
                        <td className="px-8 py-6">
                          <RoleBadge role={user.role} />
                        </td>
                        <td className="px-8 py-6 text-right">
                          <button 
                            onClick={() => setUserToDelete(user)}
                            className="p-3 text-stone-400 hover:text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                          >
                            <Trash2 size={20} />
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
            <div className="bg-emerald-800 rounded-3xl p-8 text-white shadow-xl relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-2xl mb-6 flex items-center gap-3">
                  <span>🌱</span> Provision New Users
                </h3>
                <div className="space-y-4">
                  <ProvisionBtn icon={<ShieldCheck />} label="Admin" color="violet" onClick={() => navigate('/register-admin')} />
                  <ProvisionBtn icon={<Briefcase />} label="Farmhand" color="teal" onClick={() => navigate('/register-farmhand')} />
                  <ProvisionBtn icon={<BookOpen />} label="Correspondent" color="amber" onClick={() => navigate('/register-correspondent')} />
                  <ProvisionBtn icon={<Landmark />} label="Institution" color="emerald" onClick={() => navigate('/register-institution')} />
                </div>
              </div>
              <Globe size={200} className="absolute -bottom-16 -right-16 text-white/10 rotate-12 pointer-events-none" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ==================== SUB-COMPONENTS ==================== */

const StatCard = ({ icon, label, value, color }) => (
  <div className="bg-white rounded-3xl p-6 border border-emerald-100 shadow-sm hover:shadow-md transition-all">
    <div className={`inline-flex items-center justify-center w-11 h-11 rounded-2xl bg-${color}-100 text-${color}-600 mb-4`}>
      {React.cloneElement(icon, { size: 24 })}
    </div>
    <div className="text-xs font-bold uppercase tracking-widest text-stone-500">{label}</div>
    <div className="text-4xl font-bold text-emerald-900 mt-1">{value}</div>
  </div>
);

const TabBtn = ({ active, onClick, label }) => (
  <button 
    onClick={onClick} 
    className={`px-6 py-2 rounded-3xl text-sm font-semibold transition-all whitespace-nowrap ${
      active 
        ? 'bg-emerald-700 text-white shadow-md' 
        : 'bg-white text-stone-600 hover:bg-emerald-50 border border-emerald-100'
    }`}
  >
    {label === 'all' ? 'All Users' : label.charAt(0).toUpperCase() + label.slice(1)}
  </button>
);

const RoleBadge = ({ role }) => {
  const styles = {
    admin: 'bg-violet-100 text-violet-700',
    farmhand: 'bg-teal-100 text-teal-700',
    correspondent: 'bg-amber-100 text-amber-700',
    institution: 'bg-emerald-100 text-emerald-700',
    user: 'bg-stone-100 text-stone-600'
  };
  return (
    <span className={`inline-block text-xs font-bold uppercase px-5 py-1.5 rounded-3xl ${styles[role] || 'bg-stone-100 text-stone-500'}`}>
      {role}
    </span>
  );
};

const ProvisionBtn = ({ icon, label, onClick, color }) => (
  <button 
    onClick={onClick} 
    className="w-full flex items-center gap-4 bg-white/10 hover:bg-white/20 p-5 rounded-3xl transition-all group border border-white/20"
  >
    <div className={`h-10 w-10 rounded-2xl flex items-center justify-center bg-${color}-500/20 text-${color}-200 group-hover:scale-110 transition-transform`}>
      {React.cloneElement(icon, { size: 22 })}
    </div>
    <div className="flex-1 text-left">
      <p className="font-semibold text-white">Create New {label}</p>
    </div>
    <PlusCircle size={22} className="text-white/70 group-hover:text-white transition" />
  </button>
);

export default AdminDash;