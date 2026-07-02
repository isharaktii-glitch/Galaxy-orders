'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Search, Package, Edit2, Eye, EyeOff } from 'lucide-react';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [editId, setEditId] = useState('');
  const [editProfit, setEditProfit] = useState('');

  useEffect(() => { fetchProducts(); }, [search]);

  const fetchProducts = async () => {
    const res = await fetch(`/api/products${search?`?search=${search}`:''}`);
    setProducts(await res.json());
  };

  const updateProfit = async (id: string) => {
    await fetch('/api/products', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,profitPercent:parseFloat(editProfit)}) });
    toast.success('Profit updated!');
    setEditId('');
    fetchProducts();
  };

  const toggleActive = async (id: string, isActive: boolean) => {
    await fetch('/api/products', { method:'PATCH', headers:{'Content-Type':'application/json'}, body:JSON.stringify({id,isActive:!isActive}) });
    fetchProducts();
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black gradient-text">Product Management</h1>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"/>
        <input value={search} onChange={(e)=>setSearch(e.target.value)} placeholder="Search products..."
          className="w-full bg-gray-900 border border-gray-700 rounded-xl pl-10 pr-4 py-3 text-white text-sm outline-none focus:border-indigo-500"/>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {products.map((p) => (
          <div key={p.id} className="glass rounded-2xl p-5 card-3d">
            {p.imageUrl && <img src={p.imageUrl} alt={p.title} className="w-full h-40 object-cover rounded-xl mb-4"/>}
            <h3 className="font-bold text-white text-sm">{p.title}</h3>
            <p className="text-gray-500 text-xs mt-1">by {p.seller?.username}</p>
            <div className="mt-3 space-y-1">
              <p className="text-gray-400 text-xs">Base: LKR {p.basePrice}</p>
              <p className="text-indigo-400 font-bold">Final: LKR {p.finalPrice?.toFixed(0)}</p>
              <p className="text-green-400 text-xs">Profit: {p.profitPercent}%</p>
            </div>
            <div className="flex gap-2 mt-3">
              {editId===p.id ? (
                <div className="flex gap-2 w-full">
                  <input type="number" value={editProfit} onChange={(e)=>setEditProfit(e.target.value)} placeholder="%" className="flex-1 bg-gray-900 border border-indigo-500 rounded-lg px-2 py-1 text-white text-sm outline-none"/>
                  <button onClick={()=>updateProfit(p.id)} className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-sm">Save</button>
                  <button onClick={()=>setEditId('')} className="px-3 py-1 bg-gray-700 text-white rounded-lg text-sm">✕</button>
                </div>
              ) : (
                <>
                  <button onClick={()=>{setEditId(p.id);setEditProfit(p.profitPercent.toString());}} className="flex items-center gap-1 px-3 py-1.5 bg-indigo-500/20 text-indigo-400 rounded-lg text-xs">
                    <Edit2 className="w-3 h-3"/> Edit %
                  </button>
                  <button onClick={()=>toggleActive(p.id,p.isActive)} className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs ${p.isActive?'bg-gray-700 text-gray-300':'bg-green-500/20 text-green-400'}`}>
                    {p.isActive?<EyeOff className="w-3 h-3"/>:<Eye className="w-3 h-3"/>} {p.isActive?'Hide':'Show'}
                  </button>
                </>
              )}
            </div>
          </div>
        ))}
        {products.length===0 && <div className="col-span-3 glass rounded-2xl p-12 text-center text-gray-500"><Package className="w-12 h-12 mx-auto mb-4 text-gray-600"/><p>No products</p></div>}
      </div>
    </div>
  );
}
