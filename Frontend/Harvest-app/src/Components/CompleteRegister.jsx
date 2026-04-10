import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  ShieldCheck, UserPlus, Mail, Lock, Eye, EyeOff, 
  Loader2, CheckCircle2, AlertCircle, ChevronLeft,
  Briefcase, BookOpen, Landmark 
} from 'lucide-react';

function RegisterUser() {
  const navigate = useNavigate();
  const location = useLocation();

  // --- 1. DYNAMIC ROLE RESOLUTION ---
  const getRoleFromPath = () => {
    const pathParts = location.pathname.split('-');
    const extractedRole = pathParts[pathParts.length - 1];
    const validRoles = ['admin', 'farmhand', 'correspondent', 'institution'];
    return validRoles.includes(extractedRole) ? extractedRole : 'farmhand'; 
  };

  const [role] = useState(getRoleFromPath());
  
  const roleConfigs = {
    admin: { label: 'Administrator', icon: <ShieldCheck />, theme: 'bg-violet-600 shadow-violet-200', apiValue: 'admin' },
    farmhand: { label: 'Farmhand', icon: <Briefcase />, theme: 'bg-emerald-600 shadow-emerald-200', apiValue: 'farmhand' },
    correspondent: { label: 'Correspondent', icon: <BookOpen />, theme: 'bg-blue-600 shadow-blue-200', apiValue: 'farmcorrespondent' },
    institution: { label: 'Institution', icon: <Landmark />, theme: 'bg-amber-600 shadow-amber-200', apiValue: 'farminstitution' },
  };

  const config = roleConfigs[role] || roleConfigs.farmhand;

  // --- 2. STATE MANAGEMENT ---
  const [formData, setFormData] = useState({ 
    email: '', 
    password: '', 
    confirmPassword: '',
    institution_name: '' 
  });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const [showPassword, setShowPassword] = useState(false);

  // --- 3. SUBMISSION HANDLER ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setStatus({ ...status, error: "Access keys do not match." });
    }

    setStatus({ ...status, loading: true, error: null });
    
    try {
      const response = await axios.post('http://127.0.0.1:8000/api/v1/register/', {
        email: formData.email,
        password: formData.password,
        password2: formData.confirmPassword, // Mapping to Backend Serializer requirements
        role: config.apiValue,
        institution_name: formData.institution_name || ""
      });
      
      if (response.status === 201 || response.status === 200) {
        setStatus({ loading: false, error: null, success: true });
        setTimeout(() => navigate('/login'), 2500);
      }
    } catch (err) {
      const serverError = err.response?.data;
      let errorMsg = "System failed to provision account.";

      if (serverError) {
        errorMsg = typeof serverError === 'object' 
          ? Object.values(serverError).flat().join(' ') 
          : serverError.detail || errorMsg;
      }

      setStatus({ loading: false, error: errorMsg, success: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans text-slate-900">
      <div className="max-w-md w-full">
        {/* Navigation Back */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 font-black text-[10px] uppercase tracking-[0.2em] transition-all group"
        >
          <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Back to Selection
        </button>

        <div className="bg-white rounded-[3rem] border border-slate-100 shadow-2xl p-10 relative overflow-hidden">
          
          {status.success ? (
            /* SUCCESS VIEW */
            <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="inline-flex h-24 w-24 bg-emerald-50 text-emerald-500 rounded-[2rem] items-center justify-center mb-8 rotate-6">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="text-3xl font-black italic tracking-tighter">Provisioned!</h3>
              <p className="text-slate-500 text-sm mt-3 font-bold">Secure account created. Redirecting to login...</p>
            </div>
          ) : (
            /* FORM VIEW */
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="mb-10">
                <div className={`h-16 w-16 ${config.theme} text-white rounded-[1.5rem] flex items-center justify-center mb-6 shadow-xl`}>
                  {React.cloneElement(config.icon, { size: 32 })}
                </div>
                <h1 className="text-3xl font-black tracking-tighter text-slate-900 uppercase italic">Register {config.label}</h1>
                <p className="text-slate-500 text-xs mt-2 font-bold uppercase tracking-widest opacity-60">System Security Protocol 0.4.1</p>
              </div>

              {status.error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-[1.5rem] flex items-start gap-3 text-[11px] font-black leading-tight uppercase">
                  <AlertCircle size={18} className="shrink-0" /> {status.error}
                </div>
              )}

              <div className="space-y-5">
                {/* Work Email */}
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Work Email</label>
                  <div className="relative">
                    <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                    <input 
                      type="email" 
                      required 
                      value={formData.email} 
                      onChange={(e) => setFormData({...formData, email: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-slate-100 transition-all outline-none" 
                      placeholder="user@harvest-hand.com" 
                    />
                  </div>
                </div>
                
                {/* Access Key */}
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Access Key</label>
                  <div className="relative">
                    <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      value={formData.password} 
                      onChange={(e) => setFormData({...formData, password: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-14 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-slate-100 transition-all outline-none" 
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-900 transition-colors">
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                {/* Confirm Key */}
                <div className="group">
                  <label className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 ml-1 block mb-2">Confirm Key</label>
                  <div className="relative">
                    <ShieldCheck className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-slate-900 transition-colors" size={18} />
                    <input 
                      type="password" 
                      required 
                      value={formData.confirmPassword} 
                      onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} 
                      className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-5 pl-14 pr-4 text-sm font-bold focus:bg-white focus:ring-8 focus:ring-slate-100 transition-all outline-none" 
                    />
                  </div>
                </div>
              </div>

              <button 
                type="submit" 
                disabled={status.loading} 
                className={`w-full ${config.theme} text-white font-black py-5 rounded-2xl hover:brightness-110 shadow-xl transition-all flex items-center justify-center gap-3 mt-6 active:scale-95 disabled:opacity-50`}
              >
                {status.loading ? <Loader2 className="animate-spin" size={20} /> : <><UserPlus size={20} /> Create {config.label}</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default RegisterUser;