import { useState } from 'react';
import { useStore } from '../../store';

export default function ComponentPreview() {
  const { tokens } = useStore();
  const [inputState, setInputState] = useState('default');

  if (!tokens) return null;

  const { typography, colors } = tokens;

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-display mb-1">Component Preview</h2>
        <p className="text-ink-500 text-sm">All components use CSS custom properties from your extracted tokens.</p>
      </div>

      <div className="space-y-6">
        {/* Buttons */}
        <section className="token-card">
          <p className="text-ink-500 text-xs font-mono uppercase tracking-wider mb-4">Buttons</p>
          <div className="flex flex-wrap gap-3">
            <button className="btn-preview-primary">Primary Button</button>
            <button className="btn-preview-secondary">Secondary Button</button>
            <button className="btn-preview-ghost">Ghost Button</button>
            <button className="btn-preview-primary" style={{ opacity: 0.5, cursor: 'not-allowed' }}>Disabled</button>
          </div>
          <div className="flex flex-wrap gap-3 mt-3">
            {['sm', 'md', 'lg'].map(size => (
              <button key={size} className="btn-preview-primary"
                style={{ fontSize: size === 'sm' ? 12 : size === 'lg' ? 18 : 14, padding: size === 'sm' ? '6px 12px' : size === 'lg' ? '14px 28px' : undefined }}>
                {size.toUpperCase()}
              </button>
            ))}
          </div>
        </section>

        {/* Inputs */}
        <section className="token-card">
          <p className="text-ink-500 text-xs font-mono uppercase tracking-wider mb-4">Input Fields</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 max-w-2xl">
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)', opacity: 0.7 }}>Default</label>
              <input className="input-preview" placeholder="Enter text..." defaultValue="" />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--color-text)', fontFamily: 'var(--font-body)', opacity: 0.7 }}>Focus</label>
              <input className="input-preview" placeholder="Focused state" autoFocus style={{ borderColor: 'var(--color-primary)', boxShadow: '0 0 0 3px color-mix(in srgb, var(--color-primary) 15%, transparent)' }} />
            </div>
            <div>
              <label className="block text-xs mb-1.5" style={{ color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}>Error</label>
              <input className="input-preview" defaultValue="Invalid input" style={{ borderColor: 'var(--color-error)' }} />
              <p className="text-xs mt-1" style={{ color: 'var(--color-error)', fontFamily: 'var(--font-body)' }}>This field is required.</p>
            </div>
          </div>
        </section>

        {/* Cards */}
        <section className="token-card">
          <p className="text-ink-500 text-xs font-mono uppercase tracking-wider mb-4">Cards</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { title: 'Default Card', shadow: 'var(--shadow-base)', radius: 'var(--radius-base)' },
              { title: 'Elevated Card', shadow: 'var(--shadow-lg)', radius: 'calc(var(--radius-base) * 2)' },
              { title: 'Flat Card', shadow: 'none', radius: 'var(--radius-sm)' },
            ].map((card, i) => (
              <div key={i} className="card-preview" style={{ borderRadius: card.radius, boxShadow: card.shadow }}>
                <div className="w-full h-24 rounded-lg mb-3" style={{ background: `linear-gradient(135deg, var(--color-primary), var(--color-secondary))` }} />
                <h3 className="font-semibold mb-1" style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text)', fontSize: 16 }}>
                  {card.title}
                </h3>
                <p style={{ fontFamily: 'var(--font-body)', color: 'var(--color-neutral)', fontSize: 13, lineHeight: 1.5 }}>
                  A card component using your extracted design tokens for consistent styling.
                </p>
                <button className="btn-preview-primary mt-3 w-full" style={{ fontSize: 13 }}>Learn More</button>
              </div>
            ))}
          </div>
        </section>

        {/* Typography */}
        <section className="token-card">
          <p className="text-ink-500 text-xs font-mono uppercase tracking-wider mb-4">Type Scale</p>
          <div className="preview-component p-6 rounded-xl space-y-3">
            {[
              { tag: 'H1', size: tokens.typography?.sizes?.['4xl'] || 36, weight: 700 },
              { tag: 'H2', size: tokens.typography?.sizes?.['3xl'] || 30, weight: 700 },
              { tag: 'H3', size: tokens.typography?.sizes?.['2xl'] || 24, weight: 600 },
              { tag: 'H4', size: tokens.typography?.sizes?.xl || 20, weight: 600 },
              { tag: 'Body', size: tokens.typography?.sizes?.base || 16, weight: 400 },
              { tag: 'Small', size: tokens.typography?.sizes?.sm || 14, weight: 400 },
              { tag: 'Caption', size: tokens.typography?.sizes?.xs || 12, weight: 400 },
            ].map(({ tag, size, weight }) => (
              <div key={tag} className="flex items-baseline gap-4">
                <span className="text-xs font-mono w-14 flex-shrink-0" style={{ color: 'var(--color-neutral)' }}>{tag}</span>
                <p style={{ fontFamily: tag === 'Body' || tag === 'Small' || tag === 'Caption' ? 'var(--font-body)' : 'var(--font-heading)', fontSize: `${size}px`, fontWeight: weight, color: 'var(--color-text)', lineHeight: 1.2 }}>
                  {tag === 'Body' || tag === 'Small' || tag === 'Caption'
                    ? 'The quick brown fox jumps over the lazy dog'
                    : 'Display Heading Text'}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Color Chips */}
        <section className="token-card">
          <p className="text-ink-500 text-xs font-mono uppercase tracking-wider mb-4">Color Palette</p>
          <div className="preview-component p-4 rounded-xl">
            <div className="flex gap-0 rounded-xl overflow-hidden mb-4" style={{ height: 64 }}>
              {['primary', 'secondary', 'accent', 'success', 'warning', 'error'].map(c => (
                <div key={c} className="flex-1" style={{ background: `var(--color-${c})` }} title={`--color-${c}`} />
              ))}
            </div>
            <div className="grid grid-cols-2 gap-2">
              {['background', 'surface', 'border', 'neutral'].map(c => (
                <div key={c} className="flex items-center gap-2 p-2 rounded-lg" style={{ border: '1px solid var(--color-border)' }}>
                  <div className="w-6 h-6 rounded border" style={{ background: `var(--color-${c})`, borderColor: 'var(--color-border)' }} />
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--color-neutral)' }}>--color-{c}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Badge/Tag components */}
        <section className="token-card">
          <p className="text-ink-500 text-xs font-mono uppercase tracking-wider mb-4">Badges & Tags</p>
          <div className="preview-component p-4 rounded-xl flex flex-wrap gap-2">
            {['primary', 'secondary', 'success', 'warning', 'error'].map(c => (
              <span key={c} style={{
                background: `color-mix(in srgb, var(--color-${c}) 15%, transparent)`,
                color: `var(--color-${c})`,
                border: `1px solid color-mix(in srgb, var(--color-${c}) 30%, transparent)`,
                borderRadius: 'var(--radius-full)',
                padding: '4px 12px', fontSize: 12,
                fontFamily: 'var(--font-body)', fontWeight: 500
              }}>
                {c.charAt(0).toUpperCase() + c.slice(1)}
              </span>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
