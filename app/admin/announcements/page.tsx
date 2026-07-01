'use client';
import { useState } from 'react';
import toast from 'react-hot-toast';
import { Megaphone, Send } from 'lucide-react';

export default function AdminAnnouncementsPage() {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!title || !message) { toast.error('Fill title and message'); return; }
    setLoading(true);
    const res = await fetch('/api/announcements', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, message, targetRole: targetRole || undefined }),
    });
    if (res.ok) { toast.success('Announcement sent!'); setTitle(''); setMessage(''); setTargetRole(''); }
    else toast.error('Failed');
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <h1 className="text-2xl font-black gradient-text">Send Announcement</h1>

      <div className="glass rounded-2xl p-6 neon-border">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-white">Broadcast Message</h3>
            <p className="text-gray-400 text-xs">Send to all or specific user groups</p>
          </div>
        </div>

        <div className="space-y-4">
          <select value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
            className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none">
            <option value="">All Users</option>
            <option value="SELLER">All Sellers</option>
            <option value="CUSTOMER">All Customers</option>
          </select>
          <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement Title"
            className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none" />
          <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Announcement Message..." rows={5}
            className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none resize-none" />
          <button onClick={send} disabled={loading} className="btn-primary text-white w-full flex items-center justify-center gap-2">
            <Send className="w-5 h-5" />
            {loading ? 'Sending...' : 'Send Announcement'}
          </button>
        </div>
      </div>
    </div>
  );
}
