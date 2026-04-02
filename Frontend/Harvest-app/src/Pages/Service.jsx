import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { 
  ShoppingBag, Users, Zap, Tractor, 
  Search, Filter, ChevronRight, Phone,
  CheckCircle, AlertCircle, Loader2
} from 'lucide-react';

function Service() {
  const BASE_URL = 'http://127.0.0.1:8000/api/v1/services';
  
  // --- 1. State Management ---
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Payment States
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null); // 'success', 'error', or null
  const [phone, setPhone] = useState('');

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('access_token')}` }
  });
  useEffect(() => {
  const fetchUserDataAndMarketplace = async () => {
    try {
      setLoading(true);
      
      // 1. Fetch User Profile to get their saved phone number
      const userRes = await axios.get('http://127.0.0.1:8000/api/v1/auth/user/', getAuthHeaders());
      if (userRes.data.phone) {
        setPhone(userRes.data.phone);
      }

      // 2. Fetch Categories and Items
      const [catRes, itemRes] = await Promise.all([
        axios.get(`${BASE_URL}/categories/`, getAuthHeaders()),
        axios.get(`${BASE_URL}/items/`, getAuthHeaders())
      ]);

      setCategories(catRes.data);
      setItems(itemRes.data);
    } catch (err) {
      console.error("Initialization Error:", err);
    } finally {
      setLoading(false);
    }
  };

  fetchUserDataAndMarketplace();
}, []);

  

  // --- 3. M-Pesa Integration Logic ---
  const handlePurchase = async (item) => {
    // Basic validation
    if (!phone || phone.length < 10) {
      alert("Please provide a valid M-Pesa phone number in settings or at checkout.");
      return;
    }

    setIsPaying(true);
    setPaymentStatus('processing');

    try {
      const payload = {
        item_id: item.id,
        phone: phone // e.g., "0712345678"
      };

      const res = await axios.post(`${BASE_URL}/pay/initiate/`, payload, getAuthHeaders());
      
      if (res.data.ResponseCode === "0") {
        alert("STK Push Sent! Enter your M-Pesa PIN on your phone.");
        setPaymentStatus('success');
      } else {
        setPaymentStatus('error');
      }
    } catch (err) {
      console.error("Payment Error:", err);
      setPaymentStatus('error');
    } finally {
      setTimeout(() => {
        setIsPaying(false);
        setPaymentStatus(null);
      }, 5000);
    }
  };

  // Filter logic for search bar
  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 pb-20">
      {/* HERO / SEARCH HEADER */}
      <div className="bg-emerald-900 text-white pt-16 pb-24 px-6">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-6">Marketplace & Services</h1>
          <p className="text-emerald-100 text-lg mb-8 max-w-2xl mx-auto">
            Access vetted personnel, high-quality farm inputs, and professional equipment to boost your harvest.
          </p>
          
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700" size={20} />
            <input 
              type="text"
              placeholder="Search for mechanics, seeds, or solar pumps..."
              className="w-full pl-12 pr-6 py-4 rounded-2xl bg-white text-stone-900 shadow-xl outline-none focus:ring-4 focus:ring-emerald-500/30 transition-all"
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 -mt-12">
        {/* CATEGORY BAR */}
        <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar">
          <button 
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-md ${!selectedCategory ? 'bg-amber-500 text-white scale-105' : 'bg-white text-stone-600 hover:bg-emerald-50'}`}
          >
            All Services
          </button>
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`px-6 py-3 rounded-2xl font-bold whitespace-nowrap transition-all shadow-md ${selectedCategory === cat.slug ? 'bg-amber-500 text-white scale-105' : 'bg-white text-stone-600 hover:bg-emerald-50'}`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* PHONE NUMBER INPUT (REQUIRED FOR MPESA) */}
        <div className="mt-8 mb-4 bg-emerald-100 p-4 rounded-2xl border border-emerald-200 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-emerald-800">
            <Phone size={20} />
            <span className="font-bold text-sm">Payment Phone Number:</span>
          </div>
          <input 
            type="text" 
            placeholder="e.g. 0712345678"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className="px-4 py-2 rounded-xl border-none focus:ring-2 focus:ring-emerald-500 outline-none w-full md:w-48 text-sm"
          />
        </div>

        {/* MAIN GRID */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 opacity-50">
            <Loader2 className="animate-spin text-emerald-600 mb-4" size={40} />
            <p className="font-bold text-emerald-900 uppercase tracking-widest text-xs">Loading Catalog...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mt-8">
            {filteredItems.map(item => (
              <div key={item.id} className="bg-white rounded-[2.5rem] overflow-hidden border border-emerald-100 hover:shadow-2xl transition-all group">
                <div className="h-56 bg-stone-200 relative overflow-hidden">
                  <img 
                    src={item.image} 
                    alt={item.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                  />
                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg font-black text-emerald-900">
                    KES {item.price}
                  </div>
                </div>

                <div className="p-8">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xl font-bold text-stone-800 mb-1">{item.name}</h3>
                      <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        {item.item_type}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-stone-500 text-sm line-clamp-2 mb-6">
                    {item.description}
                  </p>

                  <button 
                    disabled={isPaying}
                    onClick={() => handlePurchase(item)}
                    className={`w-full py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all ${
                      isPaying 
                      ? 'bg-stone-100 text-stone-400 cursor-not-allowed' 
                      : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-lg shadow-emerald-600/20 active:scale-95'
                    }`}
                  >
                    {isPaying ? (
                      <> <Loader2 className="animate-spin" size={20} /> Processing... </>
                    ) : (
                      <> <ShoppingBag size={20} /> Order via M-Pesa </>
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {!loading && filteredItems.length === 0 && (
          <div className="text-center py-20">
            <AlertCircle size={48} className="mx-auto text-stone-300 mb-4" />
            <h3 className="text-xl font-bold text-stone-400">No items found in this category</h3>
          </div>
        )}
      </div>

      {/* PAYMENT TOAST NOTIFICATION */}
      {paymentStatus && (
        <div className={`fixed bottom-10 left-1/2 -translate-x-1/2 px-8 py-4 rounded-3xl shadow-2xl z-[100] animate-in fade-in slide-in-from-bottom-5 flex items-center gap-4 border-2 ${
          paymentStatus === 'success' ? 'bg-emerald-900 border-emerald-400 text-white' : 'bg-rose-900 border-rose-400 text-white'
        }`}>
          {paymentStatus === 'success' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
          <div>
            <p className="font-bold text-sm">
              {paymentStatus === 'success' ? "Check your phone for PIN prompt!" : "M-Pesa request failed."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default Service;