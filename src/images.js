// Mahsulot uchun haqiqiy rasm topish:
//  - barkod bo'lsa yoki brend mahsulot bo'lsa — Open Food Facts (ochiq litsenziya, CC BY-SA)
//  - meva-sabzavot, go'sht kabi brendsiz mahsulotlar — Vikipediya asosiy rasmi
const { lookupBarcode } = require('./lookup');

async function getJson(url, ms = 20000) {
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
  [/mol go.shti/i, 'Steak'], [/tovuq/i, 'Chicken_as_food'], [/losos/i, 'Salmon_as_food'], [/krevetka/i, 'Prawn'],
  [/patir|obi non/i, 'Non_(food)'], [/baton|buxanka|non\b/i, 'Bread'], [/tuxum/i, 'Egg_as_food'], [/guruch/i, 'Rice'],
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

// Brend nomi -> Open Food Facts brend tegi
const BRANDS = [
  ['coca-cola zero', 'coca-cola'], ['coca-cola', 'coca-cola'], ['fanta', 'fanta'], ['sprite', 'sprite'], ['pepsi', 'pepsi'], ['7up', '7up'],
  ['red bull', 'red-bull'], ['nestle pure life', 'nestle-pure-life'], ['borjomi', 'borjomi'], ['rich', 'rich'], ['lipton', 'lipton'],
  ['ahmad', 'ahmad-tea'], ['nescafe', 'nescafe'], ['jacobs', 'jacobs'], ['snickers', 'snickers'], ['twix', 'twix'], ['mars', 'mars'],
  ['bounty', 'bounty'], ['kitkat', 'kitkat'], ['milka', 'milka'], ['alpen gold', 'alpen-gold'], ['nutella', 'nutella'], ['chupa chups', 'chupa-chups'],
  ["lay's", 'lay-s'], ['pringles', 'pringles'], ['cheetos', 'cheetos'], ['orbit', 'orbit'], ['lactel', 'lactel'], ['president', 'president'],
  ['danone', 'danone'], ['activia', 'activia'], ['hochland', 'hochland'], ['barilla', 'barilla'], ['heinz', 'heinz'], ["hellmann's", 'hellmann-s'],
  ['magnum', 'magnum'], ['cornetto', 'cornetto'],
];
// "1,5 L" -> ["1,5 l","1.5 l","1500 ml"]; "80 g" -> ["80 g","80g"]
function qtyKeys(name) {
  const m = /(\d+(?:[.,]\d+)?)\s*(l|ml|g|kg)\b/i.exec(name);
  if (!m) return [];
  const n = parseFloat(m[1].replace(',', '.')), u = m[2].toLowerCase();
  const keys = [`${m[1].replace(',', '.')} ${u}`, `${m[1].replace('.', ',')} ${u}`, `${m[1].replace(',', '.')}${u}`];
  if (u === 'l') keys.push(`${Math.round(n * 1000)} ml`, `${Math.round(n * 1000)}ml`);
  if (u === 'kg') keys.push(`${Math.round(n * 1000)} g`);
  return keys.map((k) => k.toLowerCase());
}
// Open Food Facts qidiruvi daqiqasiga ~10 so'rov — navbat bilan
let lastSearch = 0;
async function throttle() {
  const wait = lastSearch + 6500 - Date.now();
  lastSearch = Math.max(Date.now(), lastSearch + 6500);
  if (wait > 0) await new Promise((r) => setTimeout(r, wait));
}
async function fromOffSearch(name) {
  const low = name.toLowerCase();
  const hit = BRANDS.find(([k]) => low.startsWith(k) || low.includes(k));
  if (!hit) return null;
  await throttle();
  const j = await getJson(`https://world.openfoodfacts.org/api/v2/search?brands_tags=${hit[1]}&fields=code,product_name,brands,quantity,image_front_url,unique_scans_n&sort_by=unique_scans_n&page_size=60`);
  const list = (j?.products || []).filter((p) => p.image_front_url && p.product_name);
  if (!list.length) return null;
  const words = norm(name.replace(hit[0], '')).split(' ').filter((w) => w.length > 2 && !/^\d/.test(w) && !['dona', 'paket', 'banka', 'klassik'].includes(w));
  const qk = qtyKeys(name);
  const score = (p) => {
    const t = norm(`${p.product_name}`); const q = String(p.quantity || '').toLowerCase().replace(/\s+/g, ' ');
    let s = words.reduce((a, w) => a + (t.includes(w) ? 3 : 0), 0);
    if (qk.some((k) => q.includes(k) || t.includes(k))) s += 5;
    if (hit[0] === 'coca-cola' && /zero|light|vanil|cherry|lime/i.test(p.product_name)) s -= 6;
    s += Math.min(3, Math.log10((p.unique_scans_n || 0) + 1));
    return s;
  };
  list.sort((a, b) => score(b) - score(a));
  return { image: list[0].image_front_url, barcode: list[0].code, source: 'openfoodfacts' };
}

async function findImage(p) {
  if (p.barcode) {
    const r = await lookupBarcode(p.barcode);
    if (r?.image) return { image: r.image };
  }
  return (await fromOffSearch(p.name_uz)) || (await fromWikipedia(p.name_uz)) || null;
}

module.exports = { findImage };
