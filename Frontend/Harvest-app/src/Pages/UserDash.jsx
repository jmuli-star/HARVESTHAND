import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
// --- TOAST IMPORT ---
import toast, { Toaster } from 'react-hot-toast'; 
import { 
  User, Mail, ShieldCheck, LogOut, Camera, 
  MessageSquare, ShoppingCart, Send, X, Building, 
  Smartphone, Clock, Settings, ArrowRight , Sparkles
} from 'lucide-react';

// --- CONFIGURATION ---
const API_ROOT = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, "");
const BASE_URL = `${API_ROOT}/api/v1`;

function UserDash() {
  const navigate = useNavigate();
  
  // --- State Management ---
  const [user, setUser] = useState({});
  const [farmhands, setFarmhands] = useState([]);
  const [greeting, setGreeting] = useState('');
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const chatEndRef = useRef(null); 

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  // Helper for consistent headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('access_token');
    return {
      headers: { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    };
  };

  // --- Initial Data Load ---
  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) setGreeting('Good Morning');
    else if (hour < 18) setGreeting('Good Afternoon');
    else setGreeting('Good Evening');

    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [userRes, handsRes] = await Promise.all([
        axios.get(`${BASE_URL}/auth/user/`, getAuthHeaders()),
        axios.get(`${BASE_URL}/users/`, getAuthHeaders())
      ]);
      
      setUser(userRes.data);
      setFormData({
        first_name: userRes.data.first_name || '',
        last_name: userRes.data.last_name || '',
        phone: userRes.data.phone || ''
      });
      
      const usersList = Array.isArray(handsRes.data) ? handsRes.data : [];
      setFarmhands(usersList.filter(u => u.role === 'farmhand'));
      
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      if (err.response?.status === 401) {
        handleSignOut();
      } else {
        toast.error("Failed to sync farm data. 🌾"); // Toast added
      }
    } finally {
      setLoading(false);
    }
  };

  // --- Chat System Logic ---
  useEffect(() => {
    let interval;
    if (activeChat) {
      fetchMessages(activeChat.id);
      interval = setInterval(() => fetchMessages(activeChat.id), 3000);
    }
    return () => {
      clearInterval(interval);
      setMessages([]); 
    };
  }, [activeChat]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const fetchMessages = async (farmhandId) => {
    try {
      const res = await axios.get(
        `${BASE_URL}/messages/chat/?other_user_id=${farmhandId}`, 
        getAuthHeaders()
      );
      setMessages(res.data);
    } catch (err) {
      console.error("Message Fetch Error:", err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeChat) return;
    try {
      const payload = { receiver: activeChat.id, content: newMessage };
      const res = await axios.post(`${BASE_URL}/messages/chat/`, payload, getAuthHeaders());
      setMessages(prev => [...prev, res.data]);
      setNewMessage('');
    } catch (err) {
      toast.error("Message failed to send."); // Toast added
    }
  };

  // --- Profile & Auth Handlers ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    const loadId = toast.loading("Updating your credentials..."); // Loading Toast
    try {
      // CHANGED: Removed /update/ from URL as per your Django error log
      const res = await axios.patch(`${BASE_URL}/auth/user/`, formData, getAuthHeaders());
      setUser(res.data);
      setEditModalOpen(false);
      toast.success("Profile synchronized! 🌾", { id: loadId }); // Success Toast
    } catch (err) {
      toast.error("Update failed. Check your connection.", { id: loadId }); // Error Toast
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    toast.success("Signed out successfully."); // Toast added
    navigate('/login');
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 text-stone-900">
      {/* --- TOAST CONTAINER --- */}
      <Toaster position="top-right" reverseOrder={false} />

      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-3xl bg-emerald-600 flex items-center justify-center text-white shadow-xl relative">
              <User size={38} />
              <button className="absolute -bottom-1 -right-1 p-2 bg-white rounded-2xl shadow text-emerald-500 hover:text-emerald-700 transition">
                <Camera size={14} />
              </button>
            </div>
            <div>
              <h1 className="text-4xl font-black text-emerald-900 tracking-tight">
                {greeting}, {user.first_name || 'Grower'}!
              </h1>
              <p className="text-emerald-700 text-sm font-bold flex items-center gap-2">
                <ShieldCheck size={16} /> {(user.role || 'user').toUpperCase()} ACCOUNT
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            <button onClick={() => navigate('/services')} className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-3xl font-black text-xs uppercase tracking-widest hover:bg-emerald-200 transition flex items-center gap-2">
               <ShoppingCart size={18} /> Marketplace
            </button>
            {/* CHANGED: Combined Button */}
            <button onClick={() => setEditModalOpen(true)} className="px-6 py-3 bg-white border border-emerald-200 rounded-3xl font-bold text-xs uppercase tracking-widest text-emerald-700 hover:bg-emerald-50 transition shadow-sm flex items-center gap-2">
              <Settings size={18} /> Manage Account
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: FARMHAND DIRECTORY (Restored) */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <h2 className="text-2xl font-black text-emerald-900 flex items-center gap-3 mb-6">
                <MessageSquare className="text-emerald-600" size={24} /> 
                Personnel Directory
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {farmhands.length > 0 ? farmhands.map(hand => (
                  <div key={hand.id} className="bg-white p-6 rounded-[2rem] border border-emerald-100 hover:border-emerald-400 hover:shadow-xl transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl font-black text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {(hand.email || 'U')[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-stone-800">{(hand.email || '').split('@')[0]}</p>
                        <p className="text-[10px] text-stone-400 font-black uppercase tracking-tighter">{hand.institution_name || 'Independent'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveChat(hand); }} 
                      className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                )) : (
                  <p className="text-stone-400 font-bold italic">No personnel found.</p>
                )}
              </div>
            </section>

            {/* NAVIGATION CARD */}
            <section className="bg-emerald-900 rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h3 className="text-3xl font-black mb-3 tracking-tighter">Marketplace & Services</h3>
                  <p className="text-emerald-200 font-medium">Access certified farm products, professional personnel, and yield logistics.</p>
                </div>
                <button 
                  onClick={() => navigate('/services')}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-950 font-black text-sm uppercase tracking-widest px-8 py-6 rounded-3xl flex items-center gap-3 transition-all shadow-lg group"
                >
                  <ShoppingCart size={22} /> 
                  Open Marketplace
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 text-9xl opacity-10 rotate-12 select-none">🌾</div>
            </section>
          </div>

          {/* RIGHT: ACCOUNT INFO */}
          <div className="space-y-6">
            <div className="bg-white rounded-[2rem] p-8 border border-emerald-100 shadow-sm">
              <h3 className="uppercase text-[10px] font-black text-emerald-600 tracking-[0.2em] mb-8">Verified Credentials</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Mail size={20} className="text-emerald-500" />
                  <div><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Email</p><p className="font-bold text-sm text-stone-800">{user.email}</p></div>
                </div>
                <div className="flex gap-4">
                  <span className="text-emerald-500"><Smartphone size={20} /></span>
                  <div><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Phone</p><p className="font-bold text-sm text-stone-800">{user.phone || 'Not provided'}</p></div>
                </div>
                <div className="flex gap-4">
                  <Building size={20} className="text-emerald-500" />
                  <div><p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Institution</p><p className="font-bold text-sm text-stone-800">{user.institution_name || 'Freelance'}</p></div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-[2rem] p-8 border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-amber-600" size={20} />
                <h4 className="font-black text-amber-900 uppercase text-xs tracking-widest">Timeline</h4>
              </div>
              <p className="text-[11px] text-amber-700/70 font-bold leading-relaxed">No recent yield requests found. Coordinate with a farmhand via the directory to begin.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING CHAT BOX --- */}
      {activeChat && (
        <div className="fixed bottom-8 right-8 w-80 bg-white rounded-[2rem] shadow-2xl border border-emerald-100 z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          <div className="bg-emerald-900 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center text-xs font-black uppercase">
                {(activeChat.email || 'U')[0]}
              </div>
              <p className="font-bold text-sm truncate">{(activeChat.email || '').split('@')[0]}</p>
            </div>
            <button onClick={() => setActiveChat(null)} className="text-white/70 hover:text-white transition"><X size={20} /></button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 bg-emerald-50/50 flex flex-col gap-3">
            {messages.map(msg => (
              <div key={msg.id} className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm ${
                msg.sender === user.id 
                  ? 'bg-emerald-600 text-white self-end rounded-tr-none' 
                  : 'bg-white text-stone-800 self-start rounded-tl-none border border-emerald-100'
              }`}>
                {msg.content}
                <p className={`text-[8px] mt-1 font-black opacity-60 uppercase ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            ))}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-white">
            <input 
              autoFocus
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message..." 
              className="flex-1 bg-stone-100 rounded-2xl px-4 py-2.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all" 
            />
            <button type="submit" className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition shadow-md">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* --- COMBINED MANAGEMENT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] overflow-hidden shadow-2xl relative">
            <div className="p-8 pb-0 flex justify-between items-center">
              <h2 className="text-2xl font-black text-emerald-900 uppercase tracking-tighter">Account Management</h2>
              <button onClick={() => setEditModalOpen(false)} className="text-stone-400 hover:text-stone-900 transition">
                <X size={24} />
              </button>
            </div>

            <div className="p-8 pt-6 space-y-8">
              <section>
                <h3 className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em] mb-4">Update Profile</h3>
                <form onSubmit={handleProfileUpdate} className="space-y-4">
                  {[
                    { label: 'First Name', key: 'first_name' },
                    { label: 'Last Name', key: 'last_name' },
                    { label: 'Phone Contact', key: 'phone' }
                  ].map(field => (
                    <div key={field.key}>
                      <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">{field.label}</label>
                      <input 
                        value={formData[field.key]} 
                        onChange={e => setFormData({...formData, [field.key]: e.target.value})} 
                        className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl text-sm font-bold focus:border-emerald-300 focus:bg-white outline-none transition-all mt-1" 
                      />
                    </div>
                  ))}
                  <button type="submit" className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-md transition-all active:scale-95">
                    Save Changes
                  </button>
                </form>
              </section>

              <div className="border-t border-stone-100"></div>

              <section>
                <h3 className="text-[10px] font-black text-rose-600 uppercase tracking-[0.2em] mb-4">Account Actions</h3>
                <div className="bg-rose-50 p-4 rounded-2xl border border-rose-100 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-bold text-rose-900">End Session</p>
                    <p className="text-[10px] text-rose-600 font-medium">Log out of your grower account.</p>
                  </div>
                  <button 
                    onClick={handleSignOut} 
                    className="p-3 bg-white text-rose-600 rounded-xl border border-rose-200 hover:bg-rose-600 hover:text-white transition-all shadow-sm"
                  >
                    <LogOut size={20} />
                  </button>
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      {/* --- AI ASSISTANT --- */}
      <div className="fixed bottom-8 left-8 z-[60] flex flex-col items-start gap-3 group">
        <div className="bg-white px-5 py-3 rounded-2xl shadow-2xl border border-emerald-100 animate-bounce transition-all">
          <p className="text-[10px] font-black text-emerald-800 flex items-center gap-2 uppercase tracking-widest">Need Farm Advice?</p>
          <div className="absolute -bottom-1 left-6 w-3 h-3 bg-white border-r border-b border-emerald-50 rotate-45"></div>
        </div>
        <button onClick={() => navigate('/ai-hub')} className="bg-emerald-900 text-white p-5 rounded-[2rem] shadow-2xl hover:bg-black hover:scale-110 active:scale-95 transition-all duration-300 flex items-center gap-3">
          <div className="relative">
            <Sparkles size={24} className="text-amber-400" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>
          <span className="font-black text-xs uppercase tracking-widest pr-2">Ask Harvest AI</span>
        </button>
      </div>
    </div>
  );
}

export default UserDash;