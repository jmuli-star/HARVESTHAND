import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../Components/Navbar';

function Home() {
  const navigate = useNavigate();

  const goLogin = () => {
    navigate("/Login");
  };

  return (
    <>
    <Navbar/>
      {/* ==================== HERO SECTION ==================== */}
      <section className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-amber-700 py-24 text-white relative overflow-hidden">
        

        <div className="max-w-7xl mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-6 py-2 rounded-3xl text-sm font-medium mb-6">

            looking to improve your adventure into farming
          </div>

          <h1 className="text-6xl md:text-7xl font-extrabold leading-none mb-6">
            Your Farm's<br />Digital Right Hand.
          </h1>

          <p className="text-xl md:text-2xl text-emerald-100 max-w-2xl mx-auto mb-10">
            Track growth cycle, connect with local markets — 
            all from one simple, beautiful dashboard built for real farmers.
          </p>

          <button 
            onClick={goLogin}
            className="px-10 py-5 bg-amber-500 hover:bg-amber-600 text-white text-xl font-bold rounded-3xl shadow-xl shadow-emerald-950/30 transition-all hover:scale-105 flex items-center gap-3 mx-auto"
          >
            Start Your Harvest Today
           
          </button>

         
        </div>
      </section>

      {/* ==================== FEATURES SECTION ==================== */}
      <div className="py-20 bg-gradient-to-b from-emerald-50 to-amber-50">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <span className="uppercase text-emerald-600 font-bold text-sm tracking-widest">Built for the field</span>
            <h2 className="text-4xl font-bold text-stone-800 mt-2">Everything your farm needs in one place</h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8 text-left">
            
            {/* Container 1 - Crop Tracking */}
            <div className="group bg-white rounded-3xl shadow-md border border-emerald-200 p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center text-5xl mb-6 group-hover:rotate-12 transition-transform">
              
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-3">Crop Tracking</h3>
              <p className="text-stone-600 leading-relaxed">
                Simplify your daily farm operations with automated crop tracking tools — real-time soil, growth stages &amp; harvest insights.
              </p>
            </div>

            {/* Container 2 - Direct Contact */}
            <div className="group bg-white rounded-3xl shadow-md border border-amber-200 p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300">
              <div className="w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-5xl mb-6 group-hover:rotate-12 transition-transform">
                
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-3">Direct Contact to Personnel</h3>
              <p className="text-stone-600 leading-relaxed">
                Simplify your daily farm operations with automated direct contact tools — instant chat &amp; video with field workers and agronomists.
              </p>
            </div>

            {/* Container 3 - Market Insights */}
            <div className="group bg-white rounded-3xl shadow-md border border-teal-200 p-8 hover:shadow-2xl hover:-translate-y-3 transition-all duration-300">
              <div className="w-16 h-16 bg-teal-100 rounded-2xl flex items-center justify-center text-5xl mb-6 group-hover:rotate-12 transition-transform">
              
              </div>
              <h3 className="text-2xl font-bold text-stone-800 mb-3">Market Insights</h3>
              <p className="text-stone-600 leading-relaxed">
                Simplify your daily farm operations with automated market insights tools — live prices, buyer demand &amp; smart selling tips.
              </p>
            </div>

          </div>
        </div>
      </div>

      <br/>

      <div className="py-20 bg-emerald-50">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-center text-4xl font-bold text-stone-800 mb-12">Real farmers, real results</h2>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <p className="italic text-stone-600 mb-6">"HarvestHub cut my weekly paperwork in half. I can finally spend more time in the field instead of on the computer."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-200 rounded-2xl flex items-center justify-center text-2xl"></div>
                <div>
                  <div className="font-semibold">Sarah Thompson</div>
                  <div className="text-sm text-stone-500">Thompson Family Farms</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <p className="italic text-stone-600 mb-6">"The market insights are gold. Last month I sold my entire soybean crop 12% above market price thanks to their buyer alerts."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-200 rounded-2xl flex items-center justify-center text-2xl"></div>
                <div>
                  <div className="font-semibold">Miguel Rodriguez</div>
                  <div className="text-sm text-stone-500">Rodriguez Ranch</div>
                </div>
              </div>
            </div>
            
            <div className="bg-white p-8 rounded-3xl shadow-sm">
              <p className="italic text-stone-600 mb-6">"My crew loves the direct chat feature. No more yelling across the field — everything is instant and documented."</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-200 rounded-2xl flex items-center justify-center text-2xl">🚜</div>
                <div>
                  <div className="font-semibold">James Keller</div>
                  <div className="text-sm text-stone-500">Keller Dairy </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br/>
      <div className="bg-emerald-800 text-white py-16 text-center">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-5xl font-bold mb-4">Ready to grow smarter?</h2>
          <p className="text-emerald-200 text-xl mb-10">Join thousands of farmers already using HarvestHand to run a more profitable, stress-free operation.</p>
          <button 
            onClick={goLogin}
            className="px-12 py-6 bg-amber-500 hover:bg-amber-600 text-2xl font-bold rounded-3xl transition-all hover:scale-105"
          >
            Get Started for Free 
          </button>
        </div>
      </div>
    </>
  );
}

export default Home;