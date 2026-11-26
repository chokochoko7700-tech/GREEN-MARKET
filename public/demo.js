// Faqat ?demo=1 bilan ochilganda: serverga ulanmasdan dizaynni ko'rish uchun
(() => {
  const svg = (bg, txt) => 'data:image/svg+xml,' + encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="600"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${bg[0]}"/><stop offset="1" stop-color="${bg[1]}"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#g)"/><text x="60" y="330" font-family="sans-serif" font-size="90" font-weight="800" fill="#fff">${txt}</text></svg>`);
  const D = {
    me: { id: 1, name: 'Ali', phone: '+998901234567', lat: 39.0573, lng: 66.8341, address: 'Ipak yo\'li 12', lang: 'uz', theme: 'auto', coins: 37, is_admin: true },
    catalog: {
      version: window.APP_VERSION,
      settings: { shop: { name: 'Green Market', phone: '+998901112233', work_hours: '08:00–23:00' }, delivery: { fee: 5000, free_from: 100000, min_order: 0 }, coins: { sum_per_coin: 1000, enabled: true }, banner: { interval_ms: 1000 } },
      categories: [
        { id: 1, name_uz: 'Meva-sabzavot', icon: 'solar:leaf-bold-duotone' },
        { id: 2, name_uz: 'Ichimliklar', icon: 'solar:bottle-bold-duotone' },
        { id: 3, name_uz: 'Sut mahsulotlari', icon: 'solar:cup-hot-bold-duotone' },
      ],
      banners: [
        { id: 1, image: svg(['#17a34a', '#0f5132'], 'Meva −20%'), title: 'Yangi mevalar', subtitle: 'Bugun chegirmada', link_type: 'category', link_id: 1 },
        { id: 2, image: svg(['#f59e0b', '#b45309'], 'Coin x2'), title: 'Ikki barobar coin', subtitle: 'Hafta oxirigacha', link_type: 'product', link_id: 4 },
        { id: 3, image: svg(['#2563eb', '#1e3a8a'], 'Bepul yetkazish'), title: '100 000 so\'mdan', subtitle: '', link_type: 'none' },
      ],
      products: [
        { id: 1, category_id: 1, name_uz: 'Piyoz', unit: 'kg', price: 7000, piece_kg: 0.2, min_kg: 0.1, in_stock: true, active: true },
        { id: 2, category_id: 1, name_uz: 'Kartoshka', unit: 'kg', price: 6000, piece_kg: 0.2, min_kg: 0.1, in_stock: true, active: true, old_price: 7500 },
        { id: 3, category_id: 1, name_uz: 'Olma', unit: 'kg', price: 15000, piece_kg: 0.25, min_kg: 0.1, in_stock: true, active: true, coin_price: 30 },
        { id: 4, category_id: 2, name_uz: 'Coca-Cola 1.5 L', unit: 'dona', price: 12000, in_stock: true, active: true, coin_price: 25 },
        { id: 5, category_id: 2, name_uz: 'Suv 1 L', unit: 'dona', price: 3000, in_stock: true, active: true, coin_price: 8 },
        { id: 6, category_id: 3, name_uz: 'Sut 1 L', unit: 'dona', price: 11000, in_stock: false, active: true },
      ],
      faq: [{ id: 1, q_uz: 'Yetkazib berish qancha vaqt oladi?', a_uz: 'Odatda 30–60 daqiqa.' }],
    },
    orders: [],
  };
  window.__mockApi = async (path, method, body) => {
    await new Promise((r) => setTimeout(r, 250));
    if (path === '/api/catalog') return D.catalog;
    if (path === '/api/me' && method === 'GET') return D.me;
    if (path === '/api/me') return Object.assign(D.me, body, body?.avatar ? { avatar: body.avatar } : {});
    if (path === '/api/orders' && method === 'POST') {
      const o = { id: 100 + D.orders.length, status: 'new', created_at: new Date().toISOString(), total: 0, items: [] };
      D.orders.unshift(o); return o;
    }
    if (path === '/api/orders') return D.orders;
    if (path === '/api/admin/all') return D.catalog;
    if (path.startsWith('/api/admin/orders')) return D.orders;
    if (path === '/api/admin/stats') return { today_orders: D.orders.length, today_sum: 0, users: 1 };
    return { ok: true };
  };
})();
