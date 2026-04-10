import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Smartphone, CheckCircle2, Loader2, 
  ArrowLeft, Package, AlertCircle, CreditCard, Plus, X, 
  ShoppingCart, Trash2, ChevronRight, Minus, Edit3
} from 'lucide-react';

// --- CONFIGURATION ---
const API_ROOT = (import.meta.env.VITE_API_URL || 'http://127.0.0.1:8000').replace(/\/$/, "");
const BASE_URL = `${API_ROOT}/api/v1/services`;

// --- SUB-COMPONENT: PRODUCT CARD ---
const ProductItem = ({ item, onAddToCart, onEdit, onDelete }) => {
  const [qty, setQty] = useState(1);
  const price = parseFloat(item.price || 0);
  const subtotal = qty * price;

  return (
    <div className="group bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col">
      <div className="aspect-square relative bg-emerald-50">
        <img 
          src={item.image || `https://picsum.photos/id/${(item.id % 50) + 10}/600/600`} 
          alt={item.name} 
          className="w-full h-full object-cover transition-transform group-hover:scale-105" 
        />
        {/* Owner Controls */}
        <div className="absolute top-4 left-4 flex gap-2">
           <button onClick={() => onEdit(item)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-emerald-600 shadow-sm hover:bg-emerald-600 hover:text-white transition-all">
             <Edit3 size={14} />
           </button>
           <button onClick={() => onDelete(item.id)} className="p-2 bg-white/90 backdrop-blur-sm rounded-full text-rose-600 shadow-sm hover:bg-rose-600 hover:text-white transition-all">
             <Trash2 size={14} />
           </button>
        </div>
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-black px-4 py-1.5 rounded-full shadow uppercase tracking-widest">
          {item.category_name || item.category?.name || 'General'}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-xl text-emerald-900 leading-tight">{item.name}</h3>
           <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${item.stock_quantity > 0 ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
             {item.stock_quantity > 0 ? `${item.stock_quantity} Left` : 'Out of Stock'}
           </span>
        </div>
        <p className="text-stone-500 text-sm line-clamp-2 flex-1">{item.description}</p>
        
        <div className="mt-auto pt-6 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-emerald-600 uppercase">Unit Price</span>
              <p className="text-2xl font-black text-emerald-900 leading-none">KES {price.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Subtotal</span>
              <p className="text-lg font-bold text-stone-700 leading-none">KES {subtotal.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center hover:bg-rose-50 transition-all">
              <Minus size={16} />
            </button>
            <span className="flex-1 text-center font-bold text-emerald-900">{qty}</span>
            <button onClick={() => { if(qty < item.stock_quantity) setQty(qty + 1) }} className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center hover:bg-emerald-50 transition-all">
              <Plus size={16} />
            </button>
          </div>

          <button 
            disabled={item.stock_quantity === 0}
            onClick={() => onAddToCart(item, qty)} 
            className="w-full py-4 border-2 border-emerald-700 text-emerald-700 font-bold rounded-3xl hover:bg-emerald-700 hover:text-white transition-all disabled:border-stone-200 disabled:text-stone-300"
          >
            {item.stock_quantity === 0 ? 'Sold Out' : `Add ${qty} to Cart`}
          </button>
        </div>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
const Service = () => {
  const navigate = useNavigate();
  
  // Data States
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // UI/Modal States
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCart, setShowCart] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form States
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postForm, setPostForm] = useState({ name: '', description: '', price: '', stock_quantity: '', category_id: '' });
  const [phone, setPhone] = useState('');
  const [isPaying, setIsPaying] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState(null);

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' } };
  }, []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();

      // Ensure trailing slashes for Django
      const [catRes, itemRes, cartRes] = await Promise.all([
        axios.get(`${BASE_URL}/categories/`, headers),
        axios.get(`${BASE_URL}/items/`, headers),
        axios.get(`${BASE_URL}/cart/`, headers).catch(() => ({ data: [] }))
      ]);

      // Failsafe data extraction (checks for .results key)
      const extract = (res) => res.data.results || (Array.isArray(res.data) ? res.data : []);
      
      setCategories(extract(catRes));
      setItems(extract(itemRes));
      setCart(cartRes.data.items || extract(cartRes));
      
    } catch (err) {
      console.error("Marketplace Fetch Error:", err.response?.data || err.message);
    } finally {
      setLoading(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // --- CRUD ACTIONS ---
  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
        ...postForm,
        price: parseFloat(postForm.price),
        stock_quantity: parseInt(postForm.stock_quantity),
        category: parseInt(postForm.category_id)
      };

      if (editingItem) {
        await axios.patch(`${BASE_URL}/items/${editingItem.id}/`, payload, getAuthHeaders());
      } else {
        await axios.post(`${BASE_URL}/items/`, payload, getAuthHeaders());
      }

      setShowPostModal(false);
      setEditingItem(null);
      setPostForm({ name: '', description: '', price: '', stock_quantity: '', category_id: '' });
      fetchData();
    } catch (err) {
      alert("Submission failed. Ensure all fields are valid.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm("Permanently delete this item?")) return;
    try {
      await axios.delete(`${BASE_URL}/items/${id}/`, getAuthHeaders());
      fetchData();
    } catch (err) {
      alert("Delete failed.");
    }
  };

  const addToCart = async (item, requestedQty) => {
    try {
      await axios.post(`${BASE_URL}/cart/`, { item_id: item.id, quantity: requestedQty }, getAuthHeaders());
      fetchData();
      setShowCart(true); 
    } catch (err) { 
      alert(err.response?.data?.error || "Error adding to cart."); 
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`${BASE_URL}/cart/${cartItemId}/`, getAuthHeaders());
      fetchData();
    } catch (err) { console.error(err); }
  };

  const handleCheckout = async () => {
    if (!phone) return alert("Enter M-Pesa Number");
    setIsPaying(true);
    try {
      await axios.post(`${BASE_URL}/pay/initiate/`, { phone }, getAuthHeaders());
      setPaymentStatus('success');
      setCart([]);
      setTimeout(() => { setShowCart(false); setPaymentStatus(null); }, 3000);
    } catch (err) { setPaymentStatus('error'); } 
    finally { setIsPaying(false); }
  };

  // --- FILTER LOGIC ---
  const cartTotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (parseFloat(curr.item_price || 0) * curr.quantity), 0);
  }, [cart]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const name = (item.name || "").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      const catName = item.category?.name || item.category_name || "General";
      const matchesCat = selectedCategory === 'All' || catName === selectedCategory;
      return matchesSearch && matchesCat;
    });
  }, [items, searchQuery, selectedCategory]);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <Loader2 className="animate-spin text-emerald-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F9FBFA] text-stone-900 font-sans pb-20">
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* TOP BAR */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button onClick={() => navigate('/dashboard/user')} className="flex items-center gap-2 text-emerald-700 font-bold mb-4">
              <ArrowLeft size={18} /> Exit
            </button>
            <h1 className="text-5xl font-black text-emerald-900 tracking-tighter">Marketplace.</h1>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={() => setShowCart(true)} className="relative bg-white border-2 border-emerald-100 px-6 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl">
              <ShoppingCart size={22} className="text-emerald-600" />
              <span>KES {cartTotal.toLocaleString()}</span>
              {cart.length > 0 && <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center">{cart.length}</span>}
            </button>
            <button onClick={() => { setEditingItem(null); setShowPostModal(true); }} className="bg-stone-900 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
              <Plus size={22} /> Sell Item
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input 
              type="text" placeholder="Search farm items..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border-2 border-stone-100 rounded-[2rem] focus:border-emerald-500 outline-none"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            <button onClick={() => setSelectedCategory('All')} className={`px-8 py-4 rounded-2xl font-bold text-sm ${selectedCategory === 'All' ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-stone-100 text-stone-500'}`}>All</button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-8 py-4 rounded-2xl font-bold text-sm whitespace-nowrap ${selectedCategory === cat.name ? 'bg-emerald-600 text-white' : 'bg-white border-2 border-stone-100 text-stone-500'}`}>{cat.name}</button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        {filteredItems.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {filteredItems.map((item) => (
              <ProductItem 
                key={item.id} 
                item={item} 
                onAddToCart={addToCart}
                onDelete={handleDeleteItem}
                onEdit={(itm) => {
                  setEditingItem(itm);
                  setPostForm({ name: itm.name, description: itm.description, price: itm.price, stock_quantity: itm.stock_quantity, category_id: itm.category?.id || itm.category });
                  setShowPostModal(true);
                }}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-32"><Package size={64} className="mx-auto text-stone-200 mb-4" /><h3 className="text-xl font-bold text-stone-400">Empty Section.</h3></div>
        )}
      </div>

      {/* POST/PATCH MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-stone-900/80 backdrop-blur-sm z-[250] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden animate-in zoom-in-95">
              <div className="px-10 py-8 bg-emerald-50 border-b flex justify-between items-center text-emerald-900">
                <h2 className="text-3xl font-black tracking-tighter">{editingItem ? 'Edit Product' : 'List Product'}</h2>
                <button onClick={() => setShowPostModal(false)}><X size={24} /></button>
              </div>
              <form onSubmit={handlePostSubmit} className="p-10 space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <input required value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} className="w-full px-6 py-4 border-2 rounded-2xl bg-stone-50" placeholder="Product Name" />
                  <select required value={postForm.category_id} onChange={e => setPostForm({...postForm, category_id: e.target.value})} className="w-full px-6 py-4 border-2 rounded-2xl bg-stone-50 font-bold">
                    <option value="">Select Category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <input type="number" required value={postForm.price} onChange={e => setPostForm({...postForm, price: e.target.value})} className="w-full px-6 py-4 border-2 rounded-2xl bg-stone-50 font-bold" placeholder="Price KES" />
                  <input type="number" required value={postForm.stock_quantity} onChange={e => setPostForm({...postForm, stock_quantity: e.target.value})} className="w-full px-6 py-4 border-2 rounded-2xl bg-stone-50 font-bold" placeholder="Stock Quantity" />
                </div>
                <textarea rows={3} required value={postForm.description} onChange={e => setPostForm({...postForm, description: e.target.value})} className="w-full px-6 py-4 border-2 rounded-2xl bg-stone-50 font-bold resize-none" placeholder="Details..." />
                <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-emerald-600 text-white font-black text-xl rounded-2xl shadow-xl disabled:bg-stone-200">
                  {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : editingItem ? "UPDATE PRODUCT" : "PUBLISH TO MARKET"}
                </button>
              </form>
          </div>
        </div>
      )}

      {/* CART DRAWER */}
      {showCart && (
        <div className="fixed inset-0 z-[300] flex justify-end">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col">
            <div className="p-8 border-b bg-emerald-50 flex justify-between items-center">
              <h2 className="text-2xl font-black italic tracking-tighter">Your Basket.</h2>
              <button onClick={() => setShowCart(false)}><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (<div className="text-center py-20 text-stone-300 font-black text-xs uppercase">Empty</div>) : (
                cart.map((c) => (
                  <div key={c.id} className="flex gap-4 items-center p-4 rounded-2xl border-2 border-stone-50">
                    <div className="flex-1">
                      <p className="font-bold text-sm text-emerald-900">{c.item_name}</p>
                      <p className="text-[10px] font-black text-stone-400">QTY: {c.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-sm">KES {(parseFloat(c.item_price || 0) * c.quantity).toLocaleString()}</p>
                      <button onClick={() => removeFromCart(c.id)} className="text-rose-400 mt-1"><Trash2 size={14} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-emerald-50 border-t space-y-6">
              <div className="flex justify-between items-end"><span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Total</span><span className="text-4xl font-black text-emerald-900">KES {cartTotal.toLocaleString()}</span></div>
              {paymentStatus === 'success' ? (
                <div className="bg-emerald-100 text-emerald-700 p-4 rounded-xl text-center font-bold">Sent! Check phone.</div>
              ) : (
                <div className="space-y-4">
                  <input type="tel" placeholder="07XXXXXXXX" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-6 py-4 rounded-xl border-2 border-emerald-200 outline-none font-bold" />
                  <button onClick={handleCheckout} disabled={isPaying || cart.length === 0} className="w-full py-5 bg-emerald-900 text-white font-black rounded-xl shadow-xl flex items-center justify-center">
                    {isPaying ? <Loader2 className="animate-spin" /> : "PAY VIA M-PESA"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;