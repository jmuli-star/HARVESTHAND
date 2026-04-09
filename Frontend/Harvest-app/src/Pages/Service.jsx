import React, { useState, useEffect, useCallback, useMemo } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingBag, Search, Smartphone, CheckCircle2, Loader2, 
  ArrowLeft, Package, AlertCircle, CreditCard, Plus, X, 
  ShoppingCart, Trash2, ChevronRight, Minus
} from 'lucide-react';

const BASE_URL = 'http://127.0.0.1:8000/api/v1/services';

// --- SUB-COMPONENT: PRODUCT CARD ---
const ProductItem = ({ item, onAddToCart }) => {
  const [qty, setQty] = useState(1);
  const subtotal = qty * parseFloat(item.price || 0);

  return (
    <div className="group bg-white rounded-[2.5rem] border border-emerald-100 shadow-sm hover:shadow-2xl transition-all overflow-hidden flex flex-col">
      <div className="aspect-square relative bg-emerald-50">
        <img src={item.image || `https://picsum.photos/id/${item.id + 10}/600/600`} alt={item.name} className="w-full h-full object-cover transition-transform group-hover:scale-105" />
        <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-emerald-700 text-[10px] font-black px-4 py-1.5 rounded-full shadow uppercase tracking-widest">
          {item.category?.name || 'General'}
        </div>
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex justify-between items-start mb-2">
           <h3 className="font-bold text-xl text-emerald-900 leading-tight">{item.name}</h3>
           <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-md">
             {item.stock_quantity} Left
           </span>
        </div>
        <p className="text-stone-500 text-sm line-clamp-2 flex-1">{item.description}</p>
        
        <div className="mt-auto pt-6 space-y-4">
          <div className="flex justify-between items-end">
            <div>
              <span className="text-xs font-bold text-emerald-600">UNIT KES</span>
              <p className="text-2xl font-black text-emerald-900 leading-none">{parseFloat(item.price).toLocaleString()}</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Subtotal</span>
              <p className="text-lg font-bold text-stone-700 leading-none">KES {subtotal.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-2xl border border-stone-100">
            <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center hover:bg-rose-50 hover:text-rose-600 transition-all">
              <Minus size={16} />
            </button>
            <span className="flex-1 text-center font-bold text-emerald-900">{qty}</span>
            <button onClick={() => { if(qty < item.stock_quantity) setQty(qty + 1) }} className="w-10 h-10 rounded-xl bg-white border border-stone-200 flex items-center justify-center hover:bg-emerald-50 hover:text-emerald-600 transition-all">
              <Plus size={16} />
            </button>
          </div>

          <div className="flex gap-3">
            <button 
              disabled={item.stock_quantity === 0}
              onClick={() => onAddToCart(item, qty)} 
              className="flex-1 py-4 border-2 border-emerald-700 text-emerald-700 font-bold rounded-3xl hover:bg-emerald-700 hover:text-white transition-all disabled:border-stone-200"
            >
              Add {qty} to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const Service = () => {
  const navigate = useNavigate();
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
  const [showCheckoutStep, setShowCheckoutStep] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [postForm, setPostForm] = useState({ name: '', description: '', price: '', stock_quantity: '', category_id: '' });

  const getAuthHeaders = useCallback(() => {
    const token = localStorage.getItem('access_token');
    return { headers: { Authorization: `Bearer ${token}` } };
  }, []);

  const fetchCart = useCallback(async () => {
    try {
      const res = await axios.get(`${BASE_URL}/cart/`, getAuthHeaders());
      setCart(res.data.items || []);
    } catch (err) { console.error(err); }
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
    } catch (err) { console.error(err); } 
    finally { setLoading(false); }
  }, [getAuthHeaders, fetchCart]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const addToCart = async (item, requestedQty) => {
    try {
      await axios.post(`${BASE_URL}/cart/`, { item_id: item.id, quantity: requestedQty }, getAuthHeaders());
      fetchCart();
      setShowCart(true); 
    } catch (err) { alert("Stock limit reached"); }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      await axios.delete(`${BASE_URL}/cart/${cartItemId}/`, getAuthHeaders());
      fetchCart();
    } catch (err) { fetchCart(); }
  };

  const handleCheckout = async () => {
    if (!phone || phone.length < 10) return alert("Enter M-Pesa Number");
    setIsPaying(true);
    setPaymentStatus('processing');
    try {
      const res = await axios.post(`${BASE_URL}/pay/initiate/`, { phone }, getAuthHeaders());
      if (res.status === 200 || res.status === 201) {
        setPaymentStatus('success');
        setCart([]);
        setTimeout(() => { setPaymentStatus(null); setShowCart(false); setShowCheckoutStep(false); }, 5000);
      }
    } catch (err) { setPaymentStatus('error'); } 
    finally { setIsPaying(false); }
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((acc, curr) => acc + (parseFloat(curr.item_price || 0) * curr.quantity), 0);
  }, [cart]);

  const filteredItems = useMemo(() => {
    return items.filter(item => {
      const name = (item.name || "").toLowerCase();
      const matchesSearch = name.includes(searchQuery.toLowerCase());
      const catName = item.category?.name || "General";
      return (selectedCategory === 'All' || catName === selectedCategory) && matchesSearch;
    });
  }, [items, searchQuery, selectedCategory]);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await axios.post(`${BASE_URL}/items/`, postForm, getAuthHeaders());
      setShowPostModal(false);
      setPostForm({ name: '', description: '', price: '', stock_quantity: '', category_id: '' });
      fetchData();
    } catch (err) { alert("Error posting."); } 
    finally { setIsSubmitting(false); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-emerald-50">
      <Loader2 className="animate-spin text-emerald-600" size={48} />
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-amber-50 text-stone-900 font-sans pb-20">
      
      <div className="max-w-7xl mx-auto px-6 py-10">
        
        {/* UPDATED HEADER: Cart is now a button here */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
          <div>
            <button onClick={() => navigate('/dashboard/user')} className="flex items-center gap-2 text-emerald-700 hover:text-emerald-900 font-semibold mb-4">
              <ArrowLeft size={18} /> Back
            </button>
            <h1 className="text-5xl font-bold tracking-tight text-emerald-900">
              Harvest<span className="text-amber-600">Market</span>
            </h1>
          </div>

          <div className="flex items-center gap-3 w-full md:w-auto">
            {/* CART BUTTON IN HEADER */}
            <button 
              onClick={() => { setShowCart(true); setShowCheckoutStep(false); }}
              className="relative bg-white border border-emerald-200 text-emerald-900 px-6 py-5 rounded-3xl font-bold flex items-center gap-3 shadow-sm hover:shadow-lg transition-all active:scale-95"
            >
              <ShoppingCart size={22} className="text-emerald-600" />
              <span>Cart (KES {cartTotal.toLocaleString()})</span>
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-amber-500 text-white text-[10px] w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                  {cart.length}
                </span>
              )}
            </button>

            <button onClick={() => setShowPostModal(true)} className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-5 rounded-3xl font-bold flex items-center gap-3 shadow-xl transition-all active:scale-95">
              <Plus size={22} /> Sell Item
            </button>
          </div>
        </div>

        {/* SEARCH & FILTERS */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12">
          <div className="relative flex-1">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-emerald-400" size={22} />
            <input 
              type="text" 
              placeholder="Search seeds, tools, fertilizers..." 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-5 bg-white border border-emerald-100 rounded-3xl focus:border-emerald-300 outline-none shadow-sm"
            />
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2">
            <button onClick={() => setSelectedCategory('All')} className={`px-8 py-4 rounded-3xl font-semibold text-sm transition-all whitespace-nowrap ${selectedCategory === 'All' ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-stone-600 border border-emerald-100'}`}>All</button>
            {categories.map((cat) => (
              <button key={cat.id} onClick={() => setSelectedCategory(cat.name)} className={`px-8 py-4 rounded-3xl font-semibold text-sm transition-all whitespace-nowrap ${selectedCategory === cat.name ? 'bg-emerald-700 text-white shadow-md' : 'bg-white text-stone-600 border border-emerald-100'}`}>{cat.name}</button>
            ))}
          </div>
        </div>

        {/* PRODUCTS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {filteredItems.map((item) => (
            <ProductItem key={item.id} item={item} onAddToCart={addToCart} />
          ))}
        </div>
      </div>

      {/* SIDE CART DRAWER (Kept same logic, just triggered from header) */}
      {showCart && (
        <div className="fixed inset-0 z-[150] flex justify-end">
          <div className="absolute inset-0 bg-stone-900/40 backdrop-blur-sm" onClick={() => setShowCart(false)} />
          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            <div className="p-8 border-b bg-emerald-50 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-emerald-900 italic tracking-tighter">Market Cart.</h2>
                <p className="text-stone-500 text-[10px] font-black uppercase tracking-widest mt-1">{cart.length} items</p>
              </div>
              <button onClick={() => setShowCart(false)} className="p-2 hover:bg-emerald-100 rounded-full"><X size={24} /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cart.length === 0 ? (
                <div className="text-center py-20 text-stone-300 font-black uppercase tracking-widest text-xs">Empty Cart</div>
              ) : (
                cart.map((c) => (
                  <div key={c.id} className="flex gap-4 items-center p-4 rounded-[2rem] bg-stone-50 border border-stone-100 transition-all hover:bg-emerald-50">
                    <div className="w-16 h-16 bg-white rounded-2xl overflow-hidden border flex-shrink-0">
                      <img src={c.item_image} className="object-cover w-full h-full" alt="" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-emerald-900 truncate">{c.item_name}</p>
                      <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mt-1">Qty: {c.quantity}</p>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <p className="font-black text-emerald-900 text-sm">KES {(parseFloat(c.item_price || 0) * c.quantity).toLocaleString()}</p>
                      <button onClick={() => removeFromCart(c.id)} className="p-2 text-stone-300 hover:text-rose-500 rounded-full transition-all"><Trash2 size={16} /></button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-8 bg-emerald-50 border-t space-y-6">
              <div className="flex justify-between items-end">
                <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Total</span>
                <span className="text-4xl font-bold text-emerald-900 tracking-tighter">KES {cartTotal.toLocaleString()}</span>
              </div>

              {showCheckoutStep && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <label className="block text-[10px] font-black text-emerald-700 uppercase tracking-widest ml-1">M-Pesa Number</label>
                  <div className="flex items-center gap-3 bg-white px-5 py-4 rounded-2xl border-2 border-emerald-400 shadow-inner">
                    <Smartphone size={18} className="text-emerald-500" />
                    <input type="tel" placeholder="07XX XXX XXX" value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-transparent outline-none font-bold text-stone-700 w-full text-lg" />
                  </div>
                </div>
              )}

              {paymentStatus === 'success' && (
                <div className="bg-emerald-100 text-emerald-700 p-4 rounded-2xl flex items-center gap-3 font-bold animate-pulse">
                  <CheckCircle2 size={20} /> Success! Check your phone.
                </div>
              )}

              {!showCheckoutStep ? (
                <button onClick={() => setShowCheckoutStep(true)} disabled={cart.length === 0} className="w-full py-6 bg-emerald-700 text-white font-black text-lg rounded-[2rem] shadow-xl hover:bg-stone-900 transition-all">
                  Proceed to Checkout
                </button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={() => setShowCheckoutStep(false)} className="p-6 bg-white border border-emerald-200 text-emerald-700 rounded-[2rem] hover:bg-stone-100"><ArrowLeft size={20} /></button>
                  <button onClick={handleCheckout} disabled={isPaying || !phone} className="flex-1 py-6 bg-emerald-900 text-white font-black text-lg rounded-[2rem] shadow-xl hover:bg-black transition-all">
                    {isPaying ? <Loader2 className="animate-spin mx-auto" size={24} /> : "Pay via M-Pesa"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* POST MODAL */}
      {showPostModal && (
        <div className="fixed inset-0 bg-stone-950/60 backdrop-blur-sm z-[250] flex items-center justify-center p-6">
          <div className="bg-white w-full max-w-2xl rounded-[3rem] shadow-2xl overflow-hidden">
             <div className="px-8 py-6 bg-emerald-50 border-b flex justify-between items-center text-emerald-900">
               <h2 className="text-2xl font-bold italic">Sell Product</h2>
               <button onClick={() => setShowPostModal(false)} className="p-2 hover:bg-emerald-100 rounded-full"><X size={24} /></button>
             </div>
             <form onSubmit={handlePostSubmit} className="p-8 space-y-6">
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <input required value={postForm.name} onChange={e => setPostForm({...postForm, name: e.target.value})} className="w-full px-6 py-4 border rounded-[1.5rem] bg-stone-50" placeholder="Product Name" />
                 <select required value={postForm.category_id} onChange={e => setPostForm({...postForm, category_id: e.target.value})} className="w-full px-6 py-4 border rounded-[1.5rem] bg-stone-50">
                   <option value="">Category</option>
                   {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                 </select>
               </div>
               <div className="grid grid-cols-2 gap-6">
                 <input type="number" required value={postForm.price} onChange={e => setPostForm({...postForm, price: e.target.value})} className="w-full px-6 py-4 border rounded-[1.5rem] bg-stone-50" placeholder="Price" />
                 <input type="number" required value={postForm.stock_quantity} onChange={e => setPostForm({...postForm, stock_quantity: e.target.value})} className="w-full px-6 py-4 border rounded-[1.5rem] bg-stone-50" placeholder="Stock" />
               </div>
               <textarea rows={3} required value={postForm.description} onChange={e => setPostForm({...postForm, description: e.target.value})} className="w-full px-6 py-4 border rounded-[1.5rem] bg-stone-50 resize-none" placeholder="Description" />
               <button type="submit" disabled={isSubmitting} className="w-full py-6 bg-emerald-600 text-white font-bold text-xl rounded-[2rem] hover:bg-emerald-700">
                 {isSubmitting ? <Loader2 className="animate-spin mx-auto" /> : "PUBLISH"}
               </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Service;