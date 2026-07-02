'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, Check, X } from 'lucide-react';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    const res = await fetch('/api/orders');
    setOrders(await res.json());
  };

  const updateStatus = async (id: string, status: string, rejectReason?: string) => {
    await fetch('/api/orders', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,status,rejectReason}) });
    toast.success('Order updated!');
    fetchOrders();
  };

  const statusColors: Record<string,string> = {
    PENDING:'text-yellow-400 bg-yellow-400/10',
    APPROVED:'text-green-400 bg-green-400/10',
    REJECTED:'text-red-400 bg-red-400/10',
    DONE:'text-blue-400 bg-blue-400/10',
    CANCELLED:'text-gray-400 bg-gray-400/10',
  };

  const filtered = orders.filter(o =>
    !search || o.customer?.username?.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black gradient-text">Order Management</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search by customer or order ID..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-indigo-500"/>
      </div>
      <div className="space-y-4">
        {filtered.map((order) => (
          <motion.div key={order.id} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="glass rounded-2xl p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="font-bold text-white">Order #{order.id.slice(-8)}</p>
                <p className="text-gray-400 text-sm">Customer: <span className="text-indigo-300">{order.customer?.username}</span></p>
                <p className="text-gray-400 text-sm">Seller: <span className="text-indigo-300">{order.seller?.username}</span></p>
                <p className="text-white font-bold text-lg mt-1">LKR {order.totalAmount}</p>
                {order.rejectReason && <p className="text-red-400 text-xs mt-1">Reason: {order.rejectReason}</p>}
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status]}`}>{order.status}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {order.status==='PENDING' && (
                <>
                  <button onClick={()=>updateStatus(order.id,'APPROVED')} className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm">
                    <Check className="w-4 h-4"/> Approve
                  </button>
                  <button onClick={()=>{const r=prompt('Reject reason:');updateStatus(order.id,'REJECTED',r||'');}} className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm">
                    <X className="w-4 h-4"/> Reject
                  </button>
                </>
              )}
              {order.status==='APPROVED' && (
                <button onClick={()=>updateStatus(order.id,'DONE')} className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm">
                  <Check className="w-4 h-4"/> Mark Done
                </button>
              )}
            </div>
          </motion.div>
        ))}
        {filtered.length===0 && <div className="glass rounded-2xl p-12 text-center text-gray-500">No orders found</div>}
      </div>
    </div>
  );
}
