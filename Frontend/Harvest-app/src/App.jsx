import react from 'react'
import Homepage from './Components/Homepage'
import Home from './Pages/Home'
import Logintoogle from './Components/Logintoogle'
import Forms from './Pages/Forms'
import Contactus from './Pages/Contactus'
import Aboutus from './Pages/Aboutus'
import Axiosfetch from './Components/Axiosfetch'
import ProtectedRoute from './Components/ProtectRoute'
import UserDash from './Pages/UserDash'
import FarminstitutDash from './Pages/FarminstitutDash'
import FarmhandDash from './Pages/FarmhandDash'
import AdminDash from './Pages/AdminDash'
import Navbar from './Components/Navbar'
import { Route,Routes } from 'react-router-dom'
import FarmcorrsDash from './Pages/FarmcorrsDash'
function App() {
  

  return (
    <>
   <Navbar/>
    <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/about' element={<Aboutus/>}/>
    <Route path='/login' element={<Logintoogle/>}/>
    <Route path='/axios' element={<Axiosfetch/>}/>

    {/* 1. Farmhand */}
  <Route 
    path="/dashboard/farmhand" 
    element={
      <ProtectedRoute allowedRoles={['FarmHand']}>
        <FarmhandDash />
      </ProtectedRoute>
    } 
  />
  {/* 2. Correspondent - UPDATED PATH TO MATCH ERROR */}
        <Route 
          path="/dashboard/farmcorrespondent" 
          element={
            <ProtectedRoute allowedRoles={['FarmCorrespondent']}>
              <FarmcorrsDash />
            </ProtectedRoute>
          } 
        /> 

        {/* 3. Institution */}
        <Route 
          path="/dashboard/farminstitution" 
          element={
            <ProtectedRoute allowedRoles={['FarmInstitution']}>
              <FarminstitutDash />
            </ProtectedRoute>
          } 
        />

        {/* 4. Admin */}
        <Route 
          path="/dashboard/admin" 
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <AdminDash />
            </ProtectedRoute>
          } 
        />

        {/* 5. General User */}
        <Route 
          path="/dashboard/user" 
          element={
            <ProtectedRoute allowedRoles={['User']}>
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
