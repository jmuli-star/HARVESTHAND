import react from 'react'
import Homepage from './Components/Homepage'
import Home from './Pages/Home'
import Logintoogle from './Components/Logintoogle'
import Forms from './Pages/Forms'
import Contactus from './Pages/Contactus'
import Aboutus from './Pages/Aboutus'
import Axiosfetch from './Components/Axiosfetch'
import Navbar from './Components/Navbar'
import { Route,Routes } from 'react-router-dom'
function App() {
  

  return (
    <>
   <Navbar/>
    <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/about' element={<Aboutus/>}/>
    <Route path='/login' element={<Logintoogle/>}/>
    <Route path='/axios' element={<Axiosfetch/>}/>
    </Routes>
  
   

  
    
    </>
  )
}

export default App
