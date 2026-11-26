// Shtrix-kod bo'yicha mahsulot nomini internetdagi ochiq bazalardan topish
const cache = new Map();

async function getJson(url, ms = 4500) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'GreenMarket/1.0 (telegram mini app)' } });
    if (!r.ok) return null;
    return await r.json();
  } catch { return null; } finally { clearTimeout(t); }
}

async function fromOpenFoodFacts(code) {
  const base = ['world.openfoodfacts.org', 'world.openbeautyfacts.org', 'world.openproductsfacts.org'];
  for (const host of base) {
    const j = await getJson(`https://${host}/api/v2/product/${code}.json?fields=product_name,product_name_ru,product_name_uz,generic_name,brands,quantity,image_front_url,image_url`);
    const p = j && j.status === 1 ? j.product : null;
    if (p) {
      const name = p.product_name_uz || p.product_name_ru || p.product_name || p.generic_name;
      if (name) {
        return {
          name: [name, p.quantity].filter(Boolean).join(' ').trim(),
          brand: (p.brands || '').split(',')[0].trim() || null,
          image: p.image_front_url || p.image_url || null,
          source: host,
        };
      }
    }
  }
  return null;
}

async function fromUpcItemDb(code) {
  const j = await getJson(`https://api.upcitemdb.com/prod/trial/lookup?upc=${code}`);
  const it = j && Array.isArray(j.items) ? j.items[0] : null;
  if (!it || !it.title) return null;
  return { name: it.title, brand: it.brand || null, image: (it.images || [])[0] || null, source: 'upcitemdb' };
}

// barcode-list.ru — Rossiya/MDH tovarlari (Turkiya va O'zbekistonniki ham uchraydi)
async function fromBarcodeList(code) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 7000);
  try {
    const r = await fetch(`https://barcode-list.ru/barcode/RU/%D0%9F%D0%BE%D0%B8%D1%81%D0%BA.htm?barcode=${code}`, { signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)' } });
    if (!r.ok) return null;
    const html = await r.text();
    const m = html.match(/<meta name="description" content="[^"]*?:\s*([^"]+)"/i);
    if (!m) return null;
    const dec = (x) => x.replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#039;|&apos;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
    const names = dec(m[1]).split(';').map((x) => x.replace(/\s+/g, ' ').trim()).filter((x) => x.length > 2);
    if (!names.length) return null;
    const cnt = new Map();
    for (const n of names) { const k = n.toLowerCase(); cnt.set(k, { n, c: (cnt.get(k)?.c || 0) + 1 }); }
    const best = [...cnt.values()].sort((a, b) => b.c - a.c || b.n.length - a.n.length)[0].n;
    return { name: best, brand: null, image: null, source: 'barcode-list.ru' };
  } catch { return null; } finally { clearTimeout(t); }
}

// O'zbekiston Soliq qo'mitasining yagona elektron katalogi (tasnif.soliq.uz) — mahalliy mahsulotlar ham bor
async function fromTasnif(code) {
  for (const lang of ['uz', 'ru']) {
    const j = await getJson(`https://tasnif.soliq.uz/api/cls-api/mxik/search/by-params?gtin=${code}&page=0&size=5&lang=${lang}`, 8000);
    const it = j?.data?.content?.[0];
    if (it?.mxikName) {
      const name = String(it.mxikName).replace(/\s+/g, ' ').trim();
      return { name, brand: it.brandName || null, ikpu: it.mxikCode || null, image: null, source: 'tasnif.soliq.uz' };
    }
  }
  return null;
}

async function lookupBarcode(code) {
  code = String(code || '').replace(/\D/g, '');
  if (code.length < 6 || code.length > 14) return null;
  if (cache.has(code)) return cache.get(code);
  // tasnif.soliq.uz chet el serverlaridan (Render) javob bermaydi — uni telefon o'zi so'raydi
  const [off, bl] = await Promise.all([fromOpenFoodFacts(code), fromBarcodeList(code)]);
  let res = off || bl || (await fromUpcItemDb(code)) || null;
  if (res && !res.image && off?.image) res = { ...res, image: off.image };
  if (res && !res.image && !off && res.source !== 'upcitemdb') { const up = await fromUpcItemDb(code); if (up?.image) res = { ...res, image: up.image }; }
  if (res) cache.set(code, res);
  if (cache.size > 500) cache.delete(cache.keys().next().value);
  return res;
}

module.exports = { lookupBarcode, fromTasnif };
