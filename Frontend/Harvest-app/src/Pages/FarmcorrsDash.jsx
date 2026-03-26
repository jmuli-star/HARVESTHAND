import React, { useState, useEffect } from 'react';
import axios from 'axios';
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
  MailWarning,
  Circle,
  CheckCircle2,
  Inbox
} from 'lucide-react';

function FarmcorrsDash() {
  const [tasks, setTasks] = useState([]);
  const [reports, setReports] = useState([]); // Logic: Inbox for incoming reports
  const [loading, setLoading] = useState(true);
  const [userInfo, setUserInfo] = useState({ name: 'Correspondent', role: 'Staff' });

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
  });

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('access_token');
      const headers = { Authorization: `Bearer ${token}` };
      
      // Logic: Fetch Tasks AND Reports simultaneously
      const [taskRes, reportRes] = await Promise.all([
        axios.get('http://127.0.0.1:8000/api/v1/management/tasks/', { headers }),
        axios.get('http://127.0.0.1:8000/api/v1/management/reports/', { headers })
      ]);
      
      setTasks(taskRes.data);
      setReports(reportRes.data);
    } catch (err) {
      console.error("Error fetching hub data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        setUserInfo({
          name: parsed.first_name || parsed.email.split('@')[0],
          role: parsed.role
        });
      } catch (e) { console.error(e); }
    }
  }, []);

  const completedCount = tasks.filter(t => t.is_complete).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="min-h-screen bg-slate-50 p-6 lg:p-10 text-slate-900">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900 capitalize">
              Welcome, <span className="text-indigo-600">{userInfo.name}</span>
            </h1>
            <p className="text-slate-500 font-medium italic">
              {today} • {reports.length} Reports awaiting review
            </p>
          </div>
          <div className="flex gap-3">
            <button className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-md">
              <MessageSquare size={18} /> Broadcast Alert
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Content: Task Queue */}
          <div className="lg:col-span-8 space-y-8">
            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 flex justify-between items-center">
                <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                  <Layers size={20} className="text-indigo-600" />
                  Assignment Oversight
                </h2>
              </div>
              <div className="divide-y divide-slate-50">
                {loading ? (
                    <div className="p-10 text-center text-slate-400 font-bold tracking-widest">LOADING FIELD DATA...</div>
                ) : tasks.map((item) => (
                  <div key={item.id} className="p-6 flex items-center justify-between hover:bg-slate-50/50 transition-colors">
                    <div className="flex items-center gap-4">
                      {item.is_complete ? <CheckCircle2 className="text-emerald-500" /> : <Circle className="text-slate-200" />}
                      <div>
                        <p className={`font-bold ${item.is_complete ? 'text-slate-400' : 'text-slate-800'}`}>{item.title}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                          Assigned To: {item.assigned_to_email.split('@')[0]}
                        </p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-slate-100 text-slate-700 rounded-lg text-xs font-bold hover:bg-slate-200">Manage</button>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual Stats */}
            <div className="bg-slate-900 rounded-3xl p-8 text-white relative overflow-hidden">
              <h2 className="text-2xl font-bold mb-4">Field Efficiency</h2>
              <div className="flex gap-6 mt-2 relative z-10">
                <div className="flex-1">
                  <p className="text-slate-400 text-xs mb-2 uppercase font-black">Success Rate</p>
                  <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${completionRate}%` }}></div>
                  </div>
                </div>
              </div>
              <Map size={120} className="absolute -bottom-5 -right-5 text-white/5 -rotate-12" />
            </div>
          </div>

          {/* Sidebar: NEW FIELD INBOX (Replaced Urgent Reports) */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-white rounded-3xl border border-slate-100 p-8 shadow-sm">
              <h3 className="font-bold text-slate-800 mb-6 flex items-center gap-2">
                <Inbox size={20} className="text-indigo-600" />
                Field Hand Inbox
              </h3>
              
              <div className="space-y-4">
                {reports.length === 0 ? (
                  <p className="text-center py-6 text-slate-400 text-sm italic">No reports from farmhands.</p>
                ) : reports.map((report) => (
                  <div key={report.id} className="p-4 bg-indigo-50/30 rounded-2xl border border-indigo-100 group hover:border-indigo-300 transition-all">
                    <div className="flex justify-between items-start mb-1">
                      <p className="text-sm font-black text-indigo-900">{report.title}</p>
                      <span className="text-[9px] bg-white px-2 py-0.5 rounded shadow-sm font-bold text-indigo-400 uppercase">
                        {report.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 line-clamp-2 mb-3 leading-relaxed">
                      {report.message}
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] font-bold text-indigo-400">
                        From: {report.sender_email?.split('@')[0] || "Farmhand"}
                      </span>
                      <button className="flex items-center gap-1 text-[10px] font-black uppercase text-indigo-600 group-hover:translate-x-1 transition-transform">
                        Add Feedback <ArrowRight size={12}/>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-xl shadow-indigo-100">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <Users size={18}/> Team Briefing
              </h3>
              <p className="text-indigo-100 text-xs mb-6">Coordinate with your farmhands on reported issues.</p>
              <button className="w-full bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold py-3 rounded-xl transition-all text-sm">
                Open Messenger
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default FarmcorrsDash;