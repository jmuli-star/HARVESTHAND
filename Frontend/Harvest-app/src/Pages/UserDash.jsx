import React, { useState, useEffect } from 'react';
import axios from 'axios'; // Importing axios directly
import { 
  User, Mail, ShieldCheck, LogOut, Camera, History, 
  Award, Smartphone, MessageSquare, ShoppingCart, 
  Search, Send, X, Building, CheckCircle, Clock
} from 'lucide-react';

function UserDash() {
  // --- 1. Configuration & State ---
  const BASE_URL = 'http://127.0.0.1:8000/api/v1'; // Change this to your Django URL
  const [user, setUser] = useState({});
  const [farmhands, setFarmhands] = useState([]);
  const [greeting, setGreeting] = useState('');
  const [activeChat, setActiveChat] = useState(null);
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    phone: ''
  });

  // Helper to get headers (since we aren't using a central api.js instance)
  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });

  // --- 2. Lifecycle & Data Logic ---
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
      
      // Fetch User Profile and Personnel in parallel
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
      
      // Filter list to show only farmhands
      setFarmhands(handsRes.data.filter(u => u.role === 'farmhand'));
      
    } catch (err) {
      console.error("Fetch Error:", err.response?.data || err.message);
      if (err.response?.status === 401) handleSignOut(); // Auto-logout if token expires
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.patch(`${BASE_URL}/auth/user/update/`, formData, getAuthHeaders());
      setUser(res.data);
      setEditModalOpen(false);
      alert("Profile updated!");
    } catch (err) {
      alert("Update failed. Ensure you are logged in.");
    }
  };

  const handleSignOut = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-emerald-600"></div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans">
      <div className="max-w-6xl mx-auto px-6 py-10">
        
        {/* TOP NAV / HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div className="flex items-center gap-5">
            <div className="h-20 w-20 rounded-3xl bg-emerald-600 flex items-center justify-center text-white shadow-xl shadow-emerald-100 relative">
              <User size={36} />
              <button className="absolute -bottom-1 -right-1 p-1.5 bg-white rounded-lg shadow border border-slate-100 text-slate-400">
                <Camera size={12} />
              </button>
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight">{greeting}, {user.first_name || 'Grower'}</h1>
              <p className="text-slate-400 text-sm font-medium flex items-center gap-2">
                <ShieldCheck size={14} className="text-emerald-500" /> {user.role?.toUpperCase()} ACCOUNT
              </p>
            </div>
          </div>
          
          <div className="flex gap-3">
            <button onClick={() => setEditModalOpen(true)} className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 rounded-xl font-bold text-sm transition-all">
              Settings
            </button>
            <button onClick={handleSignOut} className="px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-xl font-bold text-sm transition-all flex items-center gap-2">
              <LogOut size={16} /> Logout
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* COLUMN 1 & 2: Main Logic */}
          <div className="lg:col-span-2 space-y-10">
            
            {/* Personnel Chat Section */}
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-black flex items-center gap-2">
                  <MessageSquare className="text-emerald-600" size={20} /> Assigned Farmhands
                </h2>
                <span className="text-[10px] font-black bg-slate-100 px-2 py-1 rounded">ACTIVE DIRECTORY</span>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {farmhands.map(hand => (
                  <div key={hand.id} className="p-4 rounded-2xl border border-slate-100 hover:border-emerald-200 hover:shadow-lg hover:shadow-emerald-50 transition-all flex items-center justify-between group">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-xl bg-slate-50 flex items-center justify-center font-bold text-slate-400 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                        {hand.email[0].toUpperCase()}
                      </div>
                      <div className="max-w-[120px]">
                        <p className="text-sm font-bold truncate">{hand.email}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tighter">
                          {hand.institution_name || 'Independent'}
                        </p>
                      </div>
                    </div>
                    <button onClick={() => setActiveChat(hand)} className="p-2 bg-emerald-50 text-emerald-600 rounded-lg hover:bg-emerald-600 hover:text-white transition-all">
                      <Send size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </section>

            {/* Ordering Section */}
            <section className="bg-emerald-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-6">
                <div>
                  <h3 className="text-xl font-black mb-2">Ready for Harvest?</h3>
                  <p className="text-emerald-100/60 text-sm max-w-xs">Request immediate yield collection from your linked personnel.</p>
                </div>
                <button className="bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-black px-6 py-4 rounded-2xl flex items-center gap-2 transition-all shadow-xl shadow-emerald-950/20">
                  <ShoppingCart size={20} /> Order Yield Delivery
                </button>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full -mr-10 -mt-10"></div>
            </section>
          </div>

          {/* COLUMN 3: Profile Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-slate-50 rounded-3xl border border-slate-100">
              <h3 className="font-black text-sm mb-6 uppercase tracking-widest text-slate-400">Account Profile</h3>
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <Mail size={18} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Primary Email</p>
                    <p className="text-sm font-bold">{user.email}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Smartphone size={18} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Contact Phone</p>
                    <p className="text-sm font-bold">{user.phone || 'Not provided'}</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <Building size={18} className="text-slate-400 mt-1" />
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase">Institution</p>
                    <p className="text-sm font-bold">{user.institution_name || 'Freelance'}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 bg-amber-50 rounded-3xl border border-amber-100">
              <div className="flex items-center gap-3 mb-2">
                <Clock className="text-amber-600" size={18} />
                <h4 className="font-black text-amber-900 text-sm">Recent Activity</h4>
              </div>
              <p className="text-[10px] text-amber-700/70 font-medium">No recent orders found. Start by requesting a harvest delivery from the panel.</p>
            </div>
          </div>

        </div>
      </div>

      {/* --- CHAT OVERLAY --- */}
      {activeChat && (
        <div className="fixed bottom-6 right-6 w-72 bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden">
          <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
            <p className="text-xs font-bold truncate w-40">{activeChat.email}</p>
            <button onClick={() => setActiveChat(null)}><X size={14} /></button>
          </div>
          <div className="h-48 p-4 bg-slate-50 flex items-center justify-center text-center">
            <p className="text-[10px] text-slate-400 italic">Messages sent here are encrypted and sent to {activeChat.email.split('@')[0]}</p>
          </div>
          <div className="p-2 border-t flex gap-2">
            <input type="text" placeholder="Message..." className="flex-1 bg-slate-100 border-none rounded-lg px-3 py-1.5 text-xs" />
            <button className="p-2 bg-emerald-600 text-white rounded-lg"><Send size={14} /></button>
          </div>
        </div>
      )}

      {/* --- EDIT PROFILE MODAL --- */}
      {isEditModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-3xl p-8 shadow-2xl animate-in zoom-in duration-150">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-black">Account Settings</h2>
              <button onClick={() => setEditModalOpen(false)}><X /></button>
            </div>
            <form onSubmit={handleProfileUpdate} className="space-y-4">
              <input 
                placeholder="First Name" 
                value={formData.first_name}
                onChange={e => setFormData({...formData, first_name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm" 
              />
              <input 
                placeholder="Last Name" 
                value={formData.last_name}
                onChange={e => setFormData({...formData, last_name: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm" 
              />
              <input 
                placeholder="Phone Number" 
                value={formData.phone}
                onChange={e => setFormData({...formData, phone: e.target.value})}
                className="w-full px-4 py-3 bg-slate-50 border-none rounded-xl text-sm" 
              />
              <button type="submit" className="w-full py-3 bg-emerald-600 text-white font-black rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20">
                Update Profile
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDash;