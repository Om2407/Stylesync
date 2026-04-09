import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';

const API = import.meta.env.VITE_API_URL || '/api';

export const useStore = create(
  persist(
    (set, get) => ({
      // ─── State ─────────────────────────────────────────
      sessionId: null,
      currentSite: null,
      tokenId: null,
      tokens: null,
      lockedTokens: {},  // { "colors.primary": true, ... }
      versionHistory: [],
      isLoading: false,
      isScraping: false,
      error: null,
      recentSites: [],

      // ─── Actions ────────────────────────────────────────
      setSessionId: (id) => set({ sessionId: id }),

      scrape: async (url) => {
        set({ isScraping: true, error: null });
        try {
          const sid = get().sessionId || crypto.randomUUID();
          const { data } = await axios.post(`${API}/scrape`, { url, sessionId: sid });
          set({
            sessionId: sid,
            currentSite: { id: data.siteId, url, title: data.title, faviconUrl: data.faviconUrl, usedFallback: data.usedFallback },
            tokenId: data.tokenId,
            tokens: data.tokens,
            lockedTokens: {},
            isScraping: false
          });
          get().fetchLockedTokens();
          return data;
        } catch (err) {
          set({ isScraping: false, error: err.response?.data?.error || 'Scraping failed' });
          throw err;
        }
      },

      updateToken: async (category, key, value) => {
        const { tokenId, tokens, sessionId, lockedTokens } = get();
        const lockKey = `${category}.${key}`;
        if (lockedTokens[lockKey]) return; // Don't update locked tokens

        const newTokens = {
          ...tokens,
          [category]: { ...tokens[category], [key]: value }
        };
        set({ tokens: newTokens });

        // Apply CSS variable instantly
        applyTokensToCSS(newTokens);

        // Debounced save
        clearTimeout(get()._saveTimeout);
        const timeout = setTimeout(async () => {
          try {
            await axios.put(`${API}/tokens/${tokenId}`, {
              [category]: newTokens[category],
              sessionId
            });
          } catch (e) { console.error('Save error', e); }
        }, 800);
        set({ _saveTimeout: timeout });
      },

      lockToken: async (category, key) => {
        const { tokenId, sessionId, tokens, lockedTokens } = get();
        const lockKey = `${category}.${key}`;
        const value = tokens?.[category]?.[key];
        try {
          await axios.post(`${API}/tokens/${tokenId}/lock`, { sessionId, category, key, value });
          set({ lockedTokens: { ...lockedTokens, [lockKey]: true } });
        } catch (e) { console.error('Lock error', e); }
      },

      unlockToken: async (category, key) => {
        const { tokenId, sessionId, lockedTokens } = get();
        const lockKey = `${category}.${key}`;
        try {
          await axios.delete(`${API}/tokens/${tokenId}/lock`, { data: { sessionId, category, key } });
          const updated = { ...lockedTokens };
          delete updated[lockKey];
          set({ lockedTokens: updated });
        } catch (e) { console.error('Unlock error', e); }
      },

      fetchLockedTokens: async () => {
        const { tokenId, sessionId } = get();
        if (!tokenId) return;
        try {
          const { data } = await axios.get(`${API}/tokens/${tokenId}/locked?sessionId=${sessionId}`);
          const lockMap = {};
          data.data.forEach(lt => { lockMap[`${lt.token_category}.${lt.token_key}`] = true; });
          set({ lockedTokens: lockMap });
        } catch {}
      },

      fetchVersionHistory: async () => {
        const { tokenId } = get();
        if (!tokenId) return;
        try {
          const { data } = await axios.get(`${API}/tokens/${tokenId}/history`);
          set({ versionHistory: data.data });
        } catch {}
      },

      restoreVersion: async (versionId) => {
        const { tokenId } = get();
        try {
          await axios.post(`${API}/tokens/${tokenId}/restore`, { versionId });
          const { data } = await axios.get(`${API}/tokens/${tokenId}`);
          const row = data.data;
          const tokens = {
            colors: row.colors, typography: row.typography,
            spacing: row.spacing, shadows: row.shadows, borderRadius: row.border_radius
          };
          set({ tokens });
          applyTokensToCSS(tokens);
        } catch (e) { console.error('Restore error', e); }
      },

      fetchRecentSites: async () => {
        try {
          const { data } = await axios.get(`${API}/recent`);
          set({ recentSites: data.data });
        } catch {}
      },

      loadSite: (tokenId, tokens, site) => {
        set({ tokenId, tokens, currentSite: site });
        applyTokensToCSS(tokens);
      },

      applyTokensToDOM: () => {
        const { tokens } = get();
        if (tokens) applyTokensToCSS(tokens);
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: 'stylesync-store',
      partialize: (s) => ({ sessionId: s.sessionId, recentSites: s.recentSites }),
    }
  )
);

// ─── Apply tokens to CSS custom properties ─────────────────
export const applyTokensToCSS = (tokens) => {
  if (!tokens) return;
  const root = document.documentElement;
  const { colors, typography, spacing, borderRadius, shadows } = tokens;

  if (colors) {
    const colorMap = { primary: '--color-primary', secondary: '--color-secondary', accent: '--color-accent', background: '--color-background', surface: '--color-surface', text: '--color-text', neutral: '--color-neutral', border: '--color-border', success: '--color-success', warning: '--color-warning', error: '--color-error' };
    Object.entries(colorMap).forEach(([key, cssVar]) => { if (colors[key]) root.style.setProperty(cssVar, colors[key]); });
  }
  if (typography) {
    root.style.setProperty('--font-heading', `"${typography.headingFont}", serif`);
    root.style.setProperty('--font-body', `"${typography.bodyFont}", sans-serif`);
    if (typography.sizes?.base) root.style.setProperty('--text-base', `${typography.sizes.base}px`);
  }
  if (spacing?.named?.md) root.style.setProperty('--spacing-md', `${spacing.named.md}px`);
  if (borderRadius?.base) root.style.setProperty('--radius-base', `${borderRadius.base}px`);
  if (shadows?.md) root.style.setProperty('--shadow-md', shadows.md);
};
