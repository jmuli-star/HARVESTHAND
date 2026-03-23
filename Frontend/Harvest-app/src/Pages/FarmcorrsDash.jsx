import React from 'react';
import { 
  Users, 
  Map, 
  CheckCircle, 
  Clock, 
  MessageSquare, 
  Layers, 
  ArrowRight, 
  Filter,
  MoreHorizontal,
  MailWarning
} from 'lucide-react';

function FarmcorrsDash() {
  const pendingApprovals = [
    { id: 1, farm: 'North Valley', hand: 'John Doe', type: 'Yield Log', date: '2h ago' },
    { id: 2, farm: 'Green Plateau', hand: 'Jane Smith', type: 'Pest Report', date: '5h ago' },
    { id: 3, farm: 'Riverside', hand: 'Mike Ross', type: 'Asset Repair', date: 'Yesterday' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header: Coordination Hub */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Correspondent Hub</h1>
            <p className="text-slate-500 font-medium italic">Managing 3 Sectors • 18 Personnel Active</p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-white border border-slate-200 px-4 py-2 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all shadow-sm">
              <Filter size={18} /> Filter Sectors
            </button>
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md shadow-indigo-200">
              <MessageSquare size={18} /> Broadcast Alert
            </button>
          </div>
        </header>

        {/* Quick Stats: Team & Field Status */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-indigo-50 text-indigo-600 rounded-2xl"><Users size={28} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Team Active</p>
              <p className="text-2xl font-bold">14 / 18</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><CheckCircle size={28} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Tasks Verified</p>
              <p className="text-2xl font-bold">88%</p>
            </div>
          </div>
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl"><Clock size={28} /></div>
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Avg. Response</p>
              <p className="text-2xl font-bold">1.2 hrs</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content: Approval Queue */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center bg-white">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Layers size={20} className="text-indigo-600" />
                  Review Queue
                </h2>
                <span className="text-[10px] bg-indigo-50 text-indigo-600 px-3 py-1 rounded-full font-black uppercase tracking-widest">
                  3 Actions Required
                </span>
              </div>
              <div className="divide-y divide-slate-50">
                {pendingApprovals.map((item) => (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 font-bold uppercase text-xs">
                        {item.hand.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{item.type}</p>
                        <p className="text-sm text-slate-500">{item.hand} • <span className="font-bold">{item.farm}</span></p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400 font-medium mr-4">{item.date}</span>
                      <button className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-bold hover:bg-emerald-100">Approve</button>
                      <button className="p-2 text-slate-300 hover:text-slate-500"><MoreHorizontal size={20}/></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Field Sector Map Overview */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden min-h-[200px]">
              <div className="relative z-10">
                <h3 className="text-indigo-400 font-black text-xs uppercase tracking-widest mb-2">Live Status</h3>
                <h2 className="text-2xl font-bold mb-4">Sector Distribution</h2>
                <div className="flex gap-6 mt-6">
                  <div className="flex-1">
                    <p className="text-slate-400 text-xs mb-1">North Plot</p>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 w-[70%]"></div>
                    </div>
                  </div>
                  <div className="flex-1">
                    <p className="text-slate-400 text-xs mb-1">Highland</p>
                    <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 w-[95%]"></div>
                    </div>
                  </div>
                </div>
              </div>
              <Map size={150} className="absolute -bottom-10 -right-10 text-white/5 -rotate-12" />
            </div>
          </div>

          {/* Sidebar: Coordination Feed */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <MailWarning size={20} className="text-rose-500" />
                Urgent Reports
              </h3>
              <div className="space-y-6">
                <div className="p-4 bg-rose-50/50 rounded-2xl border border-rose-100">
                  <p className="text-sm font-bold text-rose-800 mb-1">Low Moisture Alert</p>
                  <p className="text-xs text-rose-600 leading-relaxed mb-3">Reported by David (North Plot). Sensor at 18%.</p>
                  <button className="flex items-center gap-1 text-[10px] font-black uppercase text-rose-700 hover:underline">
                    Dispatch Team <ArrowRight size={12}/>
                  </button>
                </div>
                <div className="p-4 bg-amber-50/50 rounded-2xl border border-amber-100">
                  <p className="text-sm font-bold text-amber-800 mb-1">Asset Down</p>
                  <p className="text-xs text-amber-600 leading-relaxed">Tractor A1 needs fuel delivery in Sector 2.</p>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-200">
              <h3 className="font-bold mb-2">Team Sync</h3>
              <p className="text-indigo-100 text-sm mb-6 leading-relaxed">Last global briefing was at 06:00 AM today.</p>
              <button className="w-full bg-white text-indigo-700 font-bold py-3 rounded-xl hover:bg-indigo-50 transition-all text-sm">
                Schedule Meeting
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FarmcorrsDash;