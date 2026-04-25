import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import toast, { Toaster } from 'react-hot-toast';
import { 
  AlertTriangle, Send, X, ClipboardList, Plus, 
  Sun, Sunrise, CloudSun, LogOut, MessageSquare,
  Check, Loader2, Settings, RefreshCcw,
  MapPin, Sprout, User, Inbox, Calendar
} from 'lucide-react';

// --- CONFIGURATION ---
const API_ROOT = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, "");
const BASE_URL = `${API_ROOT}/api/v1`;

function FarmhandDash() {
  const navigate = useNavigate();
  const chatEndRef = useRef(null);
  
  // --- 1. STATE MANAGEMENT ---
  const [tasks, setTasks] = useState([]);
  const [correspondents, setCorrespondents] = useState([]); 
  const [growers, setGrowers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Farmer");
  const [profile, setProfile] = useState({
    email: "", location: "", farm_name: "", crops_managed: ""
  });

  // Modals & Chat State
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBatchModal, setShowBatchModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState("");

  // Form States
  const [newReport, setNewReport] = useState({ 
    title: '', message: '', category: 'General', recipient: '', priority: 'normal'
  });
  
  const [newBatch, setNewBatch] = useState({
    crop_name: '', variety: '', quantity_kg: '', destination: '',
    planted_date: new Date().toISOString().split('T')[0],
    harvest_date: new Date().toISOString().split('T')[0],
    recipient: '' 
  });

  const [profileForm, setProfileForm] = useState({
    first_name: '', last_name: '', phone: '', location: '', farm_name: '', crops_managed: ''
  });

  // --- 2. CORE LOGIC (Auth & Fetch) ---
  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate('/login'); 
    toast.success("Logged out successfully");
  }, [navigate]);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    if (!token) { handleLogout(); return null; }
    return { headers: { Authorization: `Bearer ${token}` } };
  }, [handleLogout]);

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    const config = getAuthHeaders();
    if (!config) return;

    try {
      const userRes = await axios.get(`${BASE_URL}/auth/user/`, config); 
      const u = userRes.data;
      setUserName(u.first_name || u.email.split('@')[0]);
      setProfile({
        email: u.email,
        location: u.location || "Not set",
        farm_name: u.farm_name || "Unassigned",
        crops_managed: u.crops_managed || "General"
      });
      // RECOMMENDED CHANGE: Keep Form and Profile state in sync
      setProfileForm({ ...u });

      const [usersRes, taskRes] = await Promise.all([
        axios.get(`${BASE_URL}/users/`, config),
        axios.get(`${BASE_URL}/management/tasks/`, config)
      ]);
      
      const allUsers = Array.isArray(usersRes.data) ? usersRes.data : [];
      setCorrespondents(allUsers.filter(u => u.role === 'farmcorrespondent' || u.role === 'admin'));
      setGrowers(allUsers.filter(u => u.role === 'user'));
      setTasks(Array.isArray(taskRes.data) ? taskRes.data : []);

    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleLogout]);

  useEffect(() => { 
    fetchData(); 
    const interval = setInterval(() => fetchData(true), 60000);
    return () => clearInterval(interval);
  }, [fetchData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- 3. ACTION HANDLERS ---

  // Messaging Logic
  const handleStartChat = (user) => {
    setActiveChat(user);
    setMessages([]); // Fetch history logic would go here
    toast.success(`Encrypted channel with ${user.email.split('@')[0]}`);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim()) return;
    try {
      await axios.post(`${BASE_URL}/messages/`, {
        receiver: activeChat.id,
        content: messageText
      }, getAuthHeaders());
      setMessages([...messages, { id: Date.now(), sender: 'me', content: messageText }]);
      setMessageText("");
    } catch (err) {
      toast.error("Message delivery failed.");
    }
  };

  // Harvest Logic
  const handlePostBatch = async (e) => {
    e.preventDefault();
    const config = getAuthHeaders();
    const loadId = toast.loading("Logging harvest batch...");
    try {
      const batchRes = await axios.post(`${BASE_URL}/batches/`, {
        ...newBatch,
        quantity_kg: parseFloat(newBatch.quantity_kg)
      }, config);
      
      if (newBatch.recipient) {
        await axios.post(`${BASE_URL}/management/reports/`, {
          title: `Harvest Log: ${newBatch.crop_name}`,
          message: `Batch recorded: ${newBatch.quantity_kg}kg of ${newBatch.variety}. Location: ${newBatch.destination}`,
          recipient: parseInt(newBatch.recipient),
          batch: batchRes.data.id,
          category: 'Harvest'
        }, config);
      }
      setShowBatchModal(false);
      toast.success("Harvest Batch & Report Dispatched! 🌾", { id: loadId });
      fetchData(true);
    } catch (err) { toast.error("Check weight and variety formats.", { id: loadId }); }
  };

  // Report Logic
  const handleSendReport = async (e) => {
    e.preventDefault();
    const loadId = toast.loading("Dispatching field report...");
    try {
      await axios.post(`${BASE_URL}/management/reports/`, {
        ...newReport,
        recipient: parseInt(newReport.recipient)
      }, getAuthHeaders());
      setShowReportModal(false);
      toast.success("Field Report Dispatched! 📡", { id: loadId });
    } catch (err) { toast.error("Select a recipient correspondent.", { id: loadId }); }
  };

  // Identity Logic
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    const loadId = toast.loading("Saving Field Identity...");
    try {
      await axios.patch(`${BASE_URL}/auth/user/`, profileForm, getAuthHeaders());
      setProfile({ ...profile, ...profileForm });
      setUserName(profileForm.first_name);
      setShowSettingsModal(false);
      toast.success("Identity Records Updated!", { id: loadId });
    } catch (err) { toast.error("Update failed.", { id: loadId }); }
  };

  // --- 4. UI COMPONENTS ---
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: <Sunrise className="text-amber-500" size={18} /> };
    if (hour < 17) return { text: "Good Afternoon", icon: <CloudSun className="text-orange-400" size={18} /> };
    return { text: "Good Evening", icon: <Sun className="text-orange-500" size={18} /> };
  };
  const { text: greetingText, icon: greetingIcon } = getGreeting();

  if (loading) return <div className="min-h-screen bg-emerald-50 flex items-center justify-center"><Loader2 className="animate-spin text-emerald-600" size={48} /></div>;

  return (
    <div className="min-h-screen bg-[#F9FBFA] text-stone-900 pb-20 font-sans">
      <Toaster position="top-right" />
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-xl text-white">👨‍🌾</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                {greetingIcon}
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <h1 className="text-4xl font-black text-stone-900 tracking-tighter">{greetingText}, <span className="text-emerald-600">{userName}</span></h1>
            </div>
          </div>
          <div className="flex gap-2 bg-white p-2 rounded-2xl shadow-sm border border-stone-100">
            <button onClick={() => setShowSettingsModal(true)} className="p-3 hover:bg-stone-50 text-stone-600 rounded-xl transition-all"><Settings size={20} /></button>
            <button onClick={handleLogout} className="p-3 hover:bg-rose-50 text-rose-600 rounded-xl transition-all"><LogOut size={20} /></button>
          </div>
        </header>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          <button onClick={() => setShowBatchModal(true)} className="group flex items-center justify-between bg-white hover:bg-emerald-600 text-emerald-600 hover:text-white p-8 rounded-[2.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">
            Log Harvest <Plus size={32} />
          </button>
          <button onClick={() => setShowReportModal(true)} className="group flex items-center justify-between bg-white hover:bg-rose-600 text-rose-600 hover:text-white p-8 rounded-[2.5rem] font-black text-2xl shadow-xl transition-all active:scale-95">
            Send Report <AlertTriangle size={32} />
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-10">
          {/* PROFILE SUMMARY */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="uppercase text-[10px] font-black tracking-widest text-emerald-700/50 flex items-center gap-2"><User size={14} /> Field Identity</h2>
            <div className="bg-white rounded-[2.5rem] p-8 border border-stone-100 shadow-xl space-y-6">
              <div>
                <span className="text-[9px] font-black uppercase text-stone-400">Farm Name</span>
                <p className="font-black text-lg text-emerald-700">{profile.farm_name}</p>
              </div>
              <div>
                <span className="text-[9px] font-black uppercase text-stone-400">Location</span>
                <p className="font-bold text-sm text-stone-600">{profile.location}</p>
              </div>
              <div className="pt-4 border-t border-stone-50">
                <span className="text-[9px] font-black uppercase text-stone-400 block mb-2">Managed Crops</span>
                <div className="flex flex-wrap gap-2">
                  {profile.crops_managed.split(',').map((c, i) => (
                    <span key={i} className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-1 rounded-lg uppercase">{c.trim()}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* TASKS & NETWORK */}
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-8">
            <section>
              <h2 className="uppercase text-[10px] font-black tracking-widest text-emerald-700/50 flex items-center gap-2 mb-6"><Inbox size={14} /> Growers Network</h2>
              <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-xl divide-y divide-stone-50 overflow-hidden">
                {growers.map(g => (
                  <div key={g.id} className="p-6 flex items-center justify-between hover:bg-emerald-50/30 transition-colors">
                    <span className="font-black text-stone-800 text-sm">{g.email.split('@')[0]}</span>
                    <button onClick={() => handleStartChat(g)} className="p-2 bg-stone-900 text-white rounded-lg transition-colors active:scale-90"><MessageSquare size={14} /></button>
                  </div>
                ))}
              </div>
            </section>
            <section>
              <h2 className="uppercase text-[10px] font-black tracking-widest text-emerald-700/50 flex items-center gap-2 mb-6"><ClipboardList size={14} /> Duties</h2>
              <div className="bg-white rounded-[2.5rem] border border-stone-100 shadow-xl divide-y divide-stone-50 overflow-hidden">
                {tasks.length > 0 ? tasks.map(t => (
                  <div key={t.id} className="p-6 flex items-center gap-3">
                    <Check size={14} className="text-emerald-500" />
                    <span className="font-black text-stone-800 text-sm">{t.title}</span>
                  </div>
                )) : <p className="p-10 text-center text-[10px] uppercase font-black text-stone-400">All duties complete</p>}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* CHAT INTERFACE */}
      {activeChat && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[300] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md h-[70vh] rounded-[3rem] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b flex justify-between items-center bg-stone-50">
              <h2 className="font-black text-xl tracking-tighter">Chat: {activeChat.email.split('@')[0]}</h2>
              <button onClick={() => setActiveChat(null)} className="p-2 bg-stone-200 rounded-full"><X size={18}/></button>
            </div>
            <div className="flex-1 p-6 overflow-y-auto space-y-4 bg-stone-50/50">
              {messages.map(m => (
                <div key={m.id} className={`flex ${m.sender === 'me' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] p-4 rounded-2xl font-bold text-sm ${m.sender === 'me' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border text-stone-800'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-6 border-t bg-white flex gap-2">
              <input value={messageText} onChange={e => setMessageText(e.target.value)} placeholder="Type a message..." className="flex-1 bg-stone-50 border rounded-2xl px-6 font-bold outline-none focus:ring-2 focus:ring-emerald-500" />
              <button type="submit" className="p-4 bg-emerald-600 text-white rounded-2xl shadow-xl active:scale-95"><Send size={18} /></button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: LOG HARVEST */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-lg rounded-[3rem] p-10 shadow-2xl animate-in zoom-in-95 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Log Harvest</h2>
              <button onClick={() => setShowBatchModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handlePostBatch} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Crop" value={newBatch.crop_name} onChange={e => setNewBatch({...newBatch, crop_name: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100" />
                <input required placeholder="Variety" value={newBatch.variety} onChange={e => setNewBatch({...newBatch, variety: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input required type="number" placeholder="Weight KG" value={newBatch.quantity_kg} onChange={e => setNewBatch({...newBatch, quantity_kg: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100" />
                <input required placeholder="Destination" value={newBatch.destination} onChange={e => setNewBatch({...newBatch, destination: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100" />
              </div>
              <select required value={newBatch.recipient} onChange={e => setNewBatch({...newBatch, recipient: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100">
                <option value="">Recipient Correspondent</option>
                {correspondents.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
              </select>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-black rounded-2xl shadow-xl mt-4">Dispatch Harvest Batch</button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SEND REPORT */}
      {showReportModal && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Field Report</h2>
              <button onClick={() => setShowReportModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleSendReport} className="space-y-4">
              <input required placeholder="Report Title" value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100 focus:ring-2 focus:ring-rose-500 outline-none" />
              <textarea required placeholder="Observations..." rows="4" value={newReport.message} onChange={e => setNewReport({...newReport, message: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100 resize-none" />
              <select required value={newReport.recipient} onChange={e => setNewReport({...newReport, recipient: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100">
                <option value="">Recipient Correspondent</option>
                {correspondents.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
              </select>
              <button type="submit" className="w-full py-5 bg-rose-600 text-white font-black rounded-2xl shadow-xl mt-4 flex items-center justify-center gap-2">
                <Send size={18} /> Dispatch Report
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: SETTINGS */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[200] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[3rem] p-10 shadow-2xl max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-8">
              <h2 className="text-3xl font-black tracking-tighter">Settings</h2>
              <button onClick={() => setShowSettingsModal(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <input placeholder="First Name" value={profileForm.first_name} onChange={e => setProfileForm({...profileForm, first_name: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100" />
              <input placeholder="Farm Name" value={profileForm.farm_name} onChange={e => setProfileForm({...profileForm, farm_name: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100" />
              <input placeholder="Location" value={profileForm.location} onChange={e => setProfileForm({...profileForm, location: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100" />
              <textarea placeholder="Crops (Comma separated)" value={profileForm.crops_managed} onChange={e => setProfileForm({...profileForm, crops_managed: e.target.value})} className="w-full px-6 py-4 bg-stone-50 rounded-2xl font-bold border border-stone-100" />
              <button type="submit" className="w-full py-5 bg-stone-900 text-white font-black rounded-2xl shadow-xl mt-4">Save Field Identity</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmhandDash;