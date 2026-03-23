import React from 'react';
import { 
  CheckCircle2, 
  Circle, 
  AlertTriangle, 
  Droplets, 
  ThermometerSun, 
  ClipboardList, 
  Plus, 
  Wind,
  Tractor,
  TestTube2
} from 'lucide-react';

function FarmhandDash() {
  // Mock data for current tasks
  const tasks = [
    { id: 1, task: 'Irrigation Check - Sector 4', priority: 'High', status: 'Pending' },
    { id: 2, task: 'Fertilizer Application - North Plot', priority: 'Medium', status: 'In Progress' },
    { id: 3, task: 'Soil Moisture Reading', priority: 'Low', status: 'Completed' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-4 lg:p-8">
      {/* Field Greeting */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Welcome Back, FarmHand</h1>
          <p className="text-slate-500 font-medium">Monday, March 23, 2026 • Sunny 28°C</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-emerald-700 transition-all">
            <Plus size={20} /> Log Yield
          </button>
          <button className="flex items-center gap-2 bg-white text-rose-600 border border-rose-200 px-5 py-2.5 rounded-xl font-bold shadow-sm hover:bg-rose-50 transition-all">
            <AlertTriangle size={20} /> Report Issue
          </button>
        </div>
      </header>

      {/* Quick Status Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><Droplets size={24} /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Humidity</p><p className="text-xl font-bold text-slate-700">62%</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl"><ClipboardList size={24} /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Tasks</p><p className="text-xl font-bold text-slate-700">2/5 Done</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl"><TestTube2 size={24} /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Soil PH</p><p className="text-xl font-bold text-slate-700">6.8</p></div>
        </div>
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="p-3 bg-orange-50 text-orange-600 rounded-xl"><Tractor size={24} /></div>
          <div><p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Asset</p><p className="text-xl font-bold text-slate-700">Tractor A1</p></div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Active Tasks List */}
        <div className="lg:col-span-2 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
          <div className="p-6 border-b border-slate-50 bg-white">
            <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
              <ClipboardList className="text-emerald-600" size={24}/>
              Daily Assignments
            </h2>
          </div>
          <div className="divide-y divide-slate-50">
            {tasks.map((t) => (
              <div key={t.id} className="flex items-center justify-between p-5 hover:bg-slate-50/80 transition-colors group">
                <div className="flex items-center gap-4">
                  {/* FIXED: Provided valid JSX inside parentheses */}
                  {t.status === 'Completed' ? (
                    <CheckCircle2 className="h-7 w-7 text-emerald-500 fill-emerald-50" />
                  ) : (
                    <Circle className="h-7 w-7 text-slate-300 group-hover:text-emerald-400 transition-colors" />
                  )}
                  <div>
                    <p className={`text-lg font-semibold ${t.status === 'Completed' ? 'line-through text-slate-400' : 'text-slate-700'}`}>
                      {t.task}
                    </p>
                    <span className={`text-[10px] px-2.5 py-1 rounded-md font-black uppercase tracking-widest ${
                      t.priority === 'High' ? 'bg-rose-100 text-rose-600' : 'bg-sky-100 text-sky-600'
                    }`}>
                      {t.priority} Priority
                    </span>
                  </div>
                </div>
                <button className="px-4 py-2 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors">Update</button>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-3xl p-8 text-white shadow-xl shadow-slate-200 relative overflow-hidden">
            <Wind className="absolute -right-4 -top-4 h-24 w-24 text-white/5" />
            <h3 className="font-bold mb-4 flex items-center gap-2 text-rose-400 uppercase tracking-widest text-xs">
              <AlertTriangle size={16}/>
              Safety Alert
            </h3>
            <p className="text-slate-300 leading-relaxed mb-6">
              High winds expected at <span className="text-white font-bold">2:00 PM</span>. Secure all irrigation equipment in Sector 4 immediately.
            </p>
            <button className="w-full bg-white/10 hover:bg-white/20 py-3 rounded-xl text-sm font-bold transition-all border border-white/10">
              Acknowledge
            </button>
          </div>

          <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
            <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
              Field Notes
            </h3>
            <textarea 
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 min-h-[120px]"
              placeholder="Record any observations..."
            ></textarea>
            <button className="mt-4 w-full bg-emerald-50 text-emerald-700 py-3 rounded-xl font-bold text-sm hover:bg-emerald-100 transition-colors">
              Save Observation
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarmhandDash;