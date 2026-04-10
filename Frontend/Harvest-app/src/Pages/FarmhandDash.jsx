import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Send, X, ClipboardList, Plus, 
  Sun, Sunrise, CloudSun, LogOut, MessageSquare,
  Check, Loader2, Settings, Calendar, Inbox
} from 'lucide-react';

function FarmhandDash() {
  const navigate = useNavigate();
  
  // --- 1. STATE MANAGEMENT ---
  const [tasks, setTasks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [correspondents, setCorrespondents] = useState([]); 
  const [growers, setGrowers] = useState([]); 
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Farmer");
  const [userId, setUserId] = useState(null);
  
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

  const [showReportModal, setShowReportModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  const [newReport, setNewReport] = useState({ 
    title: '', message: '', category: 'Safety', recipient: '', batch: '' 
  });
  
  const [newBatch, setNewBatch] = useState({
    crop_name: '', variety: '', quantity_kg: '', destination: '',
    planted_date: new Date().toISOString().split('T')[0],
    harvest_date: new Date().toISOString().split('T')[0],
    recipient: '' 
  });

  const [profileForm, setProfileForm] = useState({
    first_name: '', last_name: '', phone: '', associated_institution: ''
  });

  // --- 2. API CONFIG ---
  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login'); 
  };

  // --- 3. DATA FETCHING ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const userRes = await api.get('/auth/user/'); 
      const u = userRes.data;
      setUserId(u.id);
      setUserName(u.first_name || u.email.split('@')[0]);
      setProfileForm({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        phone: u.phone || '',
        associated_institution: u.associated_institution || ''
      });

      const usersRes = await api.get('/users/');
      setInstitutions(usersRes.data.filter(u => u.role === 'farminstitution'));
      setCorrespondents(usersRes.data.filter(u => u.role === 'farmcorrespondent'));
      setGrowers(usersRes.data.filter(u => u.role === 'user')); 

      const [batchRes, taskRes] = await Promise.all([
        api.get('/batches/'),
        api.get('/management/tasks/')
      ]);
      setBatches(batchRes.data);
      setTasks(taskRes.data);

    } catch (err) {
      if (err.response?.status === 401) handleLogout();
      console.error("Sync error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  // --- 4. CHAT LOGIC ---
  const fetchMessages = async (otherUserId) => {
    try {
      const res = await api.get(`/messages/chat/?other_user_id=${otherUserId}`);
      setMessages(res.data);
    } catch (err) { console.error("Chat sync error:", err); }
  };

  useEffect(() => {
    let interval;
    if (activeChat) {
      fetchMessages(activeChat.id);
      interval = setInterval(() => fetchMessages(activeChat.id), 3000);
    }
    return () => clearInterval(interval);
  }, [activeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      const res = await api.post('/messages/chat/', {
        receiver: activeChat.id,
        content: newMessage
      });
      setMessages([...messages, res.data]);
      setNewMessage('');
    } catch (err) { alert("Message failed."); }
  };

  // --- 5. ACTION HANDLERS ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/auth/user/update/', profileForm);
      setShowSettingsModal(false);
      fetchData();
      alert("Profile updated! 🌾");
    } catch (err) { alert("Update failed."); }
  };

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
          message: `New harvest logged: ${newBatch.quantity_kg}kg.`,
          recipient: parseInt(newBatch.recipient),
          batch: batchRes.data.id,
          category: 'Harvest'
        });
      }

      setShowBatchModal(false);
      setNewBatch({ 
        crop_name: '', variety: '', quantity_kg: '', destination: '', 
        planted_date: new Date().toISOString().split('T')[0], 
        harvest_date: new Date().toISOString().split('T')[0], 
        recipient: '' 
      });
      fetchData();
    } catch (err) { alert("Batch Error: Check fields."); }
  };

  const handlePostReport = async (e) => {
    e.preventDefault();
    try {
      await api.post('/management/reports/', {
        ...newReport,
        recipient: parseInt(newReport.recipient)
      });
      setShowReportModal(false);
      setNewReport({ title: '', message: '', category: 'Safety', recipient: '', batch: '' });
      fetchData();
    } catch (err) { alert("Report Error."); }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: <Sunrise className="text-amber-500" size={18} /> };
    if (hour < 17) return { text: "Good Afternoon", icon: <CloudSun className="text-orange-400" size={18} /> };
    return { text: "Good Evening", icon: <Sun className="text-orange-500" size={18} /> };
  };
  const { text: greetingText, icon: greetingIcon } = getGreeting();

  if (loading) return (
    <div className="min-h-screen bg-emerald-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-emerald-700 mt-4 text-xs font-bold tracking-widest uppercase">Syncing field data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 text-stone-900 pb-20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-lg text-white">👨‍🌾</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {greetingIcon}
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <h1 className="text-3xl font-black text-stone-900">
                {greetingText}, <span className="text-emerald-600">{userName}</span>
              </h1>
            </div>
          </div>
          <div className="flex gap-2 bg-white/50 p-1.5 rounded-2xl border border-white">
            <button onClick={() => setShowSettingsModal(true)} className="p-3 hover:bg-white text-stone-600 hover:text-emerald-600 rounded-xl transition-all"><Settings size={20} /></button>
            <button onClick={handleLogout} className="p-3 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-xl transition-all"><LogOut size={20} /></button>
          </div>
        </header>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <button onClick={() => setShowBatchModal(true)} className="group flex items-center justify-center gap-4 bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white p-8 rounded-[2.5rem] font-black text-xl shadow-xl transition-all active:scale-95">
            <Plus size={28} className="group-hover:rotate-90 transition-transform" /> Log Harvest
          </button>
          <button onClick={() => setShowReportModal(true)} className="flex items-center justify-center gap-4 bg-white hover:bg-rose-600 text-rose-600 hover:text-white p-8 rounded-[2.5rem] font-black text-xl shadow-xl transition-all active:scale-95">
            <AlertTriangle size={28} /> Send Report
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* MESSAGES */}
          <section>
            <h2 className="uppercase text-[10px] font-black tracking-[0.2em] text-emerald-700/50 flex items-center gap-2 mb-6"><Inbox size={14} /> Grower Requests</h2>
            <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-white shadow-xl overflow-hidden">
              {growers.map(grower => (
                <div key={grower.id} className="p-6 flex items-center justify-between border-b border-stone-50 last:border-0 hover:bg-white transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center font-black">{grower.email[0].toUpperCase()}</div>
                    <div>
                      <p className="font-bold text-stone-800">{grower.email.split('@')[0]}</p>
                      <p className="text-[10px] text-emerald-600 font-black uppercase">Message Request</p>
                    </div>
                  </div>
                  <button onClick={() => { setActiveChat(grower); setMessages([]); }} className="p-3 bg-stone-900 text-white rounded-xl hover:bg-emerald-600 transition shadow-md"><MessageSquare size={18} /></button>
                </div>
              ))}
            </div>
          </section>

          {/* TASKS */}
          <section>
            <h2 className="uppercase text-[10px] font-black tracking-[0.2em] text-emerald-700/50 flex items-center gap-2 mb-6"><ClipboardList size={14} /> Assigned Tasks</h2>
            <div className="bg-white/70 backdrop-blur-md rounded-[2rem] border border-white shadow-xl divide-y divide-stone-50 overflow-hidden">
              {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} className="p-6 flex items-center gap-4 hover:bg-white transition-colors">
                  <div className="w-6 h-6 rounded-full border-2 border-emerald-200 flex items-center justify-center"><Check size={12} className="text-emerald-200" /></div>
                  <div>
                    <h3 className="font-bold text-stone-800">{task.title}</h3>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">{task.category}</p>
                  </div>
                </div>
              )) : <div className="p-12 text-center text-stone-400 font-medium text-sm italic">No tasks today</div>}
            </div>
          </section>
        </div>
      </div>

      {/* CHAT OVERLAY */}
      {activeChat && (
        <div className="fixed bottom-8 right-8 w-80 bg-white rounded-[2rem] shadow-2xl border border-stone-100 z-[110] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-stone-900 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center text-xs font-black">{activeChat.email[0].toUpperCase()}</div>
              <p className="font-bold text-sm">{activeChat.email.split('@')[0]}</p>
            </div>
            <button onClick={() => setActiveChat(null)} className="text-stone-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="h-64 overflow-y-auto p-4 bg-stone-50/50 flex flex-col gap-3">
            {messages.map(msg => (
              <div key={msg.id} className={`max-w-[85%] p-3 rounded-2xl text-[11px] font-medium ${msg.sender === userId ? 'bg-emerald-600 text-white self-end rounded-tr-none' : 'bg-white text-stone-800 self-start rounded-tl-none border border-stone-100 shadow-sm'}`}>
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-white">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Reply..." className="flex-1 bg-stone-100 rounded-xl px-4 py-2 text-sm outline-none" />
            <button type="submit" className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-stone-900 transition"><Send size={16} /></button>
          </form>
        </div>
      )}

      {/* MODALS (Simplified for brevity, following the style of Batch) */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-stone-900/60 backdrop-blur-md z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-black">Log Harvest</h2>
              <button onClick={() => setShowBatchModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handlePostBatch} className="space-y-4">
              <input required placeholder="Crop Name" value={newBatch.crop_name} onChange={e => setNewBatch({...newBatch, crop_name: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Weight (KG)" value={newBatch.quantity_kg} onChange={e => setNewBatch({...newBatch, quantity_kg: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold" />
                <input required placeholder="Storage" value={newBatch.destination} onChange={e => setNewBatch({...newBatch, destination: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-stone-400 ml-2">PLANTED</label>
                  <input type="date" value={newBatch.planted_date} onChange={e => setNewBatch({...newBatch, planted_date: e.target.value})} className="w-full px-4 py-3 bg-stone-50 rounded-xl text-xs font-bold" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-stone-400 ml-2">HARVESTED</label>
                  <input type="date" value={newBatch.harvest_date} onChange={e => setNewBatch({...newBatch, harvest_date: e.target.value})} className="w-full px-4 py-3 bg-stone-50 rounded-xl text-xs font-bold" />
                </div>
              </div>
              <select required value={newBatch.recipient} onChange={e => setNewBatch({...newBatch, recipient: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold">
                <option value="">Select Manager...</option>
                {correspondents.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
              </select>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-lg mt-4">Submit Batch</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmhandDash;