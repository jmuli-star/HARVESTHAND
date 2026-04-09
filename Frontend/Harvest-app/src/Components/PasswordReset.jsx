import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { KeyRound, Loader2, CheckCircle } from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000/api/v1";

function ResetPasswordConfirm() {
  const { uid, token } = useParams(); // Grabs MQ and the token from the URL
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setMessage("Passwords do not match.");
    }

    setLoading(true);
    try {
      await axios.post(`${API_BASE}/auth/password-reset-confirm/`, {
        uid,
        token,
        new_password: password
      });
      setMessage("Password reset successful! Redirecting to login...");
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setMessage("Link expired or invalid. Please request a new one.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white p-8 rounded-[2.5rem] shadow-xl border border-emerald-100">
        <h2 className="text-3xl font-bold text-emerald-900 mb-6 flex items-center gap-2">
          <KeyRound className="text-amber-600" /> New Password
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-6 py-4 bg-emerald-50 rounded-2xl outline-none"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="w-full px-6 py-4 bg-emerald-50 rounded-2xl outline-none"
            required
          />
          <button
            disabled={loading}
            className="w-full py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </button>
        </form>

        {message && (
          <div className="mt-4 p-4 bg-amber-50 text-amber-800 rounded-xl text-sm font-medium flex items-center gap-2">
            <CheckCircle size={16} /> {message}
          </div>
        )}
      </div>
    </div>
  );
}

export default ResetPasswordConfirm;