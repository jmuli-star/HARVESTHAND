import React from 'react';
import { 
  User, 
  Mail, 
  ShieldCheck, 
  Bell, 
  Key, 
  LogOut, 
  Camera,
  History,
  Award,
  Smartphone
} from 'lucide-react';

function UserDash() {
  const activityLog = [
    { id: 1, action: 'Logged Yield', target: 'Sector 4', time: '2h ago', icon: History },
    { id: 2, action: 'Changed Password', target: 'Security', time: 'Yesterday', icon: Key },
    { id: 3, action: 'Updated Profile', target: 'Account', time: '3 days ago', icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header: Personal Welcome */}
        <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="h-24 w-24 rounded-3xl bg-cyan-100 flex items-center justify-center text-cyan-600 border-4 border-white shadow-sm">
                <User size={48} />
              </div>
              <button className="absolute -bottom-2 -right-2 p-2 bg-white rounded-xl shadow-md border border-slate-100 text-slate-400 hover:text-cyan-600 transition-colors">
                <Camera size={16} />
              </button>
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">Alex Rivera</h1>
              <p className="text-slate-500 font-medium">Senior Farmhand • Sector 4 Lead</p>
              <div className="flex gap-2 mt-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest">Verified</span>
                <span className="px-2 py-0.5 rounded-md bg-cyan-50 text-cyan-600 text-[10px] font-black uppercase tracking-widest">Gold Tier</span>
              </div>
            </div>
          </div>
          <button className="flex items-center gap-2 text-rose-600 font-bold hover:bg-rose-50 px-4 py-2 rounded-xl transition-all">
            <LogOut size={18} /> Sign Out
          </button>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Column: Account Details */}
          <div className="lg:col-span-8 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50">
                <h2 className="text-lg font-bold text-slate-800">Profile Information</h2>
              </div>
              <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Mail size={12} /> Email Address
                  </label>
                  <p className="font-bold text-slate-700">alex.rivera@farmtech.io</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Smartphone size={12} /> Phone Number
                  </label>
                  <p className="font-bold text-slate-700">+1 (555) 012-3456</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <ShieldCheck size={12} /> Account Role
                  </label>
                  <p className="font-bold text-slate-700">Farmhand (Level 4)</p>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                    <Bell size={12} /> Notification Frequency
                  </label>
                  <p className="font-bold text-slate-700">Instant (Push & SMS)</p>
                </div>
              </div>
              <div className="p-6 bg-slate-50/50 border-t border-slate-50 flex justify-end">
                <button className="bg-white border border-slate-200 px-6 py-2 rounded-xl font-bold text-sm hover:bg-slate-50 transition-all shadow-sm">
                  Edit Profile
                </button>
              </div>
            </div>

            {/* Security Section */}
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-8">
              <h2 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Key size={20} className="text-cyan-600" /> Security
              </h2>
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <div>
                  <p className="font-bold text-slate-700">Two-Factor Authentication</p>
                  <p className="text-xs text-slate-500">Add an extra layer of security to your account.</p>
                </div>
                <button className="px-4 py-2 bg-cyan-600 text-white rounded-xl text-xs font-bold shadow-md shadow-cyan-200 hover:bg-cyan-700 transition-all">
                  Enable 2FA
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar: Personal Progress & Activity */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-cyan-600 to-blue-700 rounded-3xl p-8 text-white shadow-xl shadow-cyan-200 relative overflow-hidden">
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                  <Award size={32} />
                  <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-1 rounded-md">Rank #4</span>
                </div>
                <h3 className="font-bold text-xl mb-1">Efficiency Expert</h3>
                <p className="text-cyan-100 text-sm mb-6 opacity-80">You processed 14% more yields than last month!</p>
                <div className="h-2 w-full bg-white/20 rounded-full">
                  <div className="h-full bg-white w-[85%] rounded-full shadow-[0_0_8px_rgba(255,255,255,0.5)]"></div>
                </div>
              </div>
              <Award size={100} className="absolute -bottom-4 -right-4 text-white/10 -rotate-12" />
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <History size={20} className="text-slate-400" />
                Recent Activity
              </h3>
              <div className="space-y-6">
                {activityLog.map((log) => (
                  <div key={log.id} className="flex gap-4">
                    <div className="h-8 w-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 shrink-0">
                      <log.icon size={16} />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-700 leading-tight">{log.action}</p>
                      <p className="text-[10px] text-slate-400 font-medium">{log.target} • {log.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default UserDash;