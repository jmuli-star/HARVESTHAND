import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  Users, Map, Clock, MessageSquare, Layers, ArrowRight, Circle,
  CheckCircle2, Inbox, UserPlus, Send, Target, Briefcase,
  ExternalLink, ChevronRight, LayoutDashboard, ClipboardList,
  Package, LogOut, User as UserIcon, ChevronDown, X, Eye, EyeOff
} from 'lucide-react';

function FarmcorrsDash() {
  const navigate = useNavigate();
  
  // --- States ---
  const [view, setView] = useState('overview'); 
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [institutionTasks, setInstitutionTasks] = useState([]);
  const [farmhands, setFarmhands] = useState([]); // This stores all assignable users
  const [batches, setBatches] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'Correspondent', role: 'Staff' });
  
  const [showResolved, setShowResolved] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [isSendingFeedback, setIsSendingFeedback] = useState(false);

  // New Task Form State
  const [newTask, setNewTask] = useState({ title: '', assigned_to: '', batch: '' });

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  // --- API Configuration ---
  const token = localStorage.getItem('access_token');
  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { Authorization: `Bearer ${token}` }
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      const [taskRes, reportRes, instRes, userRes, batchRes] = await Promise.all([
        api.get('/management/tasks/'),
        api.get('/management/reports/'),
        api.get('/management/tasks/?source=institution'), 
        api.get('/management/tasks/assignable_users/'),
        api.get('/batches/').catch(() => ({ data: [] }))
      ]);
      
      setTasks(taskRes.data);
      setReports(reportRes.data);
      setInstitutionTasks(instRes.data);
      setFarmhands(userRes.data);
      setBatches(batchRes.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      console.error("Error fetching dashboard data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserInfo({
          name: parsed.first_name || parsed.email.split('@')[0],
          role: parsed.role || 'Correspondent'
        });
      } catch (e) { console.error(e); }
    }
  }, []);

  // --- Handlers ---
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

  if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-slate-400 animate-pulse uppercase tracking-widest">Initialising Secure Dashboard...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900 capitalize">
              Welcome, <span className="text-indigo-600">{userInfo.name}</span>
            </h1>
            <p className="text-slate-500 font-medium italic mt-1">
              {today} • <span className="text-rose-500 font-bold">{pendingReports.length} pending reports</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button 
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-3 bg-white p-2 pr-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 transition-all"
              >
                <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
                  <UserIcon size={20} />
                </div>
                <div className="text-left hidden sm:block">
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">{userInfo.role}</p>
                  <p className="text-sm font-bold text-slate-700">{userInfo.name}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50">
                  <button onClick={handleLogout} className="w-full px-4 py-3 flex items-center gap-3 text-rose-500 hover:bg-rose-50 font-bold text-sm transition-colors">
                    <LogOut size={18} /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-8 mb-10 border-b border-slate-200">
          <button onClick={() => setView('overview')} className={`pb-4 flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${view === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <LayoutDashboard size={16} /> Overview
          </button>
          <button onClick={() => setView('delegation')} className={`pb-4 flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${view === 'delegation' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}>
            <ClipboardList size={16} /> Delegation Hub
          </button>
        </div>

        {view === 'overview' ? (
          /* --- OVERVIEW VIEW --- */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2"><Layers size={20} className="text-indigo-600" /> Live Field Oversight</h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {tasks.length > 0 ? tasks.map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        {item.is_complete ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-200" />}
                        <div>
                          <p className={`font-bold ${item.is_complete ? 'text-slate-400' : 'text-slate-800'}`}>{item.title}</p>
                          <p className="text-[10px] text-slate-500 font-bold uppercase">Staff: {item.assigned_to_email?.split('@')[0]}</p>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${item.is_complete ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {item.is_complete ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                  )) : <p className="p-10 text-center text-slate-400 italic">No tasks active.</p>}
                </div>
              </div>
              
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl">
                <h2 className="text-2xl font-black mb-2 tracking-tight">Field Success Rate</h2>
                <div className="flex items-end gap-6 relative z-10">
                   <div className="text-5xl font-black text-indigo-400">{completionRate}%</div>
                   <div className="flex-1 mb-2">
                      <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: `${completionRate}%` }}></div>
                      </div>
                   </div>
                </div>
                <Map size={140} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12" />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest"><Inbox size={20} className="text-rose-500" /> Field Reports</h3>
                  <button onClick={() => setShowResolved(!showResolved)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors">
                    {showResolved ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>
                <div className="space-y-4">
                  {displayedReports.map((report) => (
                    <div key={report.id} className={`p-5 rounded-2xl border transition-all ${report.is_complete ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-slate-50 border-slate-100 shadow-sm hover:border-indigo-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className="text-sm font-black text-slate-800">{report.title}</p>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-white text-indigo-500 font-black uppercase shadow-sm">{report.category}</span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">{report.message}</p>
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase">From: {report.sender_email?.split('@')[0]}</span>
                        {!report.is_complete && (
                          <button onClick={() => setSelectedReport(report)} className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:text-indigo-800">
                            Review <ArrowRight size={12}/>
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- DELEGATION HUB (Role Filtering Enabled) --- */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl">
                  <UserPlus size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Delegate Duty</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign by Staff Role</p>
                </div>
              </div>

              <form onSubmit={handleAssignTask} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block tracking-widest">Instruction Title</label>
                  <input required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all" placeholder="e.g., Harvesting Phase 2" value={newTask.title} onChange={(e) => setNewTask({...newTask, title: e.target.value})} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block tracking-widest">Target Personnel</label>
                        <div className="relative">
                          <select required className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none focus:ring-4 focus:ring-indigo-50" value={newTask.assigned_to} onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}>
                              <option value="">Choose Staff...</option>
                              <optgroup label="Field Staff (Farmhands)">
                                {farmhands.filter(h => h.role === 'farmhand' || !h.role).map(h => (
                                    <option key={h.id} value={h.id}>👤 {h.email.split('@')[0]} (Hand)</option>
                                ))}
                              </optgroup>
                              <optgroup label="Management (Correspondents)">
                                {farmhands.filter(h => h.role === 'farmcorrespondent').map(h => (
                                    <option key={h.id} value={h.id}>⭐ {h.email.split('@')[0]} (Corr)</option>
                                ))}
                              </optgroup>
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block tracking-widest">Link Batch</label>
                        <div className="relative">
                          <select className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none focus:ring-4 focus:ring-indigo-50" value={newTask.batch} onChange={(e) => setNewTask({...newTask, batch: e.target.value})}>
                              <option value="">General Order</option>
                              {batches.map(b => <option key={b.id} value={b.id}>📦 {b.crop_name} ({b.quantity_kg}kg)</option>)}
                          </select>
                          <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                        </div>
                    </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl group">
                  <Send size={20} className="group-hover:translate-x-1 transition-transform"/>
                  Confirm Assignment
                </button>
              </form>
            </div>

            <div className="bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-10">
              <div className="flex items-center gap-3 mb-10"><Target className="text-indigo-600" size={28} /><h2 className="text-2xl font-black text-slate-800 tracking-tight">HQ Orders</h2></div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto">
                {institutionTasks.map(task => (
                  <div key={task.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                      <ExternalLink size={18} className="text-slate-200" />
                    </div>
                    <button onClick={() => { setNewTask({...newTask, title: `RE: ${task.title}`}); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="text-xs font-black text-indigo-600 uppercase flex items-center gap-1">Delegate Staff <ChevronRight size={16}/></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Feedback Modal */}
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedReport(null)} />
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-black text-slate-800">Review Report</h2>
                <button onClick={() => setSelectedReport(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-800"><X size={20} /></button>
              </div>
              <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6 italic text-slate-600">"{selectedReport.message}"</div>
              <form onSubmit={handleSendFeedback} className="space-y-4">
                <textarea required rows={4} className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700" placeholder="Type your directive here..." value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)} />
                <button disabled={isSendingFeedback} className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 shadow-xl disabled:opacity-50">
                  {isSendingFeedback ? 'Processing...' : <><Send size={20} /> Send Directive</>}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmcorrsDash;