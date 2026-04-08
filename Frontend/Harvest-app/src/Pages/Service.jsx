import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Smartphone, CheckCircle2, Loader2, 
  ArrowLeft, Package, AlertCircle, CreditCard, Tag
} from 'lucide-react';

// URL Configuration
const BASE_URL = 'http://127.0.0.1:8000/api/v1/services';

const Service = () => {
  const navigate = useNavigate();
  
  // --- 1. State Management ---
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  // --- 2. Authentication Helper ---
  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  // --- 3. Robust Data Fetching ---
  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      // We fetch separately so one failure doesn't block the other
      const [catRes, itemRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/categories/`, headers),
        axios.get(`${BASE_URL}/items/`, headers)
      ]);

      if (catRes.status === 'fulfilled') {
        setCategories(catRes.value.data || []);
      } else {
        console.error("Category Fetch Error:", catRes.reason);
      }

      if (itemRes.status === 'fulfilled') {
        setItems(itemRes.value.data || []);
      } else {
        console.error("Items Fetch Error:", itemRes.reason);
      }

    } catch (err) {
      console.error("System Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // --- 4. Search & Category Filtering ---
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Map 'name' or 'item_name' to prevent undefined errors
      const name = (item.name || item.item_name || "").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      
      // Check for nested category object or flat string
      const catName = item.category_name || item.category?.name || "General";
      const matchesCategory = selectedCategory === 'All' || catName === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  // --- 5. M-Pesa Payment Logic ---
  const handlePurchase = async (item) => {
    if (!phone || phone.length < 10) {
      alert("Please enter a valid M-Pesa number (e.g., 0712345678)");
      return;
    }

    setIsPaying(true);
    setPaymentStatus('processing');

    try {
      const payload = {
        item_id: item.id,
        phone: phone,
        amount: Math.round(item.price) // Backend usually requires integers
      };

      const res = await axios.post(`${BASE_URL}/pay/initiate/`, payload, getAuthHeaders());
      
      if (res.status === 200 || res.status === 201) {
        setPaymentStatus('success');
        setTimeout(() => setPaymentStatus(null), 6000);
      }
    } catch (err) {
      console.error("Payment Error:", err.response?.data);
      setPaymentStatus('error');
      setTimeout(() => setPaymentStatus(null), 4000);
    } finally {
      setIsPaying(false);
    }
  };

  // --- 6. Loading Screen ---
  if (loading) return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
      <Loader2 className="animate-spin text-emerald-600" size={40} />
      <p className="text-stone-400 font-bold text-xs tracking-widest uppercase">Synchronizing Marketplace...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-stone-50 pb-20 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Top Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button 
              onClick={() => navigate('/dashboard/user')} 
              className="flex items-center gap-2 text-stone-400 hover:text-stone-900 transition-colors font-bold text-xs uppercase tracking-tighter mb-4"
            >
              <ArrowLeft size={16} /> Back to Hub
            </button>
            <h1 className="text-5xl font-black text-stone-900 tracking-tighter">
              Harvest<span className="text-emerald-600">Market</span>
            </h1>
            <p className="text-stone-500 font-medium mt-1">Direct access to verified agricultural inputs.</p>
          </div>

          {/* M-Pesa Config Box */}
          <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-100 w-full md:w-80">
            <label className="flex items-center gap-2 text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-2">
              <Smartphone size={14} /> Payment Phone Number
            </label>
            <input 
              type="text" 
              placeholder="07XX XXX XXX" 
              value={phone} 
              onChange={(e) => setPhone(e.target.value)}
              className="w-full bg-stone-50 border-none rounded-xl py-3 px-4 font-mono font-bold focus:ring-2 focus:ring-emerald-500 transition-all"
            />
          </div>
        </div>

        {/* Global Notifications */}
        {paymentStatus === 'success' && (
          <div className="mb-8 p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl flex items-center gap-3 animate-in fade-in zoom-in">
            <CheckCircle2 size={20} />
            <span className="font-bold text-sm uppercase">STK Push Sent! Enter your M-Pesa PIN on your phone.</span>
          </div>
        )}

        {/* Search & Categories Bar */}
        <div className="flex flex-col lg:flex-row gap-4 mb-12">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-300 group-focus-within:text-emerald-500 transition-colors" size={20} />
            <input 
              type="text" 
              placeholder="Search equipment, seeds, or fertilizers..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-6 py-4 bg-white rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-emerald-500 font-bold text-stone-700" 
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${selectedCategory === 'All' ? 'bg-stone-900 text-white shadow-lg' : 'bg-white text-stone-400 hover:bg-stone-100'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-6 py-4 rounded-2xl font-black text-xs uppercase tracking-widest whitespace-nowrap transition-all ${selectedCategory === cat.name ? 'bg-stone-900 text-white shadow-lg' : 'bg-white text-stone-400 hover:bg-stone-100'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-[2.5rem] overflow-hidden border border-stone-100 hover:shadow-xl transition-all flex flex-col h-full">
              <div className="aspect-square bg-stone-100 relative">
                <img 
                  src={item.image || 'https://images.unsplash.com/photo-1592982537447-7440770cbfc9?q=80&w=400'} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-[9px] font-black text-stone-900 uppercase">
                  {item.category_name || item.category?.name || 'Item'}
                </div>
              </div>

              <div className="p-6 flex flex-col flex-grow">
                <h3 className="text-lg font-black text-stone-900 mb-1 leading-tight uppercase tracking-tight">
                  {item.name || item.item_name}
                </h3>
                <p className="text-stone-400 text-xs font-medium line-clamp-2 italic mb-6">
                  {item.description || "Premium agricultural resource."}
                </p>

                <div className="mt-auto pt-4 border-t border-stone-50 flex flex-col gap-4">
                  <div className="flex justify-between items-end">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-stone-300 uppercase tracking-widest">Price</span>
                      <span className="text-2xl font-black text-stone-900">
                        <span className="text-xs mr-1 text-emerald-600">KES</span>
                        {parseFloat(item.price).toLocaleString()}
                      </span>
                    </div>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                      {item.stock_quantity || 0} IN STOCK
                    </span>
                  </div>

                  <button 
                    onClick={() => handlePurchase(item)} 
                    disabled={isPaying || (item.stock_quantity <= 0)}
                    className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md ${
                      isPaying 
                      ? 'bg-stone-100 text-stone-400' 
                      : 'bg-stone-900 text-white hover:bg-emerald-600 shadow-stone-200'
                    }`}
                  >
                    {isPaying ? <Loader2 className="animate-spin" size={16} /> : <><CreditCard size={16} /> Purchase</>}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 && (
          <div className="text-center py-24 bg-white rounded-[3rem] border border-stone-100 mt-10">
            <Package size={48} className="mx-auto text-stone-200 mb-4" />
            <h3 className="text-xl font-black text-stone-800">Marketplace is Empty</h3>
            <p className="text-stone-400 font-bold text-sm">We couldn't find any items matching your criteria.</p>
            <button onClick={fetchData} className="mt-6 text-emerald-600 font-black text-xs uppercase underline">Refresh List</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Service;