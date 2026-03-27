import React, { useState, useEffect } from 'react';
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

  // FIX: Hardened role extraction logic
  const getRoleFromPath = () => {
    const pathParts = location.pathname.split('-');
    const extractedRole = pathParts[pathParts.length - 1];
    const validRoles = ['admin', 'farmhand', 'correspondent', 'institution'];
    return validRoles.includes(extractedRole) ? extractedRole : 'farmhand'; 
  };

  const [role, setRole] = useState(getRoleFromPath());
  
  const roleConfigs = {
    admin: { label: 'Administrator', icon: <ShieldCheck />, color: 'violet', theme: 'bg-violet-600 shadow-violet-200' },
    farmhand: { label: 'Farmhand', icon: <Briefcase />, color: 'emerald', theme: 'bg-emerald-600 shadow-emerald-200' },
    correspondent: { label: 'Correspondent', icon: <BookOpen />, color: 'blue', theme: 'bg-blue-600 shadow-blue-200' },
    institution: { label: 'Institution', icon: <Landmark />, color: 'amber', theme: 'bg-amber-600 shadow-amber-200' },
  };

  const config = roleConfigs[role] || roleConfigs.farmhand;

  const [formData, setFormData] = useState({ email: '', password: '', confirmPassword: '' });
  const [status, setStatus] = useState({ loading: false, error: null, success: false });
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      return setStatus({ ...status, error: "Passwords do not match." });
    }

    setStatus({ ...status, loading: true, error: null });
    
    try {
      const token = localStorage.getItem('access_token');
      
      // FIX: Ensure headers and payload are explicit
      const response = await axios.post('http://127.0.0.1:8000/api/v1/admin/stats/', {
        email: formData.email,
        password: formData.password,
        role: role // This string must match your Django choices (e.g., 'farmhand')
      }, { 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        } 
      });

      if (response.status === 201 || response.status === 200) {
        setStatus({ loading: false, error: null, success: true });
        setTimeout(() => navigate('/dashboard'), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.detail || err.response?.data?.message || "System failed to provision account.";
      setStatus({ loading: false, error: errorMsg, success: false });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center font-sans text-slate-900">
      <div className="max-w-md w-full">
        <button onClick={() => navigate('/dashboard')} className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 font-bold text-sm transition-all group">
          <ChevronLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Abort Registration
        </button>

        <div className="bg-white rounded-[2.5rem] border border-slate-100 shadow-2xl p-8 md:p-10 relative overflow-hidden">
          {status.success ? (
            <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
              <div className="inline-flex h-20 w-20 bg-emerald-50 text-emerald-500 rounded-full items-center justify-center mb-6">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="text-2xl font-black italic">Provisioned!</h3>
              <p className="text-slate-500 text-sm mt-2 font-medium">Redirecting to Control Panel...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <div className={`h-14 w-14 ${config.theme} text-white rounded-2xl flex items-center justify-center mb-6 shadow-lg`}>
                  {React.cloneElement(config.icon, { size: 28 })}
                </div>
                <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Add {config.label}</h1>
                <p className="text-slate-500 text-sm mt-2 font-medium">Enter credentials for the new system entity.</p>
              </div>

              {status.error && (
                <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl flex items-center gap-3 text-xs font-bold">
                  <AlertCircle size={16} /> {status.error}
                </div>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Email</label>
                   <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="email" required value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all outline-none" placeholder="farmhand@system.com" />
                   </div>
                </div>
                
                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Access Key</label>
                   <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type={showPassword ? "text" : "password"} required value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all outline-none" />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400">
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                   </div>
                </div>

                <div className="space-y-2">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Key</label>
                   <div className="relative">
                      <ShieldCheck className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
                      <input type="password" required value={formData.confirmPassword} onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})} className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-12 pr-4 text-sm font-bold focus:bg-white focus:ring-4 focus:ring-slate-100 transition-all outline-none" />
                   </div>
                </div>
              </div>

              <button type="submit" disabled={status.loading} className={`w-full ${config.theme} text-white font-black py-5 rounded-2xl hover:brightness-110 shadow-xl transition-all flex items-center justify-center gap-3 mt-4`}>
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