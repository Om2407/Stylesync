import { useState } from 'react';
import { useStore } from '../../store';

const SPACING_LABELS = { xs: 'Extra Small', sm: 'Small', md: 'Medium', lg: 'Large', xl: 'Extra Large', '2xl': '2X Large', '3xl': '3X Large' };

export default function SpacingEditor() {
  const { tokens, updateToken } = useStore();
  const [dragging, setDragging] = useState(null);
  if (!tokens?.spacing) return null;

  const spacing = tokens.spacing;

  const handleDragStart = (key, e) => {
    const startX = e.clientX;
    const startVal = spacing.named[key] || 0;
    setDragging(key);

    const onMove = (me) => {
      const delta = Math.round((me.clientX - startX) / 3);
      const newVal = Math.max(0, Math.min(128, startVal + delta));
      const named = { ...spacing.named, [key]: newVal };
      updateToken('spacing', 'named', named);
    };

    const onUp = () => {
      setDragging(null);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };

    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  };

  const handleUnitChange = (val) => {
    const unit = Math.max(1, Math.min(16, +val));
    updateToken('spacing', 'unit', unit);
    const named = {
      xs: unit,
      sm: unit * 2,
      md: unit * 4,
      lg: unit * 6,
      xl: unit * 8,
      '2xl': unit * 12,
      '3xl': unit * 16,
    };
    updateToken('spacing', 'named', named);
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-display mb-1">Spacing Tokens</h2>
        <p className="text-ink-500 text-sm">Drag the handles to adjust spacing values. Or change the base unit to rescale all.</p>
      </div>

      {/* Base unit */}
      <div className="token-card mb-6">
        <p className="text-ink-400 text-sm font-medium mb-3">Base Unit (px)</p>
        <div className="flex items-center gap-4">
          <input
            type="range" min={2} max={16} step={1}
            value={spacing.unit || 4}
            onChange={(e) => handleUnitChange(e.target.value)}
            className="flex-1 accent-electric"
          />
          <div className="flex items-center gap-2 bg-ink-800 border border-ink-700 rounded-lg px-3 py-2">
            <input
              type="number" min={1} max={16}
              value={spacing.unit || 4}
              onChange={(e) => handleUnitChange(e.target.value)}
              className="w-10 bg-transparent text-white font-mono text-sm focus:outline-none text-center"
            />
            <span className="text-ink-500 text-xs">px</span>
          </div>
        </div>
        <p className="text-ink-600 text-xs mt-2">Adjusting base unit rescales all spacing tokens proportionally.</p>
      </div>

      {/* Spacing scale */}
      <p className="text-ink-600 text-xs font-mono uppercase tracking-wider mb-3">Named Scale</p>
      <div className="space-y-3">
        {Object.entries(spacing.named || {}).map(([key, val]) => (
          <div key={key} className="token-card">
            <div className="flex items-center gap-4">
              <div className="w-16 flex-shrink-0">
                <p className="text-white text-sm font-medium">{key}</p>
                <p className="text-ink-600 text-xs font-mono">--spacing-{key}</p>
              </div>

              {/* Visual bar - draggable */}
              <div className="flex-1 flex items-center gap-3">
                <div
                  className="relative h-8 flex items-center cursor-ew-resize group"
                  onMouseDown={(e) => handleDragStart(key, e)}
                >
                  <div
                    className="h-full rounded-md bg-electric/20 border border-electric/30 transition-colors group-hover:bg-electric/30 flex items-center justify-end pr-1.5 min-w-[4px]"
                    style={{ width: `${Math.max(4, Math.min(val * 2, 300))}px` }}
                  >
                    {dragging === key && (
                      <div className="w-1 h-5 bg-electric rounded-full" />
                    )}
                  </div>
                </div>
              </div>

              {/* Value input */}
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <input
                  type="number"
                  value={val}
                  min={0} max={256}
                  onChange={(e) => {
                    const named = { ...spacing.named, [key]: +e.target.value };
                    updateToken('spacing', 'named', named);
                  }}
                  className="w-16 bg-ink-800 border border-ink-700 rounded-lg px-2 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-electric text-center"
                />
                <span className="text-ink-500 text-xs">px</span>
              </div>
            </div>

            {/* Visual preview */}
            <div className="mt-2 flex items-center gap-2 overflow-hidden">
              <div
                className="bg-electric/10 border border-electric/20 rounded flex-shrink-0"
                style={{ width: `${Math.min(val, 80)}px`, height: '12px' }}
              />
              <span className="text-ink-700 text-xs">{SPACING_LABELS[key] || key} · {val}px</span>
            </div>
          </div>
        ))}
      </div>

      {/* Scale preview */}
      <div className="mt-6 token-card">
        <p className="text-ink-500 text-xs font-mono mb-4">Visual Scale Preview</p>
        <div className="flex items-end gap-2">
          {Object.entries(spacing.named || {}).map(([key, val]) => (
            <div key={key} className="flex flex-col items-center gap-1">
              <div
                className="bg-electric/30 border border-electric/20 rounded w-6"
                style={{ height: `${Math.min(val, 120)}px` }}
              />
              <span className="text-ink-700 text-xs">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
