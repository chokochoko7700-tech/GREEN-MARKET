const crypto = require('crypto');

const PUBLIC_URL = (process.env.PUBLIC_URL || process.env.RENDER_EXTERNAL_URL || 'http://localhost:3000').replace(/\/$/, '');

// Har deploy'da yangi versiya => mijozlarda ilova o'zi yangilanadi
const VERSION = (process.env.RENDER_GIT_COMMIT || '').slice(0, 10) || String(Date.now());

const ADMIN_IDS = new Set(
  String(process.env.ADMIN_IDS || '').split(/[,\s]+/).filter(Boolean).map(Number)
);

const secretOf = (label, token) =>
  crypto.createHash('sha256').update(`gm-${label}:` + (token || '')).digest('hex').slice(0, 32);

module.exports = {
  PORT: Number(process.env.PORT || 3000),
  PUBLIC_URL,
  VERSION,
  ADMIN_IDS,
  WEBHOOK_SECRET: process.env.WEBHOOK_SECRET || secretOf('webhook', process.env.BOT_TOKEN),
  ADMIN_WEBHOOK_SECRET: secretOf('admin-webhook', process.env.ADMIN_BOT_TOKEN),
  webAppUrl: (hash = '') => `${PUBLIC_URL}/?v=${VERSION}${hash}`,
  adminAppUrl: () => `${PUBLIC_URL}/admin?v=${VERSION}`,
  isAdmin: (id) => ADMIN_IDS.has(Number(id)),
};
