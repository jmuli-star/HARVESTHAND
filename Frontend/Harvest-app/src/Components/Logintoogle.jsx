import React, { useState } from 'react';


function Logintoogle() {
  // 1. Create our 'loggedIn' state, defaulting to false
  const [loggedIn, setLoggedIn] = useState(false);

  // 2. A helper function to toggle the state back and forth
  const handleToggle = () => {
    setLoggedIn((prevState) => !prevState);
  };

  return (
    <>
      {/* Full-screen centered background with dark modern theme */}
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-zinc-950 to-black flex items-center justify-center p-6">
        
        {/* Main card container */}
        <div className="w-full max-w-md bg-zinc-900/90 backdrop-blur-xl border border-zinc-800 rounded-3xl shadow-2xl p-10">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <span className="text-4xl">🔐</span>
            </div>
            <h2 className="text-4xl font-bold tracking-tight text-white">Welcome to the App</h2>
            <p className="text-zinc-400 mt-2 text-lg">Simple toggle demo with Tailwind</p>
          </div>

          {/* Status message with conditional styling */}
          <div
            className={`mb-8 p-5 rounded-2xl text-center text-xl font-medium transition-all duration-300 ${
              loggedIn
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                : 'bg-amber-950 text-amber-300 border border-amber-800'
            }`}
          >
            Status:{' '}
            <span className="font-semibold">
              {loggedIn ? '✅ You are logged in!' : '🔒 Please log in.'}
            </span>
          </div>

          {/* Toggle button with smooth hover & conditional colors */}
          <button
            onClick={handleToggle}
            className={`w-full py-4 rounded-2xl font-semibold text-lg tracking-wide transition-all duration-300 flex items-center justify-center gap-3 shadow-lg active:scale-95 ${
              loggedIn
                ? 'bg-red-600 hover:bg-red-700 text-white border border-red-500'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border border-emerald-500'
            }`}
          >
            {loggedIn ? (
              <>
                <span>🚪</span> Log Out
              </>
            ) : (
              <>
                <span>🔑</span> Log In
              </>
            )}
          </button>

          {/* Subtle footer hint */}
          <p className="text-center text-zinc-500 text-sm mt-8">
            Click the button to toggle login state
          </p>
        </div>
      </div>
    </>
  );
}

export default Logintoogle;