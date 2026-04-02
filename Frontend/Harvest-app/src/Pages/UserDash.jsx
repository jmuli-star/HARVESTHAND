import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom'; // 1. Import useNavigate
import { 
  User, Mail, ShieldCheck, LogOut, Camera, History, 
  Award, Smartphone, MessageSquare, ShoppingCart, 
  Search, Send, X, Building, CheckCircle, Clock,
  Settings, ArrowRight // Added ArrowRight for better UI
} from 'lucide-react';

function UserDash() {
  const navigate = useNavigate(); // 2. Initialize navigate hook
  const BASE_URL = 'http://127.0.0.1:8000/api/v1';
  
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

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });

  // --- Navigation Method ---
  const goToServices = () => {
    // Navigates to the service dashboard route
    navigate('/services'); 
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
      setFarmhands(handsRes.data.filter(u => u.role === 'farmhand'));
    } catch (err) {
      console.error("Dashboard Load Error:", err);
      if (err.response?.status === 401) handleSignOut();
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
    return () => clearInterval(interval);
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
      alert("Failed to send message.");
    }
  };

  // --- Profile & Auth Handlers ---
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`${BASE_URL}/auth/user/update/`, formData, getAuthHeaders());
      setUser(res.data);
      setEditModalOpen(false);
      alert("Profile updated! 🌾");
    } catch (err) {
      alert("Update failed.");
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 text-stone-900">
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
              <h1 className="text-4xl font-bold text-emerald-900 tracking-tight">
                {greeting}, {user.first_name || 'Grower'}!
              </h1>
              <p className="text-emerald-700 text-sm font-semibold flex items-center gap-2">
                <ShieldCheck size={16} /> {user.role?.toUpperCase()} ACCOUNT
              </p>
            </div>
          </div>
          
          <div className="flex gap-4">
            {/* Added a secondary "Shop" button in header for convenience */}
            <button onClick={goToServices} className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-3xl font-bold hover:bg-emerald-200 transition flex items-center gap-2">
               <ShoppingCart size={18} /> Marketplace
            </button>
            <button onClick={() => setEditModalOpen(true)} className="px-6 py-3 bg-white border border-emerald-200 rounded-3xl font-semibold text-emerald-700 hover:bg-emerald-50 transition shadow-sm flex items-center gap-2">
              <Settings size={18} /> Settings
            </button>
            <button onClick={handleSignOut} className="px-6 py-3 bg-white text-rose-600 border border-rose-200 rounded-3xl font-semibold hover:bg-rose-50 transition shadow-sm flex items-center gap-2">
              <LogOut size={18} /> Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT: FARMHAND DIRECTORY */}
          <div className="lg:col-span-2 space-y-8">
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-3">
                  <MessageSquare className="text-emerald-600" size={24} /> 
                  Contact Your Farmhands
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {farmhands.map(hand => (
                  <div key={hand.id} className="bg-white p-6 rounded-3xl border border-emerald-100 hover:border-emerald-400 hover:shadow-xl transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-xl font-bold text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {hand.email[0].toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-stone-800">{hand.email.split('@')[0]}</p>
                        <p className="text-xs text-stone-500 font-medium">{hand.institution_name || 'Independent'}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => { setActiveChat(hand); setMessages([]); }} 
                      className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl hover:bg-emerald-600 hover:text-white transition-all shadow-sm"
                    >
                      <Send size={20} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* UPDATED ORDER CARD: NAVIGATION HUB */}
            <section className="bg-emerald-800 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
                <div>
                  <h3 className="text-3xl font-bold mb-3">Marketplace & Services</h3>
                  <p className="text-emerald-100 text-lg">Access certified farm products, professional personnel, and yield collection services.</p>
                </div>
                {/* 3. Navigation trigger */}
                <button 
                  onClick={goToServices}
                  className="bg-amber-500 hover:bg-amber-400 text-emerald-900 font-bold text-lg px-8 py-6 rounded-3xl flex items-center gap-3 transition-all shadow-lg group"
                >
                  <ShoppingCart size={26} /> 
                  Open Dashboard
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
              <div className="absolute -bottom-4 -right-4 text-9xl opacity-10 rotate-12">🌾</div>
            </section>
          </div>

          {/* RIGHT: ACCOUNT INFO */}
          <div className="space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm">
              <h3 className="uppercase text-xs font-bold text-emerald-600 tracking-widest mb-6">Verified Details</h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <Mail size={20} className="text-emerald-500" />
                  <div><p className="text-[10px] font-bold text-stone-400 uppercase">Email</p><p className="font-semibold text-sm">{user.email}</p></div>
                </div>
                <div className="flex gap-4">
                  <Smartphone size={20} className="text-emerald-500" />
                  <div><p className="text-[10px] font-bold text-stone-400 uppercase">Phone</p><p className="font-semibold text-sm">{user.phone || 'Not provided'}</p></div>
                </div>
                <div className="flex gap-4">
                  <Building size={20} className="text-emerald-500" />
                  <div><p className="text-[10px] font-bold text-stone-400 uppercase">Institution</p><p className="font-semibold text-sm">{user.institution_name || 'Freelance'}</p></div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 rounded-3xl p-8 border border-amber-100">
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-amber-600" size={20} />
                <h4 className="font-bold text-amber-900">Recent History</h4>
              </div>
              <p className="text-xs text-amber-700/70 font-medium">No recent yield requests found. Contact a farmhand to start.</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- FLOATING CHAT BOX --- */}
      {activeChat && (
        <div className="fixed bottom-8 right-8 w-80 bg-white rounded-3xl shadow-2xl border border-emerald-100 z-50 overflow-hidden flex flex-col animate-in slide-in-from-bottom-5">
          <div className="bg-emerald-800 text-white p-5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 bg-white/20 rounded-xl flex items-center justify-center text-xs font-bold uppercase">
                {activeChat.email[0]}
              </div>
              <p className="font-semibold text-sm truncate">{activeChat.email.split('@')[0]}</p>
            </div>
            <button onClick={() => setActiveChat(null)} className="text-white/70 hover:text-white transition"><X size={20} /></button>
          </div>
          
          <div className="h-80 overflow-y-auto p-4 bg-emerald-50/50 flex flex-col gap-3">
            {messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full opacity-40">
                <MessageSquare size={32} className="mb-2 text-emerald-700" />
                <p className="text-[10px] font-bold text-emerald-800 uppercase tracking-tighter">No messages yet</p>
              </div>
            ) : (
              messages.map(msg => (
                <div key={msg.id} className={`max-w-[85%] p-3 rounded-2xl text-xs shadow-sm ${
                  msg.sender === user.id 
                    ? 'bg-emerald-600 text-white self-end rounded-tr-none' 
                    : 'bg-white text-stone-800 self-start rounded-tl-none border border-emerald-100'
                }`}>
                  {msg.content}
                  <p className={`text-[8px] mt-1 opacity-60 ${msg.sender === user.id ? 'text-right' : 'text-left'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="p-4 border-t flex gap-2 bg-white">
            <input 
              autoFocus
              type="text" 
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Message..." 
              className="flex-1 bg-stone-100 rounded-2xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-200 transition-all" 
            />
            <button type="submit" className="bg-emerald-600 text-white p-2.5 rounded-xl hover:bg-emerald-700 transition shadow-md shadow-emerald-600/20">
              <Send size={18} />
            </button>
          </form>
        </div>
      )}

      {/* --- EDIT MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-emerald-950/60 backdrop-blur-sm z-[100] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-bold text-emerald-900">Settings</h2>
              <button onClick={() => setEditModalOpen(false)}><X size={24} /></button>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-5">
              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">First Name</label>
                <input value={formData.first_name} onChange={e => setFormData({...formData, first_name: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:border-emerald-300 focus:bg-white outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Last Name</label>
                <input value={formData.last_name} onChange={e => setFormData({...formData, last_name: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:border-emerald-300 focus:bg-white outline-none transition-all" />
              </div>
              <div>
                <label className="text-[10px] font-black text-stone-400 uppercase tracking-widest ml-1">Phone Contact</label>
                <input value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full px-5 py-3.5 bg-stone-50 border border-stone-100 rounded-2xl focus:border-emerald-300 focus:bg-white outline-none transition-all" />
              </div>
              <button type="submit" className="w-full py-4 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95">Update Profile</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDash;