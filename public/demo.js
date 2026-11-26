// Faqat ?demo=1 bilan ochilganda: serverga ulanmasdan dizaynni ko'rish uchun
(() => {
  const pimg = (emo, bg) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="400" height="400"><rect width="100%" height="100%" fill="${bg}"/><text x="50%" y="60%" font-size="200" text-anchor="middle">${emo}</text></svg>`);
  const ban = (a, b, t) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="820" height="400"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${a}"/><stop offset="1" stop-color="${b}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="600" y="270" font-size="190" text-anchor="middle">${t}</text></svg>`);
  const P = (id, category_id, name_uz, unit, price, emo, bg, extra = {}) => ({ id, category_id, name_uz, unit, price, image: pimg(emo, bg), in_stock: true, active: true, min_kg: 0.1, ...extra });
  const D = {
    me: { id: 777, name: 'Aslbek', phone: '+998904447604', lat: 39.0573, lng: 66.8341, address: 'Ipak yo\'li 12', lang: 'uz', theme: 'light', coins: 1250, spent: 1200000, is_admin: true, birthday: null },
    catalog: {
      version: window.APP_VERSION,
      settings: {
        shop: { name: 'Green Market', phone: '+998901112233', work_hours: '08:00–23:00' }, delivery: { fee: 5000, free_from: 100000, min_order: 0 },
        coins: { enabled: true, birthday_bonus: 5000, levels: [{ name: 'Bronza', pct: 1, from: 0 }, { name: 'Kumush', pct: 2, from: 3000000 }, { name: 'Oltin', pct: 3, from: 10000000 }] },
        banner: { interval_ms: 3000 }, info: { about: 'Green Market — Shahrisabzdagi do\'kon.' },
      },
      categories: [
        { id: 1, name_uz: 'Sabzavotlar', grp: 'Sabzavotlar bo\'limi', image: pimg('🥦', '#eef7ee'), icon: 'lucide:carrot' },
        { id: 8, name_uz: 'Mevalar va rezavorlar', grp: 'Sabzavotlar bo\'limi', image: pimg('🍌', '#fff7e0'), icon: 'lucide:apple' },
        { id: 2, name_uz: 'Ichimliklar', grp: 'Suv va ichimliklar', image: pimg('🥤', '#ffecec'), icon: 'lucide:cup-soda' },
        { id: 3, name_uz: 'Sut, yog\' va tuxum', grp: 'Sut mahsulotlari', image: pimg('🥛', '#eef3fb'), icon: 'lucide:milk' },
        { id: 9, name_uz: 'Pishloqlar', grp: 'Sut mahsulotlari', image: pimg('🧀', '#fff6db'), icon: 'lucide:egg' },
        { id: 4, name_uz: 'Sneklar', grp: 'Shirinliklar va gazaklar', image: pimg('🍿', '#fff0e6'), icon: 'lucide:cookie' },
      ],
      banners: [
        { id: 1, style: 'card', image: ban('#e8f5e9', '#c8e6c9', '🛒'), title: 'Bonus to\'plang', subtitle: 'Har bir xariddan ball', link_type: 'none' },
        { id: 2, style: 'card', image: ban('#fff3e0', '#ffe0b2', '🍊'), title: 'Har tong yangi', subtitle: 'Meva-sabzavot', link_type: 'category', link_id: 1 },
        { id: 3, style: 'block', color: '#e11d2a', image: pimg('🥤', '#e11d2a'), title: 'Coca‑Cola', subtitle: 'Coca‑Cola 1,5 L', link_type: 'category', link_id: 2 },
      ],
      products: [
        P(1, 1, 'Piyoz', 'kg', 7000, '🧅', '#fdf3e7', { piece_kg: 0.2, popular: true }),
        P(2, 1, 'Kartoshka', 'kg', 6000, '🥔', '#f5efe6', { piece_kg: 0.2, old_price: 7500 }),
        P(3, 8, 'Olma Golden', 'kg', 15000, '🍎', '#fdeaea', { piece_kg: 0.25, coin_price: 3000, popular: true }),
        P(10, 8, 'Banan', 'kg', 22000, '🍌', '#fff7d6', { piece_kg: 0.2 }),
        P(4, 2, 'Coca-Cola 1,5 L', 'dona', 12000, '🥤', '#ffe9e9', { coin_price: 2500, popular: true }),
        P(5, 2, 'Suv 1 L', 'dona', 3000, '💧', '#e8f3ff'),
        P(7, 2, 'Apelsin sharbati 1 L', 'dona', 16000, '🧃', '#fff4dc', { old_price: 19000 }),
        P(6, 3, 'Sut 1 L', 'dona', 11000, '🥛', '#f1f5f9', { in_stock: false }),
        P(11, 9, 'Pishloq Gauda 200 g', 'dona', 28000, '🧀', '#fff6db', { popular: true }),
        P(12, 4, 'Chips 70 g', 'dona', 12950, '🍟', '#fff0e6', { old_price: 14990 }),
      ],
      faq: [{ id: 1, q_uz: 'Ballar qanday to\'planadi?', a_uz: 'Har bir yetkazilgan buyurtmadan darajangizga qarab ball tushadi.' }, { id: 2, q_uz: 'Daraja nima va u qanday oshadi?', a_uz: 'Jami xaridingiz oshgani sari daraja ko\'tariladi.' }],
      stores: [{ id: 1, name: 'Lipton Green Market', address: 'Shahrisabz, Ipak yo\'li', lat: 39.0573, lng: 66.8341, hours: '08:00–23:00' }, { id: 2, name: 'Green Market 2', address: 'Markaz', lat: 39.062, lng: 66.828, hours: '09:00–22:00' }],
    },
    orders: [{ id: 101, status: 'delivering', created_at: new Date().toISOString(), total: 27000, coins_earned: 220, items: [{ name: 'Piyoz', unit: 'kg', mode: 'kg', kg: 1, value: 1, total: 7000 }, { name: 'Coca-Cola 1,5 L', unit: 'dona', mode: 'dona', value: 1, total: 12000 }] }],
    coins: [{ delta: 220, reason: 'order', order_id: 99, created_at: new Date().toISOString() }, { delta: -2500, reason: 'gift', order_id: 98, created_at: new Date().toISOString() }],
  };
  window.__mockApi = async (path, method, body) => {
    await new Promise((r) => setTimeout(r, 200));
    if (path === '/api/catalog') return D.catalog;
    if (path === '/api/me' && method === 'GET') return D.me;
    if (path === '/api/me') return Object.assign(D.me, body);
    if (path === '/api/orders' && method === 'POST') return { id: 102 };
    if (path === '/api/orders') return D.orders;
    if (path === '/api/coins') return D.coins;
    if (path === '/api/admin/all') return D.catalog;
    if (path.startsWith('/api/admin/orders')) return D.orders.map((o) => ({ ...o, status: 'new', name: 'Aslbek', phone: '+998904447604', address: 'Ipak yo\'li 12', lat: 39.05, lng: 66.83 }));
    if (path === '/api/admin/stats') return { today_orders: 3, today_sum: 154000, users: 42 };
    return { ok: true };
  };
})();
