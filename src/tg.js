// Telegram Bot API va Mini App initData tekshiruvi (bir nechta bot uchun)
const crypto = require('crypto');

function createBot(token) {
  const API = `https://api.telegram.org/bot${token}`;

  async function call(method, params = {}) {
    if (!token) return undefined;
    try {
      const res = await fetch(`${API}/${method}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      });
      const data = await res.json().catch(() => ({}));
      if (!data.ok) console.error(`TG ${method} xato:`, data.description || res.status);
      return data.result;
    } catch (e) {
      console.error(`TG ${method} tarmoq xatosi:`, e.message);
      return undefined;
    }
  }

  // https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app
  function verifyInitData(initData, maxAgeSec = 7 * 24 * 3600) {
    if (!initData || !token) return null;
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash || !/^[0-9a-f]{64}$/.test(hash)) return null;
    params.delete('hash');
    const dataCheck = [...params.entries()].map(([k, v]) => `${k}=${v}`).sort().join('\n');
    const secret = crypto.createHmac('sha256', 'WebAppData').update(token).digest();
    const calc = crypto.createHmac('sha256', secret).update(dataCheck).digest();
    if (!crypto.timingSafeEqual(calc, Buffer.from(hash, 'hex'))) return null;
    const authDate = Number(params.get('auth_date') || 0);
    if (Date.now() / 1000 - authDate > maxAgeSec) return null;
    try { return JSON.parse(params.get('user')); } catch { return null; }
  }

  return { call, verifyInitData, token };
}

const shop = createBot(process.env.BOT_TOKEN || '');
// Admin bot bo'lmasa — hammasi asosiy bot orqali ishlaydi
const admin = process.env.ADMIN_BOT_TOKEN ? createBot(process.env.ADMIN_BOT_TOKEN) : shop;

module.exports = { shop, admin, hasAdminBot: Boolean(process.env.ADMIN_BOT_TOKEN), TOKEN: shop.token };
