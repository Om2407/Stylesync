const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

const initDB = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS scraped_sites (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        url TEXT NOT NULL,
        raw_html_snapshot TEXT,
        timestamp TIMESTAMPTZ DEFAULT NOW(),
        extraction_status VARCHAR(50) DEFAULT 'pending',
        title TEXT,
        favicon_url TEXT,
        screenshot_url TEXT
      );

      CREATE TABLE IF NOT EXISTS design_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        site_id UUID REFERENCES scraped_sites(id) ON DELETE CASCADE,
        session_id VARCHAR(255),
        colors JSONB DEFAULT '{}',
        typography JSONB DEFAULT '{}',
        spacing JSONB DEFAULT '{}',
        shadows JSONB DEFAULT '{}',
        border_radius JSONB DEFAULT '{}',
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS locked_tokens (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token_id UUID REFERENCES design_tokens(id) ON DELETE CASCADE,
        session_id VARCHAR(255),
        token_category VARCHAR(100),
        token_key VARCHAR(255),
        locked_value TEXT,
        locked_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS version_history (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        token_id UUID REFERENCES design_tokens(id) ON DELETE CASCADE,
        session_id VARCHAR(255),
        version_number INTEGER DEFAULT 1,
        snapshot JSONB NOT NULL,
        change_description TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_design_tokens_session ON design_tokens(session_id);
      CREATE INDEX IF NOT EXISTS idx_locked_tokens_session ON locked_tokens(session_id);
      CREATE INDEX IF NOT EXISTS idx_version_history_token ON version_history(token_id);
    `);
    console.log('✅ Database initialized successfully');
  } catch (err) {
    console.error('❌ Database init error:', err);
    throw err;
  } finally {
    client.release();
  }
};

module.exports = { pool, initDB };
