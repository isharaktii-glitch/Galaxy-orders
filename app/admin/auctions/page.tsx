'use client';
import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { Plus, Clock } from 'lucide-react';

export default function AdminAuctionsPage() {
  const [auctions, setAuctions] = useState<any[]>([]);
  const [form, setForm] = useState({ title:'', description:'', startPrice:'', minBidStep:'10', adminProfit:'5', startTime:'', endTime:'' });

  useEffect(() => { fetchAuctions(); }, []);

  const fetchAuctions = async () => {
    const res = await fetch('/api/auctions');
    setAuctions(await res.json());
  };

  const createAuction = async () => {
    if (!form.title||!form.startPrice||!form.endTime) { toast.error('Fill required fields'); return; }
    const res = await fetch('/api/auctions', { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({...form,startPrice:parseFloat(form.startPrice),minBidStep:parseFloat(form.minBidStep),adminProfit:parseFloat(form.adminProfit),startTime:form.startTime||new Date().toISOString()}) });
    if (res.ok) { toast.success('Auction created!'); setForm({title:'',description:'',startPrice:'',minBidStep:'10',adminProfit:'5',startTime:'',endTime:''}); fetchAuctions(); }
    else toast.error('Failed');
  };

  const statusColors: Record<string,string> = { ACTIVE:'bg-green-500/20 text-green-400', ENDED:'bg-gray-700 text-gray-400', CANCELLED:'bg-red-500/20 text-red-400' };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-black gradient-text">Auction Management</h1>
      <div className="glass rounded-2xl p-6 neon-border">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Plus className="w-5 h-5 text-indigo-400"/> Create Auction</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[{key:'title',ph:'Title *',type:'text'},{key:'startPrice',ph:'Start Price (LKR) *',type:'number'},{key:'minBidStep',ph:'Min Bid Step',type:'number'},{key:'adminProfit',ph:'Admin Profit %',type:'number'},{key:'startTime',ph:'Start Time',type:'datetime-local'},{key:'endTime',ph:'End Time *',type:'datetime-local'}].map(f=>(
            <input key={f.key} type={f.type} placeholder={f.ph} value={(form as any)[f.key]} onChange={(e)=>setForm({...form,[f.key]:e.target.value})}
              className="bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none [color-scheme:dark]"/>
          ))}
          <textarea placeholder="Description" value={form.description} onChange={(e)=>setForm({...form,description:e.target.value})}
            className="md:col-span-2 bg-gray-900 border border-gray-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-white text-sm outline-none resize-none" rows={3}/>
        </div>
        <button onClick={createAuction} className="btn-primary text-white mt-4">Create Auction</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {auctions.map((auction) => (
          <div key={auction.id} className="glass rounded-2xl p-6 card-3d">
            <div className="flex items-start justify-between mb-3">
              <h3 className="font-bold text-white">{auction.title}</h3>
              <span className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColors[auction.status]}`}>{auction.status}</span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div><p className="text-gray-500">Start</p><p className="text-white font-bold">LKR {auction.startPrice}</p></div>
              <div><p className="text-gray-500">Current</p><p className="text-indigo-400 font-bold">LKR {auction.currentBid||auction.startPrice}</p></div>
              <div><p className="text-gray-500">Admin %</p><p className="text-green-400 font-bold">{auction.adminProfit}%</p></div>
              <div><p className="text-gray-500">Bids</p><p className="text-white font-bold">{auction._count?.bids||0}</p></div>
            </div>
            <div className="flex items-center gap-2 mt-3 text-xs text-gray-400">
              <Clock className="w-4 h-4"/> Ends: {new Date(auction.endTime).toLocaleString()}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
