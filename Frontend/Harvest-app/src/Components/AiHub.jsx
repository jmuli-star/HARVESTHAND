import React, { useState, useRef } from 'react';
import axios from 'axios';
import { 
  MessageSquare, 
  Camera, 
  TrendingUp, 
  Send, 
  Loader2, 
  Image as ImageIcon, 
  Sparkles,
  ChevronLeft
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AiHub = () => {
  const navigate = useNavigate();
  const [mode, setMode] = useState('chat'); // chat, vision, market
  const [input, setInput] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input && !image) return;

    setLoading(true);
    setResponse('');
    
    const formData = new FormData();
    formData.append('mode', mode);
    formData.append('query', input);
    if (image) formData.append('image', image);

    try {
      const token = localStorage.getItem('access_token');
      const res = await axios.post('http://127.0.0.1:8000/api/v1/services/ai-assistant/', formData, {
        headers: { 
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
        }
      });
      setResponse(res.data.data);
    } catch (err) {
      setResponse("The AI Agronomist is currently offline. Please check your connection and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-20">
      {/* Header with Back Button */}
      <div className="max-w-5xl mx-auto p-4 md:p-10">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-stone-500 hover:text-emerald-600 transition-colors mb-6 font-bold"
        >
          <ChevronLeft size={20} /> Back to Dashboard
        </button>

        <div className="text-center mb-10">
          <h1 className="text-4xl font-black text-stone-900 flex items-center justify-center gap-3 italic">
            HARVEST AI <Sparkles className="text-emerald-500 animate-pulse" />
          </h1>
          <p className="text-stone-500 mt-2 font-medium">Empowering your farm with Gemini Intelligence</p>
        </div>

        <div className="bg-white rounded-[3rem] shadow-2xl border border-stone-100 overflow-hidden min-h-[650px] flex flex-col">
          {/* Mode Selector Tabs */}
          <div className="flex bg-stone-100 p-3 gap-2">
            {[
              { id: 'chat', label: 'Agronomist', icon: MessageSquare, color: 'text-emerald-600', bg: 'hover:bg-emerald-50' },
              { id: 'vision', label: 'Crop Doctor', icon: Camera, color: 'text-blue-600', bg: 'hover:bg-blue-50' },
              { id: 'market', label: 'Market Analyst', icon: TrendingUp, color: 'text-orange-600', bg: 'hover:bg-orange-50' }
            ].map((t) => (
              <button 
                key={t.id}
                onClick={() => { setMode(t.id); setResponse(''); setImage(null); setPreview(null); }}
                className={`flex-1 py-4 rounded-[1.8rem] font-bold flex items-center justify-center gap-2 transition-all duration-300 ${
                  mode === t.id ? 'bg-white text-stone-900 shadow-sm scale-105' : `text-stone-400 ${t.bg}`
                }`}
              >
                <t.icon size={20} className={mode === t.id ? t.color : ''} />
                <span className="hidden md:inline">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="flex-1 p-6 md:p-10 flex flex-col">
            {/* AI Output Area */}
            <div className="flex-1 mb-8 overflow-y-auto">
              {response ? (
                <div className="bg-white p-8 rounded-[2.5rem] border-2 border-emerald-50 shadow-inner animate-in fade-in slide-in-from-bottom-4">
                  <div className="flex items-center gap-2 mb-6">
                      <div className="w-3 h-3 bg-emerald-500 rounded-full animate-ping" />
                      <span className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-600">Verified Advisory</span>
                  </div>
                  <div className="text-stone-700 leading-relaxed whitespace-pre-wrap font-medium text-lg">
                    {response}
                  </div>
                </div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-300 space-y-6 py-20">
                  <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center border-2 border-dashed border-stone-200">
                      {mode === 'chat' && <MessageSquare size={48} />}
                      {mode === 'vision' && <Camera size={48} />}
                      {mode === 'market' && <TrendingUp size={48} />}
                  </div>
                  <div className="text-center">
                    <p className="font-black text-stone-400 text-xl">Ready to assist</p>
                    <p className="text-sm">Type your query below to begin</p>
                  </div>
                </div>
              )}
            </div>

            {/* User Interaction Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'vision' && (
                <div className="flex items-center gap-4 animate-in zoom-in-95">
                  <div 
                    onClick={() => fileInputRef.current.click()}
                    className="flex-1 border-2 border-dashed border-stone-200 rounded-[2rem] p-6 text-center hover:border-emerald-400 cursor-pointer transition-all bg-stone-50/50 group"
                  >
                    <input type="file" hidden ref={fileInputRef} onChange={handleImageChange} accept="image/*" />
                    {preview ? (
                      <div className="relative inline-block">
                        <img src={preview} alt="Preview" className="h-24 w-24 object-cover rounded-2xl shadow-md border-2 border-white" />
                        <div className="absolute -top-2 -right-2 bg-emerald-500 text-white p-1 rounded-full"><Sparkles size={12}/></div>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-stone-400 group-hover:text-emerald-500 transition-colors">
                        <ImageIcon size={32} />
                        <span className="text-xs font-black uppercase tracking-wider">Tap to upload leaf/crop photo</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="relative group">
                <textarea 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder={
                      mode === 'chat' ? "Ask about fertilizers, pests, or planting dates..." :
                      mode === 'vision' ? "Describe any other symptoms you see..." :
                      "Which crop should we analyze for market trends?"
                  }
                  className="w-full p-8 pr-24 bg-stone-100 border-2 border-transparent rounded-[2.5rem] outline-none focus:bg-white focus:border-emerald-500/20 focus:ring-4 ring-emerald-500/5 min-h-[120px] resize-none font-bold text-stone-800 transition-all placeholder:text-stone-400"
                />
                <button 
                  disabled={loading || (!input && !image)} 
                  className="absolute right-4 bottom-4 bg-emerald-900 text-white p-5 rounded-3xl hover:scale-105 active:scale-95 disabled:bg-stone-200 disabled:scale-100 transition-all shadow-xl flex items-center justify-center min-w-[64px]"
                >
                  {loading ? <Loader2 className="animate-spin" size={24} /> : <Send size={24} />}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AiHub;