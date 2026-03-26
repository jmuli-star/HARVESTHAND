import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { X, Send, UserCheck } from 'lucide-react';

const CreateTaskModal = ({ isOpen, onClose, onTaskCreated }) => {
  const [formData, setFormData] = useState({ assigned_to: '', title: '', description: '' });
  const [assignableUsers, setAssignableUsers] = useState([]);
  const [loading, setLoading] = useState(false);

  // Logic: Fetch only valid users based on the current user's role
  useEffect(() => {
    if (isOpen) {
      const fetchUsers = async () => {
        try {
          const token = localStorage.getItem('access_token');
          const res = await axios.get('http://127.0.0.1:8000/api/v1/management/tasks/assignable_users/', {
            headers: { Authorization: `Bearer ${token}` }
          });
          setAssignableUsers(res.data);
        } catch (err) {
          console.error("Could not fetch users", err);
        }
      };
      fetchUsers();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem('access_token');
      await axios.post('http://127.0.0.1:8000/api/v1/management/tasks/', formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      onTaskCreated(); // Refresh the list in the parent
      onClose();       // Close modal
    } catch (err) {
      alert("Error creating task. Check if all fields are filled.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-emerald-50">
          <h2 className="text-xl font-bold text-emerald-900 flex items-center gap-2">
            <UserCheck size={24} /> Assign New Task
          </h2>
          <button onClick={onClose} className="text-emerald-900/50 hover:text-emerald-900"><X /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Assign To</label>
            <select 
              required
              className="w-full p-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
              value={formData.assigned_to}
              onChange={(e) => setFormData({...formData, assigned_to: e.target.value})}
            >
              <option value="">Select a Team Member</option>
              {assignableUsers.map(user => (
                <option key={user.id} value={user.id}>{user.email} ({user.role})</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Task Title</label>
            <input 
              required
              placeholder="e.g. User1 - perform planting"
              className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500"
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Description</label>
            <textarea 
              rows="3"
              placeholder="Provide specific instructions..."
              className="w-full p-3 rounded-xl border border-slate-200 text-sm outline-none focus:border-emerald-500"
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2"
          >
            {loading ? "Assigning..." : <><Send size={18}/> Send Task</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateTaskModal;