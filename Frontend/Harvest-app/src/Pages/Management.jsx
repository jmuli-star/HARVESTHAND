import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import CreateTaskModal from './CreateTaskModal';
import { CheckCircle, Circle, Plus, Loader2, ClipboardList } from 'lucide-react';

const API_BASE_URL = 'http://127.0.0.1:8000/api/v1';

const ManagementDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setModalOpen] = useState(false);

  // --- 1. DATA FETCHING ---
  const fetchTasks = useCallback(async () => {
    const token = localStorage.getItem('access_token');
    if (!token) return;
    
    try {
      const res = await axios.get(`${API_BASE_URL}/management/tasks/`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasks(res.data);
    } catch (err) {
      console.error("Task sync error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // --- 2. ACTION HANDLERS ---
  const toggleTask = async (taskId) => {
    const token = localStorage.getItem('access_token');
    try {
      // Optimistic Update UI could be done here, but standard refresh ensures accuracy
      await axios.patch(`${API_BASE_URL}/management/tasks/${taskId}/toggle_complete/`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTasks(); 
    } catch (err) {
      alert("Failed to update task status.");
    }
  };

  if (loading) return (
    <div className="min-h-[400px] flex items-center justify-center">
      <Loader2 className="animate-spin text-slate-400" size={32} />
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-6 lg:p-10 font-sans">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <ClipboardList size={18} className="text-slate-400" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Operations Control</span>
          </div>
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Field Tasks</h1>
          <p className="text-slate-500 text-sm mt-1">Directing planting, harvest, and maintenance workflows.</p>
        </div>
        
        <button 
          onClick={() => setModalOpen(true)}
          className="group bg-slate-900 text-white px-8 py-4 rounded-[2rem] font-bold flex items-center gap-2 hover:bg-emerald-600 transition-all shadow-xl active:scale-95"
        >
          <Plus size={20} className="group-hover:rotate-90 transition-transform" /> 
          Assign Task
        </button>
      </div>

      {/* TASK LISTING */}
      <div className="space-y-4">
        {tasks.length > 0 ? tasks.map(task => (
          <div 
            key={task.id} 
            className={`group bg-white border ${task.is_complete ? 'border-slate-50' : 'border-slate-100'} p-6 rounded-[2.5rem] shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`}
          >
            <div className="flex items-center gap-5">
              <button 
                onClick={() => toggleTask(task.id)}
                className="transition-transform active:scale-90"
              >
                {task.is_complete ? 
                  <CheckCircle className="text-emerald-500" size={32} /> : 
                  <Circle className="text-slate-200 group-hover:text-emerald-300" size={32} />
                }
              </button>
              
              <div>
                <h3 className={`text-lg font-bold leading-tight ${task.is_complete ? 'line-through text-slate-400 font-medium' : 'text-slate-800'}`}>
                  {task.title}
                </h3>
                <div className="flex flex-wrap gap-2 mt-2">
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Assignee: {task.assigned_to_email.split('@')[0]} ({task.assigned_to_role})
                  </span>
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    Origin: {task.creator_role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
              <div className={`px-4 py-1.5 rounded-full text-[10px] font-black tracking-widest ${task.is_complete ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'}`}>
                {task.is_complete ? "LOGGED COMPLETE" : "ACTIVE FIELD WORK"}
              </div>
            </div>
          </div>
        )) : (
          <div className="py-20 text-center bg-slate-50 rounded-[3rem] border-2 border-dashed border-slate-200">
            <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">Queue Clear • No active field tasks</p>
          </div>
        )}
      </div>

      {/* MODAL INTEGRATION */}
      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onTaskCreated={fetchTasks} 
      />
    </div>
  );
};

export default ManagementDashboard;