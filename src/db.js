// Supabase REST (PostgREST) bilan ishlash — tashqi kutubxonasiz
const URL_ = (process.env.SUPABASE_URL || '').replace(/\/$/, '');
const KEY = process.env.SUPABASE_SERVICE_KEY || '';

// Yangi turdagi kalitlar (sb_secret_...) JWT emas — faqat apikey sarlavhasida yuboriladi
const authHeaders = () => (KEY.startsWith('sb_') ? { apikey: KEY } : { apikey: KEY, Authorization: `Bearer ${KEY}` });

function headers(extra = {}) {
  return { ...authHeaders(), 'Content-Type': 'application/json', ...extra };
}

async function req(method, path, body, extra) {
  const res = await fetch(`${URL_}/rest/v1/${path}`, {
    method,
    headers: headers(extra),
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`DB ${method} ${path} ${res.status}: ${text}`);
  return text ? JSON.parse(text) : null;
}

const enc = encodeURIComponent;

module.exports = {
  enabled: Boolean(URL_ && KEY),

  select: (table, query = '') => req('GET', `${table}?${query}`),

  async one(table, query) {
    const rows = await req('GET', `${table}?${query}&limit=1`);
    return rows[0] || null;
  },

  async insert(table, row) {
    const rows = await req('POST', table, row, { Prefer: 'return=representation' });
    return Array.isArray(row) ? rows : rows[0];
  },

  async upsert(table, row, onConflict = 'id') {
    const rows = await req('POST', `${table}?on_conflict=${onConflict}`, row, {
      Prefer: 'return=representation,resolution=merge-duplicates',
    });
    return rows[0];
  },

  async update(table, query, patch) {
    const rows = await req('PATCH', `${table}?${query}`, patch, { Prefer: 'return=representation' });
    return rows[0] || null;
  },

  remove: (table, query) => req('DELETE', `${table}?${query}`),

  rpc: (fn, args) => req('POST', `rpc/${fn}`, args),

  // Rasmni Storage'ga yuklash, ochiq URL qaytaradi
  async upload(path, buffer, contentType) {
    const res = await fetch(`${URL_}/storage/v1/object/images/${path}`, {
      method: 'POST',
      headers: { ...authHeaders(), 'Content-Type': contentType, 'x-upsert': 'true' },
      body: buffer,
    });
    if (!res.ok) throw new Error(`Upload ${res.status}: ${await res.text()}`);
    return `${URL_}/storage/v1/object/public/images/${path}`;
  },

  enc,
};
