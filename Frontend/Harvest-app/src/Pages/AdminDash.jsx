import React from 'react';
import { 
  ShieldCheck, 
  Users, 
  Database, 
  Activity, 
  UserPlus, 
  Settings, 
  Lock, 
  Search, 
  MoreVertical,
  ServerCrash
} from 'lucide-react';

function AdminDash() {
  const recentUsers = [
    { id: 1, name: 'Alice Johnson', role: 'Farmhand', status: 'Active', joined: '10m ago' },
    { id: 2, name: 'Bob Smith', role: 'Correspondent', status: 'Pending', joined: '1h ago' },
    { id: 3, name: 'Charlie Davis', role: 'Institution', status: 'Active', joined: '3h ago' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900 font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* Header: System Overview */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="text-violet-600" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">System Administrator</span>
            </div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Control Panel</h1>
          </div>
          
          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search users or logs..." 
              className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
            />
          </div>
        </header>

        {/* System Health Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Users size={24} /></div>
              <span className="text-[10px] font-bold text-emerald-600">+12%</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Users</p>
            <p className="text-2xl font-bold">1,284</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Activity size={24} /></div>
              <span className="text-[10px] font-bold text-emerald-600">99.9%</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Server Uptime</p>
            <p className="text-2xl font-bold">Stable</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Database size={24} /></div>
              <span className="text-[10px] font-bold text-rose-600">82%</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Storage Used</p>
            <p className="text-2xl font-bold">1.2 TB</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Lock size={24} /></div>
              <span className="text-[10px] font-bold text-slate-400">Active</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Security SSL</p>
            <p className="text-2xl font-bold">Encrypted</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* User Management Table */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <h2 className="text-lg font-bold text-slate-800">Recent Registrations</h2>
              <button className="text-xs font-bold text-violet-600 hover:underline px-3 py-1">Manage All</button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <tr>
                    <th className="px-6 py-4">User</th>
                    <th className="px-6 py-4">Role</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Joined</th>
                    <th className="px-6 py-4"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4 font-bold text-slate-700">{user.name}</td>
                      <td className="px-6 py-4 text-sm text-slate-500">{user.role}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                          user.status === 'Active' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-400 font-medium">{user.joined}</td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-slate-300 hover:text-slate-600 transition-colors">
                          <MoreVertical size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Quick Actions & Error Logs Sidebar */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-200">
              <h3 className="font-bold text-xl mb-2">Admin Actions</h3>
              <p className="text-violet-100 text-sm mb-6 opacity-80">
                Update system permissions or invite new institutional leads.
              </p>
              <div className="space-y-3">
                <button className="flex items-center justify-center gap-2 w-full bg-white text-violet-700 font-bold py-3 rounded-xl hover:bg-violet-50 transition-all shadow-lg">
                  <UserPlus size={18} /> Add New Admin
                </button>
                <button className="flex items-center justify-center gap-2 w-full bg-violet-500/30 text-white border border-violet-400/30 font-bold py-3 rounded-xl hover:bg-violet-500/50 transition-all">
                  <Settings size={18} /> System Settings
                </button>
              </div>
            </div>

            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <ServerCrash size={20} className="text-rose-500" />
                Error Logs
              </h3>
              <div className="space-y-4">
                <div className="flex gap-4 items-start">
                  <div className="h-2 w-2 mt-2 rounded-full bg-rose-500 shrink-0"></div>
                  <div>
                    <p className="text-sm font-bold text-slate-700">API Timeout: 504</p>
                    <p className="text-[10px] text-slate-400 font-medium">Endpoint: /api/v1/yields</p>
                    <p className="text-[10px] text-rose-500 font-bold uppercase mt-1">2 mins ago</p>
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

export default AdminDash;