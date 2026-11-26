// Mahsulot uchun haqiqiy rasm topish:
//  - barkod bo'lsa yoki brend mahsulot bo'lsa — Open Food Facts (ochiq litsenziya, CC BY-SA)
//  - meva-sabzavot, go'sht kabi brendsiz mahsulotlar — Vikipediya asosiy rasmi
const { lookupBarcode } = require('./lookup');

async function getJson(url, ms = 7000) {
  const ctl = new AbortController();
  const t = setTimeout(() => ctl.abort(), ms);
  try {
    const r = await fetch(url, { signal: ctl.signal, headers: { 'User-Agent': 'GreenMarket/1.0 (telegram mini app; images)' } });
    return r.ok ? await r.json() : null;
  } catch { return null; } finally { clearTimeout(t); }
}

// Brendsiz mahsulotlar: o'zbekcha nom -> Vikipediya sahifasi
const WIKI = [
  [/bodring/i, 'Cucumber'], [/pomidor/i, 'Tomato'], [/piyoz/i, 'Onion'], [/sarimsoq/i, 'Garlic'],
  [/kartoshka(?!.*chips)/i, 'Potato'], [/sabzi/i, 'Carrot'], [/bulg.or qalampir/i, 'Bell_pepper'], [/achchiq qalampir/i, 'Chili_pepper'],
  [/avokado/i, 'Avocado'], [/shampinon|qo.ziqorin/i, 'Agaricus_bisporus'], [/olma yashil/i, 'Granny_Smith'], [/olma/i, 'Apple'],
  [/banan/i, 'Banana'], [/limon/i, 'Lemon'], [/mandarin/i, 'Mandarin_orange'], [/uzum/i, 'Grape'], [/qulupnay/i, 'Strawberry'],
  [/mol go.shti/i, 'Beef'], [/tovuq/i, 'Chicken_as_food'], [/losos/i, 'Salmon_as_food'], [/krevetka/i, 'Shrimp_and_prawn_as_food'],
  [/patir|obi non/i, 'Non_(bread)'], [/baton|buxanka|non\b/i, 'Bread'], [/tuxum/i, 'Egg_as_food'], [/guruch/i, 'Rice'],
  [/kruassan/i, 'Croissant'], [/ponchik/i, 'Doughnut'], [/asal/i, 'Honey'], [/tvorog/i, 'Quark_(dairy_product)'],
];

async function fromWikipedia(name) {
  const hit = WIKI.find(([re]) => re.test(name));
  if (!hit) return null;
  const j = await getJson(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit[1])}`);
  const src = j?.originalimage?.source || j?.thumbnail?.source;
  if (!src) return null;
  // ~640px kenglikdagi variant (tezroq yuklanadi)
  const img = j?.thumbnail?.source ? j.thumbnail.source.replace(/\/\d+px-/, '/640px-') : src;
  return { image: img, source: 'wikipedia' };
}

const norm = (s) => String(s || '').toLowerCase().replace(/[^a-z0-9а-яё]+/gi, ' ').trim();

async function fromOffSearch(name) {
  const q = name.replace(/\b\d+[.,]?\d*\s*(l|ml|g|gr|kg|dona|paket|banka)\b/gi, '').replace(/[,]/g, ' ').trim();
  const j = await getJson(`https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(q)}&search_simple=1&action=process&json=1&page_size=20&fields=code,product_name,brands,quantity,image_front_url,unique_scans_n`);
  const list = (j?.products || []).filter((p) => p.image_front_url && p.product_name);
  if (!list.length) return null;
  const words = norm(q).split(' ').filter((w) => w.length > 2);
  const brand = words[0];
  const score = (p) => {
    const t = norm(`${p.brands} ${p.product_name}`);
    let s = words.reduce((a, w) => a + (t.includes(w) ? 2 : 0), 0);
    if (brand && norm(p.brands).includes(brand)) s += 3;
    s += Math.min(3, Math.log10((p.unique_scans_n || 0) + 1));
    return s;
  };
  list.sort((a, b) => score(b) - score(a));
  const best = list[0];
  if (brand && !norm(`${best.brands} ${best.product_name}`).includes(brand)) return null;
  return { image: best.image_front_url, barcode: best.code, source: 'openfoodfacts' };
}

async function findImage(p) {
  if (p.barcode) {
    const r = await lookupBarcode(p.barcode);
    if (r?.image) return { image: r.image };
  }
  return (await fromWikipedia(p.name_uz)) || (await fromOffSearch(p.name_uz)) || null;
}

module.exports = { findImage };
