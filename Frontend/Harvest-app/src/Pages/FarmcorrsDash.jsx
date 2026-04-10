import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Map, Clock, MessageSquare, Layers, ArrowRight, Circle,
  CheckCircle2, Inbox, UserPlus, Send, Target, Briefcase,
  ExternalLink, ChevronRight, LayoutDashboard, ClipboardList,
  Package, LogOut, User as UserIcon, ChevronDown, X, Eye, EyeOff,
  Settings, Save, Building2
} from 'lucide-react';

// ✅ DYNAMIC URL: Matches logic in AdminDash and LoginToggle
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const API_VERSION = "/api/v1";

function FarmcorrsDash() {
  const navigate = useNavigate();
  
  // --- States ---
  const [view, setView] = useState('overview'); 
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [institutionTasks, setInstitutionTasks] = useState([]);
  const [farmhands, setFarmhands] = useState([]); 
  const [batches, setBatches] = useState([]); 
  const [institutions, setInstitutions] = useState([]); // For Settings
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState({ id: null, name: 'Correspondent', role: 'Staff' });
  
  // Modals & Feedback
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showResolved, setShowResolved] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // Form States
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '', batch: '' });
  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    associated_institution: ''
  });

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  // --- API Configuration ---
  const token = localStorage.getItem('access_token');
  // ✅ Updated to use dynamic constants
  const api = axios.create({
    baseURL: `${API_BASE_URL}${API_VERSION}`,
    headers: { Authorization: `Bearer ${token}` }
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [taskRes, reportRes, instTaskRes, userRes, batchRes, allUsersRes, currentUserRes] = await Promise.all([
        api.get('/management/tasks/'),
        api.get('/management/reports/'),
        api.get('/management/tasks/?source=institution'), 
        api.get('/management/tasks/assignable_users/'),
        api.get('/batches/').catch(() => ({ data: [] })),
        api.get('/users/'),
        api.get('/auth/user/')
      ]);
      
      setTasks(taskRes.data);
      setReports(reportRes.data);
      setInstitutionTasks(instTaskRes.data);
      setFarmhands(userRes.data);
      setBatches(batchRes.data);
      setInstitutions(allUsersRes.data.filter(u => u.role === 'farminstitution'));

      // Set Profile Data
      const u = currentUserRes.data;
      setUserInfo({
        id: u.id,
        name: u.first_name || u.email.split('@')[0],
        role: u.role || 'Correspondent'
      });
      setProfileForm({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        phone: u.phone || '',
        associated_institution: u.associated_institution || ''
      });

    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // --- Handlers ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/auth/user/update/', profileForm);
      setShowSettingsModal(false);
      fetchData();
      alert("Management profile updated successfully! 🌾");
    } catch (err) {
      alert("Failed to update settings.");
    }
  };

  const handleAssignTask = async (e) => {
    e.preventDefault();
    if (!newTask.assigned_to) return alert("Please select a recipient.");

    try {
      await api.post('/management/tasks/', {
        title: newTask.title,
        assigned_to: parseInt(newTask.assigned_to),
        batch: newTask.batch ? parseInt(newTask.batch) : null,
        is_complete: false
      });
      setNewTask({ title: '', assigned_to: '', batch: '' });
      alert("Task successfully delegated.");
      fetchData(); 
    } catch (err) {
      alert("Error assigning task.");
    }
  };

  const handleSendFeedback = async (e) => {
    e.preventDefault();
    if (!feedbackText.trim()) return;
    setIsSendingFeedback(true);

    try {
      await api.patch(`/management/reports/${selectedReport.id}/add_feedback/`, {
        feedback: feedbackText 
      });
      alert("Directive delivered to field staff.");
      setFeedbackText('');
      setSelectedReport(null);
      fetchData();
    } catch (err) {
      alert("Failed to send feedback.");
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const completedCount = tasks.filter(t => t.is_complete).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;
  const pendingReports = reports.filter(r => !r.is_complete);
  const displayedReports = showResolved ? reports : pendingReports;

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600"></div>
        <p className="text-emerald-700 mt-4 text-sm font-medium">Initialising Secure Dashboard...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 text-stone-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <header className="mb-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-4xl shadow-inner">📋</div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-emerald-900">
                Welcome, <span className="text-amber-600">{userInfo.name}</span>
              </h1>
              <p className="text-emerald-700 text-sm font-semibold mt-1">
                {today} • <span className="text-rose-500 font-bold">{pendingReports.length} pending reports</span>
              </p>
            </div>
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-3 bg-white px-4 py-2 rounded-3xl border border-emerald-100 shadow-sm hover:shadow-md transition-all"
            >
              <div className="w-10 h-10 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                <UserIcon size={22} />
              </div>
              <div className="text-left">
                <p className="text-xs font-bold text-emerald-700 uppercase tracking-widest">{userInfo.role}</p>
                <p className="text-stone-700 font-semibold">{userInfo.name}</p>
              </div>
              <ChevronDown size={18} className={`text-emerald-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-3 w-56 bg-white rounded-3xl shadow-xl border border-emerald-100 py-3 z-50 overflow-hidden">
                <button 
                  onClick={() => { setShowSettingsModal(true); setShowUserMenu(false); }}
                  className="w-full px-6 py-4 flex items-center gap-3 text-stone-700 hover:bg-emerald-50 font-semibold transition-colors border-b border-emerald-50"
                >
                  <Settings size={20} /> Settings
                </button>
                <button 
                  onClick={handleLogout} 
                  className="w-full px-6 py-4 flex items-center gap-3 text-rose-600 hover:bg-rose-50 font-semibold transition-colors"
                >
                  <LogOut size={20} /> Sign Out
                </button>
              </div>
            )}
          </div>
        </header>

        {/* TAB NAVIGATION */}
        <div className="flex border-b border-emerald-100 mb-10">
          <button 
            onClick={() => setView('overview')}
            className={`flex-1 md:flex-none pb-5 px-8 font-semibold text-sm transition-all flex items-center gap-2 ${view === 'overview' ? 'border-b-4 border-emerald-600 text-emerald-700' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button 
            onClick={() => setView('delegation')}
            className={`flex-1 md:flex-none pb-5 px-8 font-semibold text-sm transition-all flex items-center gap-2 ${view === 'delegation' ? 'border-b-4 border-emerald-600 text-emerald-700' : 'text-stone-500 hover:text-stone-700'}`}
          >
            <ClipboardList size={18} /> Delegation Hub
          </button>
        </div>

        {view === 'overview' ? (
          /* OVERVIEW VIEW */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
                <div className="px-8 py-6 border-b border-emerald-50 flex justify-between items-center bg-emerald-50">
                  <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-3">
                    <Layers size={24} className="text-emerald-600" /> Live Field Oversight
                  </h2>
                </div>
                <div className="divide-y divide-emerald-50">
                  {tasks.length > 0 ? tasks.map((item) => (
                    <div key={item.id} className="px-8 py-6 flex items-center justify-between hover:bg-emerald-50 transition-colors">
                      <div className="flex items-center gap-4">
                        {item.is_complete ? <CheckCircle2 className="text-emerald-500" size={28} /> : <Circle className="text-emerald-200" size={28} />}
                        <div>
                          <p className={`font-semibold ${item.is_complete ? 'text-stone-400' : 'text-stone-800'}`}>{item.title}</p>
                          <p className="text-xs text-stone-500 font-medium">Assigned to: {item.assigned_to_email?.split('@')[0]}</p>
                        </div>
                      </div>
                      <span className={`text-xs font-bold uppercase px-5 py-2 rounded-3xl ${item.is_complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.is_complete ? 'COMPLETE' : 'PENDING'}
                      </span>
                    </div>
                  )) : <div className="px-8 py-16 text-center text-stone-400">No active tasks in the field.</div>}
                </div>
              </div>

              <div className="bg-emerald-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl">
                <h2 className="text-3xl font-bold mb-1">Field Success Rate</h2>
                <div className="flex items-end gap-8">
                  <div className="text-7xl font-black text-amber-400">{completionRate}%</div>
                  <div className="flex-1">
                    <div className="h-4 bg-white/20 rounded-3xl overflow-hidden">
                      <div className="h-full bg-amber-400 transition-all" style={{ width: `${completionRate}%` }}></div>
                    </div>
                  </div>
                </div>
                <Map size={180} className="absolute -bottom-12 -right-12 text-white/10 rotate-12 pointer-events-none" />
              </div>
            </div>

            <div className="lg:col-span-4">
              <div className="bg-white rounded-3xl border border-emerald-100 p-8 shadow-sm h-full">
                <div className="flex justify-between items-center mb-8">
                  <h3 className="font-bold text-emerald-900 flex items-center gap-3">
                    <Inbox size={24} className="text-rose-500" /> Field Reports
                  </h3>
                  <button 
                    onClick={() => setShowResolved(!showResolved)}
                    className="flex items-center gap-2 text-xs font-semibold text-emerald-700 hover:text-emerald-900"
                  >
                    {showResolved ? <Eye size={18} /> : <EyeOff size={18} />}
                    {showResolved ? 'Hide Resolved' : 'Show Resolved'}
                  </button>
                </div>

                <div className="space-y-6">
                  {displayedReports.map((report) => (
                    <div 
                      key={report.id} 
                      className={`p-6 rounded-3xl border transition-all ${report.is_complete ? 'bg-stone-50 border-stone-100 opacity-70' : 'bg-emerald-50 border-emerald-100 hover:border-emerald-300'}`}
                    >
                      <div className="flex justify-between mb-3">
                        <p className="font-semibold text-stone-800">{report.title}</p>
                        <span className="text-xs font-bold bg-white px-4 py-1 rounded-3xl shadow-sm text-emerald-700">{report.category}</span>
                      </div>
                      <p className="text-sm text-stone-600 line-clamp-2 mb-6">{report.message}</p>
                      {!report.is_complete && (
                        <button 
                          onClick={() => setSelectedReport(report)}
                          className="text-xs font-bold text-emerald-700 flex items-center gap-2 hover:text-emerald-900"
                        >
                          Review &amp; Respond <ArrowRight size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* DELEGATION HUB */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
            <div className="bg-white rounded-3xl border border-emerald-100 p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-emerald-100 rounded-3xl flex items-center justify-center text-4xl">📋</div>
                <div>
                  <h2 className="text-3xl font-bold text-emerald-900">Delegate Duty</h2>
                  <p className="text-emerald-600 text-sm font-medium">Assign tasks to your team</p>
                </div>
              </div>

              <form onSubmit={handleAssignTask} className="space-y-8">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-3">TASK INSTRUCTION</label>
                  <input 
                    required 
                    placeholder="e.g., Check irrigation on Plot 4" 
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                    className="w-full px-6 py-5 border border-emerald-100 rounded-3xl focus:outline-none focus:border-emerald-300 text-stone-700"
                  />
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-3">ASSIGN TO</label>
                    <select 
                      required
                      value={newTask.assigned_to}
                      onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                      className="w-full px-6 py-5 border border-emerald-100 rounded-3xl focus:outline-none focus:border-emerald-300"
                    >
                      <option value="">Choose staff member...</option>
                      {farmhands.map(h => (
                        <option key={h.id} value={h.id}>
                          {h.email.split('@')[0]} • {h.role}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-3">LINK TO BATCH</label>
                    <select 
                      value={newTask.batch}
                      onChange={(e) => setNewTask({...newTask, batch: e.target.value})}
                      className="w-full px-6 py-5 border border-emerald-100 rounded-3xl focus:outline-none focus:border-emerald-300"
                    >
                      <option value="">No batch</option>
                      {batches.map(b => (
                        <option key={b.id} value={b.id}>
                          {b.crop_name} ({b.quantity_kg} kg)
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-3xl transition-all shadow-md flex items-center justify-center gap-3"
                >
                  <Send size={24} /> Assign Task Now
                </button>
              </form>
            </div>

            <div className="bg-white rounded-3xl border border-emerald-100 p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="w-14 h-14 bg-amber-100 rounded-3xl flex items-center justify-center text-4xl">🏛️</div>
                <div>
                  <h2 className="text-3xl font-bold text-emerald-900">HQ Orders</h2>
                  <p className="text-amber-600 text-sm font-medium">From Farm Institution</p>
                </div>
              </div>

              <div className="space-y-6 max-h-[520px] overflow-y-auto pr-2">
                {institutionTasks.map(task => (
                  <div key={task.id} className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 hover:border-emerald-300 transition-all">
                    <h3 className="font-semibold text-emerald-900">{task.title}</h3>
                    <button 
                      onClick={() => { 
                        setNewTask({ ...newTask, title: `RE: ${task.title}` }); 
                        window.scrollTo({ top: 0, behavior: 'smooth' }); 
                      }}
                      className="mt-4 text-xs font-bold flex items-center gap-2 text-emerald-700 hover:text-emerald-900"
                    >
                      Delegate this order <ChevronRight size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS MODAL */}
        {showSettingsModal && (
          <div className="fixed inset-0 bg-emerald-950/70 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-md rounded-[2.5rem] p-10 shadow-2xl animate-in zoom-in-95">
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-stone-800">Account Settings</h2>
                  <p className="text-xs text-stone-400 font-medium mt-1">Management Credentials</p>
                </div>
                <button onClick={() => setShowSettingsModal(false)} className="text-stone-300 hover:text-stone-800 transition">
                  <X size={28} />
                </button>
              </div>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase ml-1">First Name</label>
                    <input 
                      value={profileForm.first_name}
                      onChange={e => setProfileForm({...profileForm, first_name: e.target.value})}
                      className="w-full px-5 py-4 bg-stone-50 border border-emerald-50 rounded-2xl focus:border-emerald-300 focus:bg-white outline-none transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-stone-400 uppercase ml-1">Last Name</label>
                    <input 
                      value={profileForm.last_name}
                      onChange={e => setProfileForm({...profileForm, last_name: e.target.value})}
                      className="w-full px-5 py-4 bg-stone-50 border border-emerald-50 rounded-2xl focus:border-emerald-300 focus:bg-white outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase ml-1">Phone Contact</label>
                  <input 
                    value={profileForm.phone}
                    onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                    className="w-full px-5 py-4 bg-stone-50 border border-emerald-50 rounded-2xl focus:border-emerald-300 focus:bg-white outline-none transition-all"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-stone-400 uppercase ml-1">Assigned Institution</label>
                  <div className="relative">
                    <select 
                      value={profileForm.associated_institution}
                      onChange={e => setProfileForm({...profileForm, associated_institution: e.target.value})}
                      className="w-full px-5 py-4 bg-stone-50 border border-emerald-50 rounded-2xl focus:border-emerald-300 focus:bg-white outline-none appearance-none"
                    >
                      <option value="">-- Choose Institution --</option>
                      {institutions.map(inst => (
                        <option key={inst.id} value={inst.id}>
                          {inst.institution_name || inst.email}
                        </option>
                      ))}
                    </select>
                    <Building2 className="absolute right-5 top-1/2 -translate-y-1/2 text-emerald-300 pointer-events-none" size={20} />
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full py-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-3xl transition-all shadow-lg flex items-center justify-center gap-3 mt-4"
                >
                  <Save size={20} /> Update Credentials
                </button>
              </form>
            </div>
          </div>
        )}

        {/* FEEDBACK / REVIEW MODAL */}
        {selectedReport && (
          <div className="fixed inset-0 bg-emerald-950/70 backdrop-blur-sm z-[110] flex items-center justify-center p-6">
            <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
              <div className="px-8 py-6 border-b flex justify-between items-center">
                <h2 className="text-2xl font-bold text-emerald-900">Review Field Report</h2>
                <button onClick={() => setSelectedReport(null)} className="text-stone-400 hover:text-stone-600">
                  <X size={28} />
                </button>
              </div>

              <div className="p-8">
                <div className="bg-emerald-50 p-6 rounded-3xl mb-8 italic text-stone-600 border border-emerald-100">
                  “{selectedReport.message}”
                </div>

                <form onSubmit={handleSendFeedback}>
                  <label className="block text-xs font-bold text-stone-500 mb-3">YOUR DIRECTIVE TO FIELD STAFF</label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Write your instructions or feedback here..."
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    className="w-full px-6 py-5 border border-emerald-100 rounded-3xl focus:outline-none focus:border-emerald-300 resize-none"
                  />
                  
                  <button 
                    type="submit"
                    disabled={isSendingFeedback}
                    className="mt-8 w-full py-6 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-300 text-white font-bold text-xl rounded-3xl transition-all flex items-center justify-center gap-3"
                  >
                    {isSendingFeedback ? 'Sending...' : <>Send Directive <Send size={24} /></>}
                  </button>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmcorrsDash;