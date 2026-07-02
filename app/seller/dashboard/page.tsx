
'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Package, ShoppingCart, DollarSign, Plus, Check, X, CreditCard, Bell, TrendingUp, Store, LogOut } from 'lucide-react';

type Tab = 'overview'|'products'|'orders'|'payment'|'store'|'announcements';

export default function SellerDashboard() {
  const { data:session } = useSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [newProduct, setNewProduct] = useState({ title:'', description:'', basePrice:'', stock:'', imageUrl:'' });
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');
  const [storeName, setStoreName] = useState('');
  const [storeDesc, setStoreDesc] = useState('');

  useEffect(() => { if (session?.user) fetchAll(); }, [session]);

  const fetchAll = async () => {
    const [pRes,oRes,aRes] = await Promise.all([
      fetch('/api/products?sellerId='+(session?.user as any)?.id),
      fetch('/api/orders'),
      fetch('/api/announcements'),
    ]);
    if (pRes.ok) setProducts(await pRes.json());
    if (oRes.ok) setOrders(await oRes.json());
    if (aRes.ok) setAnnouncements(await aRes.json());
  };

  const addProduct = async () => {
    if (!newProduct.title||!newProduct.basePrice) { toast.error('Fill required fields'); return; }
    const res = await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...newProduct,basePrice:parseFloat(newProduct.basePrice),stock:parseInt(newProduct.stock)||0}) });
    if (res.ok) { toast.success('Product added!'); setNewProduct({title:'',description:'',basePrice:'',stock:'',imageUrl:''}); fetchAll(); }
    else toast.error('Failed');
  };

  const updateOrder = async (id: string, status: string, rejectReason?: string) => {
    const res = await fetch('/api/orders', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,status,rejectReason}) });
    if (res.ok) { toast.success('Order updated!'); fetchAll(); }
  };

  const requestPayment = async () => {
    if (!bankName||!accountNo||!amount) { toast.error('Fill all fields'); return; }
    const res = await fetch('/api/payment-requests', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({bankName,accountNo,amount:parseFloat(amount)}) });
    if (res.ok) { toast.success('Payment requested!'); setBankName(''); setAccountNo(''); setAmount(''); }
  };

  const setupStore = async () => {
    if (!storeName) { toast.error('Enter store name'); return; }
    const res = await fetch('/api/stores', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({name:storeName,description:storeDesc}) });
    if (res.ok) toast.success('Store created!');
  };

  const earnings = orders.filter((o:any)=>o.status==='DONE').reduce((sum:number,o:any)=>sum+o.totalAmount,0);

  const statusColors: Record<string,string> = {
    PENDING:'text-yellow-400 bg-yellow-400/10', APPROVED:'text-green-400 bg-green-400/10',
    REJECTED:'text-red-400 bg-red-400/10', DONE:'text-blue-400 bg-blue-400/10',
  };

  const tabs = [
    {id:'overview' as Tab,label:'Overview',icon:TrendingUp},
    {id:'products' as Tab,label:'Products',icon:Package},
    {id:'orders' as Tab,label:'Orders',icon:ShoppingCart},
    {id:'payment' as Tab,label:'Payments',icon:CreditCard},
    {id:'store' as Tab,label:'My Store',icon:Store},
    {id:'announcements' as Tab,label:'Announcements',icon:Bell},
  ];

  return (
    <div className="min-h-screen hero-bg grid-pattern">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text">Seller Dashboard</h1>
            <p className="text-gray-400">Welcome, {session?.user?.name}</p>
          </div>
          <button onClick={()=>signOut({callbackUrl:'/login'})} className="flex items-center gap-2 px-4 py-2 glass rounded-xl text-gray-400 hover:text-red-400 transition-colors">
            <LogOut className="w-4 h-4"/> Logout
          </button>
        </div>

        <div className="flex flex-wrap gap-2 mb-8 glass rounded-2xl p-2">
          {tabs.map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${tab===t.id?'bg-indigo-600 text-white':'text-gray-400 hover:text-white'}`}>
              <t.icon className="w-4 h-4"/>{t.label}
            </button>
          ))}
        </div>

        {tab==='overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                {label:'Products',value:products.length,icon:<Package className="w-6 h-6"/>,color:'from-indigo-500 to-purple-600'},
                {label:'Total Orders',value:orders.length,icon:<ShoppingCart className="w-6 h-6"/>,color:'from-blue-500 to-cyan-600'},
                {label:'Pending',value:orders.filter((o:any)=>o.status==='PENDING').length,icon:<TrendingUp className="w-6 h-6"/>,color:'from-yellow-500 to-orange-600'},
                {label:'Earnings (LKR)',value:earnings.toFixed(0),icon:<DollarSign className="w-6 h-6"/>,color:'from-green-500 to-teal-600'},
              ].map((s,i)=>(
                <motion.div key={i} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} transition={{delay:i*0.1}} className="glass rounded-2xl p-5 card-3d">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3`}>{s.icon}</div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-gray-400 text-sm">{s.label}</div>
                </motion.div>
              ))}
            </div>
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0,5).map((o:any)=>(
                  <div key={o.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                    <div>
                      <p className="text-white font-medium text-sm">Order #{o.id.slice(-6)}</p>
                      <p className="text-gray-400 text-xs">{o.customer?.username}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">LKR {o.totalAmount}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[o.status]}`}>{o.status}</span>
                    </div>
                  </div>
                ))}
                {orders.length===0 && <p className="text-gray-500 text-center py-4">No orders yet</p>}
              </div>
            </div>
          </div>
        )}

        {tab==='products' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 neon-border">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-400"/> Add Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{key:'title',ph:'Product Title *'},{key:'basePrice',ph:'Base Price (LKR) *'},{key:'stock',ph:'Stock Qty'},{key:'imageUrl',ph:'Image URL'}].map(f=>(
                  <input key={f.key} placeholder={f.ph} value={(newProduct as any)[f.key]} onChange={(e)=>setNewProduct({...newProduct,[f.key]:e.target.value})}
                    className="bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none"/>
                ))}
                <textarea placeholder="Description" value={newProduct.description} onChange={(e)=>setNewProduct({...newProduct,description:e.target.value})}
                  className="md:col-span-2 bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none" rows={3}/>
              </div>
              <button onClick={addProduct} className="btn-primary text-white mt-4 flex items-center gap-2"><Plus className="w-5 h-5"/> Add Product</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p:any)=>(
                <div key={p.id} className="glass rounded-2xl p-5 card-3d">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover rounded-xl mb-4"/>}
                  <h4 className="font-bold text-white">{p.title}</h4>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{p.description}</p>
                  <div className="mt-3">
                    <p className="text-gray-500 text-xs">Base: LKR {p.basePrice}</p>
                    <p className="text-indigo-400 font-bold">Final: LKR {p.finalPrice?.toFixed(0)}</p>
                  </div>
                </div>
              ))}
              {products.length===0 && <div className="col-span-3 glass rounded-2xl p-12 text-center text-gray-500">No products yet</div>}
            </div>
          </div>
        )}

        {tab==='orders' && (
          <div className="space-y-4">
            {orders.map((o:any)=>(
              <div key={o.id} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-white">Order #{o.id.slice(-8)}</p>
                    <p className="text-gray-400 text-sm">Customer: {o.customer?.username}</p>
                    <p className="text-indigo-400 font-bold">LKR {o.totalAmount}</p>
                    {o.note && <p className="text-gray-400 text-xs mt-1">Note: {o.note}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[o.status]}`}>{o.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {o.status==='PENDING' && (
                    <>
                      <button onClick={()=>updateOrder(o.id,'APPROVED')} className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm"><Check className="w-4 h-4"/> Approve</button>
                      <button onClick={()=>{const r=prompt('Reject reason:');updateOrder(o.id,'REJECTED',r||'');}} className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm"><X className="w-4 h-4"/> Reject</button>
                    </>
                  )}
                  {o.status==='APPROVED' && (
                    <button onClick={()=>updateOrder(o.id,'DONE')} className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm"><Check className="w-4 h-4"/> Mark Done</button>
                  )}
                </div>
              </div>
            ))}
            {orders.length===0 && <div className="glass rounded-2xl p-12 text-center text-gray-500">No orders yet</div>}
          </div>
        )}

        {tab==='payment' && (
          <div className="glass rounded-2xl p-6 max-w-lg neon-border">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CreditCard className="w-6 h-6 text-indigo-400"/> Request Payment</h3>
            <div className="space-y-4">
              <input value={bankName} onChange={(e)=>setBankName(e.target.value)} placeholder="Bank Name"
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none"/>
              <input value={accountNo} onChange={(e)=>setAccountNo(e.target.value)} placeholder="Account Number"
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none"/>
              <input type="number" value={amount} onChange={(e)=>setAmount(e.target.value)} placeholder="Amount (LKR)"
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none"/>
              <button onClick={requestPayment} className="btn-primary w-full text-white">Send Payment Request</button>
            </div>
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm">⚠️ Bank details visible to Admin only. Customer sees "Payment Requested" only.</p>
            </div>
          </div>
        )}

        {tab==='store' && (
          <div className="glass rounded-2xl p-6 max-w-lg neon-border">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Store className="w-6 h-6 text-indigo-400"/> My Store</h3>
            <div className="space-y-4">
              <input value={storeName} onChange={(e)=>setStoreName(e.target.value)} placeholder="Store Name *"
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none"/>
              <textarea value={storeDesc} onChange={(e)=>setStoreDesc(e.target.value)} placeholder="Store Description" rows={4}
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none resize-none"/>
              <button onClick={setupStore} className="btn-primary w-full text-white">Save Store</button>
            </div>
          </div>
        )}

        {tab==='announcements' && (
          <div className="space-y-4 max-w-2xl">
            {announcements.map((a:any)=>(
              <div key={a.id} className="glass rounded-2xl p-5 border-l-4 border-indigo-500">
                <h4 className="font-bold text-white">{a.announcement?.title}</h4>
                <p className="text-gray-300 text-sm mt-2">{a.announcement?.message}</p>
                <p className="text-gray-600 text-xs mt-3">{new Date(a.announcement?.createdAt).toLocaleString()}</p>
              </div>
            ))}
            {announcements.length===0 && <div className="glass rounded-2xl p-12 text-center text-gray-500"><Bell className="w-12 h-12 mx-auto mb-4 text-gray-600"/><p>No announcements</p></div>}
          </div>
        )}
      </div>
    </div>
  );
}
