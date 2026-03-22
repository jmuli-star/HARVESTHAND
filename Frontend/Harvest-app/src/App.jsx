import react from 'react'
import Homepage from './Components/Homepage'
import Home from './Pages/Home'
import Logintoogle from './Pages/logintoogle'
import Forms from './Pages/Forms'
import Contactus from './Pages/Contactus'
import Aboutus from './Pages/Aboutus'
import Navbar from './Components/Navbar'
import { Route,Routes } from 'react-router-dom'
function App() {
  

  return (
    <>
   <Navbar/>
    <Routes>
    <Route path='/' element={<Home/>}/>
    <Route path='/about' element={<Aboutus/>}/>
    </Routes>
   

  
    
    </>
  )
}

export default App
