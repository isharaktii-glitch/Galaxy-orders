'use client';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Zap, ArrowLeft } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) { toast.error('Enter your email'); return; }
    setLoading(true);
    try {
      await fetch('/api/auth/forgot-password', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email}) });
      setSent(true);
      toast.success('Reset link sent!');
    } catch { toast.error('Failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen hero-bg grid-pattern flex items-center justify-center p-4">
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md">
        <div className="glass rounded-3xl p-8 neon-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Zap className="w-8 h-8 text-white"/>
            </div>
            <h1 className="text-2xl font-black gradient-text">Reset Password</h1>
          </div>
          {sent ? (
            <div className="text-center py-8">
              <div className="text-5xl mb-4">📧</div>
              <h2 className="text-xl font-bold text-white mb-2">Email Sent!</h2>
              <p className="text-gray-400 text-sm mb-6">Check your email for the reset link</p>
              <Link href="/login" className="btn-primary text-white inline-block">Back to Login</Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400"/>
                <input value={email} onChange={(e)=>setEmail(e.target.value)} type="email" placeholder="Your Email"
                  className="w-full bg-gray-900/80 border border-gray-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-4 text-white outline-none"/>
              </div>
              <button onClick={handleSubmit} disabled={loading} className="btn-primary w-full text-white disabled:opacity-50">
                {loading?'Sending...':'Send Reset Link'}
              </button>
              <Link href="/login" className="flex items-center justify-center gap-2 text-gray-400 hover:text-white text-sm">
                <ArrowLeft className="w-4 h-4"/> Back to Login
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
