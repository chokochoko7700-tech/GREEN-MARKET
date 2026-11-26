// Vaqtinchalik: barkod manbalarini serverdan tekshirish (loglarga yozadi)
async function hit(url, opts = {}) {
  const ctl = new AbortController(); const t = setTimeout(() => ctl.abort(), 10000);
  try {
    const r = await fetch(url, { ...opts, signal: ctl.signal, headers: { 'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)', Accept: 'application/json, text/html', ...(opts.headers || {}) } });
    const txt = await r.text();
    console.log('PROBE', r.status, url.slice(0, 110), '=>', txt.replace(/\s+/g, ' ').slice(0, 350));
  } catch (e) { console.log('PROBE ERR', url.slice(0, 110), e.message); } finally { clearTimeout(t); }
}
module.exports = async function probe() {
  const uz = '4780068020023', ru = '4607001770350';
  const T = 'https://tasnif.soliq.uz/api/cls-api';
  const urls = [
    `${T}/mxik/search/by-params?gtin=${uz}&page=0&size=5&lang=uz`,
    `${T}/mxik/search/by-params?barcode=${uz}&page=0&size=5&lang=uz`,
    `${T}/mxik/search/by-params?internationalCode=${uz}&page=0&size=5&lang=uz`,
    `${T}/elasticsearch/search?search=${uz}&size=5&page=0&lang=uz`,
    `${T}/mxik/search?search=${uz}&size=5&page=0&lang=uz`,
    `${T}/integration-mxik/search?gtin=${uz}&lang=uz`,
    `${T}/mxik/get/by-gtin?gtin=${uz}&lang=uz`,
    `https://barcode-list.ru/barcode/RU/%D0%9F%D0%BE%D0%B8%D1%81%D0%BA.htm?barcode=${ru}`,
    `https://barcode-list.ru/barcode/RU/%D0%9F%D0%BE%D0%B8%D1%81%D0%BA.htm?barcode=${uz}`,
  ];
  for (const u of urls) await hit(u);
};
