import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Send, X, ClipboardList, Plus, 
  Sun, Sunrise, CloudSun, LogOut, MessageSquare,
  Check, Loader2, Settings, Calendar, Inbox, RefreshCcw
} from 'lucide-react';

// --- CONFIGURATION ---
const API_ROOT = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, "");
const BASE_URL = `${API_ROOT}/api/v1`;

function FarmhandDash() {
  const navigate = useNavigate();
  
  // --- 1. STATE MANAGEMENT ---
  const [tasks, setTasks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [growers, setGrowers] = useState([]); 
  const [correspondents, setCorrespondents] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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

  // --- 2. AUTH & LOGOUT ---
  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate('/login'); 
  }, [navigate]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      handleLogout();
      return null;
    }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [handleLogout]);

  // --- 3. DATA FETCHING ---
  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    else setRefreshing(true);

    const config = getAuthHeaders();
    if (!config) return;

    try {
      const userRes = await axios.get(`${BASE_URL}/auth/user/`, config); 
      const u = userRes.data;
      
      setUserId(u.id);
      setUserName(u.first_name || u.email.split('@')[0]);
      setProfileForm({
        first_name: u.first_name || '',
        last_name: u.last_name || '',
        phone: u.phone || '',
        associated_institution: u.associated_institution || ''
      });

      const usersRes = await axios.get(`${BASE_URL}/users/`, config);
      const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
      
      setCorrespondents(allUsers.filter(u => u.role === 'farmcorrespondent'));
      setGrowers(allUsers.filter(u => u.role === 'user')); 

      const [batchRes, taskRes] = await Promise.all([
        axios.get(`${BASE_URL}/batches/`, config),
        axios.get(`${BASE_URL}/management/tasks/`, config)
      ]);
      
      setBatches(Array.isArray(batchRes.data) ? batchRes.data : []);
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);

    } catch (err) {
      console.error("Sync error:", err);
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthHeaders, handleLogout]);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(() => fetchData(true), 60000); // Auto-sync every minute
    return () => clearInterval(interval);
  }, [fetchData]);

  // --- 4. CHAT LOGIC ---
  const fetchMessages = useCallback(async (otherUserId) => {
    const config = getAuthHeaders();
    if (!config) return;
    try {
      const res = await axios.get(`${BASE_URL}/messages/chat/?other_user_id=${otherUserId}`, config);
      setMessages(res.data);
    } catch (err) { console.error("Chat sync error:", err); }
  }, [getAuthHeaders]);

  useEffect(() => {
    let interval;
    if (activeChat) {
      fetchMessages(activeChat.id);
      interval = setInterval(() => fetchMessages(activeChat.id), 3000);
    }
    return () => clearInterval(interval);
  }, [activeChat, fetchMessages]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      const res = await axios.post(`${BASE_URL}/messages/chat/`, {
        receiver: activeChat.id,
        content: newMessage
      }, getAuthHeaders());
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) { alert("Message failed to send."); }
  };

  // --- 5. ACTION HANDLERS ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await axios.patch(`${BASE_URL}/auth/user/update/`, profileForm, getAuthHeaders());
      setShowSettingsModal(false);
      fetchData(true);
      alert("Profile updated! 🌾");
    } catch (err) { alert("Update failed. Please check your inputs."); }
  };

  const handlePostBatch = async (e) => {
    e.preventDefault();
    try {
      const config = getAuthHeaders();
      const batchRes = await axios.post(`${BASE_URL}/batches/`, {
        ...newBatch,
        quantity_kg: parseFloat(newBatch.quantity_kg),
      }, config);
      
      if (newBatch.recipient) {
        await axios.post(`${BASE_URL}/management/reports/`, {
          title: `Harvest Log: ${newBatch.crop_name}`,
          message: `New harvest logged: ${newBatch.quantity_kg}kg.`,
          recipient: parseInt(newBatch.recipient),
          batch: batchRes.data.id,
          category: 'Harvest'
        }, config);
      }

      setShowBatchModal(false);
      setNewBatch({ 
        crop_name: '', variety: '', quantity_kg: '', destination: '', 
        planted_date: new Date().toISOString().split('T')[0], 
        harvest_date: new Date().toISOString().split('T')[0], 
        recipient: '' 
      });
      fetchData(true);
    } catch (err) { alert("Batch Error: Ensure all fields are filled."); }
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
        <p className="text-emerald-700 mt-4 text-[10px] font-black tracking-widest uppercase">Syncing field data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FBFA] text-stone-900 pb-20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl shadow-emerald-200/50 text-white">👨‍🌾</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {greetingIcon}
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                  {refreshing && <RefreshCcw size={10} className="inline ml-2 animate-spin text-emerald-300" />}
                </p>
              </div>
              <h1 className="text-4xl font-black text-stone-900 tracking-tighter">
                {greetingText}, <span className="text-emerald-600">{userName}</span>
              </h1>
            </div>
          </div>
          <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-stone-100">
            <button onClick={() => setShowSettingsModal(true)} className="p-3 hover:bg-stone-50 text-stone-600 hover:text-emerald-600 rounded-xl transition-all"><Settings size={20} /></button>
            <button onClick={handleLogout} className="p-3 hover:bg-rose-50 text-stone-400 hover:text-rose-600 rounded-xl transition-all"><LogOut size={20} /></button>
          </div>
        </header>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button onClick={() => setShowBatchModal(true)} className="group flex items-center justify-between bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white p-8 rounded-[2.5rem] font-black text-2xl shadow-xl shadow-stone-200/50 transition-all active:scale-95">
            Log Harvest <Plus size={32} className="group-hover:rotate-90 transition-transform bg-emerald-50 text-emerald-600 p-1.5 rounded-full group-hover:bg-emerald-500 group-hover:text-white" />
          </button>
          <button onClick={() => setShowReportModal(true)} className="group flex items-center justify-between bg-white hover:bg-rose-600 text-rose-600 hover:text-white p-8 rounded-[2.5rem] font-black text-2xl shadow-xl shadow-stone-200/50 transition-all active:scale-95">
            Send Report <AlertTriangle size={32} className="group-hover:scale-110 transition-transform" />
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* MESSAGES */}
          <section>
            <h2 className="uppercase text-[10px] font-black tracking-[0.2em] text-emerald-700/50 flex items-center gap-2 mb-6"><Inbox size={14} /> Grower Network</h2>
            <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/40 overflow-hidden divide-y divide-stone-50">
              {growers.map(grower => (
                <div key={grower.id} className="p-6 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-stone-100 text-stone-400 rounded-2xl flex items-center justify-center font-black">
                      {(grower.email || 'U')[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-black text-stone-800">{(grower.email || '').split('@')[0]}</p>
                      <p className="text-[10px] text-emerald-600 font-black uppercase tracking-tighter">Direct Chat</p>
                    </div>
                  </div>
                  <button onClick={() => { setActiveChat(grower); setMessages([]); }} className="p-4 bg-stone-900 text-white rounded-2xl hover:bg-emerald-600 transition shadow-lg active:scale-90">
                    <MessageSquare size={18} />
                  </button>
                </div>
              ))}
              {growers.length === 0 && <p className="p-10 text-center text-xs text-stone-400 font-bold uppercase">No active growers found</p>}
            </div>
          </section>

          {/* TASKS */}
          <section>
            <h2 className="uppercase text-[10px] font-black tracking-[0.2em] text-emerald-700/50 flex items-center gap-2 mb-6"><ClipboardList size={14} /> Assigned Duties</h2>
            <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-xl shadow-stone-200/40 divide-y divide-stone-50 overflow-hidden">
              {tasks.length > 0 ? tasks.map(task => (
                <div key={task.id} className="p-6 flex items-center gap-4 hover:bg-emerald-50/30 transition-colors group">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <Check size={16} />
                  </div>
                  <div>
                    <h3 className="font-black text-stone-800 leading-tight">{task.title}</h3>
                    <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest mt-1">{task.category}</p>
                  </div>
                </div>
              )) : <div className="p-12 text-center text-stone-400 font-black uppercase text-[10px] tracking-widest italic">All clear for today</div>}
            </div>
          </section>
        </div>
      </div>

      {/* CHAT OVERLAY */}
      {activeChat && (
        <div className="fixed bottom-8 right-8 w-96 bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 z-[110] flex flex-col overflow-hidden animate-in slide-in-from-bottom-10">
          <div className="bg-stone-900 text-white p-6 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-500 rounded-xl flex items-center justify-center text-sm font-black text-white shadow-lg">
                {(activeChat.email || 'U')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-black text-sm">{(activeChat.email || '').split('@')[0]}</p>
                <p className="text-[9px] text-emerald-400 font-black uppercase tracking-widest">Online</p>
              </div>
            </div>
            <button onClick={() => setActiveChat(null)} className="p-2 hover:bg-white/10 rounded-full transition-colors text-stone-400 hover:text-white"><X size={20} /></button>
          </div>
          <div className="h-80 overflow-y-auto p-6 bg-stone-50/50 flex flex-col gap-4">
            {messages.map(msg => (
              <div key={msg.id} className={`max-w-[80%] p-4 rounded-2xl text-xs font-bold leading-relaxed shadow-sm ${msg.sender === userId ? 'bg-emerald-600 text-white self-end rounded-tr-none' : 'bg-white text-stone-800 self-start rounded-tl-none border border-stone-100'}`}>
                {msg.content}
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>
          <form onSubmit={handleSendMessage} className="p-5 border-t border-stone-100 flex gap-3 bg-white">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-stone-50 border border-stone-100 rounded-2xl px-5 py-3 text-xs font-bold outline-none focus:ring-2 focus:ring-emerald-500 transition-all" />
            <button type="submit" className="bg-emerald-600 text-white p-3 rounded-2xl hover:bg-stone-900 transition shadow-lg active:scale-95"><Send size={18} /></button>
          </form>
        </div>
      )}

      {/* MODALS (Simplified for brevity but standardized) */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Log Harvest</h2>
              <button onClick={() => setShowBatchModal(false)} className="p-2 hover:bg-stone-100 rounded-full transition-colors"><X size={24} /></button>
            </div>
            <form onSubmit={handlePostBatch} className="space-y-4">
              <input required placeholder="Crop Name (e.g., Arabica Coffee)" value={newBatch.crop_name} onChange={e => setNewBatch({...newBatch, crop_name: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100 outline-none focus:ring-2 focus:ring-emerald-500" />
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Weight (KG)" value={newBatch.quantity_kg} onChange={e => setNewBatch({...newBatch, quantity_kg: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100 outline-none focus:ring-2 focus:ring-emerald-500" />
                <input required placeholder="Storage ID" value={newBatch.destination} onChange={e => setNewBatch({...newBatch, destination: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100 outline-none focus:ring-2 focus:ring-emerald-500" />
              </div>
              <select required value={newBatch.recipient} onChange={e => setNewBatch({...newBatch, recipient: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100 outline-none focus:ring-2 focus:ring-emerald-500">
                <option value="">Select Manager</option>
                {correspondents.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
              </select>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl shadow-emerald-200/50 mt-6 active:scale-95 transition-transform">Submit Harvest Batch</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmhandDash;