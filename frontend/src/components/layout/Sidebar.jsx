import { useStore } from '../../store';

export default function Sidebar() {
  const { tokens, lockedTokens } = useStore();
  if (!tokens) return null;

  const lockedCount = Object.keys(lockedTokens).length;
  const colorCount = Object.keys(tokens.colors || {}).filter(k => k !== 'allExtracted').length;

  return (
    <aside className="w-56 border-r border-ink-800 bg-ink-950 overflow-y-auto flex-shrink-0 hidden lg:flex flex-col p-4 gap-4">
      {/* Stats */}
      <div className="space-y-2">
        <p className="text-ink-600 text-xs font-mono uppercase tracking-wider">Overview</p>
        {[
          { label: 'Colors', value: colorCount, color: 'bg-electric' },
          { label: 'Locked', value: lockedCount, color: 'bg-amber-500' },
          { label: 'Font Scale', value: Object.keys(tokens.typography?.sizes || {}).length, color: 'bg-emerald-500' },
        ].map((s) => (
          <div key={s.label} className="flex items-center justify-between py-2 px-3 rounded-lg bg-ink-900">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${s.color}`} />
              <span className="text-ink-400 text-xs">{s.label}</span>
            </div>
            <span className="text-white text-xs font-mono">{s.value}</span>
          </div>
        ))}
      </div>

      {/* Color swatches */}
      {tokens.colors && (
        <div>
          <p className="text-ink-600 text-xs font-mono uppercase tracking-wider mb-2">Palette</p>
          <div className="grid grid-cols-4 gap-1.5">
            {Object.entries(tokens.colors)
              .filter(([k]) => k !== 'allExtracted')
              .map(([key, val]) => (
                <div key={key} title={`${key}: ${val}`} className="group relative">
                  <div className="w-full aspect-square rounded-md border border-ink-800 cursor-pointer hover:scale-110 transition-transform"
                    style={{ background: val }} />
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Font preview */}
      {tokens.typography && (
        <div>
          <p className="text-ink-600 text-xs font-mono uppercase tracking-wider mb-2">Fonts</p>
          <div className="space-y-2">
            <div className="px-3 py-2 rounded-lg bg-ink-900">
              <p className="text-ink-600 text-xs mb-0.5">Heading</p>
              <p className="text-white text-sm truncate" style={{ fontFamily: tokens.typography.headingFont }}>
                {tokens.typography.headingFont}
              </p>
            </div>
            <div className="px-3 py-2 rounded-lg bg-ink-900">
              <p className="text-ink-600 text-xs mb-0.5">Body</p>
              <p className="text-white text-sm truncate" style={{ fontFamily: tokens.typography.bodyFont }}>
                {tokens.typography.bodyFont}
              </p>
            </div>
          </div>
        </div>
      )}
    </aside>
  );
}
