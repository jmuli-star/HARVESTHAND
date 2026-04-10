import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, UserPlus, Mail, Lock, 
  Eye, EyeOff, Loader2, CheckCircle2, AlertCircle, ChevronLeft 
} from 'lucide-react';

function RegisterAdmin() {
  const navigate = useNavigate();
  
  // --- Form & UI State ---
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [status, setStatus] = useState({ 
    loading: false, 
    error: null, 
    success: false 
  });
  
  const [showPassword, setShowPassword] = useState(false);

  // --- Handlers ---
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (status.error) setStatus({ ...status, error: null });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 1. Client-side Validation
    if (formData.password !== formData.confirmPassword) {
      return setStatus({ ...status, error: "Access keys do not match." });
    }

    setStatus({ ...status, loading: true });
    
    // 2. API Request
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      // Targeting the admin creation endpoint
      await axios.post('http://127.0.0.1:8000/api/v1/admin/stats/', {
        email: formData.email,
        password: formData.password,
        role: 'admin' 
      }, { headers });

      setStatus({ loading: false, error: null, success: true });
      
      // Automatic return to control panel
      setTimeout(() => navigate('/dashboard/admin'), 2500);

    } catch (err) {
      const errorMessage = err.response?.data?.detail || "System failed to provision admin account.";
      setStatus({ 
        loading: false, 
        error: errorMessage, 
        success: false 
      });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans text-slate-900">
      <div className="max-w-md w-full">
        
        {/* Navigation Back */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-slate-400 hover:text-violet-600 transition-all mb-8 font-black text-[10px] uppercase tracking-[0.2em] group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Return to Control Panel
        </button>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-10 relative overflow-hidden">
          
          {/* Header */}
          <div className="relative z-10 mb-10">
            <div className="h-16 w-16 bg-violet-600 text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl shadow-violet-200">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">New Administrator</h1>
            <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest opacity-60">Elevated Privilege Provisioning</p>
          </div>

          {/* View Toggle: Success vs Form */}
          {status.success ? (
            <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="inline-flex h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[2rem] items-center justify-center mb-8 rotate-3">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter">Provisioning Complete</h3>
              <p className="text-slate-500 text-sm mt-3 font-bold">Admin added. Redirecting to Secure Panel...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {status.error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-[1.5rem] flex items-start gap-3 text-[11px] font-black leading-tight uppercase animate-in slide-in-from-top-2">
                  <AlertCircle size={18} className="shrink-0" />
                  {status.error}
                </div>
              )}

              {/* Email */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Admin Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={18} />
                  <input 
                    type="email"
                    name="email"
                    required
                    placeholder="name@system.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-violet-50 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Access Key</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-14 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-violet-50 transition-all outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password */}
              <div className="space-y-2 group">
                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1">Confirm Identity Key</label>
                <div className="relative">
                  <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-violet-600 transition-colors" size={18} />
                  <input 
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-violet-50 transition-all outline-none"
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={status.loading}
                className="w-full bg-violet-600 text-white font-black py-5 rounded-2xl hover:bg-violet-700 shadow-xl shadow-violet-100 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
              >
                {status.loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span className="text-xs uppercase tracking-[0.2em]">Authorize Admin</span>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-[10px] text-slate-300 mt-10 font-black uppercase tracking-[0.3em] opacity-50">
            Security Core v2.4 Active
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAdmin;