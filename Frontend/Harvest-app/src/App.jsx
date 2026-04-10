import React from 'react'
import { Route, Routes } from 'react-router-dom'
import axios from 'axios'

// Import all your components
import Home from './pages/Home'
import Logintoogle from './components/Logintoogle'
import RegisterUser from './components/CompleteRegister'
import Aboutus from './pages/Aboutus'
import Axiosfetch from './components/Axiosfetch'
import ProtectedRoute from './components/ProtectRoute'
import UserDash from './pages/UserDash'
import FarminstitutDash from './pages/FarminstitutDash'
import FarmhandDash from './pages/FarmhandDash'
import AdminDash from './pages/AdminDash'
import RegisterAdmin from './components/RegisterAdmin'
import ResetPasswordConfirm from './components/PasswordReset'
import Service from './pages/Service'
import FarmcorrsDash from './pages/FarmcorrsDash'

// --- AXIOS INTERCEPTOR CONFIGURATION ---

axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

function App() {
  return (
    <>
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/about' element={<Aboutus />} />
        <Route path='/services' element={<Service />} />
        
        {/* Registration Paths */}
        <Route path='/register-admin' element={<RegisterUser />} />
        <Route path='/register-correspondent' element={<RegisterUser />} />
        <Route path='/register-institution' element={<RegisterUser />} />
        <Route path='/register-farmhand' element={<RegisterUser />} />
        
        {/* Auth Paths */}
        <Route path='/login' element={<Logintoogle />} />
        <Route path="/reset-password/:uid/:token" element={<ResetPasswordConfirm />} />
        <Route path='/axios' element={<Axiosfetch />} />

        {/* --- PROTECTED DASHBOARD ROUTES --- */}
        
        {/* 1. Farmhand */}
        <Route 
          path="/dashboard/farmhand" 
          element={
            <ProtectedRoute allowedRoles={['farmhand']}>
              <FarmhandDash />
            </ProtectedRoute>
          } 
        />

        {/* 2. Correspondent */}
        <Route 
          path="/dashboard/farmcorrespondent" 
          element={
            <ProtectedRoute allowedRoles={['farmcorrespondent']}>
              <FarmcorrsDash />
            </ProtectedRoute>
          } 
        /> 

        {/* 3. Institution */}
        <Route 
          path="/dashboard/farminstitution" 
          element={
            <ProtectedRoute allowedRoles={['farminstitution']}>
              <FarminstitutDash />
            </ProtectedRoute>
          } 
        />

        {/* 4. Admin */}
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDash />
            </ProtectedRoute>
          } 
        />
        
        <Route
          path="/register-admin-provision"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <RegisterAdmin />
            </ProtectedRoute>
          }
        />

        {/* 5. General User */}
        <Route 
          path="/dashboard/user" 
          element={
            <ProtectedRoute allowedRoles={['user']}>
              <UserDash />
            </ProtectedRoute>
          } 
        />

        {/* Catch-all for Unauthorized or Not Found */}
        <Route path="/unauthorized" element={<div className="p-10 text-red-500 font-bold">Access Denied: You do not have permission to view this page.</div>} />
        <Route path="*" element={<div className="p-10 text-slate-500">404: Page Not Found</div>} />
      </Routes>
    </>
  )
}

export default App