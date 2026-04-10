import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000/api/v1";

function ResetPasswordConfirm() {
  const { uid, token } = useParams(); 
  const navigate = useNavigate();
  
  // --- State Management ---
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', text: '' });

  // --- Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setStatus({ type: 'error', text: "Access keys do not match." });
    }

    setLoading(true);
    setStatus({ type: '', text: '' });

    try {
      await axios.post(`${API_BASE}/auth/password-reset-confirm/`, {
        uid,
        token,
        new_password: password
      });
      
      setStatus({ 
        type: 'success', 
        text: "Credentials updated! Securing account and redirecting..." 
      });
      
      // Delay allows the user to read the success message
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setStatus({ 
        type: 'error', 
        text: "The reset link has expired or is invalid. Please request a new one." 
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6 font-sans">
      <div className="max-w-md w-full bg-white p-10 rounded-[3rem] shadow-2xl border border-emerald-50 relative overflow-hidden">
        
        {/* Branding/Header */}
        <div className="mb-8">
          <div className="h-14 w-14 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center mb-6">
            <KeyRound size={28} />
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight uppercase italic">
            New Password
          </h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-2">
            Protocol: Secure Credential Reset
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">New Access Key</label>
            <input
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all font-bold"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Confirm Access Key</label>
            <input
              type="password"
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-4 focus:ring-emerald-50 focus:bg-white transition-all font-bold"
              required
            />
          </div>

          <button
            disabled={loading || status.type === 'success'}
            className="w-full py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:active:scale-100"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Authorize Update"}
          </button>
        </form>

        {/* Status Messages */}
        {status.text && (
          <div className={`mt-6 p-5 rounded-2xl text-[11px] font-black uppercase leading-tight flex items-start gap-3 animate-in fade-in slide-in-from-top-2 ${
            status.type === 'success' 
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
              : 'bg-rose-50 text-rose-700 border border-rose-100'
          }`}>
            {status.type === 'success' ? <CheckCircle size={18} className="shrink-0" /> : <AlertCircle size={18} className="shrink-0" />}
            {status.text}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordConfirm;