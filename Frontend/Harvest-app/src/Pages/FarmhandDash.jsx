import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, Send, X, Circle, ClipboardList, Package, Box, Plus, 
  Sun, Moon, Sunrise, CloudSun, LogOut, User as UserIcon,
  Check, Loader2, ChevronDown, Settings, Save, Building2, MessageSquare,
  Inbox, UserCheck
} from 'lucide-react';

function FarmhandDash() {
  const navigate = useNavigate();
  
  // --- 1. STATE MANAGEMENT ---
  const [tasks, setTasks] = useState([]);
  const [batches, setBatches] = useState([]);
  const [correspondents, setCorrespondents] = useState([]); 
  const [growers, setGrowers] = useState([]); // <--- NEW: For messages from Growers
  const [peers, setPeers] = useState([]); 
  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState("Farmer");
  const [userId, setUserId] = useState(null);
  
  // Chat Specific State
  const [activeChat, setActiveChat] = useState(null); 
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null);

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
    associated_institution: ''
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

      const instRes = await api.get('/users/');
      setInstitutions(instRes.data.filter(user => user.role === 'farminstitution'));
      setCorrespondents(instRes.data.filter(user => user.role === 'farmcorrespondent'));
      setGrowers(instRes.data.filter(user => user.role === 'user')); // <--- FETCH GROWERS
      setPeers(instRes.data.filter(user => user.role === 'farmhand'));

      const batchRes = await api.get('/batches/');
      setBatches(batchRes.data);
      
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

  // --- 4. CHAT LOGIC ---
  const fetchMessages = async (otherUserId) => {
    try {
      const res = await api.get(`/messages/chat/?other_user_id=${otherUserId}`);
      setMessages(res.data);
    } catch (err) {
      console.error("Chat sync error:", err);
    }
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
    } catch (err) {
      alert("Message failed to send.");
    }
  };

  // --- 5. ACTION HANDLERS ---
  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      await api.patch('/auth/user/update/', profileForm);
      setShowSettingsModal(false);
      fetchData();
      alert("Profile updated successfully! 🌾");
    } catch (err) {
      alert("Update failed.");
    }
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

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: <Sunrise className="text-amber-500" size={18} /> };
    if (hour < 17) return { text: "Good Afternoon", icon: <CloudSun className="text-orange-400" size={18} /> };
    return { text: "Good Evening", icon: <Sun className="text-orange-500" size={18} /> };
  };
  const { text: greetingText, icon: greetingIcon } = getGreeting();

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-emerald-700 mt-6 text-sm font-semibold">Syncing field data...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 text-stone-900 font-sans pb-20">
      <div className="max-w-5xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-2xl shadow-inner">👷‍♂️</div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                {greetingIcon}
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-700">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-emerald-900">
                {greetingText}, <span className="text-amber-600">{userName}!</span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-3xl border border-emerald-100 shadow-sm">
            <button 
              onClick={() => setShowSettingsModal(true)}
              className="flex items-center gap-2 px-5 py-3 hover:bg-emerald-50 text-emerald-700 font-semibold rounded-2xl transition-all"
            >
              <Settings size={18} /> Settings
            </button>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-2 px-5 py-3 text-rose-600 hover:bg-rose-50 rounded-2xl transition-all"
            >
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 gap-6 mb-12">
          <button 
            onClick={() => setShowBatchModal(true)} 
            className="flex items-center justify-center gap-3 bg-emerald-600 hover:bg-emerald-700 text-white py-6 rounded-3xl font-bold text-xl shadow-xl transition-all active:scale-95"
          >
            <Plus size={26} /> Log Harvest
          </button>
          <button 
            onClick={() => setShowReportModal(true)} 
            className="flex items-center justify-center gap-3 bg-rose-600 hover:bg-rose-700 text-white py-6 rounded-3xl font-bold text-xl shadow-xl transition-all active:scale-95"
          >
            <AlertTriangle size={26} /> Send Report
          </button>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-8">
          
          {/* LEFT COLUMN: MESSAGING & TASKS */}
          <div className="space-y-10">
            
            {/* NEW: MESSAGE INBOX (GROWERS/USERS) */}
            <section>
              <h2 className="uppercase text-xs font-bold tracking-widest text-emerald-700 flex items-center gap-2 mb-6">
                <Inbox size={18} /> Messages from Growers
              </h2>
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm overflow-hidden">
                {growers.length > 0 ? growers.map(grower => (
                  <div key={grower.id} className="p-6 flex items-center justify-between border-b border-emerald-50 last:border-0 hover:bg-emerald-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold uppercase">
                        {grower.email[0]}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{grower.email.split('@')[0]}</p>
                        <p className="text-[10px] text-emerald-600 font-bold uppercase">Yield Request / User</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveChat(grower); setMessages([]); }} 
                      className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition shadow-md"
                    >
                      <MessageSquare size={18} />
                    </button>
                  </div>
                )) : (
                  <div className="p-10 text-center text-stone-400 text-sm italic">No grower messages found</div>
                )}
              </div>
            </section>

            {/* MANAGER CONTACTS */}
            <section>
              <h2 className="uppercase text-xs font-bold tracking-widest text-emerald-700 flex items-center gap-2 mb-6">
                <UserCheck size={18} /> Management Team
              </h2>
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm divide-y divide-emerald-50 overflow-hidden">
                {correspondents.map(c => (
                  <div key={c.id} className="p-5 flex items-center justify-between hover:bg-emerald-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-amber-100 rounded-lg flex items-center justify-center font-bold text-amber-700 uppercase">
                        {c.email[0]}
                      </div>
                      <p className="font-semibold text-stone-700 text-sm">{c.email.split('@')[0]}</p>
                    </div>
                    <button 
                      onClick={() => { setActiveChat(c); setMessages([]); }} 
                      className="p-2.5 bg-emerald-50 text-emerald-700 rounded-lg hover:bg-emerald-600 hover:text-white transition-all"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* RIGHT COLUMN: TASKS & LOGS */}
          <div className="space-y-10">
            {/* ACTIVE TASKS */}
            <section>
              <h2 className="uppercase text-xs font-bold tracking-widest text-emerald-700 flex items-center gap-2 mb-6">
                <ClipboardList size={18} /> Field Tasks
              </h2>
              <div className="bg-white rounded-3xl border border-emerald-100 shadow-sm divide-y divide-emerald-50 overflow-hidden">
                {tasks.length > 0 ? tasks.map(task => (
                  <div key={task.id} className="p-6 flex items-center gap-5 hover:bg-emerald-50 transition-colors">
                    <Circle className="text-emerald-200" size={24} />
                    <div className="flex-1">
                      <h3 className="font-bold text-stone-800">{task.title}</h3>
                      <p className="text-xs text-stone-500">{task.category}</p>
                    </div>
                  </div>
                )) : (
                  <div className="p-12 text-center text-stone-400 font-medium">Clear schedule for today</div>
                )}
              </div>
            </section>

            {/* HARVEST LOGS */}
            <section>
              <h2 className="uppercase text-xs font-bold tracking-widest text-emerald-700 flex items-center gap-2 mb-6">
                <Package size={18} /> Recent Harvests
              </h2>
              <div className="space-y-4">
                {batches.length > 0 ? batches.slice(0, 3).map(b => (
                  <div key={b.id} className="bg-white p-6 rounded-3xl border border-emerald-100 flex justify-between items-center shadow-sm">
                    <div>
                      <h4 className="font-bold text-emerald-900">{b.crop_name}</h4>
                      <p className="text-xs text-stone-500 mt-1">{b.quantity_kg}kg • {b.destination}</p>
                    </div>
                    <div className="text-[10px] font-black bg-emerald-50 text-emerald-600 px-3 py-1 rounded-full">STORED</div>
                  </div>
                )) : (
                  <div className="bg-white p-10 rounded-3xl border border-emerald-100 text-center text-stone-400 text-sm">No harvest logs</div>
                )}
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* CHAT OVERLAY */}
      {activeChat && (
        <div className="fixed bottom-8 right-8 w-80 bg-white rounded-3xl shadow-2xl border border-emerald-100 z-[110] flex flex-col overflow-hidden animate-in slide-in-from-bottom-5">
          <div className="bg-emerald-800 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center text-xs font-bold uppercase">{activeChat.email[0]}</div>
              <p className="font-semibold text-sm truncate">{activeChat.email.split('@')[0]}</p>
            </div>
            <button onClick={() => setActiveChat(null)} className="text-white/70 hover:text-white"><X size={20} /></button>
          </div>
          
          <div className="h-64 overflow-y-auto p-4 bg-emerald-50/30 flex flex-col gap-3">
            {messages.map(msg => (
              <div key={msg.id} className={`max-w-[85%] p-3 rounded-2xl text-[11px] shadow-sm ${
                msg.sender === userId ? 'bg-emerald-600 text-white self-end rounded-tr-none' : 'bg-white text-stone-800 self-start rounded-tl-none border border-emerald-50'
              }`}>{msg.content}</div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-white">
            <input type="text" value={newMessage} onChange={(e) => setNewMessage(e.target.value)} placeholder="Type a message..." className="flex-1 bg-stone-100 rounded-2xl px-4 py-2 text-sm outline-none" />
            <button type="submit" className="bg-emerald-600 text-white p-2 rounded-xl hover:bg-emerald-700 transition"><Send size={16} /></button>
          </form>
        </div>
      )}

      {/* --- ALL MODALS PRESERVED BELOW --- */}

      {/* SETTINGS MODAL */}
      {showSettingsModal && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-3"><Settings size={24} /> Settings</h2>
              <button onClick={() => setShowSettingsModal(false)}><X size={28} /></button>
            </div>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <input placeholder="First Name" value={profileForm.first_name} onChange={e => setProfileForm({...profileForm, first_name: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl" />
                <input placeholder="Last Name" value={profileForm.last_name} onChange={e => setProfileForm({...profileForm, last_name: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl" />
              </div>
              <input placeholder="Phone" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl" />
              <select value={profileForm.associated_institution} onChange={e => setProfileForm({...profileForm, associated_institution: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl">
                <option value="">Select Institution...</option>
                {institutions.map(inst => <option key={inst.id} value={inst.id}>{inst.institution_name || inst.email}</option>)}
              </select>
              <button type="submit" className="w-full py-5 bg-amber-600 text-white font-bold rounded-3xl shadow-lg">Save Changes</button>
            </form>
          </div>
        </div>
      )}

      {/* LOG HARVEST MODAL */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-3"><Box size={26} /> Log Harvest</h2>
              <button onClick={() => setShowBatchModal(false)}><X size={28} /></button>
            </div>
            <form onSubmit={handlePostBatch} className="space-y-6">
              <input required placeholder="Crop Name" value={newBatch.crop_name} onChange={e => setNewBatch({...newBatch, crop_name: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl" />
              <div className="grid grid-cols-2 gap-6">
                <input required type="number" placeholder="KG" value={newBatch.quantity_kg} onChange={e => setNewBatch({...newBatch, quantity_kg: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl" />
                <input required placeholder="Destination" value={newBatch.destination} onChange={e => setNewBatch({...newBatch, destination: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl" />
              </div>
              <select required value={newBatch.recipient} onChange={e => setNewBatch({...newBatch, recipient: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl">
                <option value="">Notify Manager...</option>
                {correspondents.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
              </select>
              <button type="submit" className="w-full py-5 bg-emerald-600 text-white font-bold rounded-3xl shadow-lg">Submit Harvest</button>
            </form>
          </div>
        </div>
      )}

      {/* SEND REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-rose-600 flex items-center gap-3"><AlertTriangle size={26} /> Send Report</h2>
              <button onClick={() => setShowReportModal(false)}><X size={28} /></button>
            </div>
            <form onSubmit={handlePostReport} className="space-y-6">
              <input required placeholder="Title" value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl" />
              <textarea required placeholder="Details..." value={newReport.message} onChange={e => setNewReport({...newReport, message: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl h-32" />
              <select required value={newReport.recipient} onChange={e => setNewReport({...newReport, recipient: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-2xl">
                <option value="">Recipient...</option>
                {correspondents.map(c => <option key={c.id} value={c.id}>{c.email}</option>)}
              </select>
              <button type="submit" className="w-full py-5 bg-rose-600 text-white font-bold rounded-3xl shadow-lg">Submit Report</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmhandDash;