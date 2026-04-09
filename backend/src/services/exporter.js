// ─── Generate CSS variables string ──────────────────────────
const generateCSSVariables = (tokens) => {
  const { colors, typography, spacing, borderRadius, shadows } = tokens;
  return `:root {
  /* Colors */
  --color-primary: ${colors.primary};
  --color-secondary: ${colors.secondary};
  --color-accent: ${colors.accent};
  --color-background: ${colors.background};
  --color-surface: ${colors.surface};
  --color-text: ${colors.text};
  --color-neutral: ${colors.neutral};
  --color-border: ${colors.border};
  --color-success: ${colors.success};
  --color-warning: ${colors.warning};
  --color-error: ${colors.error};

  /* Typography */
  --font-heading: '${typography.headingFont}', serif;
  --font-body: '${typography.bodyFont}', sans-serif;
  --font-mono: '${typography.monoFont}', monospace;
  --text-xs: ${typography.sizes.xs}px;
  --text-sm: ${typography.sizes.sm}px;
  --text-base: ${typography.sizes.base}px;
  --text-lg: ${typography.sizes.lg}px;
  --text-xl: ${typography.sizes.xl}px;
  --text-2xl: ${typography.sizes['2xl']}px;
  --text-3xl: ${typography.sizes['3xl']}px;
  --text-4xl: ${typography.sizes['4xl']}px;
  --text-5xl: ${typography.sizes['5xl']}px;

  /* Spacing */
  --spacing-xs: ${spacing.named.xs}px;
  --spacing-sm: ${spacing.named.sm}px;
  --spacing-md: ${spacing.named.md}px;
  --spacing-lg: ${spacing.named.lg}px;
  --spacing-xl: ${spacing.named.xl}px;
  --spacing-2xl: ${spacing.named['2xl']}px;
  --spacing-3xl: ${spacing.named['3xl']}px;

  /* Border Radius */
  --radius-sm: ${borderRadius.sm}px;
  --radius-base: ${borderRadius.base}px;
  --radius-md: ${borderRadius.md}px;
  --radius-lg: ${borderRadius.lg}px;
  --radius-xl: ${borderRadius.xl}px;
  --radius-full: ${borderRadius.full}px;

  /* Shadows */
  --shadow-sm: ${shadows.sm};
  --shadow-base: ${shadows.base};
  --shadow-md: ${shadows.md};
  --shadow-lg: ${shadows.lg};
  --shadow-xl: ${shadows.xl};
}`;
};

// ─── Generate Tailwind config ────────────────────────────────
const generateTailwindConfig = (tokens) => {
  const { colors, typography, spacing, borderRadius } = tokens;
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        primary: '${colors.primary}',
        secondary: '${colors.secondary}',
        accent: '${colors.accent}',
        background: '${colors.background}',
        surface: '${colors.surface}',
        foreground: '${colors.text}',
        neutral: '${colors.neutral}',
        border: '${colors.border}',
        success: '${colors.success}',
        warning: '${colors.warning}',
        error: '${colors.error}',
      },
      fontFamily: {
        heading: ['${typography.headingFont}', 'serif'],
        body: ['${typography.bodyFont}', 'sans-serif'],
        mono: ['${typography.monoFont}', 'monospace'],
      },
      fontSize: {
        xs: '${typography.sizes.xs}px',
        sm: '${typography.sizes.sm}px',
        base: '${typography.sizes.base}px',
        lg: '${typography.sizes.lg}px',
        xl: '${typography.sizes.xl}px',
        '2xl': '${typography.sizes['2xl']}px',
        '3xl': '${typography.sizes['3xl']}px',
        '4xl': '${typography.sizes['4xl']}px',
        '5xl': '${typography.sizes['5xl']}px',
      },
      borderRadius: {
        sm: '${borderRadius.sm}px',
        DEFAULT: '${borderRadius.base}px',
        md: '${borderRadius.md}px',
        lg: '${borderRadius.lg}px',
        xl: '${borderRadius.xl}px',
        full: '${borderRadius.full}px',
      },
    },
  },
};`;
};

// ─── Generate JSON tokens ────────────────────────────────────
const generateJSONTokens = (tokens) => {
  return JSON.stringify({
    "$schema": "https://design-tokens.github.io/community-group/format/",
    "version": "1.0.0",
    "color": Object.fromEntries(
      Object.entries(tokens.colors)
        .filter(([k]) => k !== 'allExtracted')
        .map(([k, v]) => [k, { "$value": v, "$type": "color" }])
    ),
    "typography": {
      "headingFont": { "$value": tokens.typography.headingFont, "$type": "fontFamily" },
      "bodyFont": { "$value": tokens.typography.bodyFont, "$type": "fontFamily" },
      "baseSize": { "$value": `${tokens.typography.baseSize}px`, "$type": "dimension" },
    },
    "spacing": Object.fromEntries(
      Object.entries(tokens.spacing.named).map(([k, v]) => [k, { "$value": `${v}px`, "$type": "dimension" }])
    ),
    "borderRadius": Object.fromEntries(
      Object.entries(tokens.borderRadius).map(([k, v]) => [k, { "$value": `${v}px`, "$type": "dimension" }])
    ),
  }, null, 2);
};

module.exports = { generateCSSVariables, generateTailwindConfig, generateJSONTokens };
