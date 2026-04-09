const { pool } = require('../db');
const { generateCSSVariables, generateTailwindConfig, generateJSONTokens } = require('../services/exporter');

const exportTokens = async (req, res) => {
  const { tokenId } = req.params;
  const { format = 'css' } = req.query;
  const client = await pool.connect();

  try {
    const result = await client.query('SELECT * FROM design_tokens WHERE id = $1', [tokenId]);
    if (!result.rows.length) return res.status(404).json({ error: 'Tokens not found' });

    const row = result.rows[0];
    const tokens = {
      colors: row.colors,
      typography: row.typography,
      spacing: row.spacing,
      shadows: row.shadows,
      borderRadius: row.border_radius
    };

    let output, contentType, filename;

    switch (format) {
      case 'css':
        output = generateCSSVariables(tokens);
        contentType = 'text/css';
        filename = 'tokens.css';
        break;
      case 'tailwind':
        output = generateTailwindConfig(tokens);
        contentType = 'text/javascript';
        filename = 'tailwind.config.js';
        break;
      case 'json':
      default:
        output = generateJSONTokens(tokens);
        contentType = 'application/json';
        filename = 'tokens.json';
    }

    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.setHeader('Content-Type', contentType);
    return res.send(output);
  } finally {
    client.release();
  }
};

module.exports = { exportTokens };
