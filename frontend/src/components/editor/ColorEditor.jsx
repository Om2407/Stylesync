import { useState, useRef, useEffect } from 'react';
import { HexColorPicker } from 'react-colorful';
import { Lock, Unlock, Eye, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../../store';
import clsx from 'clsx';

const COLOR_LABELS = {
  primary: 'Primary', secondary: 'Secondary', accent: 'Accent',
  background: 'Background', surface: 'Surface', text: 'Text',
  neutral: 'Neutral', border: 'Border', success: 'Success',
  warning: 'Warning', error: 'Error',
};

function ColorSwatch({ colorKey, value, isLocked, onEdit, onToggleLock }) {
  const [showPicker, setShowPicker] = useState(false);
  const [localVal, setLocalVal] = useState(value);
  const ref = useRef(null);

  useEffect(() => { setLocalVal(value); }, [value]);

  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setShowPicker(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleChange = (hex) => {
    if (isLocked) return;
    setLocalVal(hex);
    onEdit(colorKey, hex);
  };

  return (
    <motion.div
      layout
      className={clsx('token-card group', isLocked && 'locked')}
      ref={ref}
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => !isLocked && setShowPicker(!showPicker)}
            className="w-9 h-9 rounded-lg border-2 border-ink-700 hover:border-ink-500 transition-all flex-shrink-0 relative overflow-hidden"
            style={{ background: localVal }}
            disabled={isLocked}
          >
            {isLocked && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <Lock size={12} className="text-white/80" />
              </div>
            )}
          </button>
          <div>
            <p className="text-white text-sm font-medium leading-none mb-0.5">
              {COLOR_LABELS[colorKey] || colorKey}
            </p>
            <p className="text-ink-500 text-xs font-mono">{localVal}</p>
          </div>
        </div>
        <button
          onClick={() => onToggleLock(colorKey)}
          className={clsx(
            'p-1.5 rounded-lg transition-all',
            isLocked
              ? 'text-electric bg-electric/10 hover:bg-electric/20'
              : 'text-ink-600 hover:text-ink-300 hover:bg-ink-800'
          )}
          title={isLocked ? 'Unlock token' : 'Lock token'}
        >
          {isLocked ? <Lock size={13} /> : <Unlock size={13} />}
        </button>
      </div>

      {/* Hex input */}
      <div className="flex items-center gap-2">
        <input
          type="text"
          value={localVal}
          onChange={(e) => handleChange(e.target.value)}
          disabled={isLocked}
          className="flex-1 bg-ink-800 border border-ink-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-ink-200 focus:outline-none focus:border-electric disabled:opacity-50"
          maxLength={7}
        />
        <div className="text-xs text-ink-600 font-mono">
          --color-{colorKey}
        </div>
      </div>

      {/* Color picker popover */}
      <AnimatePresence>
        {showPicker && !isLocked && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 5 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 5 }}
            className="absolute z-50 mt-2 shadow-2xl rounded-xl overflow-hidden border border-ink-700"
            style={{ background: '#1a1a1a' }}
          >
            <HexColorPicker color={localVal} onChange={handleChange} />
            <div className="p-2">
              <input
                type="text"
                value={localVal}
                onChange={(e) => handleChange(e.target.value)}
                className="w-full bg-ink-800 border border-ink-700 rounded-lg px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-electric text-center"
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function ColorEditor() {
  const { tokens, lockedTokens, updateToken, lockToken, unlockToken } = useStore();
  if (!tokens?.colors) return null;

  const colors = tokens.colors;
  const displayColors = Object.entries(colors).filter(([k]) => k !== 'allExtracted');

  const handleToggleLock = (key) => {
    const lockKey = `colors.${key}`;
    if (lockedTokens[lockKey]) unlockToken('colors', key);
    else lockToken('colors', key);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-display mb-1">Color Tokens</h2>
        <p className="text-ink-500 text-sm">Click a swatch to edit. Lock tokens to protect them on re-scrape.</p>
      </div>

      {/* All extracted colors */}
      {colors.allExtracted?.length > 0 && (
        <div className="mb-6">
          <p className="text-ink-600 text-xs font-mono uppercase tracking-wider mb-3">All Extracted Colors ({colors.allExtracted.length})</p>
          <div className="flex flex-wrap gap-2">
            {colors.allExtracted.map((c, i) => (
              <div key={i} title={c} className="w-8 h-8 rounded-lg border border-ink-800 cursor-pointer hover:scale-110 transition-transform" style={{ background: c }} />
            ))}
          </div>
        </div>
      )}

      {/* Editable tokens */}
      <p className="text-ink-600 text-xs font-mono uppercase tracking-wider mb-3">Design Tokens</p>
      <div className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {displayColors.map(([key, val]) => (
          <ColorSwatch
            key={key}
            colorKey={key}
            value={val}
            isLocked={!!lockedTokens[`colors.${key}`]}
            onEdit={(k, v) => updateToken('colors', k, v)}
            onToggleLock={handleToggleLock}
          />
        ))}
      </div>
    </div>
  );
}
