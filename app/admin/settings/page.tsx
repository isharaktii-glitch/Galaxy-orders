'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Settings, Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({ globalProfitPercent:'10', sellerProfitPercent:'5', auctionProfitPercent:'5', siteName:'Galaxy Mart', siteTagline:'Tagla Market' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/settings').then(r=>r.json()).then(data => {
      setSettings(prev=>({...prev,...data}));
    });
  }, []);

  const saveAll = async () => {
    setSaving(true);
    await Promise.all(Object.entries(settings).map(([key,value]) =>
      fetch('/api/admin/settings', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({key,value}) })
    ));
    toast.success('All settings saved!');
    setSaving(false);
  };

  const fields = [
    { key:'globalProfitPercent', label:'Global Profit % (Admin Earnings)', hint:'Product Rs.1000 + 10% = Rs.1100 customer sees' },
    { key:'sellerProfitPercent', label:'Seller Commission %', hint:'What sellers earn from each sale' },
    { key:'auctionProfitPercent', label:'Auction Admin Profit %', hint:'Admin profit % from auctions' },
    { key:'siteName', label:'Site Name', hint:'Displayed in header' },
    { key:'siteTagline', label:'Site Tagline', hint:'Subtitle in header' },
  ];

  return (
    <div className="max-w-2xl space-y-6">
      <div className="flex items-center gap-3">
        <Settings className="w-8 h-8 text-indigo-400"/>
        <h1 className="text-2xl font-black gradient-text">Global Settings</h1>
      </div>
      <div className="glass rounded-2xl p-6 neon-border space-y-5">
        {fields.map(f=>(
          <div key={f.key}>
            <label className="text-sm font-semibold text-gray-300 block mb-1">{f.label}</label>
            <input value={(settings as any)[f.key]} onChange={(e)=>setSettings({...settings,[f.key]:e.target.value})}
              className="w-full bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white outline-none"/>
            <p className="text-xs text-gray-500 mt-1">{f.hint}</p>
          </div>
        ))}
        <button onClick={saveAll} disabled={saving} className="btn-primary text-white w-full flex items-center justify-center gap-2">
          <Save className="w-5 h-5"/> {saving?'Saving...':'Save All Settings'}
        </button>
      </div>
    </div>
  );
}
