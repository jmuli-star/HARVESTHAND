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
  const [farmhands, setFarmhands] = useState([]);
  const [batches, setBatches] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [userInfo, setUserInfo] = useState({ name: 'Correspondent', role: 'Staff' });
  
  // New: Filter state for sidebar
  const [showResolved, setShowResolved] = useState(false);

  // --- Feedback Modal State ---
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
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    navigate('/login');
  };

  const fetchData = async () => {
    try {
      const [taskRes, reportRes, instRes, userRes, batchRes] = await Promise.all([
        api.get('/management/tasks/'),
        api.get('/management/reports/'),
        api.get('/management/tasks/?source=institution'), 
        api.get('/management/tasks/assignable_users/'),
        api.get('/harvest/batches/').catch(() => ({ data: [] }))
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
    if (!newTask.assigned_to) return alert("Please select a farmhand.");

    try {
      await api.post('/management/tasks/', {
        title: newTask.title,
        assigned_to: parseInt(newTask.assigned_to),
        batch: newTask.batch ? parseInt(newTask.batch) : null,
        is_complete: false
      });
      setNewTask({ title: '', assigned_to: '', batch: '' });
      alert("Task delegated successfully.");
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
      // FIX 1: Use .patch
      // FIX 2: Correct URL path with add_feedback
      await api.patch(`/management/reports/${selectedReport.id}/add_feedback/`, {
        // FIX 3: Key named 'feedback' to match backend request.data.get
        feedback: feedbackText 
      });

      alert("Directive delivered to field staff.");
      setFeedbackText('');
      setSelectedReport(null);
      fetchData(); // This will refresh lists, and filtering logic below will hide the report
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Check permissions or backend logic.";
      console.error("Feedback Error:", err.response?.data);
      alert(`Failed: ${errorMsg}`);
    } finally {
      setIsSendingFeedback(false);
    }
  };

  const completedCount = tasks.filter(t => t.is_complete).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  // New Logic: Filter reports for the sidebar
  const pendingReports = reports.filter(r => !r.is_complete);
  const resolvedReports = reports.filter(r => r.is_complete);
  const displayedReports = showResolved ? reports : pendingReports;

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
                  <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Correspondent</p>
                  <p className="text-sm font-bold text-slate-700">{userInfo.name}</p>
                </div>
                <ChevronDown size={16} className={`text-slate-400 transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-3 w-48 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in duration-200">
                  <button 
                    onClick={handleLogout}
                    className="w-full px-4 py-3 flex items-center gap-3 text-rose-500 hover:bg-rose-50 font-bold text-sm transition-colors"
                  >
                    <LogOut size={18} /> Sign Out System
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Tab Navigation */}
        <div className="flex gap-8 mb-10 border-b border-slate-200">
          <button 
            onClick={() => setView('overview')}
            className={`pb-4 flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${view === 'overview' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutDashboard size={16} /> Overview
          </button>
          <button 
            onClick={() => setView('delegation')}
            className={`pb-4 flex items-center gap-2 font-black text-xs uppercase tracking-[0.2em] transition-all ${view === 'delegation' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <ClipboardList size={16} /> Delegation Hub
          </button>
        </div>

        {/* --- OVERVIEW VIEW --- */}
        {view === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-in fade-in duration-500">
            <div className="lg:col-span-8 space-y-8">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-slate-50/50">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Layers size={20} className="text-indigo-600" />
                    Live Field Oversight
                  </h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {loading ? (
                      <div className="p-10 text-center text-slate-400 font-bold tracking-widest">LOADING...</div>
                  ) : tasks.length > 0 ? tasks.map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-4">
                        {item.is_complete ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-200" />}
                        <div>
                          <p className={`font-bold ${item.is_complete ? 'text-slate-400' : 'text-slate-800'}`}>{item.title}</p>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                Staff: {item.assigned_to_email?.split('@')[0]}
                            </p>
                            {item.batch && (
                                <span className="flex items-center gap-1 text-[9px] bg-indigo-50 text-indigo-500 px-2 py-0.5 rounded-full font-black uppercase">
                                    <Package size={10} /> Batch #{item.batch}
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-lg ${item.is_complete ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                        {item.is_complete ? 'Complete' : 'Pending'}
                      </span>
                    </div>
                  )) : <p className="p-10 text-center text-slate-400 italic">No tasks active.</p>}
                </div>
              </div>

              <div className="bg-slate-900 rounded-[2rem] p-8 text-white relative overflow-hidden shadow-2xl shadow-slate-200">
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

            {/* SIDEBAR: REPORTS with Filtering */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-black text-slate-800 flex items-center gap-2 uppercase text-xs tracking-widest">
                    <Inbox size={20} className="text-rose-500" /> Farmhand Reports
                  </h3>
                  <button 
                    onClick={() => setShowResolved(!showResolved)}
                    className="p-2 text-slate-400 hover:text-indigo-600 transition-colors"
                    title={showResolved ? "Showing All" : "Showing Pending"}
                  >
                    {showResolved ? <Eye size={18} /> : <EyeOff size={18} />}
                  </button>
                </div>

                <div className="space-y-4">
                  {displayedReports.length === 0 ? (
                    <div className="text-center py-10">
                      <CheckCircle2 size={32} className="mx-auto text-slate-200 mb-2" />
                      <p className="text-xs text-slate-400 font-bold uppercase tracking-tighter">No reports to review</p>
                    </div>
                  ) : displayedReports.map((report) => (
                    <div key={report.id} className={`p-5 rounded-2xl border transition-all group ${report.is_complete ? 'bg-slate-50/50 border-slate-100 opacity-60' : 'bg-slate-50 border-slate-100 shadow-sm hover:border-indigo-200'}`}>
                      <div className="flex justify-between items-start mb-2">
                        <p className={`text-sm font-black leading-tight ${report.is_complete ? 'text-slate-400' : 'text-slate-800'}`}>{report.title}</p>
                        <span className={`text-[9px] px-2 py-0.5 rounded shadow-sm font-black uppercase ${report.is_complete ? 'bg-slate-200 text-slate-500' : 'bg-white text-indigo-500'}`}>
                          {report.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mb-4 leading-relaxed font-medium">{report.message}</p>
                      
                      <div className="flex justify-between items-center pt-3 border-t border-slate-200/50">
                        <span className="text-[10px] font-black text-slate-400 uppercase">From: {report.sender_email?.split('@')[0]}</span>
                        {report.is_complete ? (
                          <span className="text-[9px] font-black text-emerald-500 uppercase flex items-center gap-1">
                            <CheckCircle2 size={12} /> Resolved
                          </span>
                        ) : (
                          <button 
                            onClick={() => setSelectedReport(report)}
                            className="text-[10px] font-black uppercase text-indigo-600 flex items-center gap-1 hover:text-indigo-800 transition-colors"
                          >
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
          /* --- DELEGATION HUB --- */
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 animate-in slide-in-from-right-4 duration-500">
            <div className="bg-white rounded-[2.5rem] border border-slate-100 p-10 shadow-sm">
              <div className="flex items-center gap-4 mb-10">
                <div className="p-4 bg-indigo-600 rounded-2xl text-white shadow-xl shadow-indigo-100">
                  <UserPlus size={28} />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Delegate Duty</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Assign tasks to field staff</p>
                </div>
              </div>

              <form onSubmit={handleAssignTask} className="space-y-6">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block tracking-widest">Instruction Title</label>
                  <input 
                    required
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all"
                    placeholder="e.g., Warehouse Stocking"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block tracking-widest">Field Staff</label>
                        <select 
                            required
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none transition-all"
                            value={newTask.assigned_to}
                            onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                        >
                            <option value="">Select Staff...</option>
                            {farmhands.map(hand => (
                                <option key={hand.id} value={hand.id}>{hand.email}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block tracking-widest">Link Batch</label>
                        <select 
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none transition-all"
                            value={newTask.batch}
                            onChange={(e) => setNewTask({...newTask, batch: e.target.value})}
                        >
                            <option value="">General Task</option>
                            {batches.map(batch => (
                                <option key={batch.id} value={batch.id}>
                                    {batch.crop_name} - {batch.quantity_kg}kg
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl group">
                  <Send size={20} className="group-hover:translate-x-1 transition-transform"/>
                  Confirm Assignment
                </button>
              </form>
            </div>

            <div className="bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <Target className="text-indigo-600" size={28} />
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">HQ Orders</h2>
                </div>
              </div>
              <div className="space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar">
                {institutionTasks.map(task => (
                  <div key={task.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group">
                    <div className="flex justify-between items-start mb-4">
                      <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                      <ExternalLink size={18} className="text-slate-200" />
                    </div>
                    <button className="text-xs font-black text-indigo-600 uppercase flex items-center gap-1">
                      Delegate Staff <ChevronRight size={16}/>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* --- FEEDBACK MODAL --- */}
        {selectedReport && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300" onClick={() => setSelectedReport(null)} />
            <div className="relative bg-white w-full max-w-xl rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
              <div className="p-8 border-b border-slate-50 flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-black text-slate-800">Report Feedback</h2>
                  <p className="text-[10px] font-bold text-indigo-500 uppercase tracking-widest mt-1">Reviewing: {selectedReport.title}</p>
                </div>
                <button onClick={() => setSelectedReport(null)} className="p-2 bg-slate-100 rounded-full text-slate-400 hover:text-slate-800 transition-colors">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8 space-y-6">
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2">Original Message</p>
                  <p className="text-sm text-slate-600 italic leading-relaxed">"{selectedReport.message}"</p>
                </div>

                <form onSubmit={handleSendFeedback} className="space-y-4">
                  <div>
                    <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block tracking-widest">Direct Instructions / Feedback</label>
                    <textarea 
                      required
                      rows={4}
                      className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 focus:bg-white focus:ring-4 focus:ring-indigo-50 transition-all resize-none"
                      placeholder="Type your response to the field staff..."
                      value={feedbackText}
                      onChange={(e) => setFeedbackText(e.target.value)}
                    />
                  </div>
                  <button 
                    disabled={isSendingFeedback}
                    className="w-full bg-indigo-600 text-white py-5 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-700 transition-all shadow-xl disabled:opacity-50"
                  >
                    {isSendingFeedback ? 'Processing...' : (
                      <>
                        <Send size={20} /> Send Directive
                      </>
                    )}
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