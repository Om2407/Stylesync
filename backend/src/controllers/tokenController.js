const { v4: uuidv4 } = require('uuid');
const { pool } = require('../db');
const { scrapeWebsite } = require('../services/scraper');

// ─── POST /api/scrape ─────────────────────────────────────
const scrapeURL = async (req, res) => {
  const { url, sessionId } = req.body;

  if (!url) return res.status(400).json({ error: 'URL is required' });

  let parsedUrl;
  try {
    parsedUrl = new URL(url.startsWith('http') ? url : `https://${url}`);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const sid = sessionId || uuidv4();
  const client = await pool.connect();

  try {
    // Insert site record
    const siteRes = await client.query(
      `INSERT INTO scraped_sites (url, extraction_status) VALUES ($1, 'processing') RETURNING id`,
      [parsedUrl.href]
    );
    const siteId = siteRes.rows[0].id;

    // Scrape
    const extracted = await scrapeWebsite(parsedUrl.href);

    // Update site
    await client.query(
      `UPDATE scraped_sites SET extraction_status = $1, title = $2, favicon_url = $3 WHERE id = $4`,
      ['completed', extracted.title, extracted.faviconUrl, siteId]
    );

    // Insert tokens
    const tokenRes = await client.query(
      `INSERT INTO design_tokens (site_id, session_id, colors, typography, spacing, shadows, border_radius)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        siteId, sid,
        JSON.stringify(extracted.colors),
        JSON.stringify(extracted.typography),
        JSON.stringify(extracted.spacing),
        JSON.stringify(extracted.shadows),
        JSON.stringify(extracted.borderRadius)
      ]
    );
    const tokenId = tokenRes.rows[0].id;

    // Save initial version
    await client.query(
      `INSERT INTO version_history (token_id, session_id, version_number, snapshot, change_description)
       VALUES ($1, $2, 1, $3, 'Initial extraction')`,
      [tokenId, sid, JSON.stringify(extracted)]
    );

    return res.json({
      success: true,
      siteId,
      tokenId,
      sessionId: sid,
      usedFallback: extracted.usedFallback,
      title: extracted.title,
      faviconUrl: extracted.faviconUrl,
      tokens: {
        colors: extracted.colors,
        typography: extracted.typography,
        spacing: extracted.spacing,
        shadows: extracted.shadows,
        borderRadius: extracted.borderRadius
      }
    });

  } catch (err) {
    console.error('Scrape error:', err);
    await client.query(`UPDATE scraped_sites SET extraction_status = 'failed' WHERE id = (SELECT id FROM scraped_sites ORDER BY timestamp DESC LIMIT 1)`).catch(() => {});
    return res.status(500).json({ error: 'Scraping failed', message: err.message });
  } finally {
    client.release();
  }
};

// ─── GET /api/tokens/:tokenId ──────────────────────────────
const getTokens = async (req, res) => {
  const { tokenId } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT dt.*, ss.url, ss.title, ss.favicon_url FROM design_tokens dt
       JOIN scraped_sites ss ON dt.site_id = ss.id WHERE dt.id = $1`,
      [tokenId]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Token not found' });
    return res.json({ success: true, data: result.rows[0] });
  } finally {
    client.release();
  }
};

// ─── PUT /api/tokens/:tokenId ──────────────────────────────
const updateTokens = async (req, res) => {
  const { tokenId } = req.params;
  const { colors, typography, spacing, shadows, borderRadius, sessionId } = req.body;
  const client = await pool.connect();
  try {
    // Get current for version history
    const current = await client.query('SELECT * FROM design_tokens WHERE id = $1', [tokenId]);
    if (!current.rows.length) return res.status(404).json({ error: 'Token not found' });

    const versionCount = await client.query('SELECT COUNT(*) FROM version_history WHERE token_id = $1', [tokenId]);
    const nextVersion = parseInt(versionCount.rows[0].count) + 1;

    // Save version snapshot
    await client.query(
      `INSERT INTO version_history (token_id, session_id, version_number, snapshot, change_description)
       VALUES ($1, $2, $3, $4, $5)`,
      [tokenId, sessionId, nextVersion, JSON.stringify(current.rows[0]), `Version ${nextVersion}`]
    );

    // Update tokens
    const updates = [];
    const vals = [];
    let idx = 1;
    if (colors) { updates.push(`colors = $${idx++}`); vals.push(JSON.stringify(colors)); }
    if (typography) { updates.push(`typography = $${idx++}`); vals.push(JSON.stringify(typography)); }
    if (spacing) { updates.push(`spacing = $${idx++}`); vals.push(JSON.stringify(spacing)); }
    if (shadows) { updates.push(`shadows = $${idx++}`); vals.push(JSON.stringify(shadows)); }
    if (borderRadius) { updates.push(`border_radius = $${idx++}`); vals.push(JSON.stringify(borderRadius)); }
    updates.push(`updated_at = NOW()`);

    vals.push(tokenId);
    await client.query(`UPDATE design_tokens SET ${updates.join(', ')} WHERE id = $${idx}`, vals);

    return res.json({ success: true, message: 'Tokens updated' });
  } finally {
    client.release();
  }
};

// ─── POST /api/tokens/:tokenId/lock ───────────────────────
const lockToken = async (req, res) => {
  const { tokenId } = req.params;
  const { sessionId, category, key, value } = req.body;
  const client = await pool.connect();
  try {
    // Upsert locked token
    await client.query(
      `INSERT INTO locked_tokens (token_id, session_id, token_category, token_key, locked_value)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT DO NOTHING`,
      [tokenId, sessionId, category, key, value]
    );
    return res.json({ success: true, message: 'Token locked' });
  } finally {
    client.release();
  }
};

// ─── DELETE /api/tokens/:tokenId/lock ─────────────────────
const unlockToken = async (req, res) => {
  const { tokenId } = req.params;
  const { sessionId, category, key } = req.body;
  const client = await pool.connect();
  try {
    await client.query(
      `DELETE FROM locked_tokens WHERE token_id = $1 AND session_id = $2 AND token_category = $3 AND token_key = $4`,
      [tokenId, sessionId, category, key]
    );
    return res.json({ success: true, message: 'Token unlocked' });
  } finally {
    client.release();
  }
};

// ─── GET /api/tokens/:tokenId/locked ──────────────────────
const getLockedTokens = async (req, res) => {
  const { tokenId } = req.params;
  const { sessionId } = req.query;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM locked_tokens WHERE token_id = $1 AND session_id = $2`,
      [tokenId, sessionId]
    );
    return res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
};

// ─── GET /api/tokens/:tokenId/history ─────────────────────
const getVersionHistory = async (req, res) => {
  const { tokenId } = req.params;
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT * FROM version_history WHERE token_id = $1 ORDER BY version_number DESC`,
      [tokenId]
    );
    return res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
};

// ─── POST /api/tokens/:tokenId/restore ────────────────────
const restoreVersion = async (req, res) => {
  const { tokenId } = req.params;
  const { versionId } = req.body;
  const client = await pool.connect();
  try {
    const version = await client.query('SELECT * FROM version_history WHERE id = $1', [versionId]);
    if (!version.rows.length) return res.status(404).json({ error: 'Version not found' });

    const snapshot = version.rows[0].snapshot;
    await client.query(
      `UPDATE design_tokens SET colors = $1, typography = $2, spacing = $3, shadows = $4, border_radius = $5, updated_at = NOW() WHERE id = $6`,
      [JSON.stringify(snapshot.colors), JSON.stringify(snapshot.typography), JSON.stringify(snapshot.spacing), JSON.stringify(snapshot.shadows), JSON.stringify(snapshot.borderRadius), tokenId]
    );
    return res.json({ success: true, message: 'Version restored' });
  } finally {
    client.release();
  }
};

// ─── GET /api/recent ──────────────────────────────────────
const getRecentSites = async (req, res) => {
  const client = await pool.connect();
  try {
    const result = await client.query(
      `SELECT ss.id, ss.url, ss.title, ss.favicon_url, ss.timestamp, dt.id as token_id
       FROM scraped_sites ss
       JOIN design_tokens dt ON ss.id = dt.site_id
       WHERE ss.extraction_status = 'completed'
       ORDER BY ss.timestamp DESC LIMIT 10`
    );
    return res.json({ success: true, data: result.rows });
  } finally {
    client.release();
  }
};

module.exports = {
  scrapeURL, getTokens, updateTokens,
  lockToken, unlockToken, getLockedTokens,
  getVersionHistory, restoreVersion, getRecentSites
};
