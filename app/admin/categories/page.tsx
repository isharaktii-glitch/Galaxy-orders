'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Eye, EyeOff, Tag } from 'lucide-react';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [newCat, setNewCat] = useState({ name: '', nameSi: '', nameTa: '', icon: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => { fetchCats(); }, []);

  const fetchCats = async () => {
    const res = await fetch('/api/categories');
    setCategories(await res.json());
  };

  const addCategory = async () => {
    if (!newCat.name) { toast.error('Enter category name'); return; }
    setLoading(true);
    const res = await fetch('/api/categories', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCat),
    });
    if (res.ok) { toast.success('Category added!'); setNewCat({ name: '', nameSi: '', nameTa: '', icon: '' }); fetchCats(); }
    else toast.error('Failed');
    setLoading(false);
  };

  const toggleVisibility = async (id: string, isVisible: boolean) => {
    const res = await fetch('/api/categories', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, isVisible: !isVisible }),
    });
    if (res.ok) { toast.success('Updated!'); fetchCats(); }
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black gradient-text">Category Management</h1>

      {/* Add Category */}
      <div className="glass rounded-2xl p-6 neon-border">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-400" /> Add Category</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { key: 'name', placeholder: 'Category Name (English) *' },
            { key: 'nameSi', placeholder: 'Category Name (Sinhala)' },
            { key: 'nameTa', placeholder: 'Category Name (Tamil)' },
            { key: 'icon', placeholder: 'Icon (emoji or URL)' },
          ].map((f) => (
            <input key={f.key} placeholder={f.placeholder}
              value={(newCat as any)[f.key]}
              onChange={(e) => setNewCat({ ...newCat, [f.key]: e.target.value })}
              className="bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none" />
          ))}
        </div>
        <button onClick={addCategory} disabled={loading} className="btn-primary text-white mt-4">
          {loading ? 'Adding...' : 'Add Category'}
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat: any) => (
          <div key={cat.id} className={`glass rounded-2xl p-5 card-3d border-2 transition-all ${cat.isVisible ? 'border-indigo-500/30' : 'border-gray-700 opacity-60'}`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{cat.icon || '📦'}</span>
                <div>
                  <h3 className="font-bold text-white">{cat.name}</h3>
                  {cat.nameSi && <p className="text-gray-400 text-xs">{cat.nameSi}</p>}
                  {cat.nameTa && <p className="text-gray-400 text-xs">{cat.nameTa}</p>}
                </div>
              </div>
              <button onClick={() => toggleVisibility(cat.id, cat.isVisible)}
                className={`p-2 rounded-xl transition-colors ${cat.isVisible ? 'bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30' : 'bg-gray-700 text-gray-400 hover:bg-gray-600'}`}
                title={cat.isVisible ? 'Hide' : 'Show'}>
                {cat.isVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs">{cat._count?.products || 0} products</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${cat.isVisible ? 'bg-green-500/20 text-green-400' : 'bg-gray-700 text-gray-500'}`}>
                {cat.isVisible ? 'Visible' : 'Hidden'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
