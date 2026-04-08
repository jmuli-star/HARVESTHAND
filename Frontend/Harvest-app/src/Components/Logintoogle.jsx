import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LogIn, UserPlus, Leaf, Globe, ShieldCheck, Loader2 
} from 'lucide-react';

const API_BASE = "http://127.0.0.1:8000/api/v1";

function Logintoogle() {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    institution_name: '',
    role: 'user',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  // --- GOOGLE OAUTH HASH HANDLING ---
  useEffect(() => {
    const hash = window.location.hash;
    if (hash && hash.includes('access=')) {
      const params = {};
      hash.substring(1).split('&').forEach(pair => {
        const [key, value] = pair.split('=');
        params[key] = value;
      });

      if (params.access) {
        localStorage.setItem('access_token', params.access);
        localStorage.setItem('refresh_token', params.refresh || '');
        localStorage.setItem('user_role', params.role || 'user');

        window.history.replaceState(null, null, window.location.pathname);

        const roleRoutes = {
          admin: '/dashboard/admin',
          farmhand: '/dashboard/farmhand',
          farmcorrespondent: '/dashboard/farmcorrespondent',
          farminstitution: '/dashboard/farminstitution',
          user: '/dashboard/user'
        };

        navigate(roleRoutes[params.role] || '/dashboard/user');
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleAuth = () => {
    window.location.href = `${API_BASE}/auth/google/`;
  };

  const redirectUser = (role) => {
    const routes = {
      admin: '/dashboard/admin',
      farmhand: '/dashboard/farmhand',
      farmcorrespondent: '/dashboard/farmcorrespondent',
      farminstitution: '/dashboard/farminstitution',
      user: '/dashboard/user',
    };
    navigate(routes[role] || '/dashboard/user');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const res = await axios.post(`${API_BASE}/login/`, {
        email: formData.email,
        password: formData.password,
      });
      
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user_role', res.data.user.role);
      
      setMessage("Welcome back to the field! 🌾");
      redirectUser(res.data.user.role);
    } catch (err) {
      setMessage(err.response?.data?.detail || "Invalid email or password.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
      return setMessage("Passwords do not match!");
    }
    
    setLoading(true);
    setMessage("");

    try {
      const res = await axios.post(`${API_BASE}/register/`, {
        email: formData.email,
        password: formData.password,
        password2: formData.password2,
        role: formData.role,
        institution_name: formData.institution_name || ""
      });

      setMessage("Account created successfully! 🎉");
      
      if (res.data.access) {
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('user_role', res.data.user.role);
        redirectUser(res.data.user.role);
      } else {
        setMessage("Account created! Redirecting to login...");
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err) {
      const data = err.response?.data;
      const errorMsg = data?.email?.[0] || data?.password2?.[0] || data?.detail || "Registration failed.";
      setMessage(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-stone-50 to-amber-50 flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Brand Header */}
        <div className="flex items-center justify-center gap-3 mb-10">
          <div className="w-14 h-14 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-xl">
            <Leaf className="text-white w-9 h-9" />
          </div>
          <h1 className="text-5xl font-black text-emerald-900 tracking-tighter">
            Harvest<span className="text-amber-600">Hub</span>
          </h1>
        </div>

        <div className="bg-white rounded-[2.75rem] shadow-2xl border border-emerald-100 overflow-hidden">
          
          {/* Login / Register Toggle */}
          <div className="flex m-4 bg-emerald-50 rounded-[2rem] p-1">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-4 rounded-[1.75rem] text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                isLogin 
                  ? 'bg-white shadow-sm text-emerald-700' 
                  : 'text-stone-500 hover:text-emerald-600'
              }`}
            >
              <LogIn size={18} /> Login
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-4 rounded-[1.75rem] text-sm font-bold flex items-center justify-center gap-2 transition-all ${
                !isLogin 
                  ? 'bg-white shadow-sm text-emerald-700' 
                  : 'text-stone-500 hover:text-emerald-600'
              }`}
            >
              <UserPlus size={18} /> Register
            </button>
          </div>

          <div className="px-8 pb-8">
            <h2 className="text-3xl font-bold text-center text-emerald-900 mb-8">
              {isLogin ? 'Welcome back to the field' : 'Join the farm family'}
            </h2>

            {/* Google Button */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              className="w-full py-4 bg-white border-2 border-stone-200 rounded-3xl flex items-center justify-center gap-4 font-semibold text-stone-700 hover:border-emerald-300 hover:bg-emerald-50 transition-all active:scale-95 mb-8"
            >
              <Globe className="text-blue-500" size={22} />
              {isLogin ? 'Sign in with Google' : 'Register with Google'}
            </button>

            <div className="relative text-center mb-8">
              <hr className="border-emerald-100" />
              <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white px-6 text-xs font-bold text-emerald-400 tracking-widest">
                OR CONTINUE WITH EMAIL
              </span>
            </div>

            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@farm.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-5 bg-emerald-50 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none transition-all text-stone-700"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-5 bg-emerald-50 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none transition-all text-stone-700"
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2">Confirm Password</label>
                    <input
                      name="password2"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password2}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-5 bg-emerald-50 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none transition-all text-stone-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2">Farm / Organization Name</label>
                    <input
                      name="institution_name"
                      type="text"
                      placeholder="e.g. Green Valley Co-op"
                      value={formData.institution_name}
                      onChange={handleChange}
                      className="w-full px-6 py-5 bg-emerald-50 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none transition-all text-stone-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-500 mb-2">Your Role</label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-6 py-5 bg-emerald-50 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none transition-all text-stone-700"
                    >
                      <option value="user">Grower / Basic User</option>
                      <option value="farmhand">Farm Hand</option>
                      <option value="farmcorrespondent">Farm Correspondent</option>
                      <option value="farminstitution">Farming Institution</option>
                      <option value="admin">Administrator</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-3xl transition-all active:scale-95 flex items-center justify-center gap-3 shadow-xl shadow-emerald-200"
              >
                {loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : isLogin ? (
                  <>Login to HarvestHub</>
                ) : (
                  <>Create My Account 🌱</>
                )}
              </button>
            </form>

            {/* Message */}
            {message && (
              <div className={`mt-8 p-4 rounded-3xl text-sm font-medium flex items-center gap-3 ${
                message.includes('success') || message.includes('Welcome') || message.includes('created')
                  ? 'bg-emerald-100 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-100 text-rose-700 border border-rose-200'
              }`}>
                <ShieldCheck size={18} />
                {message}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={handleDecline}
          className="mt-8 w-full text-stone-400 hover:text-rose-500 text-xs font-bold tracking-widest uppercase transition-colors"
        >
          Clear Session &amp; Return Home
        </button>
      </div>
    </div>
  );
}

export default Logintoogle;