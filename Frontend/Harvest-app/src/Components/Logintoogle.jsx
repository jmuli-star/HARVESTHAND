import axios from 'axios';
import React, { useState } from 'react';



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

  const API_URL = "";

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://127.0.0.1:8000/api/v1/login/', {
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem('access_token', res.data.access);
      localStorage.setItem('refresh_token', res.data.refresh);
      setMessage("Logged in successfully!");
    } catch (err) {
      setMessage("Login failed. Check credentials.");
    }
  };

  const handleRegister = async (e) => {
  e.preventDefault();
  try {
    const res = await axios.post('http://127.0.0.1:8000/api/v1/register/', formData);
    setMessage("Registration successful!");
  } catch (err) {
    // Check if the server actually sent a response
    if (err.response) {
      console.log("Server Error Data:", err.response.data);
      setMessage("Server Error: " + (err.response.data.detail || "Check Django terminal"));
    } else {
      console.log("Network Error:", err.message);
      setMessage("Network error or server is down.");
    }
  }
};
  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    setMessage("Logged out.");
  };

  return (
    <>
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
              <select 
                name="role" 
                className="w-full p-2 border rounded"
                onChange={handleChange}
                value={formData.role}
              >
                <option value="farmhand">FarmHand</option>
                <option value="farmcorrespondent">FarmCorrespondent</option>
              </select>
            </>
          )}

          <button type="submit" className="w-full bg-green-600 text-white p-2 rounded hover:bg-green-700">
            {isLogin ? 'Login' : 'Register'}
          </button>
        </form>

        <div className="mt-4 text-center">
          <button 
            onClick={() => setIsLogin(!isLogin)} 
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

        {message && <p className="mt-4 text-center text-sm font-semibold">{message}</p>}
      </div>
    </div>
  </>
  )
}

export default Logintoogle;