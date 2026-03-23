import axios from 'axios';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

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

  // Helper function to handle role-based navigation
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
      const res = await axios.post('http://127.0.0.1:8000/api/v1/login/', {
        email: formData.email,
        password: formData.password,
      });

      // Save tokens and role
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      localStorage.setItem('user_role', res.data.user.role);

   

      setMessage("Logged in successfully!");
      redirectUser(res.data.user.role);
    } catch (err) {
      setMessage("Login failed. Check credentials.");
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/register/', formData);
      
      setMessage("Registration successful!");

      // If your backend returns a token on register, use it. 
      // If not, we switch to login mode so they can sign in.
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
        console.log("Server Error:", err.response.data);
        // Show specific field errors (e.g., "Email already exists")
        const errorDetail = typeof err.response.data === 'object' 
          ? JSON.stringify(err.response.data) 
          : err.response.data.detail;
        setMessage(`Error: ${errorDetail}`);
      } else {
        setMessage("Network error or server is down.");
      }
    }
  };

  const handleLogout = () => {
    localStorage.clear(); // Clears everything including role
    setMessage("Logged out.");
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-4">
      <div className="bg-white p-8 rounded shadow-md w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center">
          {isLogin ? 'Login to Harvest' : 'Register Account'}
        </h2>

        <form onSubmit={isLogin ? handleLogin : handleRegister} className="space-y-4">
          <input
            name="email"
            type="email"
            placeholder="Email"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            className="w-full p-2 border rounded"
            onChange={handleChange}
            required
          />

          {!isLogin && (
            <>
              <input
                name="password2"
                type="password"
                placeholder="Confirm Password"
                className="w-full p-2 border rounded"
                onChange={handleChange}
                required
              />
              <input
                name="institution_name"
                type="text"
                placeholder="Institution Name"
                className="w-full p-2 border rounded"
                onChange={handleChange}
              />
              {/* FIXED SELECT OPTIONS BELOW */}
              <select 
                name="role" 
                className="w-full p-2 border rounded"
                onChange={handleChange}
                value={formData.role}
              >
                <option value="farmhand">FarmHand</option>
                <option value="farmcorrespondent">FarmCorrespondent</option>
                <option value="farminstitution">FarmInstitution</option>
                <option value="admin">Admin</option>
                <option value="user">User</option>
              </select>
            </>
          )}

          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => { setIsLogin(!isLogin); setMessage(''); }} 
            className="text-blue-600 text-sm underline"
          >
            {isLogin ? "Need an account? Register" : "Already have an account? Login"}
          </button>
        </div>

        <button 
          onClick={handleLogout} 
          className="mt-6 w-full text-red-500 text-sm border border-red-500 p-2 rounded"
        >
          Logout
        </button>

        {message && <p className="mt-4 text-center text-sm font-semibold text-gray-700">{message}</p>}
      </div>
    </div>
  );
}

export default Logintoogle;