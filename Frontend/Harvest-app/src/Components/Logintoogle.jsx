import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, UserPlus, Leaf } from 'lucide-react'; // optional icons

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

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const redirectUser = (role) => {
    if (role === 'farmhand') navigate('/dashboard/farmhand');
    else if (role === 'farmcorrespondent') navigate('/dashboard/farmcorrespondent');
    else if (role === 'farminstitution') navigate('/dashboard/farminstitution');
    else if (role === 'admin') navigate('/dashboard/admin');
    else navigate('/dashboard/user');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/login/', {
        email: formData.email,
        password: formData.password,
      });

      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user_role', res.data.user.role);

      setMessage("Logged in successfully! 🌾");
      redirectUser(res.data.user.role);
    } catch (err) {
      setMessage("Login failed. Check credentials.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/register/', formData);
      
      setMessage("Registration successful! 🎉");

      if (res.data.access) {
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('user_role', res.data.user.role);
        redirectUser(res.data.user.role);
      } else {
        setMessage("Account created! Please login now.");
        setTimeout(() => setIsLogin(true), 1500);
      }
    } catch (err) {
      if (err.response) {
        const errorDetail = typeof err.response.data === 'object' 
          ? JSON.stringify(err.response.data) 
          : err.response.data.detail || "Registration failed";
        setMessage(`Error: ${errorDetail}`);
      } else {
        setMessage("Network error or server is down.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    setMessage("Logged out.");
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-amber-50 to-white flex items-center justify-center p-6">
      <div className="max-w-md w-full">
        
        {/* Logo & Title */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="w-12 h-12 bg-emerald-600 rounded-3xl flex items-center justify-center text-4xl shadow-inner">
            🌾
          </div>
          <h1 className="text-4xl font-bold text-emerald-800 tracking-tight">HarvestHub</h1>
        </div>

        <div className="bg-white rounded-3xl shadow-2xl border border-emerald-100 overflow-hidden">
          
          {/* Toggle Tabs */}
          <div className="flex border-b border-emerald-100">
            <button
              onClick={() => { setIsLogin(true); setMessage(''); }}
              className={`flex-1 py-5 text-lg font-semibold transition-all flex items-center justify-center gap-2
                ${isLogin 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-stone-600 hover:bg-emerald-50'}`}
            >
              <LogIn className="w-5 h-5" />
              Login
            </button>
            <button
              onClick={() => { setIsLogin(false); setMessage(''); }}
              className={`flex-1 py-5 text-lg font-semibold transition-all flex items-center justify-center gap-2
                ${!isLogin 
                  ? 'bg-emerald-600 text-white' 
                  : 'text-stone-600 hover:bg-emerald-50'}`}
            >
              <UserPlus className="w-5 h-5" />
              Register
            </button>
          </div>

          <div className="p-8">
            <h2 className="text-3xl font-bold text-emerald-900 text-center mb-8">
              {isLogin ? 'Welcome back to the field' : 'Join the farm family'}
            </h2>

            <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-6">
              
              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">Email Address</label>
                <input
                  name="email"
                  type="email"
                  placeholder="you@farm.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-400 transition text-stone-700"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-stone-600 mb-2">Password</label>
                <input
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-6 py-4 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-400 transition text-stone-700"
                />
              </div>

              {!isLogin && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Confirm Password</label>
                    <input
                      name="password2"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password2}
                      onChange={handleChange}
                      required
                      className="w-full px-6 py-4 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-400 transition text-stone-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Institution / Farm Name</label>
                    <input
                      name="institution_name"
                      type="text"
                      placeholder="Green Valley Cooperative"
                      value={formData.institution_name}
                      onChange={handleChange}
                      className="w-full px-6 py-4 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-400 transition text-stone-700"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-stone-600 mb-2">Your Role</label>
                    <select 
                      name="role" 
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full px-6 py-4 border border-stone-200 rounded-2xl focus:outline-none focus:border-emerald-400 transition bg-white text-stone-700"
                    >
                      <option value="farmhand">Farm Hand</option>
                      <option value="farmcorrespondent">Farm Correspondent</option>
                      <option value="farminstitution">Farm Institution</option>
                      <option value="admin">Admin</option>
                      <option value="user">Individual User</option>
                    </select>
                  </div>
                </>
              )}

              <button
                type="submit"
                className="w-full py-5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xl rounded-3xl transition-all hover:scale-105 shadow-md flex items-center justify-center gap-3"
              >
                {isLogin ? (
                  <>Login to HarvestHub <Leaf className="w-6 h-6" /></>
                ) : (
                  <>Create My Farm Account 🌱</>
                )}
              </button>
            </form>

            {/* Toggle Link */}
            <div className="mt-6 text-center">
              <button
                onClick={() => { setIsLogin(!isLogin); setMessage(''); }}
                className="text-emerald-700 hover:text-emerald-800 font-medium transition"
              >
                {isLogin 
                  ? "Don't have an account? Register here" 
                  : "Already have an account? Login instead"}
              </button>
            </div>

            {/* Message */}
            {message && (
              <p className={`mt-6 text-center font-semibold text-sm py-3 px-6 rounded-2xl ${
                message.includes('success') || message.includes('created')
                  ? 'bg-emerald-100 text-emerald-700'
                  : 'bg-red-100 text-red-700'
              }`}>
                {message}
              </p>
            )}
          </div>
        </div>

        {/* Logout Button (only visible if logged in) */}
        <button
          onClick={handleLogout}
          className="mt-8 w-full text-stone-500 hover:text-red-600 text-sm flex items-center justify-center gap-2 transition"
        >
          <span>Logout from current session</span>
        </button>

        <p className="text-center text-stone-400 text-xs mt-8">
          © 2026 HarvestHub • Made for real farmers
        </p>
      </div>
    </div>
  );
}

export default Logintoogle;