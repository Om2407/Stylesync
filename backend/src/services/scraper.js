const axios = require('axios');
const cheerio = require('cheerio');
const color = require('color');

// ─── Utility: hex validation ───────────────────────────────
const isValidHex = (str) => /^#([0-9A-Fa-f]{3}){1,2}$/.test(str);

const rgbToHex = (r, g, b) => {
  return '#' + [r, g, b].map(x => {
    const hex = Math.round(x).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  }).join('');
};

// ─── Parse CSS color values to hex ────────────────────────
const parseColorToHex = (colorStr) => {
  if (!colorStr || colorStr === 'transparent' || colorStr === 'inherit' || colorStr === 'initial') return null;
  try {
    const c = color(colorStr);
    if (c.alpha() < 0.1) return null;
    return c.hex().toLowerCase();
  } catch {
    return null;
  }
};

// ─── Extract colors from CSS text ─────────────────────────
const extractColorsFromCSS = (cssText) => {
  const colors = new Set();
  const hexPattern = /#([0-9A-Fa-f]{3,8})\b/g;
  const rgbPattern = /rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/g;
  const hslPattern = /hsla?\(\s*(\d+)\s*,\s*(\d+)%\s*,\s*(\d+)%/g;

  let match;
  while ((match = hexPattern.exec(cssText)) !== null) {
    const hex = '#' + match[1];
    if (isValidHex(hex.length === 4 ? hex : hex)) {
      try {
        colors.add(color(hex).hex().toLowerCase());
      } catch {}
    }
  }
  while ((match = rgbPattern.exec(cssText)) !== null) {
    try {
      colors.add(rgbToHex(+match[1], +match[2], +match[3]).toLowerCase());
    } catch {}
  }
  while ((match = hslPattern.exec(cssText)) !== null) {
    try {
      colors.add(color(`hsl(${match[1]}, ${match[2]}%, ${match[3]}%)`).hex().toLowerCase());
    } catch {}
  }
  return [...colors].filter(c => c !== '#000000' || colors.size < 3);
};

// ─── Cluster colors into palette ──────────────────────────
const clusterColors = (hexColors) => {
  if (!hexColors.length) return { primary: '#1a1a2e', secondary: '#16213e', accent: '#0f3460', background: '#ffffff', text: '#1a1a1a', neutral: '#6b7280' };

  const colorObjects = hexColors.map(h => {
    try { return { hex: h, hsl: color(h).hsl().object() }; } catch { return null; }
  }).filter(Boolean);

  // Sort by saturation desc
  colorObjects.sort((a, b) => b.hsl.s - a.hsl.s);

  const vibrant = colorObjects.find(c => c.hsl.s > 30 && c.hsl.l > 20 && c.hsl.l < 80);
  const dark = colorObjects.find(c => c.hsl.l < 25);
  const light = colorObjects.find(c => c.hsl.l > 85);
  const mid = colorObjects.find(c => c.hsl.l >= 25 && c.hsl.l <= 85 && c.hsl.s > 10);

  return {
    primary: vibrant?.hex || colorObjects[0]?.hex || '#3b82f6',
    secondary: mid?.hex || colorObjects[1]?.hex || '#6366f1',
    accent: colorObjects.find(c => c !== vibrant && c.hsl.s > 40)?.hex || '#f59e0b',
    background: light?.hex || '#ffffff',
    text: dark?.hex || '#111827',
    neutral: '#9ca3af',
    surface: light ? colorObjects.find(c => c.hsl.l > 90 && c !== light)?.hex || '#f9fafb' : '#f3f4f6',
    border: '#e5e7eb',
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    allExtracted: hexColors.slice(0, 20)
  };
};

// ─── Extract typography ────────────────────────────────────
const extractTypography = ($) => {
  const fonts = new Set();
  const sizes = new Set();
  const weights = new Set();

  // From link tags (Google Fonts)
  $('link[href*="fonts.googleapis.com"]').each((_, el) => {
    const href = $(el).attr('href') || '';
    const familyMatch = href.match(/family=([^&:]+)/);
    if (familyMatch) {
      familyMatch[1].split('|').forEach(f => fonts.add(decodeURIComponent(f.split(':')[0].replace(/\+/g, ' '))));
    }
  });

  // From style tags
  $('style').each((_, el) => {
    const css = $(el).text();
    const fontFamilyMatches = css.matchAll(/font-family\s*:\s*([^;}{]+)/gi);
    for (const m of fontFamilyMatches) {
      const families = m[1].split(',').map(f => f.trim().replace(/['"]/g, ''));
      families.forEach(f => {
        if (f && !['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'inherit', 'initial'].includes(f.toLowerCase())) {
          fonts.add(f);
        }
      });
    }
    const fontSizeMatches = css.matchAll(/font-size\s*:\s*([\d.]+)(px|rem|em)/gi);
    for (const m of fontSizeMatches) {
      const px = m[2] === 'rem' ? parseFloat(m[1]) * 16 : m[2] === 'em' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
      if (px >= 10 && px <= 100) sizes.add(Math.round(px));
    }
    const fontWeightMatches = css.matchAll(/font-weight\s*:\s*(\d{3}|bold|normal)/gi);
    for (const m of fontWeightMatches) {
      const w = m[1] === 'bold' ? '700' : m[1] === 'normal' ? '400' : m[1];
      weights.add(w);
    }
  });

  // From meta font hints
  $('meta[name="font"], [class*="font"]').each((_, el) => {
    const cls = $(el).attr('class') || '';
    const match = cls.match(/font-([a-z-]+)/i);
    if (match) fonts.add(match[1]);
  });

  const sizeArray = [...sizes].sort((a, b) => a - b);
  const headingFont = [...fonts][0] || 'Georgia';
  const bodyFont = [...fonts][1] || [...fonts][0] || 'system-ui';

  return {
    headingFont,
    bodyFont,
    monoFont: 'ui-monospace',
    baseSize: sizeArray[Math.floor(sizeArray.length / 2)] || 16,
    scaleRatio: 1.25,
    sizes: {
      xs: Math.round((sizeArray[0] || 12)),
      sm: Math.round((sizeArray[1] || 14)),
      base: Math.round((sizeArray[Math.floor(sizeArray.length / 2)] || 16)),
      lg: Math.round((sizeArray[Math.floor(sizeArray.length * 0.7)] || 18)),
      xl: Math.round((sizeArray[Math.floor(sizeArray.length * 0.8)] || 20)),
      '2xl': Math.round((sizeArray[Math.floor(sizeArray.length * 0.9)] || 24)),
      '3xl': Math.round((sizeArray[sizeArray.length - 2] || 30)),
      '4xl': Math.round((sizeArray[sizeArray.length - 1] || 36)),
      '5xl': 48,
    },
    weights: [...weights].length ? [...weights].map(Number).sort() : [300, 400, 500, 600, 700],
    lineHeights: { tight: 1.25, base: 1.5, relaxed: 1.75 }
  };
};

// ─── Extract spacing ───────────────────────────────────────
const extractSpacing = ($) => {
  const spacingValues = new Set();
  $('style').each((_, el) => {
    const css = $(el).text();
    const spacingMatches = css.matchAll(/(?:margin|padding|gap)\s*:\s*([\d.]+)px/gi);
    for (const m of spacingMatches) {
      const v = parseFloat(m[1]);
      if (v > 0 && v <= 128) spacingValues.add(v);
    }
  });

  const vals = [...spacingValues].sort((a, b) => a - b);
  const unit = vals[0] || 4;
  const roundedUnit = [2, 4, 8].find(u => unit <= u * 1.5) || 4;

  return {
    unit: roundedUnit,
    scale: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24],
    named: {
      xs: roundedUnit,
      sm: roundedUnit * 2,
      md: roundedUnit * 4,
      lg: roundedUnit * 6,
      xl: roundedUnit * 8,
      '2xl': roundedUnit * 12,
      '3xl': roundedUnit * 16,
    }
  };
};

// ─── Extract border radius ─────────────────────────────────
const extractBorderRadius = ($) => {
  const radii = new Set();
  $('style').each((_, el) => {
    const css = $(el).text();
    const matches = css.matchAll(/border-radius\s*:\s*([\d.]+)(px|rem|%)/gi);
    for (const m of matches) {
      const px = m[2] === 'rem' ? parseFloat(m[1]) * 16 : parseFloat(m[1]);
      if (px >= 0 && px <= 50) radii.add(Math.round(px));
    }
  });
  const vals = [...radii].sort((a, b) => a - b);
  const base = vals[0] || 4;
  return { none: 0, sm: base, base: base * 2, md: base * 3, lg: base * 4, xl: base * 6, full: 9999 };
};

// ─── Main scrape function ──────────────────────────────────
const scrapeWebsite = async (url) => {
  let html = '';
  let usedFallback = false;

  try {
    const response = await axios.get(url, {
      timeout: 12000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.5',
      },
      maxRedirects: 5
    });
    html = response.data;
  } catch (err) {
    usedFallback = true;
    console.warn(`⚠️ Could not fetch ${url}: ${err.message}. Using heuristic fallback.`);
  }

  if (!html) {
    return generateFallbackTokens(url);
  }

  const $ = cheerio.load(html);

  // Get all CSS text from style tags
  let allCSSText = '';
  $('style').each((_, el) => { allCSSText += $(el).text() + '\n'; });

  // Get inline styles
  $('[style]').each((_, el) => { allCSSText += $(el).attr('style') + '\n'; });

  const rawColors = extractColorsFromCSS(allCSSText);
  const palette = clusterColors(rawColors);
  const typography = extractTypography($);
  const spacing = extractSpacing($);
  const borderRadius = extractBorderRadius($);

  const title = $('title').text().trim() || new URL(url).hostname;
  const description = $('meta[name="description"]').attr('content') || '';
  const faviconEl = $('link[rel="icon"], link[rel="shortcut icon"]').first();
  const faviconUrl = faviconEl.attr('href') ? new URL(faviconEl.attr('href'), url).href : null;

  return {
    title,
    description,
    faviconUrl,
    usedFallback,
    colors: palette,
    typography,
    spacing,
    borderRadius,
    shadows: {
      sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
      base: '0 1px 3px 0 rgba(0,0,0,0.1), 0 1px 2px -1px rgba(0,0,0,0.1)',
      md: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
      lg: '0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -4px rgba(0,0,0,0.1)',
      xl: '0 20px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
    }
  };
};

// ─── Fallback tokens when scraping fails ──────────────────
const generateFallbackTokens = (url) => {
  const hostname = (() => { try { return new URL(url).hostname; } catch { return url; } })();
  const hash = [...hostname].reduce((a, c) => a + c.charCodeAt(0), 0);
  const hue = hash % 360;

  try {
    const primary = color({ h: hue, s: 65, l: 45 }).hex();
    const secondary = color({ h: (hue + 30) % 360, s: 55, l: 55 }).hex();
    const accent = color({ h: (hue + 180) % 360, s: 75, l: 50 }).hex();

    return {
      title: hostname,
      description: '',
      faviconUrl: null,
      usedFallback: true,
      colors: {
        primary, secondary, accent,
        background: '#ffffff', text: '#111827', neutral: '#9ca3af',
        surface: '#f9fafb', border: '#e5e7eb',
        success: '#10b981', warning: '#f59e0b', error: '#ef4444',
        allExtracted: [primary, secondary, accent]
      },
      typography: {
        headingFont: 'Georgia', bodyFont: 'system-ui', monoFont: 'ui-monospace',
        baseSize: 16, scaleRatio: 1.25,
        sizes: { xs: 12, sm: 14, base: 16, lg: 18, xl: 20, '2xl': 24, '3xl': 30, '4xl': 36, '5xl': 48 },
        weights: [400, 500, 600, 700],
        lineHeights: { tight: 1.25, base: 1.5, relaxed: 1.75 }
      },
      spacing: {
        unit: 4, scale: [0, 0.5, 1, 1.5, 2, 3, 4, 5, 6, 8, 10, 12, 16, 20, 24],
        named: { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, '2xl': 48, '3xl': 64 }
      },
      borderRadius: { none: 0, sm: 2, base: 4, md: 6, lg: 8, xl: 12, full: 9999 },
      shadows: {
        sm: '0 1px 2px 0 rgba(0,0,0,0.05)',
        base: '0 1px 3px 0 rgba(0,0,0,0.1)',
        md: '0 4px 6px -1px rgba(0,0,0,0.1)',
        lg: '0 10px 15px -3px rgba(0,0,0,0.1)',
        xl: '0 20px 25px -5px rgba(0,0,0,0.1)',
      }
    };
  } catch {
    return generateFallbackTokens('fallback.com');
  }
};

module.exports = { scrapeWebsite };
