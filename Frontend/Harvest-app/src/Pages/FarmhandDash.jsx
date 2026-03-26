import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  AlertTriangle, Send, X, ChevronDown, CheckCircle2, 
  Circle, ClipboardList, Clock, Package, Box, Plus, Scale, MapPin, Calendar 
} from 'lucide-react';

function FarmhandDash() {
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]);
  const [batches, setBatches] = useState([]);
  const [respondents, setRespondents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);

  // Form State
  const [newReport, setNewReport] = useState({ 
    title: '', message: '', category: 'Safety', recipient: '', batch: '' 
  });
  
  const [newBatch, setNewBatch] = useState({
    crop_name: '', variety: '', quantity_kg: '', destination: '',
    planted_date: '', harvest_date: new Date().toISOString().split('T')[0]
  });

  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });

  const fetchData = async () => {
    try {
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
      console.error("Fetch Error:", err.response?.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- LOGIC: REGISTER HARVEST ---
  const handlePostBatch = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...newBatch,
        quantity_kg: parseFloat(newBatch.quantity_kg)
      };
      await api.post('/harvest/batches/', payload); 
      setShowBatchModal(false);
      setNewBatch({
        crop_name: '', variety: '', quantity_kg: '', destination: '',
        planted_date: '', harvest_date: new Date().toISOString().split('T')[0]
      });
      fetchData();
      alert("Batch Registered Successfully!");
    } catch (err) {
      alert("Batch Error: " + JSON.stringify(err.response?.data));
    }
  };

  // --- LOGIC: SEND REPORT TO CORRESPONDENT ---
  const handlePostReport = async (e) => {
    e.preventDefault();
    try {
      // BUG FIX: Ensure batch is sent as an integer or null, not an empty string
      const payload = {
        ...newReport,
        recipient: parseInt(newReport.recipient),
        batch: newReport.batch ? parseInt(newReport.batch) : null
      };

      await api.post('/management/reports/', payload);
      setShowReportModal(false);
      setNewReport({ title: '', message: '', category: 'Safety', recipient: '', batch: '' });
      fetchData();
      alert("Report dispatched to correspondent!");
    } catch (err) {
      console.error("Report Error:", err.response?.data);
      alert("Error: " + JSON.stringify(err.response?.data));
    }
  };

  // --- LOGIC: TICK BOX TASK TOGGLE ---
  const handleToggleTask = async (id, currentStatus) => {
    try {
      await api.patch(`/management/tasks/${id}/toggle_complete/`);
      setTasks(tasks.map(t => t.id === id ? { ...t, is_complete: !currentStatus } : t));
    } catch (err) {
      console.error("Toggle Error:", err.response?.data);
    }
  };

  if (loading) return <div className="p-20 text-center font-black text-slate-400">Loading Ops...</div>;

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-slate-50 text-slate-900 font-sans">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Field Ops</h1>
          <p className="text-slate-500 font-medium">Record harvests and manage active tasks.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setShowBatchModal(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-emerald-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <Plus size={20} /> Log Harvest
          </button>
          <button 
            onClick={() => setShowReportModal(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-4 rounded-2xl font-black shadow-lg shadow-rose-100 flex items-center gap-2 transition-all active:scale-95"
          >
            <AlertTriangle size={20} /> New Report
          </button>
        </div>
      </header>

      <div className="grid lg:grid-cols-2 gap-10">
        {/* Task Section */}
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

        {/* Batch Section */}
        <section className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
            <Package size={14} /> Recent Batch Logs
          </h2>
          <div className="grid gap-4">
             {batches.slice(0, 5).map(b => (
               <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm hover:border-emerald-200 transition-all">
                 <div>
                   <h4 className="font-black text-slate-800">{b.crop_name} <span className="text-slate-400 font-medium text-sm">({b.variety})</span></h4>
                   <div className="flex items-center gap-3 mt-1">
                      <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500 uppercase tracking-tighter">{b.quantity_kg} KG</span>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">To: {b.destination}</p>
                   </div>
                 </div>
                 <div className="bg-slate-50 p-2 rounded-xl text-slate-400 font-black text-xs">#{b.id}</div>
               </div>
             ))}
          </div>
        </section>
      </div>

      {/* MODAL: HARVEST ENTRY */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Box className="text-emerald-500" /> Log Harvest
              </h2>
              <button onClick={() => setShowBatchModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
            </div>
            <form onSubmit={handlePostBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Crop Type</label>
                  <input required placeholder="Maize" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.crop_name} onChange={(e) => setNewBatch({...newBatch, crop_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Variety</label>
                  <input required placeholder="H614" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.variety} onChange={(e) => setNewBatch({...newBatch, variety: e.target.value})} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Net KGs</label>
                  <input required type="number" step="0.01" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.quantity_kg} onChange={(e) => setNewBatch({...newBatch, quantity_kg: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Destination</label>
                  <input required placeholder="Store B" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.destination} onChange={(e) => setNewBatch({...newBatch, destination: e.target.value})} />
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Planted Date</label>
                <input required type="date" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newBatch.planted_date} onChange={(e) => setNewBatch({...newBatch, planted_date: e.target.value})} />
              </div>
              <button className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-3 mt-4">
                <Plus size={20} /> Register Batch
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: REPORT ENTRY (CORRESPONDENT DISPATCH) */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2">
                <Send className="text-rose-500" /> Dispatch Report
              </h2>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
            </div>
            <form onSubmit={handlePostReport} className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Assign To (Correspondent)</label>
                <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-slate-700" value={newReport.recipient} onChange={(e) => setNewReport({...newReport, recipient: e.target.value})}>
                  <option value="">Select Correspondent</option>
                  {respondents.map(user => <option key={user.id} value={user.id}>{user.email}</option>)}
                </select>
              </div>

              {/* NEW LOGIC: LINKING TO A BATCH */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Link to Harvest (Optional)</label>
                <select className="w-full p-4 bg-white border-2 border-slate-100 rounded-xl font-bold text-slate-700 outline-emerald-500" value={newReport.batch} onChange={(e) => setNewReport({...newReport, batch: e.target.value})}>
                  <option value="">General Report (No Batch)</option>
                  {batches.map(b => <option key={b.id} value={b.id}>{b.crop_name} - {b.quantity_kg}kg (#{b.id})</option>)}
                </select>
              </div>

              <input required placeholder="Report Title" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newReport.title} onChange={(e) => setNewReport({...newReport, title: e.target.value})} />
              <textarea required rows="4" placeholder="Detailed message..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold" value={newReport.message} onChange={(e) => setNewReport({...newReport, message: e.target.value})} />
              
              <button className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-3">
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