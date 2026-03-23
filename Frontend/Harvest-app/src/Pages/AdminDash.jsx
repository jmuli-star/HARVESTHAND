// import React, { useState ,useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { 
//   ShieldCheck, 
//   Users, 
//   Database, 
//   Activity, 
//   UserPlus, 
//   Settings, 
//   Lock, 
//   Search, 
//   MoreVertical,
//   ServerCrash, 
//   LogOut,
//   AlertTriangle, 
//   X, 
//   ChevronRight, 
//   Globe, 
//   HardDrive // FIXED: Changed from hardDrive to HardDrive
// } from 'lucide-react';
// import axios from 'axios';

// function AdminDash() {
//   const navigate = useNavigate();
//   const [showLogoutModal, setShowLogoutModal] = useState(false);

//   const [stats, setStats] = useState({
//     total_users: 0,
//     recent_growth: 0,
//     farmhand_count: 0,
//     institution_count: 0
//   });
//   const [recentUsers, setRecentUsers] = useState([]);
//   const [loading, setLoading] = useState(true);

//   // --- NEW: Logic to Fetch Dashboard Data ---
//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const token = localStorage.getItem('access_token');
//         const headers = { Authorization: `Bearer ${token}` };

//         // 1. Fetch Top Cards Data (Part 4 View)
//         const statsRes = await axios.get('http://127.0.0.1:8000/api/v1/admin/stats/', { headers });
//         setStats(statsRes.data);

//         // 2. Fetch User Table Data (UserListViewSet)
//         const usersRes = await axios.get('http://127.0.0.1:8000/api/v1/users/', { headers });
//         // We take the first 4 for the 'Recent' view
//         setRecentUsers(usersRes.data.slice(0, 4)); 

//         setLoading(false);
//       } catch (err) {
//         console.error("Dashboard Load Error:", err);
//         if (err.response?.status === 401) navigate('/login');
//         setLoading(false);
//       }
//     };

//     fetchDashboardData();
//   }, [navigate]);


//   // Logout Logic
//   const handleLogout = () => {
//     localStorage.clear();
//     navigate('/login');
//   };

 
//   return (
//     <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900 font-sans relative">
      
//       {/* --- LOGOUT CONFIRMATION MODAL --- */}
//       {showLogoutModal && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
//           <div 
//             className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
//             onClick={() => setShowLogoutModal(false)}
//           ></div>
          
//           <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
//             <div className="flex flex-col items-center text-center">
//               <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
//                 <AlertTriangle size={32} />
//               </div>
//               <h2 className="text-xl font-black text-slate-900 mb-2">Confirm Logout</h2>
//               <p className="text-slate-500 text-sm mb-8">
//                 Are you sure you want to end your administrative session? Unsaved system changes may be lost.
//               </p>
              
//               <div className="flex gap-3 w-full">
//                 <button 
//                   onClick={() => setShowLogoutModal(false)}
//                   className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
//                 >
//                   Cancel
//                 </button>
//                 <button 
//                   onClick={handleLogout}
//                   className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
//                 >
//                   Yes, Log out
//                 </button>
//               </div>
//             </div>
//             <button 
//               onClick={() => setShowLogoutModal(false)}
//               className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"
//             >
//               <X size={20} />
//             </button>
//           </div>
//         </div>
//       )}

//       <div className="max-w-7xl mx-auto">
        
//         {/* --- HEADER --- */}
//         <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
//           <div>
//             <div className="flex items-center gap-2 mb-1">
//               <ShieldCheck className="text-violet-600" size={20} />
//               <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">System Administrator</span>
//             </div>
//             <h1 className="text-4xl font-black tracking-tight text-slate-900">Control Panel</h1>
//           </div>
          
//           <div className="flex items-center gap-4">
//             <div className="relative hidden md:block">
//               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
//               <input 
//                 type="text" 
//                 placeholder="Search logs..." 
//                 className="pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl w-64 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
//               />
//             </div>
//             <button 
//               onClick={() => setShowLogoutModal(true)}
//               className="flex items-center gap-2 bg-white text-rose-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-50 transition-all border border-slate-200 shadow-sm group"
//             >
//               <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
//               <span>Logout</span>
//             </button>
//           </div>
//         </header>

//         {/* --- SYSTEM HEALTH CARDS --- */}
//         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
//           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
//             <div className="flex justify-between items-start mb-4">
//               <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Users size={24} /></div>
//               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">+12%</span>
//             </div>
//             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Users</p>
//             <p className="text-3xl font-bold text-slate-800">1,284</p>
//           </div>

//           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//             <div className="flex justify-between items-start mb-4">
//               <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Activity size={24} /></div>
//               <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">99.9%</span>
//             </div>
//             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Server Uptime</p>
//             <p className="text-3xl font-bold text-slate-800">Stable</p>
//           </div>

//           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//             <div className="flex justify-between items-start mb-4">
//               <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><Database size={24} /></div>
//               <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">82%</span>
//             </div>
//             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Storage Used</p>
//             <p className="text-3xl font-bold text-slate-800">1.2 TB</p>
//           </div>

//           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
//             <div className="flex justify-between items-start mb-4">
//               <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Lock size={24} /></div>
//               <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Active</span>
//             </div>
//             <p className="text-xs font-black uppercase tracking-widest text-slate-400">Security SSL</p>
//             <p className="text-3xl font-bold text-slate-800">Secure</p>
//           </div>
//         </div>

//         {/* --- MAIN CONTENT GRID --- */}
//         <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
//           {/* USER MANAGEMENT TABLE */}
//           <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
//             <div className="p-6 border-b border-slate-50 flex justify-between items-center">
//               <div>
//                 <h2 className="text-xl font-bold text-slate-800">Recent Registrations</h2>
//                 <p className="text-xs text-slate-400 font-medium">Monitoring the last 24 hours of activity</p>
//               </div>
//               <button className="text-xs font-black uppercase tracking-widest text-violet-600 bg-violet-50 px-4 py-2 rounded-xl hover:bg-violet-100 transition-all">
//                 View All
//               </button>
//             </div>
//             <div className="overflow-x-auto">
//               <table className="w-full text-left">
//                 <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
//                   <tr>
//                     <th className="px-8 py-5">User Profile</th>
//                     <th className="px-8 py-5">Assigned Role</th>
//                     <th className="px-8 py-5">Status</th>
//                     <th className="px-8 py-5 text-right">Join Date</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-slate-50">
//                   {recentUsers.map((user) => (
//                     <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
//                       <td className="px-8 py-5 font-bold text-slate-700">
//                         <div className="flex items-center gap-3">
//                           <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-violet-100 group-hover:text-violet-600 transition-colors">
//                             <Users size={14} />
//                           </div>
//                           {user.name}
//                         </div>
//                       </td>
//                       <td className="px-8 py-5">
//                         <span className="text-sm font-medium text-slate-500">{user.role}</span>
//                       </td>
//                       <td className="px-8 py-5">
//                         <div className="flex items-center gap-1.5">
//                           <div className={`h-1.5 w-1.5 rounded-full ${user.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'}`}></div>
//                           <span className={`text-[10px] font-black uppercase tracking-tight ${
//                             user.status === 'Active' ? 'text-emerald-600' : 'text-amber-600'
//                           }`}>
//                             {user.status}
//                           </span>
//                         </div>
//                       </td>
//                       <td className="px-8 py-5 text-right">
//                         <div className="flex items-center justify-end gap-2 text-xs text-slate-400 font-medium">
//                           {user.joined}
//                           <ChevronRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" />
//                         </div>
//                       </td>
//                     </tr>
//                   ))}
//                 </tbody>
//               </table>
//             </div>
//           </div>

//           {/* SIDEBAR: ACTIONS & LOGS */}
//           <div className="lg:col-span-4 space-y-8">
//             <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-200 relative overflow-hidden">
//               <div className="relative z-10">
//                 <h3 className="font-bold text-2xl mb-2">Admin Actions</h3>
//                 <p className="text-violet-100 text-sm mb-8 opacity-80 leading-relaxed">
//                   Perform critical system updates or audit trail reviews.
//                 </p>
//                 <div className="space-y-4">
//                   <button className="flex items-center justify-center gap-3 w-full bg-white text-violet-700 font-bold py-4 rounded-2xl hover:bg-violet-50 transition-all shadow-lg text-sm">
//                     <UserPlus size={20} /> Add New Admin
//                   </button>
//                   <button className="flex items-center justify-center gap-3 w-full bg-violet-500/30 text-white border border-violet-400/30 font-bold py-4 rounded-2xl hover:bg-violet-500/50 transition-all text-sm">
//                     <Settings size={20} /> System Settings
//                   </button>
//                 </div>
//               </div>
//               <Globe size={150} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
//             </div>

//             <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
//               <div className="flex items-center justify-between mb-8">
//                 <h3 className="font-bold text-slate-800 flex items-center gap-3">
//                   <ServerCrash size={20} className="text-rose-500" />
//                   System Logs
//                 </h3>
//                 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
//               </div>
//               <div className="space-y-6">
//                 {[
//                   { title: 'API Timeout: 504', detail: '/api/v1/yields', time: '2m ago', color: 'bg-rose-500' },
//                   { title: 'Memory Spike', detail: 'Cluster A-4', time: '14m ago', color: 'bg-amber-500' },
//                   { title: 'New Node Active', detail: 'Node 028', time: '1h ago', color: 'bg-emerald-500' }
//                 ].map((log, i) => (
//                   <div key={i} className="flex gap-4 items-start group">
//                     <div className={`h-2 w-2 mt-2 rounded-full ${log.color} shrink-0`}></div>
//                     <div className="flex-1">
//                       <p className="text-sm font-bold text-slate-700 leading-none mb-1">{log.title}</p>
//                       <p className="text-[10px] text-slate-400 font-medium">{log.detail}</p>
//                     </div>
//                     <span className="text-[10px] text-slate-300 font-black uppercase tracking-tighter">{log.time}</span>
//                   </div>
//                 ))}
//               </div>
//             </div>
//           </div>
          
//         </div>
//       </div>
//     </div>
//   );
// }

// export default AdminDash;
import React, { useState, useEffect } from 'react'; // ADDED: useEffect
import { useNavigate } from 'react-router-dom';
import axios from 'axios'; // ADDED: axios
import { 
  ShieldCheck, Users, Database, Activity, UserPlus, Settings, Lock, 
  Search, MoreVertical, ServerCrash, LogOut, AlertTriangle, X, 
  ChevronRight, Globe, HardDrive 
} from 'lucide-react';

function AdminDash() {
  const navigate = useNavigate();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  // --- NEW: API State Management ---
  const [stats, setStats] = useState({
    total_users: 0,
    recent_growth: 0,
    farmhand_count: 0,
    institution_count: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // --- NEW: Logic to Fetch Dashboard Data ---
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const token = localStorage.getItem('access_token');
        const headers = { Authorization: `Bearer ${token}` };

        // 1. Fetch Top Cards Data (Part 4 View)
        const statsRes = await axios.get('http://127.0.0.1:8000/api/v1/admin/stats/', { headers });
        setStats(statsRes.data);

        // 2. Fetch User Table Data (UserListViewSet)
        const usersRes = await axios.get('http://127.0.0.1:8000/api/v1/users/', { headers });
        // We take the first 4 for the 'Recent' view
        setRecentUsers(usersRes.data.slice(0, 4)); 

        setLoading(false);
      } catch (err) {
        console.error("Dashboard Load Error:", err);
        if (err.response?.status === 401) navigate('/login');
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [navigate]);

  // Logout Logic
  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900 font-sans relative">
      
      {/* --- LOGOUT CONFIRMATION MODAL --- */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            onClick={() => setShowLogoutModal(false)}
          ></div>
          
          <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full p-8 overflow-hidden transform transition-all animate-in fade-in zoom-in duration-200">
            <div className="flex flex-col items-center text-center">
              <div className="h-16 w-16 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-6">
                <AlertTriangle size={32} />
              </div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Confirm Logout</h2>
              <p className="text-slate-500 text-sm mb-8">
                Are you sure you want to end your administrative session?
              </p>
              
              <div className="flex gap-3 w-full">
                <button 
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-4 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleLogout}
                  className="flex-1 px-4 py-3 rounded-xl bg-rose-600 text-white font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-200 transition-all"
                >
                  Yes, Log out
                </button>
              </div>
            </div>
            <button onClick={() => setShowLogoutModal(false)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600">
              <X size={20} />
            </button>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        
        {/* --- HEADER --- */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <ShieldCheck className="text-violet-600" size={20} />
              <span className="text-[10px] font-black uppercase tracking-widest text-violet-600">System Administrator</span>
            </div>
            <h1 className="text-4xl font-black tracking-tight text-slate-900">Control Panel</h1>
          </div>
          
          <div className="flex items-center gap-4">
            <button onClick={() => setShowLogoutModal(true)} className="flex items-center gap-2 bg-white text-rose-600 px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-rose-50 transition-all border border-slate-200 shadow-sm group">
              <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* --- SYSTEM HEALTH CARDS (DYNAMIC) --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-violet-50 text-violet-600 rounded-2xl"><Users size={24} /></div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">
                +{stats.recent_growth} today
              </span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Total Users</p>
            <p className="text-3xl font-bold text-slate-800">{loading ? "..." : stats.total_users}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Activity size={24} /></div>
              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">99.9%</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Server Uptime</p>
            <p className="text-3xl font-bold text-slate-800">Stable</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-rose-50 text-rose-600 rounded-2xl"><HardDrive size={24} /></div>
              <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-1 rounded-lg">
                {stats.farmhand_count} active
              </span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Farm Hands</p>
            <p className="text-3xl font-bold text-slate-800">{stats.farmhand_count}</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl"><Lock size={24} /></div>
              <span className="text-[10px] font-bold text-slate-400 bg-slate-50 px-2 py-1 rounded-lg">Active</span>
            </div>
            <p className="text-xs font-black uppercase tracking-widest text-slate-400">Institutions</p>
            <p className="text-3xl font-bold text-slate-800">{stats.institution_count}</p>
          </div>
        </div>

        {/* --- MAIN CONTENT GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* USER MANAGEMENT TABLE (DYNAMIC) */}
          <div className="lg:col-span-8 bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-50 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-slate-800">Recent Registrations</h2>
                <p className="text-xs text-slate-400 font-medium">Live data from system audit logs</p>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-[10px] uppercase font-black tracking-widest text-slate-400">
                  <tr>
                    <th className="px-8 py-5">User Email</th>
                    <th className="px-8 py-5">Assigned Role</th>
                    <th className="px-8 py-5 text-right">Join Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {recentUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-5 font-bold text-slate-700">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
                            <Users size={14} />
                          </div>
                          {user.email}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="text-sm font-medium text-slate-500 uppercase">{user.role}</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="text-xs text-slate-400 font-medium">
                          {new Date(user.date_joined).toLocaleDateString()}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* SIDEBAR */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-gradient-to-br from-violet-600 to-indigo-700 rounded-3xl p-8 text-white shadow-xl shadow-violet-200 relative overflow-hidden">
              <div className="relative z-10">
                <h3 className="font-bold text-2xl mb-2">Admin Actions</h3>
                <div className="space-y-4">
                  <button className="flex items-center justify-center gap-3 w-full bg-white text-violet-700 font-bold py-4 rounded-2xl hover:bg-violet-50 transition-all text-sm">
                    <UserPlus size={20} /> Add New Admin
                  </button>
                </div>
              </div>
              <Globe size={150} className="absolute -bottom-10 -right-10 text-white/10 rotate-12" />
            </div>
          </div>
          
        </div>
      </div>
    </div>
  );
}

export default AdminDash;