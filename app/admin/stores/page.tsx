'use client';
import { useEffect, useState } from 'react';
import { Building2 } from 'lucide-react';

export default function AdminStoresPage() {
  const [stores, setStores] = useState<any[]>([]);

  useEffect(() => {
    fetch('/api/stores').then(r=>r.json()).then(setStores).catch(()=>setStores([]));
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black gradient-text">Store Management</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stores.map((store) => (
          <div key={store.id} className="glass rounded-2xl p-5 card-3d">
            {store.logoUrl && <img src={store.logoUrl} alt={store.name} className="w-16 h-16 rounded-xl mb-3 object-cover"/>}
            <h3 className="font-bold text-white">{store.name}</h3>
            <p className="text-gray-400 text-sm">{store.user?.username}</p>
            <p className="text-gray-500 text-xs mt-2">{store.description}</p>
            <span className={`mt-3 inline-block px-2 py-1 rounded-full text-xs font-bold ${store.isActive?'bg-green-500/20 text-green-400':'bg-red-500/20 text-red-400'}`}>
              {store.isActive?'Active':'Inactive'}
            </span>
          </div>
        ))}
        {stores.length===0 && (
          <div className="col-span-3 glass rounded-2xl p-12 text-center">
            <Building2 className="w-16 h-16 mx-auto mb-4 text-gray-600"/>
            <p className="text-gray-500">No stores yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
