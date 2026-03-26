import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CreateTaskModal from './CreateTaskModal';
import { CheckCircle, Circle, Plus, ClipboardList } from 'lucide-react';

const ManagementDashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [isModalOpen, setModalOpen] = useState(false);

  const fetchTasks = async () => {
    const token = localStorage.getItem('access_token');
    const res = await axios.get('http://127.0.0.1:8000/api/v1/management/tasks/', {
      headers: { Authorization: `Bearer ${token}` }
    });
    setTasks(res.data);
  };

  useEffect(() => { fetchTasks(); }, []);

  const toggleTask = async (taskId) => {
    const token = localStorage.getItem('access_token');
    await axios.patch(`http://127.0.0.1:8000/api/v1/management/tasks/${taskId}/toggle_complete/`, {}, {
      headers: { Authorization: `Bearer ${token}` }
    });
    fetchTasks(); // Refresh UI
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Farm Tasks</h1>
          <p className="text-slate-500 text-sm">Manage planting and seedling operations</p>
        </div>
        <button 
          onClick={() => setModalOpen(true)}
          className="bg-slate-900 text-white px-6 py-3 rounded-2xl font-bold flex items-center gap-2 hover:bg-slate-800 transition-all shadow-lg"
        >
          <Plus size={20}/> New Task
        </button>
      </div>

      <div className="space-y-4">
        {tasks.map(task => (
          <div key={task.id} className="bg-white border border-slate-100 p-5 rounded-3xl shadow-sm hover:shadow-md transition-shadow flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button onClick={() => toggleTask(task.id)}>
                {task.is_complete ? 
                  <CheckCircle className="text-emerald-500" size={28} /> : 
                  <Circle className="text-slate-300" size={28} />
                }
              </button>
              <div>
                <h3 className={`font-bold ${task.is_complete ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                  {task.title}
                </h3>
                <div className="flex gap-2 mt-1">
                  <span className="text-[9px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded uppercase">
                    To: {task.assigned_to_email} ({task.assigned_to_role})
                  </span>
                  <span className="text-[9px] font-black bg-blue-50 text-blue-600 px-2 py-0.5 rounded uppercase">
                    From: {task.creator_role}
                  </span>
                </div>
              </div>
            </div>
            
            <div className={`px-4 py-1 rounded-full text-[10px] font-bold ${task.is_complete ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
              {task.is_complete ? "FINISHED" : "IN PROGRESS"}
            </div>
          </div>
        ))}
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => setModalOpen(false)} 
        onTaskCreated={fetchTasks} 
      />
    </div>
  );
};

export default ManagementDashboard;