import React from 'react'
import { useNavigate } from 'react-router-dom'
function Home() {
  const navigate = useNavigate();

  const goLogin = () =>{
    navigate("/Login")
  }

  return (
    <>
    <div className="text-center space-y-12">
    <section className="py-10">
      <h1 className="text-5xl font-extrabold text-green-900 mb-4">
        Your Farm's Digital Right Hand.
      </h1>
      <p className="text-xl text-stone-600 max-w-2xl mx-auto">
        Track growth cycles, manage soil health, and connect with local markets—all from one simple dashboard.
      </p>
      <button onClick={goLogin} className="mt-8 px-8 py-3 bg-amber-600 text-white rounded-full font-bold hover:bg-amber-700 transition">
        Start Your Harvest
      </button>
    </section>

    <div className="grid md:grid-cols-3 gap-8 text-left">
      {['Crop Tracking', 'Soil Analysis', 'Market Insights'].map((feature) => (
        <div key={feature} className="p-6 bg-white rounded-xl shadow-sm border border-stone-200">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center text-green-700 mb-4">🌱</div>
          <h3 className="text-lg font-bold">{feature}</h3>
          <p className="text-stone-500 text-sm mt-2">Simplify your daily farm operations with automated {feature.toLowerCase()} tools.</p>
        </div>
      ))}
    </div>
  </div>
   
  
    </>
    
  )
}

export default Home