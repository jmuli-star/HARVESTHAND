import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, UserPlus, ArrowLeft, Mail, Lock, 
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
      return setStatus({ ...status, error: "Passwords do not match." });
    }

    setStatus({ ...status, loading: true });
    
    // 2. API Request
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };

      await axios.post('http://127.0.0.1:8000/api/v1/admin/stats/', {
        email: formData.email,
        password: formData.password,
        role: 'admin' // Explicitly setting the role
      }, { headers });

      setStatus({ loading: false, error: null, success: true });
      
      // Redirect back to dashboard after showing success message
      setTimeout(() => navigate('/dashboard/admin'), 2000);

    } catch (err) {
      const errorMessage = err.response?.data?.detail || "System failed to create admin account.";
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
          className="flex items-center gap-2 text-slate-400 hover:text-violet-600 transition-all mb-6 font-bold text-sm group"
        >
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Return to Control Panel
        </button>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl shadow-slate-200/50 p-8 md:p-10 relative overflow-hidden">
          
          {/* Decorative Accent */}
          <div className="absolute top-0 right-0 h-32 w-32 bg-violet-50 rounded-full -mr-16 -mt-16 blur-3xl opacity-50"></div>

          {/* Header */}
          <div className="relative z-10 mb-8">
            <div className="h-14 w-14 bg-violet-600 text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg shadow-violet-200">
              <ShieldCheck size={28} />
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">New Administrator</h1>
            <p className="text-slate-500 text-sm mt-2 font-medium">Assign high-level system permissions to a new user.</p>
          </div>

          {/* Success State View */}
          {status.success ? (
            <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="inline-flex h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Provisioning Complete</h3>
              <p className="text-slate-500 text-sm mt-2">The administrator has been added successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              {/* Error Alert */}
              {status.error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold animate-in slide-in-from-top-2">
                  <AlertCircle size={16} />
                  {status.error}
                </div>
              )}

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Admin Email</label>
                <div className="relative group">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={18} />
                  <input 
                    type="email"
                    name="email"
                    required
                    placeholder="name@system.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-violet-100 focus:border-violet-600 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Password</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={18} />
                  <input 
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-violet-100 focus:border-violet-600 transition-all outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Identity</label>
                <div className="relative group">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-violet-600 transition-colors" size={18} />
                  <input 
                    type="password"
                    name="confirmPassword"
                    required
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-violet-100 focus:border-violet-600 transition-all outline-none"
                  />
                </div>
              </div>

              {/* Submit Action */}
              <button 
                type="submit"
                disabled={status.loading}
                className="w-full bg-violet-600 text-white font-black py-5 rounded-2xl hover:bg-violet-700 shadow-xl shadow-violet-200 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-70 disabled:cursor-not-allowed mt-4"
              >
                {status.loading ? (
                  <Loader2 className="animate-spin" size={20} />
                ) : (
                  <>
                    <UserPlus size={20} />
                    <span>Authorize Admin</span>
                  </>
                )}
              </button>
            </form>
          )}

          <p className="text-center text-[10px] text-slate-400 mt-8 font-bold uppercase tracking-widest">
            Security Protocol v2.4 Active
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterAdmin;