import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  LogOut, Loader2, User, MapPin, Sprout, 
  Send, FileText, CheckCircle2, AlertCircle, Sun, Moon, Sunrise 
} from 'lucide-react';

const API_ROOT = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";
const BASE_URL = `${API_ROOT}/api/v1`;

function FarmhandDash() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [profile, setProfile] = useState({
    email: "", id: "", first_name: "", last_name: "",
    location: "", farm_name: "", crops_managed: ""
  });

  // Report Form State
  const [report, setReport] = useState({ title: "", content: "", priority: "normal" });
  const [statusMsg, setStatusMsg] = useState(null);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return { text: "Good Morning", icon: <Sunrise size={16} className="text-amber-500" /> };
    if (hour < 18) return { text: "Good Afternoon", icon: <Sun size={16} className="text-orange-500" /> };
    return { text: "Good Evening", icon: <Moon size={16} className="text-indigo-400" /> };
  };
  const greeting = getGreeting();

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const handleLogout = useCallback(() => {
    localStorage.clear();
    navigate('/login');
  }, [navigate]);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/users/me/`, getAuthHeaders());
      setProfile(res.data);
    } catch (err) {
      if (err.response?.status === 401) handleLogout();
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, handleLogout]);

  useEffect(() => { fetchProfile(); }, [fetchProfile]);

  const handleSendReport = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatusMsg(null);
    try {
      await axios.post(`${BASE_URL}/reports/`, report, getAuthHeaders());
      setStatusMsg({ type: 'success', text: 'Report delivered to Command Center.' });
      setReport({ title: "", content: "", priority: "normal" });
    } catch (err) {
      setStatusMsg({ type: 'error', text: 'Transmission failed. Try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50 p-6 lg:p-10 font-sans text-stone-900">
      
      {/* LOGOUT MODAL (Kept identical to AdminDash flow) */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-sm" onClick={() => setShowLogoutModal(false)}></div>
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 border border-emerald-100 animate-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-amber-50 text-amber-500 rounded-2xl flex items-center justify-center mb-6"><LogOut size={32} /></div>
              <h2 className="text-xl font-bold text-emerald-900">Sign Out?</h2>
              <p className="text-stone-500 text-sm mb-8">Leaving the field for today?</p>
              <div className="flex gap-3 w-full">
                <button onClick={() => setShowLogoutModal(false)} className="flex-1 py-3 rounded-2xl bg-stone-100 text-stone-600 font-semibold hover:bg-stone-200 transition">Stay</button>
                <button onClick={handleLogout} className="flex-1 py-3 rounded-2xl bg-emerald-700 text-white font-semibold hover:bg-emerald-800 transition">Logout</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto">
        <header className="mb-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-3xl">👨‍🌾</div>
            <div>
              <div className="flex items-center gap-3 mb-1">
                <div className="flex items-center gap-1.5 bg-white border border-emerald-200 px-3 py-1 rounded-3xl shadow-sm">
                  {greeting.icon}
                  <span className="text-xs font-bold uppercase tracking-widest text-emerald-700">{greeting.text}</span>
                </div>
                <span className="text-xs font-bold uppercase tracking-widest bg-teal-100 text-teal-700 px-3 py-1 rounded-3xl">FARMHAND</span>
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-emerald-900">{profile.first_name || 'Field Operator'}</h1>
            </div>
          </div>
          <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-200 rounded-3xl font-semibold shadow-sm transition-all"><LogOut size={18} /> Logout</button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: PROFILE INFO (The Omitted Fields) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm">
              <h3 className="text-emerald-900 font-bold text-lg mb-6 flex items-center gap-2"><User size={20}/> Field Identity</h3>
              <div className="space-y-4">
                <InfoItem label="Email Address" value={profile.email} icon={<FileText size={16}/>} />
                <InfoItem label="Farm Name" value={profile.farm_name || "Unassigned"} icon={<Sprout size={16}/>} />
                <InfoItem label="Primary Location" value={profile.location || "Earth"} icon={<MapPin size={16}/>} />
                <div className="pt-4 border-t border-emerald-50">
                  <span className="text-[10px] font-black uppercase text-stone-400 block mb-2">Crops Managed</span>
                  <div className="flex flex-wrap gap-2">
                    {(profile.crops_managed || "General").split(',').map((crop, i) => (
                      <span key={i} className="bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1 rounded-full border border-emerald-100">{crop.trim()}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: REPORT SENDING (The New Logic) */}
          <div className="lg:col-span-8">
            <div className="bg-white rounded-3xl p-8 border border-emerald-100 shadow-sm relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="text-emerald-900 font-bold text-xl mb-2">Field Report</h3>
                <p className="text-stone-500 text-sm mb-8">Send updates or alerts directly to the Command Center.</p>
                
                <form onSubmit={handleSendReport} className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-600 uppercase ml-2">Subject</label>
                      <input 
                        required
                        className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 transition"
                        placeholder="e.g., Irrigation Issue"
                        value={report.title}
                        onChange={(e) => setReport({...report, title: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-stone-600 uppercase ml-2">Priority Level</label>
                      <select 
                        className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-3 outline-none focus:ring-2 focus:ring-emerald-500/20 transition appearance-none"
                        value={report.priority}
                        onChange={(e) => setReport({...report, priority: e.target.value})}
                      >
                        <option value="normal">Normal</option>
                        <option value="urgent">Urgent</option>
                        <option value="critical">Critical</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-stone-600 uppercase ml-2">Observations</label>
                    <textarea 
                      required
                      rows="4"
                      className="w-full bg-emerald-50 border border-emerald-100 rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-emerald-500/20 transition resize-none"
                      placeholder="Describe the current field status..."
                      value={report.content}
                      onChange={(e) => setReport({...report, content: e.target.value})}
                    />
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    {statusMsg && (
                      <div className={`flex items-center gap-2 text-sm font-semibold ${statusMsg.type === 'success' ? 'text-emerald-600' : 'text-rose-500'}`}>
                        {statusMsg.type === 'success' ? <CheckCircle2 size={18}/> : <AlertCircle size={18}/>}
                        {statusMsg.text}
                      </div>
                    )}
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="ml-auto flex items-center gap-3 bg-emerald-700 text-white px-8 py-3 rounded-2xl font-bold shadow-lg shadow-emerald-900/10 hover:bg-emerald-800 transition disabled:opacity-50"
                    >
                      {isSubmitting ? <Loader2 className="animate-spin" size={20}/> : <><Send size={18}/> Submit Report</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* --- Helper Sub-component --- */
const InfoItem = ({ label, value, icon }) => (
  <div className="flex flex-col">
    <span className="text-[10px] font-black uppercase text-stone-400 ml-1">{label}</span>
    <div className="flex items-center gap-3 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-50 mt-1">
      <div className="text-emerald-600">{icon}</div>
      <span className="font-semibold text-emerald-900 text-sm truncate">{value}</span>
    </div>
  </div>
);

export default FarmhandDash;