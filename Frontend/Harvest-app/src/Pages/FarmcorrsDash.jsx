import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  Users, Map, Clock, MessageSquare, Layers, ArrowRight, Circle,
  CheckCircle2, Inbox, UserPlus, Send, Target, Briefcase,
  ExternalLink, ChevronRight, LayoutDashboard, ClipboardList,
  Package // Added for Batch iconography
} from 'lucide-react';

function FarmcorrsDash() {
  // --- States ---
  const [view, setView] = useState('overview'); 
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [institutionTasks, setInstitutionTasks] = useState([]);
  const [farmhands, setFarmhands] = useState([]);
  const [batches, setBatches] = useState([]); // Integrated Batch State
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: 'Correspondent', role: 'Staff' });
  
  // New Task Form State (includes batch)
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

  // --- Data Fetching ---
  const fetchData = async () => {
    try {
      const [taskRes, reportRes, instRes, userRes, batchRes] = await Promise.all([
        api.get('/management/tasks/'),
        api.get('/management/reports/'),
        api.get('/management/tasks/?source=institution'), 
        api.get('/management/tasks/assignable_users/'),
        api.get('/management/batches/').catch(() => ({ data: [] })) // Fallback if endpoint is new
      ]);
      
      setTasks(taskRes.data);
      setReports(reportRes.data);
      setInstitutionTasks(instRes.data);
      setFarmhands(userRes.data);
      setBatches(batchRes.data);
    } catch (err) {
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
          role: parsed.role
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
        batch: newTask.batch ? parseInt(newTask.batch) : null, // Handle optional batch
        is_complete: false
      });
      setNewTask({ title: '', assigned_to: '', batch: '' });
      alert("Task delegated successfully.");
      fetchData(); 
    } catch (err) {
      alert("Error assigning task. Check if all required fields are met.");
    }
  };

  const completedCount = tasks.filter(t => t.is_complete).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 capitalize">
              Welcome, <span className="text-indigo-600">{userInfo.name}</span>
            </h1>
            <p className="text-slate-500 font-medium italic">
              {today} • {reports.length} Reports awaiting review
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
              <MessageSquare size={18} /> Broadcast Alert
            </button>
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
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                  <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Layers size={20} className="text-indigo-600" />
                    Assignment Oversight
                  </h2>
                </div>
                <div className="divide-y divide-slate-50">
                  {loading ? (
                      <div className="p-10 text-center text-slate-400 font-bold tracking-widest">LOADING FIELD DATA...</div>
                  ) : tasks.map((item) => (
                    <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                      <div className="flex items-center gap-4">
                        {item.is_complete ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-200" />}
                        <div>
                          <p className={`font-bold ${item.is_complete ? 'text-slate-400' : 'text-slate-800'}`}>{item.title}</p>
                          <div className="flex items-center gap-3">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                                Assigned To: {item.assigned_to_email?.split('@')[0] || "User"}
                            </p>
                            {item.batch_name && (
                                <span className="flex items-center gap-1 text-[9px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-black uppercase">
                                    <Package size={10} /> {item.batch_name}
                                </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Manage</button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
                <h2 className="text-2xl font-bold mb-4">Field Efficiency</h2>
                <div className="flex gap-6 mt-2 relative z-10">
                  <div className="flex-1">
                    <p className="text-slate-400 text-xs mb-2 uppercase font-black">Success Rate</p>
                    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{ width: `${completionRate}%` }}></div>
                    </div>
                  </div>
                </div>
                <Map size={120} className="absolute -bottom-5 -right-5 text-white/5 -rotate-12" />
              </div>
            </div>

            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                  <Inbox size={20} className="text-indigo-600" />
                  Field Hand Inbox
                </h3>
                <div className="space-y-4">
                  {reports.length === 0 ? (
                    <p className="text-center py-6 text-slate-400 text-sm italic">No reports from farmhands.</p>
                  ) : reports.map((report) => (
                    <div key={report.id} className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 group">
                      <div className="flex justify-between items-start mb-1">
                        <p className="text-sm font-black text-indigo-900">{report.title}</p>
                        <span className="text-[9px] bg-white px-2 py-0.5 rounded shadow-sm font-bold text-indigo-400 uppercase">
                          {report.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">{report.message}</p>
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] font-bold text-indigo-400">From: {report.sender_email?.split('@')[0]}</span>
                        <button className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600">
                          Feedback <ArrowRight size={12}/>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* --- DELEGATION HUB VIEW --- */
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
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Instruction Title</label>
                  <input 
                    required
                    className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 placeholder:text-slate-300 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all"
                    placeholder="e.g., Irrigation System Audit"
                    value={newTask.title}
                    onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Select Field Staff</label>
                        <select 
                            required
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none transition-all focus:bg-white"
                            value={newTask.assigned_to}
                            onChange={(e) => setNewTask({...newTask, assigned_to: e.target.value})}
                        >
                            <option value="">Choose a Farmhand...</option>
                            {farmhands.map(hand => (
                                <option key={hand.id} value={hand.id}>{hand.first_name || hand.email.split('@')[0]}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[10px] font-black uppercase text-slate-400 ml-1 mb-2 block">Link Harvest Batch</label>
                        <select 
                            className="w-full p-5 bg-slate-50 border border-slate-100 rounded-2xl outline-none font-bold text-slate-700 appearance-none transition-all focus:bg-white"
                            value={newTask.batch}
                            onChange={(e) => setNewTask({...newTask, batch: e.target.value})}
                        >
                            <option value="">No Batch Association</option>
                            {batches.map(batch => (
                                <option key={batch.id} value={batch.id}>
                                    {batch.crop_name} ({batch.quantity_kg}kg)
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <button className="w-full bg-slate-900 text-white py-6 rounded-2xl font-black flex items-center justify-center gap-3 hover:bg-indigo-600 transition-all shadow-xl group">
                  <Send size={20} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"/>
                  Confirm Assignment
                </button>
              </form>
            </div>

            <div className="bg-slate-100/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 p-10">
              <div className="flex justify-between items-center mb-10">
                <div className="flex items-center gap-3">
                  <Target className="text-indigo-600" size={28} />
                  <h2 className="text-2xl font-black text-slate-800 tracking-tight">Institution Orders</h2>
                </div>
                <span className="bg-white px-4 py-1.5 rounded-full border border-slate-200 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                  {institutionTasks.length} Pending HQ Directives
                </span>
              </div>

              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                {institutionTasks.length === 0 ? (
                  <div className="py-24 text-center flex flex-col items-center opacity-20">
                    <Briefcase size={64} className="mb-4" />
                    <p className="font-bold uppercase text-xs tracking-[0.3em]">Inbox is empty</p>
                  </div>
                ) : (
                  institutionTasks.map(task => (
                    <div key={task.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm group hover:border-indigo-300 transition-all cursor-default">
                      <div className="flex justify-between items-start mb-4">
                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                        <ExternalLink size={18} className="text-slate-200 group-hover:text-indigo-400" />
                      </div>
                      <div className="flex items-center justify-between border-t border-slate-50 pt-4">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-indigo-50 flex items-center justify-center text-[10px] font-bold text-indigo-600 tracking-tighter uppercase">HQ</div>
                          <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Institutional Directive</span>
                        </div>
                        <button className="flex items-center gap-1 text-xs font-black text-indigo-600 uppercase hover:translate-x-1 transition-transform">
                          Delegate Staff <ChevronRight size={16}/>
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default FarmcorrsDash;