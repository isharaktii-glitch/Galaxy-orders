'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingBag, Users, TrendingUp, Gavel, Shield, Globe, Star, ArrowRight, Zap, ChevronDown } from 'lucide-react';

type Lang = 'en' | 'si' | 'ta';

const heroTexts = {
  en: { title: 'Galaxy Mart', sub: 'Tagla Market', desc: "Sri Lanka's Premier Multi-Vendor Marketplace" },
  si: { title: 'ගැලැක්සි මාට්', sub: 'ටැග්ලා මාකට්', desc: 'ශ්‍රී ලංකාවේ ප්‍රමුඛ බහු-විකුණුම්කරු වෙළඳපොළ' },
  ta: { title: 'கேலக்ஸி மார்ட்', sub: 'டேக்லா மார்க்கெட்', desc: 'இலங்கையின் முன்னணி பல-விற்பனையாளர் சந்தை' },
};

export default function LandingPage() {
  const [lang, setLang] = useState<Lang>('en');

  useEffect(() => {
    const saved = localStorage.getItem('lang') as Lang;
    if (saved) setLang(saved);
  }, []);

  const changeLang = (l: Lang) => { setLang(l); localStorage.setItem('lang', l); };
  const h = heroTexts[lang];

  return (
    <div className="min-h-screen hero-bg grid-pattern overflow-x-hidden">
      <nav className="fixed top-0 w-full z-50 glass border-b border-indigo-500/20">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-black gradient-text">{h.title}</span>
              <p className="text-xs text-indigo-300">{h.sub}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-1 glass rounded-lg p-1">
              {(['en','si','ta'] as Lang[]).map((l) => (
                <button key={l} onClick={() => changeLang(l)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${lang===l ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:text-white'}`}>
                  {l.toUpperCase()}
                </button>
              ))}
            </div>
            <Link href="/login" className="text-gray-300 hover:text-white text-sm">
              {lang==='si'?'ලොග් වන්න':lang==='ta'?'உள்நுழை':'Login'}
            </Link>
            <Link href="/register" className="btn-primary text-white text-sm">
              {lang==='si'?'ලියාපදිංචි':lang==='ta'?'பதிவு செய்':'Register'}
            </Link>
          </div>
        </div>
      </nav>

      <section className="min-h-screen flex items-center justify-center pt-20 px-4 relative">
        <div className="absolute top-40 left-20 w-72 h-72 bg-indigo-600/20 rounded-full blur-3xl" />
        <div className="absolute top-60 right-20 w-96 h-96 bg-purple-600/20 rounded-full blur-3xl" />
        <motion.div initial={{opacity:0,y:30}} animate={{opacity:1,y:0}} transition={{duration:0.8}} className="text-center max-w-5xl mx-auto relative z-10">
          <div className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 mb-8 text-sm text-indigo-300">
            <Star className="w-4 h-4 text-yellow-400" />
            {lang==='si'?'Galaxy Workers විසින්':lang==='ta'?'கேலக்ஸி வொர்க்கர்ஸ்':'Powered by Galaxy Workers'}
          </div>
          <h1 className="text-7xl md:text-9xl font-black mb-4 gradient-text">{h.title}</h1>
          <h2 className="text-3xl md:text-4xl font-bold text-indigo-300 mb-6">{h.sub}</h2>
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">{h.desc}</p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/register" className="btn-primary text-white flex items-center gap-2 text-lg w-full sm:w-auto justify-center">
              {lang==='si'?'ආරම්භ කරන්න':lang==='ta'?'தொடங்குங்கள்':'Get Started'} <ArrowRight className="w-5 h-5" />
            </Link>
            <Link href="/login" className="glass glass-hover px-6 py-3 rounded-xl font-semibold text-gray-300 hover:text-white transition-all w-full sm:w-auto text-center text-lg">
              {lang==='si'?'ලොග් වන්න':lang==='ta'?'உள்நுழை':'Login'}
            </Link>
          </div>
        </motion.div>
      </section>

      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <ShoppingBag className="w-8 h-8"/>, title: lang==='si'?'සෘජු මිලදී ගැනීම':lang==='ta'?'நேரடி வாங்குதல்':'Direct Buying', desc: lang==='si'?'කෙලින්ම order දාන්න':lang==='ta'?'நேரடியாக ஆர்டர் செய்யுங்கள்':'Place orders directly' },
            { icon: <Gavel className="w-8 h-8"/>, title: lang==='si'?'වෙන්දේසි':lang==='ta'?'ஏலங்கள்':'Live Auctions', desc: lang==='si'?'Real-time auction bidding':lang==='ta'?'நேரடி ஏல அமைப்பு':'Real-time auction bidding' },
            { icon: <Globe className="w-8 h-8"/>, title: lang==='si'?'බහු භාෂා':lang==='ta'?'பல மொழிகள்':'Multi-Language', desc: lang==='si'?'සිංහල, දෙමළ, ඉංග්‍රීසි':lang==='ta'?'சிங்களம், தமிழ், ஆங்கிலம்':'Sinhala, Tamil, English' },
          ].map((f,i) => (
            <motion.div key={i} initial={{opacity:0,y:30}} whileInView={{opacity:1,y:0}} transition={{delay:i*0.1}} className="glass glass-hover rounded-2xl p-8 card-3d">
              <div className="text-indigo-400 mb-4">{f.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{f.title}</h3>
              <p className="text-gray-400 text-sm">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <footer className="py-10 border-t border-indigo-500/20 text-center">
        <p className="gradient-text font-bold text-lg mb-2">Galaxy Mart | Tagla Market</p>
        <p className="text-gray-500 text-sm">© 2024 Galaxy Workers. All rights reserved.</p>
      </footer>
    </div>
  );
}
