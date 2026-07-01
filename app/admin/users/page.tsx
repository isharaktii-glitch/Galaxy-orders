'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Search, UserCheck, UserX, Shield } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchUsers(); }, [search, roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set('search', search);
    if (roleFilter) params.set('role', roleFilter);
    const res = await fetch(`/api/admin/users?${params}`);
    setUsers(await res.json());
    setLoading(false);
  };

  const toggleUser = async (id: string, isActive: boolean) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isActive: !isActive }),
    });
    if (res.ok) { toast.success('Updated!'); fetchUsers(); }
    else toast.error('Failed');
  };

  const verifyKyc = async (id: string) => {
    const res = await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, kycVerified: true }),
    });
    if (res.ok) { toast.success('KYC Verified!'); fetchUsers(); }
  };

  const roleColors: Record<string, string> = {
    ADMIN: 'bg-red-500/20 text-red-400',
    SELLER: 'bg-indigo-500/20 text-indigo-400',
    CUSTOMER: 'bg-green-500/20 text-green-400',
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black gradient-text">User Management</h1>
        <span className="glass px-4 py-2 rounded-xl text-sm text-gray-400">{users.length} users</span>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search users..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-indigo-500" />
        </div>
        <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}
          className="bg-gray-900 border border-gray-700 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500">
          <option value="">All Roles</option>
          <option value="ADMIN">Admin</option>
          <option value="SELLER">Seller</option>
          <option value="CUSTOMER">Customer</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="glass rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-800">
                {['User', 'Role', 'Contact', 'Status', 'KYC', 'Stats', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {users.map((user) => (
                <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="hover:bg-gray-900/50 transition-colors">
                  <td className="px-4 py-4">
                    <div>
                      <p className="font-semibold text-white text-sm">{user.firstName} {user.lastName}</p>
                      <p className="text-gray-500 text-xs">@{user.username}</p>
                      <p className="text-gray-600 text-xs">{user.email}</p>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-lg text-xs font-bold ${roleColors[user.role]}`}>{user.role}</span>
                  </td>
                  <td className="px-4 py-4">
                    <p className="text-gray-400 text-xs">{user.phone}</p>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {user.isActive ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${user.kycVerified ? 'bg-blue-500/20 text-blue-400' : 'bg-gray-700 text-gray-400'}`}>
                      {user.kycVerified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-xs text-gray-400">
                    <p>Products: {user._count?.products || 0}</p>
                    <p>Orders: {(user._count?.ordersAsSeller || 0) + (user._count?.ordersAsCustomer || 0)}</p>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => toggleUser(user.id, user.isActive)}
                        className={`p-2 rounded-lg transition-colors ${user.isActive ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30' : 'bg-green-500/20 text-green-400 hover:bg-green-500/30'}`}
                        title={user.isActive ? 'Disable' : 'Enable'}>
                        {user.isActive ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                      </button>
                      {!user.kycVerified && (
                        <button onClick={() => verifyKyc(user.id)} className="p-2 rounded-lg bg-blue-500/20 text-blue-400 hover:bg-blue-500/30 transition-colors" title="Verify KYC">
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {loading && <div className="p-12 text-center text-gray-500">Loading...</div>}
          {!loading && users.length === 0 && <div className="p-12 text-center text-gray-500">No users found</div>}
        </div>
      </div>
    </div>
  );
}
