import { Sparkles, Home, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import clsx from 'clsx';

export default function TopBar({ site, activeTab, setActiveTab, tabs }) {
  const navigate = useNavigate();
  const { isScraping } = useStore();

  return (
    <header className="border-b border-ink-800 bg-ink-950/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="flex items-center px-4 h-14 gap-4">
        {/* Logo */}
        <button onClick={() => navigate('/')} className="flex items-center gap-2 flex-shrink-0 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 rounded-md bg-electric flex items-center justify-center">
            <Sparkles size={12} className="text-white" />
          </div>
          <span className="font-display text-white text-sm hidden sm:block">StyleSync</span>
        </button>

        <div className="w-px h-5 bg-ink-800" />

        {/* Site info */}
        {site && (
          <div className="flex items-center gap-2 flex-shrink-0">
            {site.faviconUrl && (
              <img src={site.faviconUrl} className="w-4 h-4 rounded" onError={(e) => e.target.style.display='none'} />
            )}
            <span className="text-ink-400 text-xs font-mono truncate max-w-[140px]">
              {site.title || site.url}
            </span>
            {site.usedFallback && (
              <span className="flex items-center gap-1 text-amber-500 text-xs bg-amber-500/10 px-2 py-0.5 rounded-full">
                <AlertCircle size={10} />
                Fallback
              </span>
            )}
          </div>
        )}

        <div className="w-px h-5 bg-ink-800" />

        {/* Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto no-scrollbar flex-1">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                'px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-all',
                activeTab === tab
                  ? 'bg-electric text-white'
                  : 'text-ink-500 hover:text-ink-200 hover:bg-ink-800'
              )}
            >
              {tab}
            </button>
          ))}
        </nav>

        {/* Home btn */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-400 hover:text-white text-xs transition-all flex-shrink-0"
        >
          <Home size={12} />
          <span className="hidden sm:inline">New</span>
        </button>
      </div>
    </header>
  );
}
