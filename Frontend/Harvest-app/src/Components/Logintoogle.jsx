 import axios from 'axios';
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Leaf, Globe } from 'lucide-react';

// Use a base URL to make maintenance easier
const API_BASE = "http://127.0.0.1:8000/api/v1";

function Logintoogle() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    password2: '',
    institution_name: '',
    role: 'farmhand',
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
  const hash = window.location.hash;
  console.log("Full Hash received:", hash);

  if (hash && hash.includes('access=')) {
    // 1. Manually split the string (Reliable for long JWTs)
    const params = {};
    hash.substring(1).split('&').forEach(pair => {
      const [key, value] = pair.split('=');
      params[key] = value;
    });

    console.log("Parsed Role:", params.role);

    if (params.access) {
      // 2. Save everything to LocalStorage
      localStorage.setItem('access_token', params.access);
      localStorage.setItem('refresh_token', params.refresh);
      localStorage.setItem('user_role', params.role || 'user');

      // 3. Clean the URL immediately for security
      window.history.replaceState(null, null, window.location.pathname);

      // 4. Map the role to a valid route
      const roleRoutes = {
        'admin': '/dashboard/admin',
        'farmhand': '/dashboard/farmhand',
        'farmcorrespondent': '/dashboard/farmcorrespondent',
        'farminstitution': '/dashboard/farminstitution',
        'user': '/dashboard/user' // Your current role is 'user'
      };

      const target = roleRoutes[params.role] || '/dashboard/user';
      console.log("Navigating to:", target);
      navigate(target);
    }
  }
}, [navigate]);

  

  
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGoogleAuth = () => {
    // Hits the Django endpoint that starts the Google flow
    window.location.href = `${API_BASE}/auth/google/`;
  };

  const redirectUser = (role) => {
    const routes = {
      farmhand: '/dashboard/farmhand',
      farmcorrespondent: '/dashboard/farmcorrespondent',
      farminstitution: '/dashboard/farminstitution',
      admin: '/dashboard/admin',
    };
    navigate(routes[role] || '/dashboard/user');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // FIX 2: Ensure the path is correct (api/v1/login/)
      const res = await axios.post(`${API_BASE}/login/`, {
        email: formData.email,
        password: formData.password,
      });
      
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user_role', res.data.user.role);
      
      setMessage("Welcome back!");
      redirectUser(res.data.user.role);
    } catch (err) {
      setMessage("Invalid email or password.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.password2) {
        return setMessage("Passwords do not match!");
    }
    try {
      const res = await axios.post(`${API_BASE}/register/`, formData);
      setMessage("Registration successful! 🎉");
      
      // If your register view returns tokens immediately:
      if (res.data.access) {
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('user_role', res.data.user.role);
        redirectUser(res.data.user.role);
      } else {
        setMessage("Account created! Switch to Login.");
        setTimeout(() => setIsLogin(true), 2000);
      }
    } catch (err) {
      const errorMsg = err.response?.data?.email?.[0] || "Registration failed.";
      setMessage(errorMsg);
    }
  };

  const handledecline = () => {
    localStorage.clear();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-3xl flex items-center justify-center shadow-inner">
            <Leaf className="text-white w-7 h-7" />
          </div>
          <h1 className="text-4xl font-bold text-emerald-800 tracking-tight">HarvestHand</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
          {/* Tabs */}
          <div className="flex border-b border-emerald-100">
            <button onClick={() => setIsLogin(true)} className={`flex-1 py-5 text-lg font-semibold flex items-center justify-center gap-2 ${isLogin ? 'bg-emerald-600 text-white' : 'text-stone-600'}`}><LogIn className="w-5 h-5" /> Login</button>
            <button onClick={() => setIsLogin(false)} className={`flex-1 py-5 text-lg font-semibold flex items-center justify-center gap-2 ${!isLogin ? 'bg-emerald-600 text-white' : 'text-stone-600'}`}><UserPlus className="w-5 h-5" /> Register</button>
          </div>

          <div className="p-8">
            <h2 className="text-3xl font-bold text-emerald-900 text-center mb-8">{isLogin ? 'Welcome back' : 'Join the farm'}</h2>

            <button type="button" onClick={handleGoogleAuth} className="w-full mb-6 py-4 border-2 border-stone-100 rounded-2xl flex items-center justify-center gap-3 font-bold text-stone-700 hover:bg-stone-50 transition-all active:scale-95">
              <Globe className="text-blue-500 w-5 h-5" /> {isLogin ? "Sign in with Google" : "Sign up with Google"}
            </button>

            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
              <input name="email" type="email" placeholder="Email" value={formData.email} onChange={handleChange} required className="w-full px-6 py-4 border rounded-2xl" />
              <input name="password" type="password" placeholder="Password" value={formData.password} onChange={handleChange} required className="w-full px-6 py-4 border rounded-2xl" />
              {!isLogin && (
                <>
                  <input name="password2" type="password" placeholder="Confirm Password" value={formData.password2} onChange={handleChange} required className="w-full px-6 py-4 border rounded-2xl" />
                  <input name="institution_name" type="text" placeholder="Farm Name" value={formData.institution_name} onChange={handleChange} className="w-full px-6 py-4 border rounded-2xl" />
                  <select name="role" value={formData.role} onChange={handleChange} className="w-full px-6 py-4 border rounded-2xl bg-white">
                    <option value="farmhand">Farm Hand</option>
                    <option value="farmcorrespondent">Correspondent</option>
                    <option value="farminstitution">Institution</option>
                  </select>
                </>
              )}
              <button type="submit" className="w-full py-5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl rounded-3xl transition-all">
                {isLogin ? 'Login to HarvestHub' : 'Create Farm Account'}
              </button>
            </form>

            {message && <p className="mt-4 text-center p-3 bg-emerald-50 text-emerald-700 rounded-xl">{message}</p>}
          </div>
        </div>
        <button onClick={handledecline} className="mt-8 w-full text-stone-400 hover:text-red-500 text-sm">Logout Session</button>
      </div>
    </div>
  );
}

export default Logintoogle;