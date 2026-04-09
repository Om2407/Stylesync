import { useState } from 'react';
import { Lock, Unlock } from 'lucide-react';
import { useStore } from '../../store';
import clsx from 'clsx';

const GOOGLE_FONTS = ['Inter', 'Roboto', 'Open Sans', 'Lato', 'Poppins', 'Raleway', 'Merriweather', 'Playfair Display', 'DM Sans', 'DM Serif Display', 'Nunito', 'Source Sans 3', 'Josefin Sans', 'Quicksand', 'Libre Baskerville', 'Crimson Text', 'Space Grotesk', 'Outfit', 'Sora', 'Cabinet Grotesk'];

const SIZE_KEYS = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl'];

export default function TypographyEditor() {
  const { tokens, lockedTokens, updateToken, lockToken, unlockToken } = useStore();
  const [loadedFonts, setLoadedFonts] = useState(new Set());
  if (!tokens?.typography) return null;

  const typo = tokens.typography;

  const loadFont = (font) => {
    if (loadedFonts.has(font)) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = `https://fonts.googleapis.com/css2?family=${encodeURIComponent(font)}:wght@400;600;700&display=swap`;
    document.head.appendChild(link);
    setLoadedFonts(prev => new Set([...prev, font]));
  };

  const handleFontChange = (key, val) => {
    loadFont(val);
    updateToken('typography', key, val);
  };

  const toggleLock = (key) => {
    const lk = `typography.${key}`;
    if (lockedTokens[lk]) unlockToken('typography', key);
    else lockToken('typography', key);
  };

  const LockBtn = ({ tokenKey }) => (
    <button
      onClick={() => toggleLock(tokenKey)}
      className={clsx('p-1.5 rounded-lg transition-all flex-shrink-0',
        lockedTokens[`typography.${tokenKey}`]
          ? 'text-electric bg-electric/10 hover:bg-electric/20'
          : 'text-ink-600 hover:text-ink-300 hover:bg-ink-800')}
    >
      {lockedTokens[`typography.${tokenKey}`] ? <Lock size={12} /> : <Unlock size={12} />}
    </button>
  );

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-display mb-1">Typography Tokens</h2>
        <p className="text-ink-500 text-sm">Edit font families, sizes, and weights. Changes reflect instantly in preview.</p>
      </div>

      {/* Font Families */}
      <div className="mb-8">
        <p className="text-ink-600 text-xs font-mono uppercase tracking-wider mb-3">Font Families</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { key: 'headingFont', label: 'Heading Font', varName: '--font-heading' },
            { key: 'bodyFont', label: 'Body Font', varName: '--font-body' },
          ].map(({ key, label, varName }) => (
            <div key={key} className={clsx('token-card', lockedTokens[`typography.${key}`] && 'locked')}>
              <div className="flex items-center justify-between mb-2">
                <div>
                  <p className="text-white text-sm font-medium">{label}</p>
                  <p className="text-ink-600 text-xs font-mono">{varName}</p>
                </div>
                <LockBtn tokenKey={key} />
              </div>
              <div
                className="text-2xl text-white mb-3 leading-tight"
                style={{ fontFamily: typo[key] }}
              >
                The quick brown fox
              </div>
              <select
                value={typo[key]}
                onChange={(e) => handleFontChange(key, e.target.value)}
                disabled={!!lockedTokens[`typography.${key}`]}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-sm text-ink-200 focus:outline-none focus:border-electric disabled:opacity-50"
              >
                {GOOGLE_FONTS.map(f => (
                  <option key={f} value={f}>{f}</option>
                ))}
              </select>
              <input
                type="text"
                value={typo[key]}
                onChange={(e) => handleFontChange(key, e.target.value)}
                disabled={!!lockedTokens[`typography.${key}`]}
                placeholder="Or type a font name"
                className="mt-2 w-full bg-ink-800 border border-ink-700 rounded-lg px-3 py-2 text-xs font-mono text-ink-200 focus:outline-none focus:border-electric disabled:opacity-50"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Type Scale */}
      <div className="mb-8">
        <p className="text-ink-600 text-xs font-mono uppercase tracking-wider mb-3">Type Scale</p>
        <div className="token-card">
          <div className="space-y-3">
            {SIZE_KEYS.map((sizeKey) => {
              const val = typo.sizes?.[sizeKey] || 16;
              const lk = `typography.sizes.${sizeKey}`;
              return (
                <div key={sizeKey} className="flex items-center gap-3">
                  <span className="text-ink-600 font-mono text-xs w-8 flex-shrink-0">{sizeKey}</span>
                  <div
                    className="flex-1 text-white overflow-hidden whitespace-nowrap text-ellipsis"
                    style={{ fontSize: `${Math.min(val, 48)}px`, fontFamily: typo.headingFont, lineHeight: 1.2 }}
                  >
                    Aa
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <input
                      type="number"
                      value={val}
                      min={8} max={120}
                      onChange={(e) => {
                        const sizes = { ...typo.sizes, [sizeKey]: +e.target.value };
                        updateToken('typography', 'sizes', sizes);
                      }}
                      disabled={!!lockedTokens[lk]}
                      className="w-16 bg-ink-800 border border-ink-700 rounded-lg px-2 py-1 text-xs font-mono text-ink-200 focus:outline-none focus:border-electric text-center disabled:opacity-50"
                    />
                    <span className="text-ink-600 text-xs">px</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Line Heights */}
      <div>
        <p className="text-ink-600 text-xs font-mono uppercase tracking-wider mb-3">Line Heights</p>
        <div className="grid grid-cols-3 gap-3">
          {Object.entries(typo.lineHeights || {}).map(([key, val]) => (
            <div key={key} className="token-card text-center">
              <p className="text-ink-500 text-xs mb-2">{key}</p>
              <p className="text-white text-2xl font-mono font-bold">{val}</p>
              <input
                type="range"
                min={1} max={2.5} step={0.05}
                value={val}
                onChange={(e) => {
                  const lh = { ...typo.lineHeights, [key]: +e.target.value };
                  updateToken('typography', 'lineHeights', lh);
                }}
                className="w-full mt-2 accent-electric"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
