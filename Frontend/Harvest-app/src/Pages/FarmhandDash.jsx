import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Send, X, Circle, ClipboardList, Package, Box, Plus, 
  Sun, Moon, Sunrise, CloudSun, LogOut, User as UserIcon,
  Check, Loader2, ChevronDown, Settings, Save, Building2
} from 'lucide-react';

function FarmhandDash() {
  const navigate = useNavigate();
  
  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [correspondents, setCorrespondents] = useState([]); 
  const [peers, setPeers] = useState([]); 
  const [institutions, setInstitutions] = useState([]); // List of possible institutions
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Farmer");
  
  // Modals
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Form States
  const [newReport, setNewReport] = useState({ 
    title: '', message: '', category: 'Safety', recipient: '', batch: '' 
  });
  
  const [newBatch, setNewBatch] = useState({
    crop_name: '', variety: '', quantity_kg: '', destination: '',
    planted_date: '', harvest_date: new Date().toISOString().split('T')[0],
    recipient: '' 
  });

  const [profileForm, setProfileForm] = useState({
    first_name: '',
    last_name: '',
    phone: '',
    associated_institution: '' // The ID of the chosen institution
  });

  // --- API CONFIG ---
  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); 
  };

  // --- DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      // 1. Fetch Current Logged-in User Info
      const userRes = await api.get('/auth/user/'); 
      const u = userRes.data;
      setUserName(u.first_name || u.email.split('@')[0]);
      setProfileForm({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        phone: u.phone || '',
        associated_institution: u.associated_institution || ''
      });

      // 2. Fetch All Available Institutions for the dropdown
      const instRes = await api.get('/users/');
      const allInst = instRes.data.filter(user => user.role === 'farminstitution');
      setInstitutions(allInst);

      // 3. Fetch Batches
      const batchRes = await api.get('/batches/');
      setBatches(batchRes.data);

      // 4. Fetch Correspondents (for reporting)
      setCorrespondents(instRes.data.filter(user => user.role === 'farmcorrespondent'));
      setPeers(instRes.data.filter(user => user.role === 'farmhand'));
      
      // 5. Fetch Tasks
      const taskRes = await api.get('/management/tasks/');
      setTasks(taskRes.data);

    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- PROFILE UPDATE LOGIC ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/auth/user/update/', profileForm);
      setShowSettingsModal(false);
      fetchData(); // Refresh UI with new name/info
      alert("Profile updated successfully!");
    } catch (err) {
      alert("Update failed. Please check your data.");
    }
  };

  // --- LOG HARVEST ---
  const handlePostBatch = async (e) => {
    e.preventDefault();
    try {
      const batchRes = await api.post('/batches/', {
        ...newBatch,
        quantity_kg: parseFloat(newBatch.quantity_kg),
      });
      
      if (newBatch.recipient) {
        await api.post('/management/reports/', {
          title: `Harvest Log: ${newBatch.crop_name}`,
          message: `New harvest batch logged: ${newBatch.quantity_kg}kg.`,
          recipient: parseInt(newBatch.recipient),
          batch: batchRes.data.id,
          category: 'Harvest'
        });
      }

      setShowBatchModal(false);
      setNewBatch({ crop_name: '', variety: '', quantity_kg: '', destination: '', planted_date: '', harvest_date: new Date().toISOString().split('T')[0], recipient: '' });
      fetchData();
    } catch (err) { alert("Batch Error."); }
  };

  // --- MANUAL REPORT ---
  const handlePostReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/management/reports/', {
        ...newReport,
        recipient: parseInt(newReport.recipient),
        batch: newReport.batch ? parseInt(newReport.batch) : null
      });
      setShowReportModal(false);
      setNewReport({ title: '', message: '', category: 'Safety', recipient: '', batch: '' });
      fetchData();
    } catch (err) { alert("Report Error."); }
  };

  // Greeting Logic
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: <Sunrise className="text-amber-500" /> };
    if (hour < 17) return { text: "Good Afternoon", icon: <CloudSun className="text-orange-400" /> };
    return { text: "Good Evening", icon: <Sun className="text-orange-500" /> };
  };
  const { text: greetingText, icon: greetingIcon } = getGreeting();

  if (loading) return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
      <p className="text-slate-400 font-black text-xs uppercase tracking-widest italic">Syncing Farm Data...</p>
    </div>
  );

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-slate-50 text-slate-900 font-sans">
      
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
             <span className="p-2 bg-white rounded-lg shadow-sm">{greetingIcon}</span>
             <p className="text-slate-400 font-bold text-xs uppercase tracking-widest">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
             </p>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">
            {greetingText}, <span className="text-emerald-600 uppercase">{userName}!</span>
          </h1>
        </div>

        <div className="flex items-center gap-4 bg-white p-2 pr-4 rounded-2xl border border-slate-100 shadow-sm">
          <button 
            onClick={() => setShowSettingsModal(true)}
            className="w-10 h-10 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-600 rounded-xl flex items-center justify-center text-slate-500 transition-colors"
          >
            <Settings size={20} />
          </button>
          <div className="hidden sm:block text-right">
            <p className="text-[10px] font-black text-slate-400 uppercase leading-none">Status</p>
            <p className="text-sm font-bold text-slate-700">Active Duty</p>
          </div>
          <button onClick={handleLogout} className="ml-2 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      {/* QUICK ACTIONS */}
      <div className="flex gap-4 mb-10">
          <button onClick={() => setShowBatchModal(true)} className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-5 rounded-[2rem] font-black shadow-lg shadow-emerald-100 flex items-center justify-center gap-2 transition-all active:scale-95">
            <Plus size={20} /> Log Harvest
          </button>
          <button onClick={() => setShowReportModal(true)} className="flex-1 bg-rose-600 hover:bg-rose-700 text-white px-6 py-5 rounded-[2rem] font-black shadow-lg shadow-rose-100 flex items-center justify-center gap-2 transition-all active:scale-95">
            <AlertTriangle size={20} /> Send Report
          </button>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid lg:grid-cols-2 gap-10">
        <section className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 px-2 flex items-center gap-2">
            <ClipboardList size={14} /> My Active Tasks
          </h2>
          <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm divide-y divide-slate-50 overflow-hidden">
             {tasks.length > 0 ? tasks.map(task => (
               <div key={task.id} className="p-6 flex items-center gap-4 hover:bg-slate-50 transition-colors">
                 <Circle className="text-slate-200" size={28} />
                 <div className="flex-1">
                   <h3 className="font-bold text-slate-800">{task.title}</h3>
                   <p className="text-xs text-slate-400 font-medium">{task.category}</p>
                 </div>
               </div>
             )) : <div className="p-10 text-center text-slate-400 font-bold italic text-sm">No tasks assigned.</div>}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
            <Package size={14} /> Recent Activity
          </h2>
          <div className="grid gap-4">
              {batches.length > 0 ? batches.slice(0, 5).map(b => (
                <div key={b.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex justify-between items-center shadow-sm">
                  <div>
                    <h4 className="font-black text-slate-800 uppercase text-sm">{b.crop_name}</h4>
                    <div className="flex items-center gap-3 mt-1">
                       <span className="text-[10px] bg-slate-100 px-2 py-0.5 rounded font-black text-slate-500">{b.quantity_kg} KG</span>
                       <p className="text-[10px] text-slate-400 font-bold uppercase italic">{b.destination}</p>
                    </div>
                  </div>
                  <div className="bg-emerald-50 text-emerald-600 px-3 py-1 rounded-xl text-[10px] font-black uppercase">Stored</div>
                </div>
              )) : <div className="p-10 text-center text-slate-400 font-bold italic text-sm">No recent logs.</div>}
          </div>
        </section>
      </div>

      {/* MODAL: SETTINGS & INSTITUTION CHANGE */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl overflow-y-auto max-h-[90vh]">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Settings className="text-slate-400" /> Account Settings</h2>
              <button onClick={() => setShowSettingsModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
            </div>
            
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">First Name</label>
                  <input placeholder="John" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" value={profileForm.first_name} onChange={(e) => setProfileForm({...profileForm, first_name: e.target.value})} />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Last Name</label>
                  <input placeholder="Doe" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" value={profileForm.last_name} onChange={(e) => setProfileForm({...profileForm, last_name: e.target.value})} />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Phone Contact</label>
                <input placeholder="+254 7XX..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" value={profileForm.phone} onChange={(e) => setProfileForm({...profileForm, phone: e.target.value})} />
              </div>

              {/* INSTITUTION DROPDOWN SELECTION */}
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Primary Institution</label>
                <div className="relative">
                  <select 
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-emerald-500"
                    value={profileForm.associated_institution}
                    onChange={(e) => setProfileForm({...profileForm, associated_institution: e.target.value})}
                  >
                    <option value="">-- Change Institution --</option>
                    {institutions.map(inst => (
                      <option key={inst.id} value={inst.id}>{inst.institution_name || inst.email}</option>
                    ))}
                  </select>
                  <Building2 className="absolute right-4 top-4 text-slate-300" size={18} />
                </div>
              </div>

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2 mt-4">
                <Save size={20} /> Update Personal File
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG HARVEST */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><Box className="text-emerald-500" /> Log Harvest</h2>
              <button onClick={() => setShowBatchModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
            </div>
            
            <form onSubmit={handlePostBatch} className="space-y-4">
              <input required placeholder="Crop Name" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" value={newBatch.crop_name} onChange={(e) => setNewBatch({...newBatch, crop_name: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Weight (KG)" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" value={newBatch.quantity_kg} onChange={(e) => setNewBatch({...newBatch, quantity_kg: e.target.value})} />
                <input required placeholder="Destination" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" value={newBatch.destination} onChange={(e) => setNewBatch({...newBatch, destination: e.target.value})} />
              </div>
              
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Notify Manager:</label>
                <div className="relative">
                  <select 
                    required
                    className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-emerald-500"
                    value={newBatch.recipient}
                    onChange={(e) => setNewBatch({...newBatch, recipient: e.target.value})}
                  >
                    <option value="">Select Correspondent</option>
                    {correspondents.map(c => (
                      <option key={c.id} value={c.id}>{c.email}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              <button type="submit" className="w-full bg-emerald-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2">
                <Check size={20} /> Submit & Notify
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND REPORT */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-md w-full shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black text-slate-800 flex items-center gap-2"><AlertTriangle className="text-rose-500" /> Send Report</h2>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 rounded-full"><X size={24}/></button>
            </div>
            <form onSubmit={handlePostReport} className="space-y-4">
              <input required placeholder="Report Subject" className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm" value={newReport.title} onChange={(e) => setNewReport({...newReport, title: e.target.value})} />
              <textarea required placeholder="Detailed message..." className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm h-32" value={newReport.message} onChange={(e) => setNewReport({...newReport, message: e.target.value})} />
              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-slate-400 ml-1">Send to Correspondent:</label>
                <div className="relative">
                  <select required className="w-full p-4 bg-slate-50 border border-slate-100 rounded-xl font-bold text-sm appearance-none outline-none focus:ring-2 focus:ring-rose-500" value={newReport.recipient} onChange={(e) => setNewReport({...newReport, recipient: e.target.value})}>
                    <option value="">Choose Recipient...</option>
                    {correspondents.map(c => (
                      <option key={c.id} value={c.id}>{c.email}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={18} />
                </div>
              </div>
              <button type="submit" className="w-full bg-rose-600 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-rose-700 transition-all flex items-center justify-center gap-2">
                <Send size={20} /> Submit Official Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmhandDash;