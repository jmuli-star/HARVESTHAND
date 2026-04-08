import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Smartphone, CheckCircle2, Loader2, 
  ArrowLeft, Package, AlertCircle, CreditCard, Tag, Plus, X, 
  Image as ImageIcon, Sparkles, ShoppingCart, Trash2, ChevronRight
} from 'lucide-react';

const BASE_URL = 'http://127.0.0.1:8000/api/v1/services';

const Service = () => {
  const navigate = useNavigate();
  
  // --- State Management ---
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [phone, setPhone] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [showCart, setShowCart] = useState(false);
  
  // Posting States
  const [showPostModal, setShowPostModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postForm, setPostForm] = useState({
    name: '', description: '', price: '', stock_quantity: '', category_id: ''
  });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/cart/`, getAuthHeaders());
      setCart(res.data.items || []);
    } catch (err) {
      console.error("Cart Sync Error:", err);
    }
  }, [getAuthHeaders]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const [catRes, itemRes] = await Promise.allSettled([
        axios.get(`${BASE_URL}/categories/`, headers),
        axios.get(`${BASE_URL}/items/`, headers)
      ]);
      if (catRes.status === 'fulfilled') setCategories(catRes.value.data || []);
      if (itemRes.status === 'fulfilled') setItems(itemRes.value.data || []);
      await fetchCart();
    } catch (err) {
      console.error("Marketplace Sync Error:", err);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders, fetchCart]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addToCart = async (item) => {
    try {
      await axios.post(`${BASE_URL}/cart/`, { item_id: item.id, quantity: 1 }, getAuthHeaders());
      fetchCart();
      setShowCart(true);
    } catch (err) {
      alert("Could not add to cart");
    }
  };

  const handleCheckout = async () => {
    if (!phone || phone.length < 10) {
      setPaymentStatus('error');
      setTimeout(() => setPaymentStatus(null), 3000);
      return;
    }

    setIsPaying(true);
    setPaymentStatus('processing');

    try {
      const payload = { phone: phone };
      const res = await axios.post(`${BASE_URL}/pay/initiate/`, payload, getAuthHeaders());
      
      if (res.status === 200 || res.status === 201) {
        setPaymentStatus('success');
        setCart([]);
        setTimeout(() => {
          setPaymentStatus(null);
          setShowCart(false);
        }, 6000);
      }
    } catch (err) {
      setPaymentStatus('error');
      setTimeout(() => setPaymentStatus(null), 4000);
    } finally {
      setIsPaying(false);
    }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (curr.item_price * curr.quantity), 0);
  }, [cart]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const name = (item.name || "").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      const catName = item.category?.name || "General";
      const matchesCategory = selectedCategory === 'All' || catName === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [items, searchQuery, selectedCategory]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${BASE_URL}/items/`, postForm, getAuthHeaders());
      setShowPostModal(false);
      setPostForm({ name: '', description: '', price: '', stock_quantity: '', category_id: postForm.category_id });
      fetchData();
    } catch (err) {
      alert("Error posting product.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 flex items-center justify-center">
      <div className="flex flex-col items-center">
        <Loader2 className="animate-spin text-emerald-600" size={48} />
        <p className="text-emerald-700 mt-6 text-sm font-medium">Loading Harvest Market...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 text-stone-900 font-sans">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button 
              onClick={() => navigate('/dashboard/user')} 
              className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold transition-colors mb-4"
            >
              <ArrowLeft size={18} /> Back to Dashboard
            </button>
            <h1 className="text-5xl font-bold tracking-tight text-emerald-900">
              Harvest<span className="text-amber-600">Market</span>
            </h1>
            <p className="text-stone-600 font-medium">Farm inputs • Direct from the field</p>
          </div>

          <div className="flex gap-4 w-full md:w-auto">
            {/* M-Pesa Input */}
            <div className="bg-white px-6 py-4 rounded-3xl border border-emerald-100 shadow-sm flex items-center gap-4">
              <Smartphone size={22} className="text-emerald-500" />
              <input 
                type="tel" 
                placeholder="07XX XXX XXX" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)}
                className="bg-transparent outline-none font-semibold text-lg w-40"
              />
            </div>

            <button 
              onClick={() => setShowPostModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 rounded-3xl font-bold flex items-center gap-3 transition-all shadow-xl"
            >
              <Plus size={22} /> Sell Product
            </button>
          </div>
        </div>

        {/* Search & Categories */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={22} />
            <input 
              type="text" 
              placeholder="Search seeds, tools, fertilizers..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none text-stone-700 transition-all"
            />
          </div>

          <div className="flex gap-3 overflow-x-auto pb-2">
            <button 
              onClick={() => setSelectedCategory('All')}
              className={`px-8 py-4 rounded-3xl font-semibold text-sm whitespace-nowrap transition-all ${selectedCategory === 'All' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-stone-600 hover:bg-emerald-50 border border-emerald-100'}`}
            >
              All
            </button>
            {categories.map((cat) => (
              <button 
                key={cat.id} 
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-8 py-4 rounded-3xl font-semibold text-sm whitespace-nowrap transition-all ${selectedCategory === cat.name ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-stone-600 hover:bg-emerald-50 border border-emerald-100'}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <div key={item.id} className="group bg-white rounded-3xl border border-emerald-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col">
              <div className="aspect-square relative bg-emerald-50">
                <img 
                  src={item.image || `https://picsum.photos/id/${item.id}/600/600`} 
                  alt={item.name} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 right-4 bg-white text-emerald-700 text-xs font-bold px-4 py-1 rounded-3xl shadow">
                  {item.category?.name || 'General'}
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <h3 className="font-bold text-xl text-emerald-900 leading-tight mb-2">{item.name}</h3>
                <p className="text-stone-500 text-sm line-clamp-2 flex-1">{item.description}</p>
                
                <div className="mt-auto flex justify-between items-end pt-6">
                  <div>
                    <span className="text-xs font-bold text-emerald-600">KES</span>
                    <span className="text-3xl font-black text-emerald-900 ml-1">{parseFloat(item.price).toLocaleString()}</span>
                  </div>
                  <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-5 py-2 rounded-3xl">
                    {item.stock_quantity} left
                  </span>
                </div>

                <div className="flex gap-3 mt-6">
                  <button 
                    onClick={() => addToCart(item)}
                    className="flex-1 py-4 border-2 border-emerald-700 text-emerald-700 font-bold rounded-3xl hover:bg-emerald-700 hover:text-white transition-all"
                  >
                    Add to Cart
                  </button>
                  <button 
                    onClick={() => { addToCart(item); setShowCart(true); }}
                    className="px-6 bg-emerald-700 text-white rounded-3xl hover:bg-emerald-800 transition-all"
                  >
                    <ChevronRight size={24} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* FLOATING CART BUTTON */}
      <button 
        onClick={() => setShowCart(true)}
        className="fixed bottom-8 right-8 z-[100] bg-emerald-700 text-white p-6 rounded-full shadow-2xl hover:bg-emerald-800 transition-all flex items-center gap-4 group"
      >
        <ShoppingCart size={26} />
        <span className="font-bold text-lg pr-1">{cart.length}</span>
      </button>

      {/* SIDE CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 z-[200] flex justify-end">
          <div className="absolute inset-0 bg-emerald-950/60 backdrop-blur-md" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b flex justify-between items-center bg-emerald-50">
              <h2 className="text-2xl font-bold text-emerald-900">Your Cart</h2>
              <button onClick={() => setShowCart(false)} className="text-stone-400 hover:text-stone-600">
                <X size={28} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-8 space-y-8">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-stone-400">Your cart is empty</div>
              ) : (
                cart.map((c) => (
                  <div key={c.id} className="flex gap-5 items-center">
                    <div className="w-20 h-20 bg-emerald-50 rounded-3xl overflow-hidden">
                      <img src={c.item_image || `https://picsum.photos/id/${c.id}/200`} className="object-cover w-full h-full" alt="" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold">{c.item_name}</p>
                      <p className="text-xs text-stone-500">Qty: {c.quantity}</p>
                    </div>
                    <p className="font-bold text-emerald-900">KES {(c.item_price * c.quantity).toLocaleString()}</p>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-emerald-50 border-t">
              <div className="flex justify-between items-end mb-6">
                <span className="text-sm font-medium text-stone-500">Total</span>
                <span className="text-4xl font-bold text-emerald-900">KES {cartTotal.toLocaleString()}</span>
              </div>
              <button 
                onClick={handleCheckout}
                disabled={isPaying || cart.length === 0}
                className="w-full py-6 bg-emerald-700 text-white font-bold text-xl rounded-3xl shadow-xl hover:bg-emerald-800 transition-all flex items-center justify-center gap-3"
              >
                {isPaying ? <Loader2 className="animate-spin" size={24} /> : <>Pay with M-Pesa <CreditCard size={24} /></>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT STATUS OVERLAY */}
      {paymentStatus && (
        <div className="fixed top-8 right-8 z-[300] animate-in fade-in slide-in-from-right duration-500">
          <div className={`px-8 py-5 rounded-3xl shadow-2xl flex items-center gap-4 border ${paymentStatus === 'success' ? 'bg-emerald-100 border-emerald-200' : 'bg-rose-100 border-rose-200'}`}>
            {paymentStatus === 'processing' && <Loader2 className="animate-spin text-emerald-600" size={24} />}
            {paymentStatus === 'success' && <CheckCircle2 className="text-emerald-600" size={24} />}
            {paymentStatus === 'error' && <AlertCircle className="text-rose-600" size={24} />}
            <div>
              <p className="font-bold text-emerald-900">{paymentStatus === 'success' ? 'Payment Successful' : paymentStatus === 'error' ? 'Payment Failed' : 'Processing Payment'}</p>
              <p className="text-xs text-emerald-700">Check your M-Pesa phone</p>
            </div>
          </div>
        </div>
      )}

      {/* POST PRODUCT MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-emerald-950/70 backdrop-blur-sm z-[150] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden">
            <div className="px-8 py-6 bg-emerald-50 border-b flex justify-between items-center">
              <h2 className="text-2xl font-bold text-emerald-900 flex items-center gap-3">
                <Package size={28} /> List New Product
              </h2>
              <button onClick={() => setShowPostModal(false)} className="text-stone-400 hover:text-stone-600">
                <X size={28} />
              </button>
            </div>

            <form onSubmit={handlePostSubmit} className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">PRODUCT NAME</label>
                  <input required value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none" placeholder="e.g. Organic Fertilizer" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">CATEGORY</label>
                  <select required value={postForm.category_id} onChange={e => setPostForm({...postForm, category_id: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">PRICE (KES)</label>
                  <input type="number" required value={postForm.price} onChange={e => setPostForm({...postForm, price: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-stone-500 mb-2">STOCK QUANTITY</label>
                  <input type="number" required value={postForm.stock_quantity} onChange={e => setPostForm({...postForm, stock_quantity: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 mb-2">DESCRIPTION</label>
                <textarea rows={4} required value={postForm.description} onChange={e => setPostForm({...postForm, description: e.target.value})} className="w-full px-6 py-4 border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none resize-none" placeholder="Describe your product..." />
              </div>

              <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xl rounded-3xl transition-all flex items-center justify-center gap-3">
                {isSubmitting ? <Loader2 className="animate-spin" size={24} /> : "Publish to Market"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;