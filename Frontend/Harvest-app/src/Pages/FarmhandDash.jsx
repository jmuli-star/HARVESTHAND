import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Send, X, CheckCircle2, 
  Circle, ClipboardList, Package, Box, Plus, 
  Sun, Moon, Sunrise, CloudSun, LogOut, User as UserIcon,
  Filter, Check
} from 'lucide-react';

function FarmhandDash() {
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [batches, setBatches] = useState([]);
  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Farmer");
  
  // Modals and Filters
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [filterReported, setFilterReported] = useState(false);

  // Form States
  const [newReport, setNewReport] = useState({ 
    title: '', message: '', category: 'Safety', recipient: '', batch: '' 
  });
  
  const [newBatch, setNewBatch] = useState({
    crop_name: '', variety: '', quantity_kg: '', destination: '',
    planted_date: '', harvest_date: new Date().toISOString().split('T')[0],
    recipient: '' // Integrated recipient for automated reporting
  });

  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });

  // --- LOGIC: DYNAMIC GREETING ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: <Sunrise className="text-amber-500" /> };
    if (hour < 17) return { text: "Good Afternoon", icon: <CloudSun className="text-orange-400" /> };
    if (hour < 21) return { text: "Good Evening", icon: <Sun className="text-orange-500" /> };
    return { text: "Good Night", icon: <Moon className="text-indigo-400" /> };
  };

  const { text: greetingText, icon: greetingIcon } = getGreeting();
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
  });

  // --- LOGIC: LOGOUT ---
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
    navigate('/login'); 
  };

  // --- LOGIC: DATA FETCHING ---
  const fetchData = async () => {
    try {
      const storedUser = JSON.parse(localStorage.getItem('user_data'));
      if (storedUser?.first_name) setUserName(storedUser.first_name);

      const [reportRes, userRes, taskRes, batchRes] = await Promise.all([
        api.get('/management/reports/'),
        api.get('/management/tasks/assignable_users/'),
        api.get('/management/tasks/'),
        api.get('/harvest/batches/') 
      ]);
      setReports(reportRes.data);
      setRespondents(userRes.data);
      setTasks(taskRes.data);
      setBatches(batchRes.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      console.error("Fetch Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIC: STATUS CHECKER ---
  const getBatchStatus = (batchId) => {
    const isReported = reports.some(r => r.batch === batchId);
    return isReported ? "Reported" : "Pending";
  };

  // --- LOGIC: REGISTER HARVEST & AUTO-REPORT ---
  const handlePostBatch = async (e) => {
    e.preventDefault();
    try {
      const batchPayload = {
        crop_name: newBatch.crop_name,
        variety: newBatch.variety,
        quantity_kg: parseFloat(newBatch.quantity_kg),
        destination: newBatch.destination,
        planted_date: newBatch.planted_date,
        harvest_date: newBatch.harvest_date
      };
      
      const batchRes = await api.post('/harvest/batches/', batchPayload);
      
      // If a recipient was selected, automatically send a report
      if (newBatch.recipient) {
        const reportPayload = {
          title: `Harvest Log: ${newBatch.crop_name}`,
          message: `New batch of ${newBatch.quantity_kg}kg logged at ${newBatch.destination}.`,
          recipient: parseInt(newBatch.recipient),
          batch: batchRes.data.id,
          category: 'Harvest'
        };
        await api.post('/management/reports/', reportPayload);
      }

      setShowBatchModal(false);
      setNewBatch({
        crop_name: '', variety: '', quantity_kg: '', destination: '',
        planted_date: '', harvest_date: new Date().toISOString().split('T')[0],
        recipient: ''
      });
      fetchData();
    } catch (err) {
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  // --- LOGIC: SEND INDEPENDENT REPORT ---
  const handlePostReport = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newReport,
        recipient: parseInt(newReport.recipient),
        batch: newReport.batch ? parseInt(newReport.batch) : null
      };
      await api.post('/management/reports/', payload);
      setShowReportModal(false);
      setNewReport({ title: '', message: '', category: 'Safety', recipient: '', batch: '' });
      fetchData();
    } catch (err) {
      alert("Report Error: " + JSON.stringify(err.response?.data));
    }
  };

  // --- LOGIC: TASK TOGGLE ---
  const handleToggleTask = async (id, currentStatus) => {
    try {
      await api.patch(`/management/tasks/${id}/toggle_complete/`);
      setTasks(tasks.map(t => t.id === id ? { ...t, is_complete: !currentStatus } : t));
    } catch (err) {
      console.error("Toggle Error:", err.response?.data);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-400 italic">Preparing the fields...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* HEADER & LOGOUT */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="p-2 bg-white rounded-lg shadow-sm">{greetingIcon}</span>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">{currentDate}</p>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {greetingText}, <span className="text-emerald-600">{userName}!</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm">
          <div className="w-10 h-10 bg-slate-100 rounded-xl flex items-center justify-center text-slate-500">
            <UserIcon size={20} />
          </div>
          <div className="hidden sm:block">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Account</p>
            <p className="text-sm font-bold text-slate-700">Farmhand</p>
          </div>
          <button 
            onClick={handleLogout}
            className="ml-2 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors group"
          >
            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </header>

      {/* PRIMARY ACTIONS */}
      <div className="flex gap-4 mb-10">
          <button onClick={() => setShowBatchModal(true)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-5 rounded-[2rem] font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus size={20} /> Log Harvest
          </button>
          <button onClick={() => setShowReportModal(true)} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-6 py-5 rounded-[2rem] font-black shadow-lg shadow-rose-100 flex items-center justify-center gap-2 transition-all active:scale-95">
            <AlertTriangle size={20} /> New Report
          </button>
      </div>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* FIELD ORDERS */}
        <section className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
            <ClipboardList size={14} /> Active Field Orders
          </h2>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
             {tasks.length > 0 ? tasks.map(task => (
               <div key={task.id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                 <button onClick={() => handleToggleTask(task.id, task.is_complete)}>
                   {task.is_complete ? <CheckCircle2 className="text-emerald-500" size={28} /> : <Circle className="text-slate-200" size={28} />}
                 </button>
                 <div className="flex-1">
                   <h3 className={`font-bold ${task.is_complete ? 'text-slate-400 line-through' : 'text-slate-800'}`}>{task.title}</h3>
                   <p className="text-xs text-slate-400 font-medium">{task.category}</p>
                 </div>
               </div>
             )) : <p className="p-10 text-center text-slate-400 font-bold">No tasks assigned.</p>}
          </div>
        </section>

        {/* BATCH LOGS WITH STATUS FILTER */}
        <section className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
              <Package size={14} /> Recent Batch Logs
            </h2>
            <button 
              onClick={() => setFilterReported(!filterReported)}
              className={`flex items-center gap-1 text-[10px] font-black uppercase transition-colors ${filterReported ? 'text-emerald-600' : 'text-slate-400'}`}
            >
              <Filter size={12} /> {filterReported ? "Showing Pending" : "All Batches"}
            </button>
          </div>
          
          <div className="grid gap-4">
             {batches
               .filter(b => filterReported ? getBatchStatus(b.id) === "Pending" : true)
               .slice(0, 5).map(b => {
                const status = getBatchStatus(b.id);
                return (
                  <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm hover:border-emerald-200 transition-all">
                    <div>
                      <h4 className="font-black text-slate-800">{b.crop_name} <span className="text-slate-400 font-medium text-sm">({b.variety})</span></h4>
                      <div className="flex items-center gap-3 mt-1">
                         <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500 uppercase">#{b.id} — {b.quantity_kg} KG</span>
                         <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">To: {b.destination}</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-xl text-[10px] font-black uppercase ${status === "Reported" ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600"}`}>
                      {status}
                    </div>
                  </div>
                );
             })}
          </div>
        </section>
      </div>

      {/* MODAL: HARVEST LOG + NOTIFY */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Box className="text-emerald-500" /> Log Harvest</h2>
              <button onClick={() => setShowBatchModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
            </div>
            <form onSubmit={handlePostBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Crop Type" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.crop_name} onChange={(e) => setNewBatch({...newBatch, crop_name: e.target.value})} />
                <input required placeholder="Variety" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.variety} onChange={(e) => setNewBatch({...newBatch, variety: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="KGs" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.quantity_kg} onChange={(e) => setNewBatch({...newBatch, quantity_kg: e.target.value})} />
                <input required placeholder="Destination" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.destination} onChange={(e) => setNewBatch({...newBatch, destination: e.target.value})} />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Planted Date</label>
                <input required type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.planted_date} onChange={(e) => setNewBatch({...newBatch, planted_date: e.target.value})} />
              </div>

              {/* AUTOMATED REPORTING OPTION */}
              <div className="pt-4 border-t border-slate-100 space-y-2">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Notify Correspondent</label>
                <select 
                  className="w-full p-4 bg-slate-900 text-white rounded-xl font-bold" 
                  value={newBatch.recipient} 
                  onChange={(e) => setNewBatch({...newBatch, recipient: e.target.value})}
                >
                  <option value="">Log Only (No Notification)</option>
                  {respondents.map(user => <option key={user.id} value={user.id}>{user.email}</option>)}
                </select>
              </div>

              <button className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3">
                <Check size={20} /> Register & Dispatch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INDEPENDENT REPORT */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Send className="text-rose-500" /> Dispatch Report</h2>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
            </div>
            <form onSubmit={handlePostReport} className="space-y-4">
              <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newReport.recipient} onChange={(e) => setNewReport({...newReport, recipient: e.target.value})}>
                <option value="">Select Correspondent</option>
                {respondents.map(user => <option key={user.id} value={user.id}>{user.email}</option>)}
              </select>
              <select className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-700" value={newReport.batch} onChange={(e) => setNewReport({...newReport, batch: e.target.value})}>
                <option value="">General Report (No Batch)</option>
                {batches.map(b => <option key={b.id} value={b.id}>{b.crop_name} ({b.id})</option>)}
              </select>
              <input required placeholder="Report Title" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newReport.title} onChange={(e) => setNewReport({...newReport, title: e.target.value})} />
              <textarea required rows="4" placeholder="Message..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newReport.message} onChange={(e) => setNewReport({...newReport, message: e.target.value})} />
              <button className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-rose-700 flex items-center justify-center gap-3">
                <Send size={20} /> Submit Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmhandDash;