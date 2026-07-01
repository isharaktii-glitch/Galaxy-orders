'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Package, ShoppingCart, CreditCard, TrendingUp, DollarSign, AlertCircle, CheckCircle } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Stats {
  totalUsers: number;
  totalSellers: number;
  totalCustomers: number;
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  pendingPayments: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [globalProfit, setGlobalProfit] = useState('10');
  const [sellerProfit, setSellerProfit] = useState('5');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchStats();
    fetchSettings();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await fetch('/api/admin/stats');
      const data = await res.json();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const fetchSettings = async () => {
    const res = await fetch('/api/admin/settings');
    const data = await res.json();
    if (data.globalProfitPercent) setGlobalProfit(data.globalProfitPercent);
    if (data.sellerProfitPercent) setSellerProfit(data.sellerProfitPercent);
  };

  const saveSetting = async (key: string, value: string) => {
    setSaving(true);
    await fetch('/api/admin/settings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ key, value }),
    });
    setSaving(false);
  };

  const statCards = [
    { label: 'Total Users', value: stats?.totalUsers || 0, icon: <Users className="w-6 h-6" />, color: 'from-indigo-500 to-purple-600', change: '+12%' },
    { label: 'Total Sellers', value: stats?.totalSellers || 0, icon: <TrendingUp className="w-6 h-6" />, color: 'from-emerald-500 to-teal-600', change: '+8%' },
    { label: 'Products', value: stats?.totalProducts || 0, icon: <Package className="w-6 h-6" />, color: 'from-blue-500 to-cyan-600', change: '+23%' },
    { label: 'Total Orders', value: stats?.totalOrders || 0, icon: <ShoppingCart className="w-6 h-6" />, color: 'from-orange-500 to-red-600', change: '+15%' },
    { label: 'Pending Orders', value: stats?.pendingOrders || 0, icon: <AlertCircle className="w-6 h-6" />, color: 'from-yellow-500 to-orange-600', change: '' },
    { label: 'Revenue (LKR)', value: `${(stats?.totalRevenue || 0).toFixed(0)}`, icon: <DollarSign className="w-6 h-6" />, color: 'from-pink-500 to-rose-600', change: '+31%' },
    { label: 'Pending Payments', value: stats?.pendingPayments || 0, icon: <CreditCard className="w-6 h-6" />, color: 'from-violet-500 to-purple-600', change: '' },
    { label: 'Customers', value: stats?.totalCustomers || 0, icon: <CheckCircle className="w-6 h-6" />, color: 'from-teal-500 to-green-600', change: '+7%' },
  ];

  const chartData = [
    { month: 'Jan', orders: 40, revenue: 24000 },
    { month: 'Feb', orders: 58, revenue: 35000 },
    { month: 'Mar', orders: 75, revenue: 48000 },
    { month: 'Apr', orders: 62, revenue: 39000 },
    { month: 'May', orders: 90, revenue: 58000 },
    { month: 'Jun', orders: 110, revenue: 72000 },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black gradient-text">Admin Dashboard</h1>
          <p className="text-gray-400 mt-1">Galaxy Mart Control Center</p>
        </div>
      </div>

      {/* Profit Settings */}
      <div className="glass rounded-2xl p-6 neon-border">
        <h2 className="text-xl font-bold text-white mb-4">🎯 Global Profit Settings</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Global Profit % (Applied to all products)</label>
            <div className="flex gap-3">
              <input type="number" value={globalProfit} onChange={(e) => setGlobalProfit(e.target.value)} min="0" max="100"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" />
              <button onClick={() => saveSetting('globalProfitPercent', globalProfit)} disabled={saving}
                className="btn-primary text-white px-6">
                {saving ? '...' : 'Save'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">Example: Product Rs.1000 + 10% = Rs.1100 to customer</p>
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-2 block">Seller Commission % (Seller's earnings)</label>
            <div className="flex gap-3">
              <input type="number" value={sellerProfit} onChange={(e) => setSellerProfit(e.target.value)} min="0" max="100"
                className="flex-1 bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white outline-none focus:border-indigo-500" />
              <button onClick={() => saveSetting('sellerProfitPercent', sellerProfit)} disabled={saving}
                className="btn-primary text-white px-6">
                {saving ? '...' : 'Save'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-5 card-3d">
            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center text-white mb-4`}>
              {card.icon}
            </div>
            <div className="text-2xl font-black text-white">{loading ? '...' : card.value}</div>
            <div className="text-gray-400 text-sm mt-1">{card.label}</div>
            {card.change && <div className="text-emerald-400 text-xs mt-1">{card.change}</div>}
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Orders Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #4f46e5', borderRadius: '8px' }} />
              <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="glass rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-4">Revenue (LKR)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
              <XAxis dataKey="month" stroke="#6b7280" />
              <YAxis stroke="#6b7280" />
              <Tooltip contentStyle={{ background: '#111827', border: '1px solid #4f46e5', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="revenue" stroke="#8b5cf6" strokeWidth={2} dot={{ fill: '#8b5cf6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
