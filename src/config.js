const crypto = require('crypto');

const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000').replace(/\/$/, '');

// Har deploy'da yangi versiya => mijozlarda ilova o'zi yangilanadi
const VERSION = (process.env.RENDER_GIT_COMMIT || '').slice(0, 10) || String(Date.now());

const ADMIN_IDS = new Set(
  String(process.env.ADMIN_IDS || '').split(/[,\s]+/).filter(Boolean).map(Number)
);

const WEBHOOK_SECRET =
  process.env.WEBHOOK_SECRET ||
  crypto.createHash('sha256').update('gm-webhook:' + (process.env.BOT_TOKEN || '')).digest('hex').slice(0, 32);

module.exports = {
  PORT: Number(process.env.PORT || 3000),
  PUBLIC_URL,
  VERSION,
  ADMIN_IDS,
  WEBHOOK_SECRET,
  webAppUrl: (hash = '') => `${PUBLIC_URL}/?v=${VERSION}${hash}`,
  isAdmin: (id) => ADMIN_IDS.has(Number(id)),
};
