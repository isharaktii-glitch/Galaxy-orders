'use client';
import { useEffect, useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { ShoppingBag, Package, CreditCard, Gavel, Bell, Plus, Check, Upload, LogOut } from 'lucide-react';

type Tab = 'shop'|'mylistings'|'orders'|'payment'|'auctions'|'announcements';

export default function CustomerDashboard() {
  const { data:session } = useSession();
  const [tab, setTab] = useState<Tab>('shop');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [auctions, setAuctions] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [receiptUrl, setReceiptUrl] = useState('');
  const [bidAmount, setBidAmount] = useState<Record<string,string>>({});
  const [newListing, setNewListing] = useState({ title:'', description:'', basePrice:'', stock:'', imageUrl:'' });

  useEffect(() => { if (session?.user) fetchAll(); }, [session]);

  const fetchAll = async () => {
    const [pRes,oRes,aRes,annRes] = await Promise.all([
      fetch('/api/products'), fetch('/api/orders'), fetch('/api/auctions'), fetch('/api/announcements'),
    ]);
    if (pRes.ok) setProducts(await pRes.json());
    if (oRes.ok) setOrders(await oRes.json());
    if (aRes.ok) setAuctions(await aRes.json());
    if (annRes.ok) setAnnouncements(await annRes.json());
  };

  const placeOrder = async (product: any) => {
    const res = await fetch('/api/orders', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({sellerId:product.sellerId,items:[{productId:product.id,quantity:1}]}) });
    if (res.ok) { toast.success('Order placed!'); fetchAll(); }
    else toast.error('Failed');
  };

  const addListing = async () => {
    if (!newListing.title||!newListing.basePrice) { toast.error('Fill required fields'); return; }
    const res = await fetch('/api/products', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...newListing,basePrice:parseFloat(newListing.basePrice),stock:parseInt(newListing.stock)||0}) });
    if (res.ok) { toast.success('Listed!'); setNewListing({title:'',description:'',basePrice:'',stock:'',imageUrl:''}); fetchAll(); }
  };

  const submitPayment = async () => {
    if (!selectedOrder||!receiptUrl) { toast.error('Upload receipt URL'); return; }
    const res = await fetch('/api/payments', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({orderId:selectedOrder.id,receiptUrl}) });
    if (res.ok) { toast.success('Payment submitted!'); setSelectedOrder(null); setReceiptUrl(''); fetchAll(); }
  };

  const placeBid = async (auctionId: string) => {
    const amt = parseFloat(bidAmount[auctionId]);
    if (!amt) { toast.error('Enter bid amount'); return; }
    const res = await fetch('/api/auctions/bid', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({auctionId,amount:amt}) });
    const data = await res.json();
    if (res.ok) { toast.success('Bid placed!'); setBidAmount({...bidAmount,[auctionId]:''}); fetchAll(); }
    else toast.error(data.error||'Bid failed');
  };

  const statusColors: Record<string,string> = {
    PENDING:'text-yellow-400 bg-yellow-400/10', APPROVED:'text-green-400 bg-green-400/10',
    REJECTED:'text-red-400 bg-red-400/10', DONE:'text-blue-400 bg-blue-400/10',
  };

  const tabs = [
    {id:'shop' as Tab,label:'Shop',icon:ShoppingBag},
    {id:'mylistings' as Tab,label:'My Listings',icon:Package},
    {id:'orders' as Tab,label:'My Orders',icon:ShoppingBag},
    {id:'payment' as Tab,label:'Payment',icon:CreditCard},
    {id:'auctions' as Tab,label:'Auctions',icon:Gavel},
    {id:'announcements' as Tab,label:'Notices',icon:Bell},
  ];

  const userId = (session?.user as any)?.id;

  return (
    <div className="min-h-screen hero-bg grid-pattern">
      <div className="max-w-7xl mx-auto p-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-black gradient-text">Customer Dashboard</h1>
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

        {tab==='shop' && (
          <div>
            <h2 className="text-xl font-bold text-white mb-6">Available Products</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.filter((p:any)=>p.sellerId!==userId&&p.isActive).map((p:any)=>(
                <motion.div key={p.id} initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="glass rounded-2xl p-5 card-3d">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-48 object-cover rounded-xl mb-4"/>}
                  <h3 className="font-bold text-white">{p.title}</h3>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between mt-4">
                    <div>
                      <p className="text-indigo-400 font-bold text-lg">LKR {p.finalPrice?.toFixed(0)}</p>
                      <p className="text-gray-500 text-xs">by {p.seller?.username}</p>
                    </div>
                    <button onClick={()=>placeOrder(p)} className="btn-primary text-white text-sm px-4 py-2">Order Now</button>
                  </div>
                </motion.div>
              ))}
              {products.filter((p:any)=>p.sellerId!==userId).length===0 && <div className="col-span-3 glass rounded-2xl p-12 text-center text-gray-500">No products available</div>}
            </div>
          </div>
        )}

        {tab==='mylistings' && (
          <div className="space-y-6">
            <div className="glass rounded-2xl p-6 neon-border">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-400"/> List Your Product/Service</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[{key:'title',ph:'Title *'},{key:'basePrice',ph:'Your Price (LKR) *'},{key:'stock',ph:'Quantity'},{key:'imageUrl',ph:'Image URL'}].map(f=>(
                  <input key={f.key} placeholder={f.ph} value={(newListing as any)[f.key]} onChange={(e)=>setNewListing({...newListing,[f.key]:e.target.value})}
                    className="bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none"/>
                ))}
                <textarea placeholder="Description" value={newListing.description} onChange={(e)=>setNewListing({...newListing,description:e.target.value})}
                  className="md:col-span-2 bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none" rows={3}/>
              </div>
              <p className="text-xs text-gray-500 mt-2">Admin's profit % will be added to your price automatically.</p>
              <button onClick={addListing} className="btn-primary text-white mt-4">List Product</button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.filter((p:any)=>p.sellerId===userId).map((p:any)=>(
                <div key={p.id} className="glass rounded-2xl p-5 card-3d">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover rounded-xl mb-4"/>}
                  <h4 className="font-bold text-white">{p.title}</h4>
                  <p className="text-gray-500 text-xs">Your price: LKR {p.basePrice}</p>
                  <p className="text-indigo-400 font-bold">Listed at: LKR {p.finalPrice?.toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab==='orders' && (
          <div className="space-y-4">
            {orders.map((o:any)=>(
              <div key={o.id} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white">Order #{o.id.slice(-8)}</p>
                    <p className="text-gray-400 text-sm">Seller: {o.seller?.username}</p>
                    <p className="text-indigo-400 font-bold">LKR {o.totalAmount}</p>
                    {o.rejectReason && <p className="text-red-400 text-xs mt-1">Rejected: {o.rejectReason}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[o.status]}`}>{o.status}</span>
                </div>
                {o.status==='APPROVED' && !o.payment && (
                  <button onClick={()=>{setSelectedOrder(o);setTab('payment');}} className="mt-3 flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">
                    <CreditCard className="w-4 h-4"/> Pay Now
                  </button>
                )}
                {o.payment && (
                  <div className="mt-3 flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-400"/>
                    <span className="text-green-400 text-sm font-medium">Payment {o.payment.status}</span>
                  </div>
                )}
              </div>
            ))}
            {orders.length===0 && <div className="glass rounded-2xl p-12 text-center text-gray-500">No orders yet</div>}
          </div>
        )}

        {tab==='payment' && (
          <div className="max-w-lg space-y-6">
            {selectedOrder ? (
              <div className="glass rounded-2xl p-6 neon-border">
                <h3 className="text-xl font-bold text-white mb-4">Complete Payment</h3>
                <div className="p-4 bg-indigo-500/10 border border-indigo-500/30 rounded-xl mb-4">
                  <p className="text-indigo-300 font-medium">Order #{selectedOrder.id.slice(-8)}</p>
                  <p className="text-white font-black text-2xl mt-1">LKR {selectedOrder.totalAmount}</p>
                </div>
                <div className="p-4 bg-gray-900 rounded-xl mb-4">
                  <p className="text-gray-400 text-sm">Upload your payment receipt image to imgbb.com and paste URL below:</p>
                </div>
                <input value={receiptUrl} onChange={(e)=>setReceiptUrl(e.target.value)} placeholder="Receipt Image URL (from imgbb.com)"
                  className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none mb-4"/>
                <button onClick={submitPayment} className="btn-primary w-full text-white flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5"/> Submit Payment
                </button>
                <button onClick={()=>{setSelectedOrder(null);setTab('orders');}} className="w-full mt-2 text-gray-400 hover:text-white text-sm transition-colors">
                  ← Back to Orders
                </button>
              </div>
            ) : (
              <div className="glass rounded-2xl p-12 text-center">
                <CreditCard className="w-16 h-16 mx-auto mb-4 text-gray-600"/>
                <p className="text-gray-400">Select an approved order to pay</p>
                <button onClick={()=>setTab('orders')} className="btn-primary text-white mt-4">View Orders</button>
              </div>
            )}
          </div>
        )}

        {tab==='auctions' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {auctions.filter((a:any)=>a.status==='ACTIVE').map((a:any)=>(
              <div key={a.id} className="glass rounded-2xl p-6 card-3d">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-bold text-white text-lg">{a.title}</h3>
                  <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded-lg text-xs font-bold">LIVE</span>
                </div>
                <p className="text-gray-400 text-sm mb-4">{a.description}</p>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-gray-500 text-xs">Current Bid</p>
                    <p className="text-indigo-400 font-black text-2xl">LKR {a.currentBid||a.startPrice}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-gray-500 text-xs">Ends</p>
                    <p className="text-white text-sm">{new Date(a.endTime).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <input type="number" placeholder={`Min: ${(a.currentBid||a.startPrice)+a.minBidStep}`}
                    value={bidAmount[a.id]||''} onChange={(e)=>setBidAmount({...bidAmount,[a.id]:e.target.value})}
                    className="flex-1 bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-2 text-white text-sm outline-none"/>
                  <button onClick={()=>placeBid(a.id)} className="btn-primary text-white px-4">Bid</button>
                </div>
                <p className="text-xs text-gray-500 mt-2">{a._count?.bids||0} bids placed</p>
              </div>
            ))}
            {auctions.filter((a:any)=>a.status==='ACTIVE').length===0 && (
              <div className="col-span-2 glass rounded-2xl p-12 text-center">
                <Gavel className="w-16 h-16 mx-auto mb-4 text-gray-600"/>
                <p className="text-gray-400">No active auctions</p>
              </div>
            )}
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
