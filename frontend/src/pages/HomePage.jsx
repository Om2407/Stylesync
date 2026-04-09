import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Globe, Zap, Lock, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import { useStore } from '../store';

const EXAMPLE_URLS = [
  'https://stripe.com',
  'https://linear.app',
  'https://vercel.com',
  'https://notion.so',
  'https://figma.com',
];

export default function HomePage() {
  const navigate = useNavigate();
  const { scrape, isScraping, fetchRecentSites, recentSites } = useStore();
  const [url, setUrl] = useState('');
  const [placeholder, setPlaceholder] = useState(EXAMPLE_URLS[0]);

  useEffect(() => {
    fetchRecentSites();
    let i = 0;
    const interval = setInterval(() => {
      i = (i + 1) % EXAMPLE_URLS.length;
      setPlaceholder(EXAMPLE_URLS[i]);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const handleScrape = async (e) => {
    e.preventDefault();
    if (!url.trim()) { toast.error('Enter a URL first'); return; }
    try {
      await scrape(url.trim());
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.error || 'Failed to analyze site');
    }
  };

  return (
    <div className="min-h-screen bg-ink-950 flex flex-col">
      {/* Nav */}
      <nav className="border-b border-ink-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-electric flex items-center justify-center">
            <Sparkles size={14} className="text-white" />
          </div>
          <span className="font-display text-white text-lg">StyleSync</span>
        </div>
        <span className="text-ink-500 text-sm font-mono">v1.0</span>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col items-center justify-center px-6 py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-electric/10 border border-electric/20 text-electric text-xs font-mono mb-8">
            <Zap size={12} />
            Design Token Extractor
          </div>

          <h1 className="font-display text-5xl md:text-7xl text-white leading-tight mb-6">
            Any website.{' '}
            <span className="text-gradient italic">Living</span>{' '}
            design system.
          </h1>

          <p className="text-ink-400 text-lg md:text-xl mb-12 leading-relaxed max-w-xl mx-auto">
            Paste any URL. StyleSync extracts colors, typography, and spacing — then generates an editable design token dashboard you can lock, tweak, and export.
          </p>

          {/* URL Input */}
          <form onSubmit={handleScrape} className="flex flex-col sm:flex-row gap-3 max-w-2xl mx-auto mb-6">
            <div className="relative flex-1">
              <Globe size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-500" />
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder={placeholder}
                className="w-full bg-ink-900 border border-ink-700 rounded-xl pl-10 pr-4 py-4 text-white placeholder-ink-600 focus:outline-none focus:border-electric focus:ring-2 focus:ring-electric/20 transition-all text-sm font-mono"
                disabled={isScraping}
              />
            </div>
            <button
              type="submit"
              disabled={isScraping}
              className="flex items-center justify-center gap-2 px-6 py-4 bg-electric hover:bg-electric/90 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-semibold transition-all text-sm whitespace-nowrap"
            >
              {isScraping ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  Extract Tokens
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Scraping skeleton */}
          {isScraping && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="max-w-2xl mx-auto glass rounded-2xl p-6 mb-6"
            >
              <p className="text-ink-500 text-xs font-mono mb-4">Parsing DOM structure...</p>
              <div className="space-y-3">
                {['Extracting color palette', 'Detecting typography hierarchy', 'Analyzing spacing rhythm', 'Building token map'].map((label, i) => (
                  <div key={label} className="flex items-center gap-3">
                    <div className="skeleton w-2 h-2 rounded-full flex-shrink-0" style={{ animationDelay: `${i * 0.2}s` }} />
                    <div className="skeleton h-3 rounded flex-1" style={{ animationDelay: `${i * 0.15}s` }} />
                    <span className="text-ink-700 text-xs font-mono">{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          <p className="text-ink-600 text-xs">
            Try: stripe.com · vercel.com · linear.app · notion.so
          </p>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto mt-20 w-full"
        >
          {[
            { icon: <Globe size={20} />, title: 'Intelligent Scraping', desc: 'Handles SPAs, static HTML, and CORS-blocked sites with graceful fallbacks.' },
            { icon: <Lock size={20} />, title: 'Lock & Version', desc: 'Lock specific tokens to prevent override on re-scraping. Full version history.' },
            { icon: <Download size={20} />, title: 'Export Anywhere', desc: 'Export as CSS variables, JSON design tokens, or Tailwind config — instantly.' },
          ].map((f, i) => (
            <div key={i} className="glass rounded-2xl p-6">
              <div className="text-electric mb-3">{f.icon}</div>
              <h3 className="text-white font-semibold mb-1.5 text-sm">{f.title}</h3>
              <p className="text-ink-500 text-xs leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </motion.div>

        {/* Recent Sites */}
        {recentSites.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="max-w-3xl mx-auto mt-12 w-full"
          >
            <p className="text-ink-600 text-xs font-mono mb-3">Recent extractions</p>
            <div className="flex flex-wrap gap-2">
              {recentSites.slice(0, 6).map((site) => (
                <button
                  key={site.id}
                  onClick={() => setUrl(site.url)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-900 border border-ink-800 hover:border-ink-600 text-ink-400 hover:text-white text-xs transition-all"
                >
                  {site.favicon_url && <img src={site.favicon_url} className="w-3.5 h-3.5" onError={(e) => e.target.style.display='none'} />}
                  {site.title || new URL(site.url).hostname}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
