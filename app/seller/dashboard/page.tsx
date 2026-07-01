'use client';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Package, ShoppingCart, DollarSign, Plus, Eye, Check, X,
  CreditCard, Store, Bell, TrendingUp
} from 'lucide-react';

type Tab = 'overview' | 'products' | 'orders' | 'payment' | 'store' | 'announcements';

export default function SellerDashboard() {
  const { data: session } = useSession();
  const [tab, setTab] = useState<Tab>('overview');
  const [products, setProducts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [announcements, setAnnouncements] = useState<any[]>([]);
  const [earnings, setEarnings] = useState(0);
  const [loading, setLoading] = useState(false);

  // Payment request form
  const [bankName, setBankName] = useState('');
  const [accountNo, setAccountNo] = useState('');
  const [amount, setAmount] = useState('');

  // Add product form
  const [newProduct, setNewProduct] = useState({ title: '', description: '', basePrice: '', stock: '', categoryId: '', imageUrl: '' });

  useEffect(() => {
    fetchAll();
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const [pRes, oRes, aRes] = await Promise.all([
        fetch('/api/products?sellerId=' + session?.user?.id),
        fetch('/api/orders'),
        fetch('/api/announcements'),
      ]);
      setProducts(await pRes.json());
      setOrders(await oRes.json());
      setAnnouncements(await aRes.json());
      // Calculate earnings
      const completedOrders = (await oRes.json()).filter((o: any) => o.status === 'DONE');
      setEarnings(completedOrders.reduce((sum: number, o: any) => sum + o.totalAmount, 0));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const updateOrderStatus = async (id: string, status: string, rejectReason?: string) => {
    const res = await fetch('/api/orders', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status, rejectReason }),
    });
    if (res.ok) { toast.success('Order updated'); fetchAll(); }
    else toast.error('Failed');
  };

  const addProduct = async () => {
    if (!newProduct.title || !newProduct.basePrice) { toast.error('Fill required fields'); return; }
    const res = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...newProduct, basePrice: parseFloat(newProduct.basePrice), stock: parseInt(newProduct.stock) || 0 }),
    });
    if (res.ok) { toast.success('Product added!'); setNewProduct({ title: '', description: '', basePrice: '', stock: '', categoryId: '', imageUrl: '' }); fetchAll(); }
    else toast.error('Failed');
  };

  const requestPayment = async () => {
    if (!bankName || !accountNo || !amount) { toast.error('Fill all fields'); return; }
    const res = await fetch('/api/payment-requests', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bankName, accountNo, amount: parseFloat(amount) }),
    });
    if (res.ok) { toast.success('Payment request sent!'); setBankName(''); setAccountNo(''); setAmount(''); }
    else toast.error('Failed');
  };

  const tabs: { id: Tab; label: string; icon: any }[] = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingCart },
    { id: 'payment', label: 'Payments', icon: CreditCard },
    { id: 'store', label: 'My Store', icon: Store },
    { id: 'announcements', label: 'Announcements', icon: Bell },
  ];

  const statusColors: Record<string, string> = {
    PENDING: 'text-yellow-400 bg-yellow-400/10',
    APPROVED: 'text-green-400 bg-green-400/10',
    REJECTED: 'text-red-400 bg-red-400/10',
    DONE: 'text-blue-400 bg-blue-400/10',
    CANCELLED: 'text-gray-400 bg-gray-400/10',
  };

  return (
    <div className="min-h-screen hero-bg grid-pattern">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black gradient-text">Seller Dashboard</h1>
          <p className="text-gray-400">Welcome back, {session?.user?.name}</p>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-2 mb-8 glass rounded-2xl p-2">
          {tabs.map((t) => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all text-sm font-medium ${tab === t.id ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
              <t.icon className="w-4 h-4" />
              {t.label}
            </button>
          ))}
        </div>

        {/* Overview Tab */}
        {tab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'My Products', value: products.length, icon: <Package />, color: 'from-indigo-500 to-purple-600' },
                { label: 'Total Orders', value: orders.length, icon: <ShoppingCart />, color: 'from-blue-500 to-cyan-600' },
                { label: 'Pending', value: orders.filter((o: any) => o.status === 'PENDING').length, icon: <Eye />, color: 'from-yellow-500 to-orange-600' },
                { label: 'Earnings (LKR)', value: earnings.toFixed(0), icon: <DollarSign />, color: 'from-green-500 to-teal-600' },
              ].map((s, i) => (
                <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
                  className="glass rounded-2xl p-5 card-3d">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-3 [&>svg]:w-5 [&>svg]:h-5`}>
                    {s.icon}
                  </div>
                  <div className="text-2xl font-black text-white">{s.value}</div>
                  <div className="text-gray-400 text-sm">{s.label}</div>
                </motion.div>
              ))}
            </div>

            {/* Recent Orders */}
            <div className="glass rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Recent Orders</h3>
              <div className="space-y-3">
                {orders.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-900/50 rounded-xl">
                    <div>
                      <p className="text-white font-medium text-sm">Order #{order.id.slice(-6)}</p>
                      <p className="text-gray-400 text-xs">{order.customer?.username}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-white font-bold">LKR {order.totalAmount}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-semibold ${statusColors[order.status]}`}>{order.status}</span>
                    </div>
                  </div>
                ))}
                {orders.length === 0 && <p className="text-gray-500 text-center py-4">No orders yet</p>}
              </div>
            </div>
          </div>
        )}

        {/* Products Tab */}
        {tab === 'products' && (
          <div className="space-y-6">
            {/* Add Product Form */}
            <div className="glass rounded-2xl p-6 neon-border">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-400" /> Add New Product</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { key: 'title', placeholder: 'Product Title *', type: 'text' },
                  { key: 'basePrice', placeholder: 'Base Price (LKR) *', type: 'number' },
                  { key: 'stock', placeholder: 'Stock Quantity', type: 'number' },
                  { key: 'imageUrl', placeholder: 'Image URL', type: 'text' },
                ].map((f) => (
                  <input key={f.key} type={f.type} placeholder={f.placeholder}
                    value={(newProduct as any)[f.key]}
                    onChange={(e) => setNewProduct({ ...newProduct, [f.key]: e.target.value })}
                    className="bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors" />
                ))}
                <textarea placeholder="Description" value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="md:col-span-2 bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none transition-colors resize-none" rows={3} />
              </div>
              <button onClick={addProduct} className="btn-primary text-white mt-4 flex items-center gap-2">
                <Plus className="w-5 h-5" /> Add Product
              </button>
            </div>

            {/* Products List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((p: any) => (
                <div key={p.id} className="glass rounded-2xl p-5 card-3d">
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover rounded-xl mb-4" />}
                  <h4 className="font-bold text-white">{p.title}</h4>
                  <p className="text-gray-400 text-sm mt-1 line-clamp-2">{p.description}</p>
                  <div className="flex items-center justify-between mt-3">
                    <div>
                      <p className="text-gray-500 text-xs">Base: LKR {p.basePrice}</p>
                      <p className="text-indigo-400 font-bold">Final: LKR {p.finalPrice?.toFixed(0)}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-lg text-xs ${p.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {p.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </div>
              ))}
              {products.length === 0 && (
                <div className="col-span-3 glass rounded-2xl p-12 text-center text-gray-500">
                  <Package className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                  <p>No products yet. Add your first product!</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Orders Tab */}
        {tab === 'orders' && (
          <div className="space-y-4">
            {orders.map((order: any) => (
              <div key={order.id} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <p className="font-bold text-white">Order #{order.id.slice(-8)}</p>
                    <p className="text-gray-400 text-sm">Customer: {order.customer?.username}</p>
                    <p className="text-gray-400 text-sm">Amount: <span className="text-white font-bold">LKR {order.totalAmount}</span></p>
                    {order.rejectReason && <p className="text-red-400 text-xs mt-1">Reason: {order.rejectReason}</p>}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusColors[order.status]}`}>{order.status}</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {order.status === 'PENDING' && (
                    <>
                      <button onClick={() => updateOrderStatus(order.id, 'APPROVED')}
                        className="flex items-center gap-1 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-xl text-sm transition-colors">
                        <Check className="w-4 h-4" /> Approve
                      </button>
                      <button onClick={() => {
                        const reason = prompt('Reject reason (optional):') || '';
                        updateOrderStatus(order.id, 'REJECTED', reason);
                      }} className="flex items-center gap-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-sm transition-colors">
                        <X className="w-4 h-4" /> Reject
                      </button>
                    </>
                  )}
                  {order.status === 'APPROVED' && (
                    <button onClick={() => updateOrderStatus(order.id, 'DONE')}
                      className="flex items-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm transition-colors">
                      <Check className="w-4 h-4" /> Mark Done
                    </button>
                  )}
                </div>
              </div>
            ))}
            {orders.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center text-gray-500">
                <ShoppingCart className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No orders yet</p>
              </div>
            )}
          </div>
        )}

        {/* Payment Tab */}
        {tab === 'payment' && (
          <div className="glass rounded-2xl p-6 max-w-lg neon-border">
            <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><CreditCard className="w-6 h-6 text-indigo-400" /> Request Payment</h3>
            <div className="space-y-4">
              <input value={bankName} onChange={(e) => setBankName(e.target.value)} placeholder="Bank Name"
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none transition-colors" />
              <input value={accountNo} onChange={(e) => setAccountNo(e.target.value)} placeholder="Account Number"
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none transition-colors" />
              <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="Amount (LKR)"
                className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none transition-colors" />
              <button onClick={requestPayment} className="btn-primary w-full text-white">Send Payment Request</button>
            </div>
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
              <p className="text-yellow-400 text-sm">⚠️ Your bank details will only be visible to Admin. Customer will see "Payment Requested" only.</p>
            </div>
          </div>
        )}

        {/* Store Tab */}
        {tab === 'store' && (
          <div className="glass rounded-2xl p-8 text-center">
            <Store className="w-16 h-16 mx-auto mb-4 text-indigo-400" />
            <h3 className="text-2xl font-bold text-white mb-2">My Store</h3>
            <p className="text-gray-400 mb-6">Set up your personal store within Galaxy Mart</p>
            <button className="btn-primary text-white">Setup Store</button>
          </div>
        )}

        {/* Announcements Tab */}
        {tab === 'announcements' && (
          <div className="space-y-4">
            {announcements.map((a: any) => (
              <div key={a.id} className="glass rounded-2xl p-5">
                <h4 className="font-bold text-white">{a.announcement?.title}</h4>
                <p className="text-gray-400 text-sm mt-1">{a.announcement?.message}</p>
                <p className="text-gray-600 text-xs mt-2">{new Date(a.announcement?.createdAt).toLocaleDateString()}</p>
              </div>
            ))}
            {announcements.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center text-gray-500">
                <Bell className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No announcements</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
