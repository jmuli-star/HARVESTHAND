import React from 'react';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  FileText, 
  MapPin, 
  Download, 
  UserPlus, 
  Bell,
  ArrowUpRight,
  ChevronRight
} from 'lucide-react';

function FarminstitutDash() {
  // Stats data updated with Lucide icons
  const stats = [
    { name: 'Total Managed Farms', value: '12', icon: MapPin, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Active Personnel', value: '48', icon: Users, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { name: 'Avg. Annual Yield', value: '84%', icon: TrendingUp, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Pending Reports', value: '5', icon: FileText, color: 'text-rose-600', bg: 'bg-rose-50' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10">
      {/* Header Section */}
      <header className="mb-10 max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Institution Dashboard</h1>
          <p className="text-slate-500 font-medium">Strategic overview of agricultural assets and yield performance.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-bold hover:bg-slate-50 transition-all shadow-sm">
            <Download size={18} /> Export Results
          </button>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {stats.map((item) => (
            <div key={item.name} className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100 hover:shadow-md transition-all group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{item.name}</p>
                  <p className="mt-2 text-3xl font-bold text-slate-800">{item.value}</p>
                </div>
                <div className={`${item.bg} ${item.color} p-4 rounded-2xl group-hover:scale-110 transition-transform`}>
                  <item.icon size={24} />
                </div>
              </div>
              <div className="mt-4 flex items-center text-xs font-bold text-emerald-600 bg-emerald-50 w-fit px-2 py-1 rounded-md">
                <ArrowUpRight size={14} className="mr-1" /> +2.5% vs last month
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Content: Farm Performance Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
            <div className="px-8 py-6 border-b border-slate-50 flex justify-between items-center bg-white">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <Building2 size={22} className="text-emerald-600" />
                Managed Farm Status
              </h2>
              <button className="text-sm text-emerald-600 font-bold hover:bg-emerald-50 px-3 py-1 rounded-lg transition-colors">
                View All
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50/50 text-slate-400 text-[10px] uppercase font-black tracking-widest border-b border-slate-50">
                    <th className="px-8 py-4">Farm Name</th>
                    <th className="px-8 py-4">Correspondent</th>
                    <th className="px-8 py-4">Status</th>
                    <th className="px-8 py-4">Yield Index</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {[
                    { name: 'North Valley Plots', lead: 'Sarah Jenkins', status: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-50', yield: '92%' },
                    { name: 'Green Plateau', lead: 'David Chen', status: 'Warning', color: 'text-amber-600', bg: 'bg-amber-50', yield: '68%' },
                    { name: 'Riverside Organic', lead: 'Maria Muli', status: 'Optimal', color: 'text-emerald-600', bg: 'bg-emerald-50', yield: '89%' },
                  ].map((farm, index) => (
                    <tr key={index} className="hover:bg-slate-50/50 transition-colors cursor-pointer group">
                      <td className="px-8 py-5 font-bold text-slate-700">{farm.name}</td>
                      <td className="px-8 py-5 text-slate-500 font-medium">{farm.lead}</td>
                      <td className="px-8 py-5">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${farm.bg} ${farm.color}`}>
                          {farm.status}
                        </span>
                      </td>
                      <td className="px-8 py-5 font-black text-slate-800">
                        <div className="flex items-center justify-between gap-4">
                          {farm.yield}
                          <ChevronRight size={16} className="text-slate-300 group-hover:text-emerald-500 transition-colors" />
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar: Action Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 rounded-3xl shadow-xl shadow-slate-200 p-8 text-white relative overflow-hidden">
               <div className="relative z-10">
                <h3 className="text-xs font-black uppercase tracking-widest text-emerald-400 mb-2">Institutional Actions</h3>
                <h2 className="text-xl font-bold mb-2 text-white">Resource Allocation</h2>
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">Adjust quotas, generate quarterly yield reports, or deploy new farm correspondents.</p>
                <div className="space-y-3">
                  <button className="flex items-center justify-center gap-2 w-full bg-emerald-600 text-white font-bold py-3 rounded-xl hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/20">
                    <UserPlus size={18} /> Assign Personnel
                  </button>
                  <button className="flex items-center justify-center gap-2 w-full bg-slate-800 text-white border border-slate-700 font-bold py-3 rounded-xl hover:bg-slate-700 transition-all">
                    <FileText size={18} /> Audit Reports
                  </button>
                </div>
              </div>
              <Building2 size={120} className="absolute -bottom-8 -right-8 text-white/5 rotate-12" />
            </div>

            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Bell size={20} className="text-rose-500" />
                Live Intelligence
              </h3>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-blue-500 ring-4 ring-blue-50 shrink-0"></div>
                  <div>
                    <p className="text-sm text-slate-600 leading-snug">New yield report submitted by <span className="font-bold text-slate-800">Riverside Organic</span>.</p>
                    <span className="text-[10px] text-slate-400 font-bold">2 MINS AGO</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="h-2 w-2 mt-2 rounded-full bg-rose-500 ring-4 ring-rose-50 shrink-0"></div>
                  <div>
                    <p className="text-sm text-slate-600 leading-snug">System Alert: Low moisture detected in <span className="font-bold text-slate-800">Green Plateau</span>.</p>
                    <span className="text-[10px] text-slate-400 font-bold">45 MINS AGO</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default FarminstitutDash;