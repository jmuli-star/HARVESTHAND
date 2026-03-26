import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { AlertTriangle, Send, X, UserCheck, ChevronDown } from 'lucide-react';

function FarmhandDash() {
  const [reports, setReports] = useState([]);
  const [respondents, setRespondents] = useState([]); // Logic: Valid Correspondents
  const [loading, setLoading] = useState(true);
  
  const [showReportModal, setShowReportModal] = useState(false);
  const [newReport, setNewReport] = useState({ 
    title: '', 
    message: '', 
    category: 'Safety', 
    recipient: '' 
  });

  const api = axios.create({
    baseURL: 'http://127.0.0.1:8000/api/v1',
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });

  const fetchData = async () => {
  try {
    const [reportRes, userRes] = await Promise.all([
      api.get('/management/reports/'),
      api.get('/management/tasks/assignable_users/') 
    ]);
    
    setReports(reportRes.data);
    
    // Logic: If the API is currently only returning 'users', 
    // we must ensure the Django ViewSet (above) is updated 
    // to return 'farmcorrespondent' for the farmhand role.
    setRespondents(userRes.data); 
  } catch (err) {
    console.error("Fetch Error:", err.response?.data);
  } finally {
    setLoading(false);
  }
};

  useEffect(() => { fetchData(); }, []);

  const handlePostReport = async (e) => {
    e.preventDefault();
    if (!newReport.recipient) return alert("Please select a correspondent.");

    try {
      const payload = {
        title: newReport.title,
        message: newReport.message, // Logic: Matched to your Serializer
        category: newReport.category,
        recipient: parseInt(newReport.recipient) 
      };

      await api.post('/management/reports/', payload);
      setShowReportModal(false);
      setNewReport({ title: '', message: '', category: 'Safety', recipient: '' });
      fetchData();
      alert("Report dispatched to Correspondent.");
    } catch (err) {
      alert("Submission Error: " + JSON.stringify(err.response?.data));
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto min-h-screen bg-slate-50">
      <header className="flex justify-between items-center mb-10">
        <h1 className="text-3xl font-extrabold text-slate-900">Field Feedback</h1>
        <button 
          onClick={() => setShowReportModal(true)}
          className="bg-rose-600 hover:bg-rose-700 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-rose-100 flex items-center gap-2 transition-all"
        >
          <AlertTriangle size={20} /> New Field Report
        </button>
      </header>

      {/* Viewing Reports Posted/Received */}
      <div className="grid gap-4">
        <h2 className="text-xs font-black uppercase tracking-widest text-slate-400 mb-2">Recent Dispatches</h2>
        {reports.length === 0 ? (
          <div className="p-10 border-2 border-dashed rounded-3xl text-center text-slate-400 font-medium">No reports filed yet.</div>
        ) : (
          reports.map(r => (
            <div key={r.id} className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-2">
               <div className="flex justify-between items-center">
                 <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-tighter">{r.category}</span>
                 <span className="text-[10px] text-slate-300 font-bold">Ref: #{r.id}</span>
               </div>
               <h3 className="text-lg font-bold text-slate-800">{r.title}</h3>
               <p className="text-sm text-slate-500 leading-relaxed">{r.message}</p>
            </div>
          ))
        )}
      </div>

      {/* REPORT MODAL */}
      {showReportModal && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-[2.5rem] p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight">Post to Correspondent</h2>
              <button onClick={() => setShowReportModal(false)} className="p-2 hover:bg-slate-100 rounded-full transition-colors"><X size={24}/></button>
            </div>

            <form onSubmit={handlePostReport} className="space-y-6">
              {/* SELECT RECIPIENT DROPDOWN */}
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Select Registered Respondent</label>
                <div className="relative">
                  <select 
                    required
                    className="w-full appearance-none p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-rose-500/10 focus:border-rose-500 outline-none transition-all font-semibold text-slate-700"
                    value={newReport.recipient}
                    onChange={e => setNewReport({...newReport, recipient: e.target.value})}
                  >
                    <option value="">-- Choose Person --</option>
                    {respondents.map(user => (
                      <option key={user.id} value={user.id}>
                        {user.first_name || user.email.split('@')[0]} (ID: {user.id})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-4 top-4 text-slate-400 pointer-events-none" size={20} />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Report Title</label>
                <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:border-rose-500 transition-all font-medium" placeholder="Brief subject..." value={newReport.title} onChange={e => setNewReport({...newReport, title: e.target.value})} />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 block ml-1">Observation Message</label>
                <textarea required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl h-36 outline-none focus:border-rose-500 transition-all font-medium resize-none" placeholder="Provide full details for the correspondent..." value={newReport.message} onChange={e => setNewReport({...newReport, message: e.target.value})} />
              </div>

              <button className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black shadow-xl hover:bg-black transition-all flex items-center justify-center gap-3">
                <Send size={20} /> Dispatch Field Report
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default FarmhandDash;