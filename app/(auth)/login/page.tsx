'use client';
import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import { Mail, Lock, Eye, EyeOff, Zap } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!login || !password) { toast.error('Please enter credentials'); return; }
    setLoading(true);
    try {
      const result = await signIn('credentials', { login, password, redirect: false });
      if (result?.error) throw new Error('Invalid credentials');
      const sessionRes = await fetch('/api/auth/session');
      const session = await sessionRes.json();
      const role = session?.user?.role;
      toast.success('Welcome back!');
      if (role === 'ADMIN') router.push('/admin/dashboard');
      else if (role === 'SELLER') router.push('/seller/dashboard');
      else router.push('/customer/dashboard');
    } catch (err: any) {
      toast.error(err.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen hero-bg grid-pattern flex items-center justify-center p-4">
      <div className="fixed top-20 right-10 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <motion.div initial={{opacity:0,y:20}} animate={{opacity:1,y:0}} className="w-full max-w-md relative z-10">
        <div className="glass rounded-3xl p-8 neon-border">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
              <Zap className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-black gradient-text">Welcome Back</h1>
            <p className="text-gray-400 text-sm mt-1">Sign in to Galaxy Mart</p>
          </div>
          <div className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input value={login} onChange={(e)=>setLogin(e.target.value)} placeholder="Email or Username"
                onKeyDown={(e)=>e.key==='Enter'&&handleLogin()}
                className="w-full bg-gray-900/80 border border-gray-700 focus:border-indigo-500 rounded-xl pl-10 pr-4 py-4 text-white outline-none transition-colors" />
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-400" />
              <input value={password} onChange={(e)=>setPassword(e.target.value)} type={showPass?'text':'password'} placeholder="Password"
                onKeyDown={(e)=>e.key==='Enter'&&handleLogin()}
                className="w-full bg-gray-900/80 border border-gray-700 focus:border-indigo-500 rounded-xl pl-10 pr-12 py-4 text-white outline-none transition-colors" />
              <button onClick={()=>setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                {showPass?<EyeOff className="w-5 h-5"/>:<Eye className="w-5 h-5"/>}
              </button>
            </div>
            <div className="flex justify-end">
              <Link href="/forgot-password" className="text-indigo-400 hover:text-indigo-300 text-sm">Forgot Password?</Link>
            </div>
            <button onClick={handleLogin} disabled={loading} className="btn-primary w-full text-white text-lg disabled:opacity-50">
              {loading?'Signing in...':'Sign In'}
            </button>
            <p className="text-center text-gray-400 text-sm">
              Don't have an account?{' '}
              <Link href="/register" className="text-indigo-400 hover:text-indigo-300 font-semibold">Register</Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
