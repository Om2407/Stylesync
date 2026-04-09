import { useState } from 'react';
import { Download, Copy, Check } from 'lucide-react';
import { useStore } from '../../store';
import toast from 'react-hot-toast';
import clsx from 'clsx';

const FORMATS = [
  { key: 'css', label: 'CSS Variables', ext: '.css', desc: 'Ready-to-paste :root { ... } block' },
  { key: 'json', label: 'JSON Tokens', ext: '.json', desc: 'Design Token Community Group format' },
  { key: 'tailwind', label: 'Tailwind Config', ext: '.js', desc: 'tailwind.config.js extend block' },
];

export default function ExportPanel() {
  const { tokenId, tokens } = useStore();
  const [activeFormat, setActiveFormat] = useState('css');
  const [copied, setCopied] = useState(false);

  const generateCSS = () => {
    if (!tokens) return '';
    const { colors, typography, spacing, borderRadius, shadows } = tokens;
    return `:root {
  /* Colors */
${Object.entries(colors || {}).filter(([k]) => k !== 'allExtracted').map(([k, v]) => `  --color-${k}: ${v};`).join('\n')}

  /* Typography */
  --font-heading: '${typography?.headingFont}', serif;
  --font-body: '${typography?.bodyFont}', sans-serif;
  --font-mono: '${typography?.monoFont}', monospace;
${Object.entries(typography?.sizes || {}).map(([k, v]) => `  --text-${k}: ${v}px;`).join('\n')}

  /* Spacing */
${Object.entries(spacing?.named || {}).map(([k, v]) => `  --spacing-${k}: ${v}px;`).join('\n')}

  /* Border Radius */
${Object.entries(borderRadius || {}).map(([k, v]) => `  --radius-${k}: ${v}px;`).join('\n')}

  /* Shadows */
${Object.entries(shadows || {}).map(([k, v]) => `  --shadow-${k}: ${v};`).join('\n')}
}`;
  };

  const generateJSON = () => {
    if (!tokens) return '{}';
    return JSON.stringify({
      "$schema": "https://design-tokens.github.io/community-group/format/",
      "color": Object.fromEntries(
        Object.entries(tokens.colors || {}).filter(([k]) => k !== 'allExtracted')
          .map(([k, v]) => [k, { "$value": v, "$type": "color" }])
      ),
      "typography": {
        "headingFont": { "$value": tokens.typography?.headingFont, "$type": "fontFamily" },
        "bodyFont": { "$value": tokens.typography?.bodyFont, "$type": "fontFamily" },
        "sizes": Object.fromEntries(Object.entries(tokens.typography?.sizes || {}).map(([k, v]) => [k, { "$value": `${v}px`, "$type": "dimension" }])),
      },
      "spacing": Object.fromEntries(Object.entries(tokens.spacing?.named || {}).map(([k, v]) => [k, { "$value": `${v}px`, "$type": "dimension" }])),
      "borderRadius": Object.fromEntries(Object.entries(tokens.borderRadius || {}).map(([k, v]) => [k, { "$value": `${v}px`, "$type": "dimension" }])),
    }, null, 2);
  };

  const generateTailwind = () => {
    if (!tokens) return '';
    const { colors, typography, spacing, borderRadius } = tokens;
    return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
${Object.entries(colors || {}).filter(([k]) => k !== 'allExtracted').map(([k, v]) => `        ${k}: '${v}',`).join('\n')}
      },
      fontFamily: {
        heading: ['${typography?.headingFont}', 'serif'],
        body: ['${typography?.bodyFont}', 'sans-serif'],
        mono: ['${typography?.monoFont}', 'monospace'],
      },
      fontSize: {
${Object.entries(typography?.sizes || {}).map(([k, v]) => `        '${k}': '${v}px',`).join('\n')}
      },
      spacing: {
${Object.entries(spacing?.named || {}).map(([k, v]) => `        '${k}': '${v}px',`).join('\n')}
      },
      borderRadius: {
${Object.entries(borderRadius || {}).map(([k, v]) => `        '${k}': '${v}px',`).join('\n')}
      },
    },
  },
};`;
  };

  const getContent = () => {
    if (activeFormat === 'css') return generateCSS();
    if (activeFormat === 'json') return generateJSON();
    return generateTailwind();
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(getContent());
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const fmt = FORMATS.find(f => f.key === activeFormat);
    const blob = new Blob([getContent()], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `stylesync-tokens${fmt.ext}`;
    a.click();
    toast.success(`Downloaded ${fmt.label}`);
  };

  const handleServerExport = () => {
    if (!tokenId) return;
    window.open(`/api/tokens/${tokenId}/export?format=${activeFormat}`, '_blank');
  };

  return (
    <div>
      <div className="mb-6">
        <h2 className="text-white text-xl font-display mb-1">Export Tokens</h2>
        <p className="text-ink-500 text-sm">Download your design tokens in multiple formats.</p>
      </div>

      {/* Format selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
        {FORMATS.map((fmt) => (
          <button
            key={fmt.key}
            onClick={() => setActiveFormat(fmt.key)}
            className={clsx(
              'text-left p-4 rounded-xl border transition-all',
              activeFormat === fmt.key
                ? 'border-electric bg-electric/10 text-white'
                : 'border-ink-700 bg-ink-900 text-ink-400 hover:border-ink-600 hover:text-ink-200'
            )}
          >
            <p className="font-semibold text-sm mb-1">{fmt.label}</p>
            <p className="text-xs opacity-70">{fmt.desc}</p>
            <span className="text-xs font-mono mt-2 inline-block opacity-50">{fmt.ext}</span>
          </button>
        ))}
      </div>

      {/* Code preview */}
      <div className="token-card mb-4">
        <div className="flex items-center justify-between mb-3">
          <span className="text-ink-500 text-xs font-mono">{FORMATS.find(f => f.key === activeFormat)?.label}</span>
          <div className="flex gap-2">
            <button onClick={handleCopy} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-ink-800 hover:bg-ink-700 text-ink-300 hover:text-white text-xs transition-all">
              {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
              {copied ? 'Copied!' : 'Copy'}
            </button>
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-electric hover:bg-electric/90 text-white text-xs transition-all">
              <Download size={12} />
              Download
            </button>
          </div>
        </div>
        <pre className="text-xs text-ink-300 font-mono overflow-auto max-h-96 bg-ink-950 rounded-lg p-4 leading-relaxed">
          <code>{getContent()}</code>
        </pre>
      </div>

      {/* Quick stats */}
      {tokens && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: 'Color Tokens', value: Object.keys(tokens.colors || {}).filter(k => k !== 'allExtracted').length },
            { label: 'Type Sizes', value: Object.keys(tokens.typography?.sizes || {}).length },
            { label: 'Spacing Steps', value: Object.keys(tokens.spacing?.named || {}).length },
            { label: 'Radius Steps', value: Object.keys(tokens.borderRadius || {}).length },
          ].map((s) => (
            <div key={s.label} className="token-card text-center">
              <p className="text-2xl font-display text-white mb-1">{s.value}</p>
              <p className="text-ink-600 text-xs">{s.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
