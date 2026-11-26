// GREEN MARKET — server (Telegram bot + Mini App + API). Tashqi kutubxona yo'q.
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const cfg = require('./src/config');
const db = require('./src/db');
const tg = require('./src/tg');
const bot = require('./src/bot');
const orders = require('./src/orders');

const PUBLIC_DIR = path.join(__dirname, 'public');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png',
  '.jpg': 'image/jpeg', '.webp': 'image/webp', '.ico': 'image/x-icon', '.json': 'application/json',
};

// index.html ichiga versiya qo'yiladi => brauzer eski faylni ushlab qolmaydi
let indexHtml = null;
function getIndex() {
  if (!indexHtml) {
    indexHtml = fs.readFileSync(path.join(PUBLIC_DIR, 'index.html'), 'utf8').replace(/__VERSION__/g, cfg.VERSION);
  }
  return indexHtml;
}

function json(res, code, data) {
  res.writeHead(code, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(data));
}

function readBody(req, limit = 6 * 1024 * 1024) {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks = [];
    req.on('data', (c) => {
      size += c.length;
      if (size > limit) { reject(new Error('Juda katta')); req.destroy(); }
      else chunks.push(c);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try { resolve(JSON.parse(raw)); } catch { reject(new Error('JSON noto\'g\'ri')); }
    });
    req.on('error', reject);
  });
}

function serveStatic(req, res, pathname) {
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': MIME['.html'], 'Cache-Control': 'no-store, max-age=0' });
    return res.end(getIndex());
  }
  const file = path.normalize(path.join(PUBLIC_DIR, pathname));
  if (!file.startsWith(PUBLIC_DIR)) { res.writeHead(403); return res.end(); }
  fs.readFile(file, (err, data) => {
    if (err) { res.writeHead(404); return res.end('Not found'); }
    const versioned = /[?&]v=/.test(req.url);
    res.writeHead(200, {
      'Content-Type': MIME[path.extname(file)] || 'application/octet-stream',
      'Cache-Control': versioned ? 'public, max-age=31536000, immutable' : 'no-cache',
    });
    res.end(data);
  });
}

// ---------- Auth ----------
async function auth(req) {
  const tgUser = tg.verifyInitData(req.headers['x-init-data']);
  if (!tgUser) { const e = new Error('Avtorizatsiya xato. Ilovani bot orqali oching.'); e.code = 401; throw e; }
  let user = await db.one('users', `id=eq.${tgUser.id}`);
  if (!user) {
    user = await db.insert('users', {
      id: tgUser.id,
      tg_name: [tgUser.first_name, tgUser.last_name].filter(Boolean).join(' '),
      username: tgUser.username || null,
      name: tgUser.first_name || null,
      lang: (tgUser.language_code || '').startsWith('ru') ? 'ru' : 'uz',
    });
  }
  if (user.blocked) { const e = new Error('Bloklangan'); e.code = 403; throw e; }
  user.is_admin = cfg.isAdmin(user.id);
  return user;
}

function requireAdmin(user) {
  if (!user.is_admin) { const e = new Error('Faqat admin uchun'); e.code = 403; throw e; }
}

const pick = (obj, keys) => Object.fromEntries(keys.filter((k) => obj[k] !== undefined).map((k) => [k, obj[k]]));

const ADMIN_TABLES = {
  products: ['category_id', 'name_uz', 'name_ru', 'desc_uz', 'desc_ru', 'image', 'unit', 'price', 'old_price', 'piece_kg', 'min_kg', 'coin_price', 'in_stock', 'sort', 'active'],
  categories: ['name_uz', 'name_ru', 'icon', 'sort', 'active'],
  banners: ['image', 'title', 'subtitle', 'link_type', 'link_id', 'sort', 'active'],
  faq: ['q_uz', 'a_uz', 'q_ru', 'a_ru', 'sort'],
};

async function loadSettings() {
  const rows = await db.select('settings', 'select=key,value');
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

async function saveImage(dataUrl, folder) {
  const m = /^data:(image\/(png|jpeg|webp));base64,(.+)$/.exec(String(dataUrl || ''));
  if (!m) throw new Error('Rasm formati noto\'g\'ri');
  const buf = Buffer.from(m[3], 'base64');
  if (buf.length > 3 * 1024 * 1024) throw new Error('Rasm 3 MB dan katta');
  const ext = m[2] === 'jpeg' ? 'jpg' : m[2];
  return db.upload(`${folder}/${Date.now()}-${crypto.randomBytes(4).toString('hex')}.${ext}`, buf, m[1]);
}

// ---------- API ----------
async function api(req, res, pathname, query) {
  const method = req.method;

  if (pathname === '/api/version') return json(res, 200, { version: cfg.VERSION });

  if (pathname === '/api/catalog' && method === 'GET') {
    const [categories, products, banners, faq, settings] = await Promise.all([
      db.select('categories', 'active=eq.true&order=sort.asc,id.asc'),
      db.select('products', 'active=eq.true&order=sort.asc,id.asc'),
      db.select('banners', 'active=eq.true&order=sort.asc,id.asc'),
      db.select('faq', 'order=sort.asc,id.asc'),
      loadSettings(),
    ]);
    return json(res, 200, { categories, products, banners, faq, settings, version: cfg.VERSION });
  }

  const user = await auth(req);

  if (pathname === '/api/me' && method === 'GET') return json(res, 200, user);

  if (pathname === '/api/me' && method === 'PATCH') {
    const b = await readBody(req);
    const patch = pick(b, ['name', 'phone', 'lat', 'lng', 'address', 'lang', 'theme']);
    if (patch.name !== undefined) patch.name = String(patch.name).trim().slice(0, 60) || null;
    if (patch.phone !== undefined) {
      const p = String(patch.phone).replace(/[^\d+]/g, '');
      if (!/^\+?\d{9,15}$/.test(p)) throw Object.assign(new Error('Telefon raqam noto\'g\'ri'), { code: 400 });
      patch.phone = p.startsWith('+') ? p : '+' + p;
    }
    if (patch.lang && !['uz', 'ru'].includes(patch.lang)) delete patch.lang;
    if (patch.theme && !['auto', 'light', 'dark'].includes(patch.theme)) delete patch.theme;
    if (patch.address !== undefined) patch.address = String(patch.address).slice(0, 200);
    if (b.avatar) patch.avatar = await saveImage(b.avatar, 'avatars');
    if (b.avatar === null) patch.avatar = null;
    const upd = await db.update('users', `id=eq.${user.id}`, patch);
    return json(res, 200, { ...upd, is_admin: user.is_admin });
  }

  if (pathname === '/api/orders' && method === 'GET') {
    const rows = await db.select('orders', `user_id=eq.${user.id}&order=created_at.desc&limit=50`);
    return json(res, 200, rows);
  }

  if (pathname === '/api/orders' && method === 'POST') {
    const b = await readBody(req);
    try {
      const order = await orders.create(user, b);
      return json(res, 200, order);
    } catch (e) {
      if (!e.code) e.code = 400;
      throw e;
    }
  }

  if (pathname === '/api/support' && method === 'POST') {
    const b = await readBody(req);
    const text = String(b.text || '').trim();
    if (!text) throw Object.assign(new Error('Xabar bo\'sh'), { code: 400 });
    await bot.forwardSupport(user, text);
    return json(res, 200, { ok: true });
  }

  // ---------- Admin ----------
  if (pathname.startsWith('/api/admin/')) {
    requireAdmin(user);
    const parts = pathname.split('/').filter(Boolean); // api, admin, x, id
    const [, , entity, id] = parts;

    if (entity === 'all' && method === 'GET') {
      const [categories, products, banners, faq, settings] = await Promise.all([
        db.select('categories', 'order=sort.asc,id.asc'),
        db.select('products', 'order=sort.asc,id.asc'),
        db.select('banners', 'order=sort.asc,id.asc'),
        db.select('faq', 'order=sort.asc,id.asc'),
        loadSettings(),
      ]);
      return json(res, 200, { categories, products, banners, faq, settings });
    }

    if (entity === 'orders' && method === 'GET') {
      const st = query.get('status');
      const filter = st && st !== 'all' ? `status=eq.${db.enc(st)}&` : '';
      return json(res, 200, await db.select('orders', `${filter}order=created_at.desc&limit=100`));
    }
    if (entity === 'orders' && method === 'PATCH' && id) {
      const b = await readBody(req);
      return json(res, 200, await orders.setStatus(id, String(b.status)));
    }

    if (entity === 'stats' && method === 'GET') {
      const since = new Date(); since.setHours(0, 0, 0, 0);
      const today = await db.select('orders', `created_at=gte.${since.toISOString()}&status=neq.cancelled&select=total`);
      const users = await db.select('users', 'select=id');
      return json(res, 200, {
        today_orders: today.length,
        today_sum: today.reduce((s, o) => s + o.total, 0),
        users: users.length,
      });
    }

    if (entity === 'upload' && method === 'POST') {
      const b = await readBody(req);
      return json(res, 200, { url: await saveImage(b.image, 'catalog') });
    }

    if (entity === 'settings' && method === 'PATCH') {
      const b = await readBody(req);
      for (const key of ['shop', 'delivery', 'coins', 'banner']) {
        if (b[key] && typeof b[key] === 'object') await db.upsert('settings', { key, value: b[key] }, 'key');
      }
      return json(res, 200, await loadSettings());
    }

    if (ADMIN_TABLES[entity]) {
      if (method === 'POST') {
        const b = await readBody(req);
        return json(res, 200, await db.insert(entity, pick(b, ADMIN_TABLES[entity])));
      }
      if (method === 'PATCH' && id) {
        const b = await readBody(req);
        return json(res, 200, await db.update(entity, `id=eq.${Number(id)}`, pick(b, ADMIN_TABLES[entity])));
      }
      if (method === 'DELETE' && id) {
        if (entity === 'products') {
          // buyurtmalar tarixi buzilmasligi uchun o'chirmasdan yashiramiz
          await db.update('products', `id=eq.${Number(id)}`, { active: false });
        } else {
          await db.remove(entity, `id=eq.${Number(id)}`);
        }
        return json(res, 200, { ok: true });
      }
    }
  }

  return json(res, 404, { error: 'Topilmadi' });
}

// ---------- Server ----------
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://x');
  const pathname = decodeURIComponent(url.pathname);
  try {
    if (pathname === '/health') {
      res.writeHead(200, { 'Content-Type': 'text/plain' });
      return res.end('ok');
    }

    if (pathname === `/webhook/${cfg.WEBHOOK_SECRET}` && req.method === 'POST') {
      if (req.headers['x-telegram-bot-api-secret-token'] !== cfg.WEBHOOK_SECRET) { res.writeHead(403); return res.end(); }
      const update = await readBody(req);
      res.writeHead(200); res.end('ok'); // Telegram'ga darhol javob
      return bot.handleUpdate(update);
    }

    if (pathname === '/api/version') return json(res, 200, { version: cfg.VERSION });

    if (pathname.startsWith('/api/')) {
      if (!db.enabled) return json(res, 503, { error: 'Baza ulanmagan (SUPABASE_URL / SUPABASE_SERVICE_KEY)' });
      return await api(req, res, pathname, url.searchParams);
    }

    if (req.method === 'GET') return serveStatic(req, res, pathname);
    res.writeHead(405); res.end();
  } catch (e) {
    const code = e.code && Number.isInteger(e.code) ? e.code : 500;
    if (code === 500) console.error(e);
    if (!res.headersSent) json(res, code, { error: code === 500 ? 'Server xatosi' : e.message });
  }
});

server.listen(cfg.PORT, () => {
  console.log(`Green Market ${cfg.VERSION} — port ${cfg.PORT}`);
  bot.setup().catch((e) => console.error('Bot setup xato:', e));
});
