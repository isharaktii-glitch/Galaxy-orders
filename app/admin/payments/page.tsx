'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { CreditCard, Search, Check, Clock } from 'lucide-react';

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [paymentReqs, setPaymentReqs] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [tab, setTab] = useState<'customer' | 'seller'>('customer');

  useEffect(() => { fetchAll(); }, []);

  const fetchAll = async () => {
    const [pRes, rRes] = await Promise.all([
      fetch('/api/payments'),
      fetch('/api/payment-requests'),
    ]);
    setPayments(await pRes.json());
    setPaymentReqs(await rRes.json());
  };

  const verifyPayment = async (id: string) => {
    const res = await fetch('/api/payments/verify', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, status: 'VERIFIED' }),
    });
    if (res.ok) { toast.success('Payment verified!'); fetchAll(); }
  };

  const filtered = payments.filter((p: any) =>
    !search || p.order?.customer?.username?.includes(search) || p.order?.id?.includes(search)
  );

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black gradient-text">Payment Management</h1>

      <div className="flex gap-2 glass rounded-xl p-1 w-fit">
        <button onClick={() => setTab('customer')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'customer' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
          Customer Payments
        </button>
        <button onClick={() => setTab('seller')} className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === 'seller' ? 'bg-indigo-600 text-white' : 'text-gray-400'}`}>
          Seller Requests
        </button>
      </div>

      {tab === 'customer' && (
        <>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by username or order ID..."
              className="w-full max-w-md bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-indigo-500" />
          </div>
          <div className="space-y-4">
            {filtered.map((payment: any) => (
              <motion.div key={payment.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold text-white">Order #{payment.order?.id?.slice(-8)}</p>
                    <p className="text-gray-400 text-sm">Customer: {payment.order?.customer?.username}</p>
                    <p className="text-indigo-400 font-bold text-lg">LKR {payment.amount}</p>
                    {payment.receiptUrl && (
                      <a href={payment.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 text-sm underline">
                        View Receipt →
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${payment.status === 'VERIFIED' ? 'bg-green-500/20 text-green-400' : payment.status === 'PAID' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-400'}`}>
                      {payment.status}
                    </span>
                    {payment.status === 'PAID' && (
                      <button onClick={() => verifyPayment(payment.id)} className="flex items-center gap-1 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs transition-colors">
                        <Check className="w-3 h-3" /> Verify
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            {filtered.length === 0 && (
              <div className="glass rounded-2xl p-12 text-center text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-4 text-gray-600" />
                <p>No payments found</p>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'seller' && (
        <div className="space-y-4">
          {paymentReqs.map((req: any) => (
            <motion.div key={req.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-bold text-white">Seller: {req.seller?.username}</p>
                  <p className="text-gray-400 text-sm">Email: {req.seller?.email}</p>
                  <div className="mt-2 p-3 bg-gray-900 rounded-xl">
                    <p className="text-sm text-gray-300">Bank: <span className="text-white font-medium">{req.bankName}</span></p>
                    <p className="text-sm text-gray-300">Account: <span className="text-white font-medium">{req.accountNo}</span></p>
                    <p className="text-indigo-400 font-bold text-lg">LKR {req.amount}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${req.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-green-500/20 text-green-400'}`}>
                    {req.status}
                  </span>
                  <p className="text-gray-500 text-xs">{new Date(req.createdAt).toLocaleDateString()}</p>
                </div>
              </div>
            </motion.div>
          ))}
          {paymentReqs.length === 0 && (
            <div className="glass rounded-2xl p-12 text-center text-gray-500">
              <Clock className="w-12 h-12 mx-auto mb-4 text-gray-600" />
              <p>No payment requests</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
