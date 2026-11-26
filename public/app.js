/* GREEN MARKET — Telegram Mini App (mijoz + admin rejimi) */
(() => {
'use strict';

const tg = window.Telegram?.WebApp || null;
const ADMIN_MODE = location.pathname.startsWith('/admin');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const e = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n) => `<iconify-icon icon="solar:${n}"></iconify-icon>`;
const fmt = (n) => Math.round(Number(n || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const round100 = (x) => Math.round(x / 100) * 100;
const round3 = (x) => Math.round(x * 1000) / 1000;
const kgTxt = (x) => String(round3(x)).replace('.', ',');
const hap = (t = 'light') => { try { ['success', 'error', 'warning'].includes(t) ? tg.HapticFeedback.notificationOccurred(t) : tg.HapticFeedback.impactOccurred(t); } catch {} };
const local = {
  get(k, d) { try { const v = localStorage.getItem('gm_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('gm_' + k, JSON.stringify(v)); } catch {} },
};
// Telegram CloudStorage — savat va sevimlilar telefon almashsa ham saqlanadi
const cloud = {
  ok: () => !!(tg?.CloudStorage && tg.isVersionAtLeast?.('6.9') && tg.initData),
  set(k, v) { local.set(k, v); if (this.ok()) try { tg.CloudStorage.setItem(k, JSON.stringify(v).slice(0, 4000)); } catch {} },
  load(keys) {
    return new Promise((res) => {
      if (!this.ok()) return res({});
      try { tg.CloudStorage.getItems(keys, (err, vals) => res(err ? {} : vals || {})); } catch { res({}); }
      setTimeout(() => res({}), 1500);
    });
  },
};

/* ---------------- I18N ---------------- */
const L = {
  uz: {
    t_home: 'Asosiy', t_catalog: 'Katalog', t_cart: 'Savat', t_fav: 'Sevimlilar', t_profile: 'Profil',
    search: 'Mahsulot va kategoriyalarni qidirish', cancel: 'Bekor qilish', popular: 'Ommabop', more: (n) => `yana ${n}`,
    all: 'Hammasi', recommend: 'Siz uchun tavsiya', nothing: 'Hech narsa topilmadi', nothingSub: 'Boshqa so\'z bilan qidirib ko\'ring.',
    sum: 'so\'m', perKg: '/kg', kg: 'kg', pc: 'dona', buy: 'Sotib olish', soldOut: 'Tugagan',
    byKg: 'Kilo', bySum: 'Summa', byPc: 'Dona', enterSum: 'Qancha so\'mlik?', approx: 'taxminan',
    estNote: 'Dona tanlanganda narx taxminiy. Aniq summa tortilgandan keyin hisoblanadi.',
    addCart: 'Savatga qo\'shish', save: 'Saqlash', remove: 'O\'chirish', added: 'Savatga qo\'shildi', minIs: 'Kamida',
    emptyT: 'Voy! Hozircha bu yerda hech narsa yo\'q', cartEmpty: 'Yoqqan mahsulotlarni savatga qo\'shing — ular shu yerda paydo bo\'ladi. Yoqimli xaridlar!',
    favEmpty: 'Mahsulotdagi ♡ belgisini bosing — u shu yerda saqlanadi.', goShop: 'Xaridni boshlash',
    delSel: 'Tanlanganlarni o\'chirish', selAll: 'Hammasini tanlash', yourOrder: 'Buyurtmangiz', items: (n) => `${n} ta mahsulot`,
    fee: 'Yetkazib berish', free: 'Bepul', coinsUse: 'Coin bilan', willEarn: 'Sizga qo\'shiladi', totalPrice: 'Umumiy narx',
    checkout: 'Rasmiylashtirish', minOrder: 'Min. buyurtma', address: 'Yetkazish manzili', noAddress: 'Manzil tanlanmagan',
    phone: 'Telefon', name: 'Ism', comment: 'Izoh: podyezd, qavat, mo\'ljal…', payment: 'To\'lov usuli',
    cash: 'Naqd yoki kartaga kuryerga', payme: 'Payme orqali onlayn', soon: 'Tez kunda', placeOrder: 'Buyurtma berish',
    needPhone: 'Telefon raqamingizni kiriting', needAddr: 'Yetkazish manzilini tanlang',
    success: 'Buyurtma qabul qilindi!', successSub: 'Holati haqida botda xabar beramiz.', myOrders: 'Buyurtmalarim', toHome: 'Bosh sahifaga',
    coins: 'coin', bonuses: 'Bonuslar', yourCoins: 'Sizning coinlaringiz', nextGift: 'Keyingi sovg\'agacha',
    earnRule: (s) => `Har ${fmt(s)} so'mlik xarid = 1 coin. Coin buyurtma yetkazilgach tushadi.`,
    gifts: 'Coinga sovg\'alar', take: 'Olish', needMore: (n) => `yana ${n}`, noGifts: 'Hozircha sovg\'alar yo\'q', giftAdded: 'Sovg\'a savatga qo\'shildi', gift: 'Sovg\'a',
    myData: 'Ma\'lumotlarim', lang: 'Til', theme: 'Mavzu', th_light: 'Kunduzgi', th_dark: 'Tungi', th_auto: 'Telegram bo\'yicha',
    about: 'Biz haqimizda', deliveryTerms: 'Yetkazib berish shartlari', returns: 'Qaytarish va almashtirish', contact: 'Biz bilan bog\'lanish',
    socials: 'Ijtimoiy tarmoqlar', saved: 'Saqlandi', faq: 'Ko\'p beriladigan savollar', writeUs: 'Bizga yozing', msgPh: 'Savolingizni yozing…',
    send: 'Yuborish', sent: 'Xabar yuborildi', call: 'Qo\'ng\'iroq qilish', noOrders: 'Hali buyurtma yo\'q',
    st_new: 'Yangi', st_accepted: 'Qabul qilindi', st_delivering: 'Yo\'lda', st_done: 'Yetkazildi', st_cancelled: 'Bekor qilindi',
    pickMap: 'Xaritani surib, uyingizni markazga keltiring', addrDetail: 'Uy, podyezd, qavat, xonadon', saveAddr: 'Manzilni saqlash',
    openInBot: 'Ilovani Telegram bot orqali oching', error: 'Xatolik yuz berdi', updated: 'Ilova yangilandi', edit: 'O\'zgartirish', total: 'Jami',
  },
  ru: {
    t_home: 'Главная', t_catalog: 'Каталог', t_cart: 'Корзина', t_fav: 'Избранное', t_profile: 'Профиль',
    search: 'Поиск продуктов и категорий', cancel: 'Отменить', popular: 'Популярный', more: (n) => `${n} ещё`,
    all: 'Все', recommend: 'Рекомендуем для вас', nothing: 'Нет доступных данных', nothingSub: 'Попробуйте другой запрос.',
    sum: 'сум', perKg: '/кг', kg: 'кг', pc: 'шт', buy: 'Купить', soldOut: 'Нет в наличии',
    byKg: 'Вес', bySum: 'Сумма', byPc: 'Штуки', enterSum: 'На какую сумму?', approx: 'примерно',
    estNote: 'При выборе штук цена примерная. Точная сумма — после взвешивания.',
    addCart: 'В корзину', save: 'Сохранить', remove: 'Удалить', added: 'Добавлено в корзину', minIs: 'Минимум',
    emptyT: 'Ой! Тут пока ничего нет', cartEmpty: 'Добавьте понравившиеся товары в корзину — и они появятся здесь. Приятных покупок!',
    favEmpty: 'Нажмите ♡ на товаре — он сохранится здесь.', goShop: 'За покупками',
    delSel: 'Удалить выбранные', selAll: 'Выбрать все', yourOrder: 'Ваш заказ', items: (n) => `${n} товара`,
    fee: 'Доставка', free: 'Бесплатно', coinsUse: 'Коинами', willEarn: 'Вам начислится', totalPrice: 'Общая стоимость',
    checkout: 'Перейти к оформлению', minOrder: 'Мин. заказ', address: 'Адрес доставки', noAddress: 'Адрес не выбран',
    phone: 'Телефон', name: 'Имя', comment: 'Комментарий: подъезд, этаж, ориентир…', payment: 'Способ оплаты',
    cash: 'Наличными или картой курьеру', payme: 'Онлайн через Payme', soon: 'Скоро', placeOrder: 'Оформить заказ',
    needPhone: 'Укажите номер телефона', needAddr: 'Выберите адрес доставки',
    success: 'Заказ принят!', successSub: 'О статусе сообщим в боте.', myOrders: 'Мои заказы', toHome: 'На главную',
    coins: 'коин', bonuses: 'Бонусы', yourCoins: 'Ваши коины', nextGift: 'До следующего подарка',
    earnRule: (s) => `Каждые ${fmt(s)} сум покупок = 1 коин. Начисляются после доставки.`,
    gifts: 'Подарки за коины', take: 'Взять', needMore: (n) => `ещё ${n}`, noGifts: 'Пока подарков нет', giftAdded: 'Подарок добавлен в корзину', gift: 'Подарок',
    myData: 'Мои данные', lang: 'Язык', theme: 'Тема', th_light: 'Светлая', th_dark: 'Тёмная', th_auto: 'Как в Telegram',
    about: 'О нас', deliveryTerms: 'Условия доставки', returns: 'Условия возврата и обмена', contact: 'Связаться с нами',
    socials: 'Социальные сети', saved: 'Сохранено', faq: 'Частые вопросы', writeUs: 'Напишите нам', msgPh: 'Напишите вопрос…',
    send: 'Отправить', sent: 'Сообщение отправлено', call: 'Позвонить', noOrders: 'Заказов пока нет',
    st_new: 'Новый', st_accepted: 'Принят', st_delivering: 'В пути', st_done: 'Доставлен', st_cancelled: 'Отменён',
    pickMap: 'Двигайте карту, чтобы дом был в центре', addrDetail: 'Дом, подъезд, этаж, квартира', saveAddr: 'Сохранить адрес',
    openInBot: 'Откройте приложение через Telegram-бота', error: 'Произошла ошибка', updated: 'Приложение обновлено', edit: 'Изменить', total: 'Итого',
  },
};

/* ---------------- STATE ---------------- */
const S = {
  catalog: null, me: null,
  lang: local.get('lang', (tg?.initDataUnsafe?.user?.language_code || '').startsWith('ru') ? 'ru' : 'uz'),
  cart: local.get('cart', []), fav: local.get('fav', []),
  admin: null, adminStatus: 'new',
};
const tr = (k, ...a) => { const v = (L[S.lang] || L.uz)[k] ?? L.uz[k] ?? k; return typeof v === 'function' ? v(...a) : v; };
const pname = (p) => (S.lang === 'ru' && p.name_ru) || p.name_uz;
const pdesc = (p) => (S.lang === 'ru' && p.desc_ru) || p.desc_uz || '';
const cname = (c) => (S.lang === 'ru' && c.name_ru) || c.name_uz;
const setting = (k, d = {}) => ({ ...d, ...(S.catalog?.settings?.[k] || {}) });
const product = (id) => S.catalog?.products.find((p) => p.id === Number(id));

/* ---------------- API ---------------- */
async function api(path, { method = 'GET', body } = {}) {
  if (window.__mockApi) return window.__mockApi(path, method, body);
  const res = await fetch(path, {
    method,
    headers: { 'Content-Type': 'application/json', 'X-Init-Data': tg?.initData || '' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || tr('error'));
  return data;
}

/* ---------------- UI helpers ---------------- */
document.addEventListener('load', (ev) => { if (ev.target.tagName === 'IMG') ev.target.classList.add('ok'); }, true);
const img = (src, fb = 'bag-4-bold-duotone') => (src ? `<img class="lz" src="${e(src)}" loading="lazy" alt="">` : ic(fb));

let toastT;
function toast(msg, type) {
  const t = $('#toast');
  t.textContent = msg; t.classList.add('show');
  if (type) hap(type);
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2200);
}

function openSheet(html, onMount) {
  const w = $('#sheetWrap');
  $('#sheetBody').innerHTML = html;
  w.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('open')));
  onMount?.($('#sheetBody'));
  hap('light');
}
function closeSheet() {
  const w = $('#sheetWrap');
  if (w.hidden) return;
  w.classList.remove('open');
  setTimeout(() => { w.hidden = true; $('#sheetBody').innerHTML = ''; }, 380);
}
$('.sheet-backdrop').addEventListener('click', closeSheet);
(() => { // pastga surib yopish
  const sh = $('.sheet'); let y0 = null, dy = 0;
  sh.addEventListener('touchstart', (ev) => { if (sh.scrollTop <= 0) { y0 = ev.touches[0].clientY; dy = 0; } }, { passive: true });
  sh.addEventListener('touchmove', (ev) => {
    if (y0 === null) return; dy = ev.touches[0].clientY - y0;
    if (dy > 0) { sh.style.transition = 'none'; sh.style.transform = `translateY(${dy}px)`; }
  }, { passive: true });
  sh.addEventListener('touchend', () => { sh.style.transition = ''; sh.style.transform = ''; if (y0 !== null && dy > 110) closeSheet(); y0 = null; });
})();

function resizeImage(file, max = 1000, quality = 0.85) {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => {
      const im = new Image();
      im.onload = () => {
        const k = Math.min(1, max / Math.max(im.width, im.height));
        const c = document.createElement('canvas');
        c.width = Math.round(im.width * k); c.height = Math.round(im.height * k);
        c.getContext('2d').drawImage(im, 0, 0, c.width, c.height);
        resolve(c.toDataURL('image/jpeg', quality));
      };
      im.onerror = reject; im.src = r.result;
    };
    r.onerror = reject; r.readAsDataURL(file);
  });
}
function pickFile() {
  return new Promise((resolve) => {
    const inp = document.createElement('input');
    inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => resolve(inp.files[0] || null);
    inp.click();
  });
}

function navbar(title, { back = true, act = '' } = {}) {
  return `<div class="navbar"><div class="in">${back ? `<button class="back press" data-back>${ic('alt-arrow-left-linear')}</button>` : ''}<h1>${e(title)}</h1>${act}</div></div>`;
}
const emptyState = (icon, title, text, btn) => `<div class="empty"><div class="ill">${ic(icon)}</div><b>${e(title)}</b><p>${e(text)}</p>${btn || ''}</div>`;

/* ---------------- THEME ---------------- */
function applyTheme() {
  const pref = S.me?.theme || local.get('theme', 'light');
  const mode = pref === 'auto' ? (tg?.colorScheme || 'light') : pref;
  document.documentElement.dataset.theme = mode;
  const accent = setting('theme', {}).accent;
  if (accent && /^#[0-9a-f]{6}$/i.test(accent)) document.documentElement.style.setProperty('--accent', accent);
  const bg = mode === 'dark' ? '#0f1012' : '#ffffff';
  try { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); tg.setBottomBarColor?.(bg); } catch {}
}

/* ---------------- PRICING (server bilan bir xil) ---------------- */
function priceLine(p, it) {
  const v = Number(it.value);
  if (it.reward) return { total: 0, coins: (p.coin_price || 0) * v, kg: p.unit === 'kg' ? v : null, est: false };
  if (p.unit === 'dona') return { total: p.price * v, coins: 0, kg: null, est: false };
  if (it.mode === 'kg') return { total: round100(p.price * v), coins: 0, kg: v, est: false };
  if (it.mode === 'sum') return { total: v, coins: 0, kg: round3(v / p.price), est: false };
  const kg = round3(v * Number(p.piece_kg || 0));
  return { total: round100(p.price * kg), coins: 0, kg, est: true };
}
function lineLabel(p, it) {
  const pl = priceLine(p, it);
  if (it.reward) return `🎁 ${p.coin_price} ${tr('coins')}`;
  if (p.unit === 'dona') return `${it.value} ${tr('pc')}`;
  if (it.mode === 'kg') return `${kgTxt(it.value)} ${tr('kg')}`;
  if (it.mode === 'sum') return `${fmt(it.value)} ${tr('sum')} ≈ ${kgTxt(pl.kg)} ${tr('kg')}`;
  return `${it.value} ${tr('pc')} ≈ ${kgTxt(pl.kg)} ${tr('kg')}`;
}

/* ---------------- CART & FAV ---------------- */
const saveCart = () => { cloud.set('cart', S.cart); updateBadge(); };
const saveFav = () => cloud.set('fav', S.fav);
function cartTotals(onlySel = true) {
  let subtotal = 0, coins = 0, est = false, n = 0;
  S.cart = S.cart.filter((it) => product(it.id));
  for (const it of S.cart) {
    if (onlySel && it.sel === false) continue;
    const pl = priceLine(product(it.id), it);
    subtotal += pl.total; coins += pl.coins; est = est || pl.est; n++;
  }
  const d = setting('delivery', { fee: 0, free_from: 0, min_order: 0 });
  const fee = !n || (d.free_from && subtotal >= d.free_from) ? 0 : Number(d.fee || 0);
  const c = setting('coins', { sum_per_coin: 1000, enabled: true });
  const earn = c.enabled && c.sum_per_coin ? Math.floor(subtotal / c.sum_per_coin) : 0;
  return { subtotal, coins, est, fee, total: subtotal + fee, earn, n, min: Number(d.min_order || 0) };
}
function addToCart(it, replaceKey) {
  const key = `${it.id}:${it.reward ? 'r' : it.mode}`;
  if (replaceKey) S.cart = S.cart.filter((x) => x.k !== replaceKey);
  const ex = S.cart.find((x) => x.k === key);
  if (ex && !replaceKey) ex.value = it.mode === 'kg' ? round3(ex.value + it.value) : ex.value + it.value;
  else S.cart.push({ ...it, k: key, sel: true });
  saveCart();
  const b = $('#cartBadge'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
}
const donaLine = (id) => S.cart.find((x) => x.id === id && !x.reward && product(id)?.unit === 'dona');
function kgInCart(id) {
  const p = product(id);
  const lines = S.cart.filter((x) => x.id === id && !x.reward);
  if (!lines.length) return null;
  return round3(lines.reduce((s, x) => s + (priceLine(p, x).kg || 0), 0));
}
function updateBadge() {
  const b = $('#cartBadge'); const n = S.cart.length;
  b.hidden = !n; b.textContent = n;
}
const isFav = (id) => S.fav.includes(Number(id));

/* ---------------- Components ---------------- */
function buyArea(p) {
  if (!p.in_stock) return `<button class="buy" disabled>${tr('soldOut')}</button>`;
  if (p.unit === 'dona') {
    const l = donaLine(p.id);
    if (l) return `<div class="qty"><button data-dec="${p.id}">${ic('minus-linear')}</button><b>${l.value}</b><button data-inc="${p.id}">${ic('add-linear')}</button></div>`;
  } else {
    const kg = kgInCart(p.id);
    if (kg) return `<button class="buy ghost" data-open="${p.id}">${ic('check-circle-bold')} ${kgTxt(kg)} ${tr('kg')}</button>`;
  }
  return `<button class="buy" data-buy="${p.id}">${ic('bag-4-bold')}${tr('buy')}</button>`;
}
function pcard(p, i = 0) {
  const disc = p.old_price && p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
  return `<div class="pc" data-pc="${p.id}" style="animation-delay:${Math.min(i, 8) * 35}ms">
    <div class="im press" data-p="${p.id}">${img(p.image)}
      <button class="heart ${isFav(p.id) ? 'on' : ''}" data-fav="${p.id}">${ic(isFav(p.id) ? 'heart-bold' : 'heart-linear')}</button>
      ${p.unit === 'kg' ? `<span class="unit-tag">${tr('kg')}</span>` : ''}
      ${p.in_stock ? '' : `<div class="soldout">${tr('soldOut')}</div>`}
    </div>
    ${disc ? `<div class="old"><s>${fmt(p.old_price)}</s><b>−${disc}%</b></div>` : ''}
    <div class="price">${fmt(p.price)} <small>${tr('sum')}${p.unit === 'kg' ? tr('perKg') : ''}</small></div>
    <div class="nm">${e(pname(p))}</div>
    ${buyArea(p)}
  </div>`;
}
const TINTS = 8;
function tile(c, i) {
  return `<button class="tile press" data-go="cat/${c.id}">
    <div class="sq ${c.image ? '' : 'tint-' + (i % TINTS)}">${c.image ? img(c.image) : `<iconify-icon icon="${e(c.icon || 'solar:bag-4-bold-duotone')}"></iconify-icon>`}</div>
    <span>${e(cname(c))}</span></button>`;
}
function refreshCards(id) {
  const p = product(id); if (!p) return;
  $$(`[data-pc="${id}"]`).forEach((el) => {
    const d = document.createElement('div'); d.innerHTML = pcard(p).trim();
    const n = d.firstChild; n.style.animation = 'none';
    el.replaceWith(n);
  });
}

// Butun ilova uchun bitta bosish boshqaruvchisi
document.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-fav],[data-buy],[data-inc],[data-dec],[data-open],[data-p],[data-go],[data-back]');
  if (!t || (t.closest('#sheetWrap') && !t.matches('[data-go]'))) return;
  if (t.dataset.back !== undefined) { history.back(); return; }
  if (t.dataset.go) { hap('light'); go(t.dataset.go); return; }
  const id = Number(t.dataset.fav || t.dataset.buy || t.dataset.inc || t.dataset.dec || t.dataset.open || t.dataset.p);
  const p = product(id); if (!p) return;
  ev.stopPropagation();
  if (t.dataset.fav) {
    hap('light');
    S.fav = isFav(id) ? S.fav.filter((x) => x !== id) : [id, ...S.fav];
    saveFav(); refreshCards(id);
    if (['fav', 'cart'].includes(route()[0])) render(true);
    return;
  }
  if (t.dataset.buy) {
    if (p.unit === 'kg') return productSheet(p);
    hap('medium'); addToCart({ id, mode: 'dona', value: 1 }); refreshCards(id); return;
  }
  if (t.dataset.inc || t.dataset.dec) {
    hap('light');
    const l = donaLine(id); if (!l) return;
    l.value += t.dataset.inc ? 1 : -1;
    if (l.value <= 0) S.cart = S.cart.filter((x) => x !== l);
    saveCart(); refreshCards(id);
    if (route()[0] === 'cart') render(true);
    return;
  }
  if (t.dataset.open) {
    const l = S.cart.find((x) => x.id === id && !x.reward);
    return productSheet(p, l);
  }
  productSheet(p);
});

/* ---------------- ROUTER ---------------- */
const TABS = ['home', 'catalog', 'cart', 'fav', 'profile'];
const stack = [];
function route() { return (location.hash.slice(1) || (ADMIN_MODE ? 'admin/orders' : 'home')).split('/'); }
function go(h) { if (location.hash !== '#' + h) location.hash = h; else render(true); }

window.addEventListener('hashchange', () => { closeSheet(); render(); });
$$('#tabbar button').forEach((b) => b.addEventListener('click', () => {
  hap('light');
  if (route()[0] === b.dataset.tab) return window.scrollTo({ top: 0, behavior: 'smooth' });
  stack.length = 0; go(b.dataset.tab);
}));

let heroTimer = null;
function render(silent = false) {
  clearInterval(heroTimer);
  const h = location.hash || '#';
  const [page, a, b] = route();
  if (ADMIN_MODE && page !== 'admin') return go('admin/orders');
  const isTab = TABS.includes(page) && !ADMIN_MODE;
  let anim = 'anim-fade';
  if (!silent) {
    const idx = stack.lastIndexOf(h);
    if (isTab) { stack.length = 0; stack.push(h); }
    else if (idx >= 0) { anim = 'anim-pop'; stack.length = idx + 1; }
    else { anim = 'anim-push'; stack.push(h); }
  }
  $('#tabbar').hidden = ADMIN_MODE;
  $('#tabbar').classList.toggle('hide', !isTab);
  $$('#tabbar button').forEach((x) => x.classList.toggle('on', x.dataset.tab === page));
  $$('[data-i]').forEach((el) => { el.textContent = tr(el.dataset.i); });
  const useTgBack = !isTab && !(ADMIN_MODE && page === 'admin');
  try { useTgBack ? tg.BackButton.show() : tg.BackButton.hide(); } catch {}
  document.body.classList.toggle('tg-back', !!(useTgBack && tg?.initData && tg.isVersionAtLeast?.('6.1')));
  const v = $('#view');
  v.classList.toggle('no-tab', !isTab);
  if (!silent) {
    v.classList.remove('anim-fade', 'anim-push', 'anim-pop'); void v.offsetWidth; v.classList.add(anim);
    window.scrollTo(0, 0);
  }
  const R = { home, catalog, cat: category, search, cart, checkout, fav, profile, bonus, orders, edit, map, support, info, success, admin };
  (R[page] || home)(v, a, b);
}
try { tg.BackButton.onClick(() => { if (!$('#sheetWrap').hidden) return closeSheet(); history.length > 1 ? history.back() : go('home'); }); } catch {}

const needCatalog = (v) => {
  if (S.catalog) return false;
  v.innerHTML = `<div class="sk" style="height:min(56vh,112vw);border-radius:0"></div>`;
  return true;
};

/* ---------------- PAGES ---------------- */
function avatarInner() {
  const m = S.me;
  if (m?.avatar) return `<img src="${e(m.avatar)}" alt="">`;
  const ph = tg?.initDataUnsafe?.user?.photo_url;
  if (ph) return `<img src="${e(ph)}" alt="">`;
  return ic('user-bold');
}

function home(v) {
  if (needCatalog(v)) return;
  const { categories, products, banners } = S.catalog;
  const pop = products.filter((p) => p.popular);
  const popular = (pop.length ? pop : products).slice(0, 15);
  const sections = categories.map((c) => ({ c, list: products.filter((p) => p.category_id === c.id) })).filter((s) => s.list.length);
  v.innerHTML = `
    ${banners.length ? `<div class="hero" id="hero"><div class="hero-track">${[...banners, banners[0]].map((b, i) => `
        <div class="hero-slide" data-b="${i % banners.length}">${img(b.image, 'gallery-bold-duotone')}
        ${b.title ? `<div class="cap"><b>${e(b.title)}</b><small>${e(b.subtitle)}</small></div>` : ''}</div>`).join('')}</div>
        ${banners.length > 1 ? `<div class="hero-dots">${banners.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}`
      : '<div class="hero-empty" style="position:relative">'}
      <button class="float-btn l press" data-go="profile">${avatarInner()}</button>
      <button class="float-btn r press" data-go="support">${ic('chat-round-dots-linear')}</button>
    </div>
    <div class="sheet-top" ${banners.length ? '' : 'style="margin-top:0"'}>
      <div class="pad"><button class="search-pill press" data-go="search">${ic('magnifer-linear')}${tr('search')}</button></div>
      <div class="cat-row">${categories.map(tile).join('')}</div>
      <div class="section">
        <div class="sec-h"><b>🛍️ ${tr('popular')}</b><button class="more press" data-go="catalog">${tr('more', products.length)}${ic('alt-arrow-right-linear')}</button></div>
        <div class="h-scroll">${popular.map(pcard).join('')}</div>
      </div>
      ${sections.map(({ c, list }) => `<div class="section">
        <div class="sec-h"><b>${e(cname(c))}</b>${list.length > 6 ? `<button class="more press" data-go="cat/${c.id}">${tr('more', list.length - 6)}${ic('alt-arrow-right-linear')}</button>` : ''}</div>
        <div class="h-scroll">${list.slice(0, 6).map(pcard).join('')}</div></div>`).join('')}
    </div>`;
  if (banners.length) startHero(banners);
}

function startHero(banners) {
  const box = $('#hero'); if (!box) return;
  const track = box.querySelector('.hero-track');
  const dots = box.querySelectorAll('.hero-dots i');
  const n = banners.length;
  let i = 0, paused = false;
  const show = (k, anim = true) => {
    track.style.transition = anim ? '' : 'none';
    track.style.transform = `translateX(-${k * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('on', j === k % n));
  };
  track.addEventListener('transitionend', () => { if (i >= n) { i = 0; show(0, false); } });
  const ms = Math.max(700, Number(setting('banner', { interval_ms: 1000 }).interval_ms) || 1000);
  if (n > 1) heroTimer = setInterval(() => { if (!paused && !document.hidden) { i++; show(i); } }, ms + 550);
  let x0 = null, moved = false;
  box.addEventListener('touchstart', (ev) => { paused = true; x0 = ev.touches[0].clientX; moved = false; }, { passive: true });
  box.addEventListener('touchmove', () => { moved = true; }, { passive: true });
  box.addEventListener('touchend', (ev) => {
    const dx = ev.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40 && n > 1) { i = ((i % n) + (dx < 0 ? 1 : n - 1)) % n; show(i); }
    setTimeout(() => { paused = false; }, 1800);
  });
  track.addEventListener('click', () => { if (!moved) openBanner(banners[i % n]); });
}
function openBanner(b) {
  if (!b) return;
  hap('light');
  if (b.link_type === 'product' && product(b.link_id)) productSheet(product(b.link_id));
  if (b.link_type === 'category') go('cat/' + b.link_id);
}

function catalog(v) {
  if (needCatalog(v)) return;
  v.innerHTML = `${navbar(tr('t_catalog'), { back: false })}
    <div class="pad"><button class="search-pill press" data-go="search">${ic('magnifer-linear')}${tr('search')}</button></div>
    <div class="cat-grid">${S.catalog.categories.map(tile).join('')}</div>`;
}

function category(v, id) {
  if (needCatalog(v)) return;
  const c = S.catalog.categories.find((x) => x.id === Number(id));
  const list = S.catalog.products.filter((p) => p.category_id === Number(id));
  v.innerHTML = `${navbar(c ? cname(c) : tr('t_catalog'))}
    ${list.length ? `<div class="p-grid" style="padding-top:6px">${list.map(pcard).join('')}</div>` : emptyState('box-minimalistic-linear', tr('emptyT'), '')}`;
}

function search(v) {
  if (needCatalog(v)) return;
  v.innerHTML = `<div class="navbar"><div class="search-row" style="padding-top:8px;padding-bottom:10px">
      <label class="search-pill" style="flex:1">${ic('magnifer-linear')}<input id="q" type="search" placeholder="${tr('search')}" autocomplete="off" enterkeyhint="search"></label>
      <button class="cancel" data-back>${tr('cancel')}</button></div></div>
    <div id="sres"></div>`;
  const q = $('#q');
  const draw = () => {
    const s = q.value.trim().toLowerCase();
    const box = $('#sres');
    if (!s) {
      const pop = S.catalog.products.filter((p) => p.popular);
      box.innerHTML = `<div class="pad chips" style="margin:4px 0 16px">${S.catalog.categories.slice(0, 8).map((c) => `<button class="chip" data-q="${e(cname(c))}">${e(cname(c))}</button>`).join('')}</div>
        <div class="sec-h"><b style="font-size:17px">${tr('recommend')}</b></div>
        <div class="p-grid">${(pop.length ? pop : S.catalog.products).slice(0, 10).map(pcard).join('')}</div>`;
      box.querySelectorAll('[data-q]').forEach((b) => b.onclick = () => { q.value = b.dataset.q; draw(); });
      return;
    }
    const cats = S.catalog.categories.filter((c) => `${c.name_uz} ${c.name_ru || ''}`.toLowerCase().includes(s));
    const prods = S.catalog.products.filter((p) => `${p.name_uz} ${p.name_ru || ''}`.toLowerCase().includes(s));
    if (!cats.length && !prods.length) { box.innerHTML = emptyState('box-minimalistic-linear', tr('nothing'), tr('nothingSub')); return; }
    box.innerHTML = `${cats.length ? `<div class="group">${cats.map((c) => `<button class="row" data-go="cat/${c.id}"><span class="tx">${e(cname(c))}</span><span class="chev">${ic('alt-arrow-right-linear')}</span></button>`).join('')}</div>` : ''}
      <div class="p-grid">${prods.map(pcard).join('')}</div>`;
  };
  q.oninput = draw;
  q.onkeydown = (ev) => { if (ev.key === 'Enter') q.blur(); };
  draw();
  setTimeout(() => q.focus(), 350);
}

/* ---------- Product sheet ---------- */
function productSheet(p, editLine) {
  const isKg = p.unit === 'kg';
  const st = { mode: editLine ? editLine.mode : (isKg ? 'kg' : 'dona'), value: editLine ? editLine.value : 1 };
  const minKg = Number(p.min_kg || 0.1);
  const minSum = round100(p.price * minKg);
  const defaults = { kg: 1, sum: 10000, dona: 1 };
  const disc = p.old_price && p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0;

  const draw = () => {
    const modes = isKg ? [['kg', tr('byKg')], ['sum', tr('bySum')], ...(p.piece_kg ? [['dona', tr('byPc')]] : [])] : [];
    const stepper = (val, unit, mode) => `<div class="stepper"><button data-d="-1">${ic('minus-linear')}</button>
      <div class="v"><input id="val" type="text" inputmode="${mode === 'kg' ? 'decimal' : 'numeric'}" value="${val}"><small>${unit}</small></div>
      <button data-d="1">${ic('add-linear')}</button></div>`;
    let body = '';
    if (st.mode === 'kg') {
      body = stepper(kgTxt(st.value), tr('kg'), 'kg') + `<div class="chips">${[0.5, 1, 1.5, 2, 3, 5].filter((x) => x >= minKg).map((x) => `<button class="chip" data-set="${x}">${kgTxt(x)} ${tr('kg')}</button>`).join('')}</div>`;
    } else if (st.mode === 'sum') {
      body = `<div class="sub" style="margin-bottom:8px">${tr('enterSum')}</div>` + stepper(fmt(st.value), tr('sum'), 'sum') +
        `<div class="chips">${[2000, 3000, 5000, 10000, 20000, 50000].filter((x) => x >= minSum).map((x) => `<button class="chip" data-set="${x}">${fmt(x)}</button>`).join('')}</div>`;
    } else {
      body = stepper(st.value, tr('pc'), 'dona') + (isKg ? `<div class="note">${ic('info-circle-bold')}<span>${tr('estNote')}</span></div>` : '');
    }
    return `<div class="big-im">${img(p.image)}<button class="heart ${isFav(p.id) ? 'on' : ''}" id="shFav">${ic(isFav(p.id) ? 'heart-bold' : 'heart-linear')}</button></div>
      <h2>${e(pname(p))}</h2>
      <div class="sub"><b style="color:var(--text);font-size:18px">${fmt(p.price)} ${tr('sum')}</b>${isKg ? ' ' + tr('perKg') : ''}
        ${disc ? ` &nbsp;<s>${fmt(p.old_price)}</s> <b style="color:var(--danger)">−${disc}%</b>` : ''}</div>
      ${pdesc(p) ? `<p class="sub">${e(pdesc(p))}</p>` : ''}
      ${modes.length && p.in_stock ? `<div class="seg">${modes.map(([m, t]) => `<button data-mode="${m}" class="${st.mode === m ? 'on' : ''}">${t}</button>`).join('')}</div>` : ''}
      ${p.in_stock ? body : ''}
      <div id="calc" class="sub" style="text-align:center;min-height:19px"></div>
      ${p.in_stock ? `<button class="btn" id="addBtn">${ic('bag-4-bold')}<span id="addTxt"></span></button>` : `<button class="btn" disabled>${tr('soldOut')}</button>`}
      ${editLine ? `<button class="btn danger" id="delBtn" style="margin-top:4px">${ic('trash-bin-minimalistic-linear')}${tr('remove')}</button>` : ''}`;
  };
  const valid = () => (st.mode === 'kg' ? st.value >= minKg : st.mode === 'sum' ? st.value >= minSum : st.value >= 1);
  const refresh = (root) => {
    const calc = $('#calc', root);
    if (!p.in_stock) return;
    const pl = priceLine(p, { mode: st.mode, value: st.value });
    if (!valid()) calc.innerHTML = `<span style="color:var(--danger)">${tr('minIs')} ${st.mode === 'sum' ? fmt(minSum) + ' ' + tr('sum') : st.mode === 'kg' ? kgTxt(minKg) + ' ' + tr('kg') : '1'}</span>`;
    else if (st.mode === 'sum') calc.textContent = `≈ ${kgTxt(pl.kg)} ${tr('kg')}`;
    else if (st.mode === 'dona' && isKg) calc.textContent = `≈ ${kgTxt(pl.kg)} ${tr('kg')} · ${tr('approx')} ${fmt(pl.total)} ${tr('sum')}`;
    else calc.textContent = '';
    const btn = $('#addBtn', root);
    if (btn) { btn.disabled = !valid(); $('#addTxt', root).textContent = `${editLine ? tr('save') : tr('addCart')} · ${pl.est ? '~' : ''}${fmt(pl.total)} ${tr('sum')}`; }
  };
  const mount = (root) => {
    $('#shFav', root).onclick = () => {
      hap('light');
      S.fav = isFav(p.id) ? S.fav.filter((x) => x !== p.id) : [p.id, ...S.fav]; saveFav();
      const b = $('#shFav', root); b.classList.toggle('on', isFav(p.id)); b.innerHTML = ic(isFav(p.id) ? 'heart-bold' : 'heart-linear');
      refreshCards(p.id);
    };
    root.querySelectorAll('[data-mode]').forEach((b) => b.onclick = () => {
      hap('light'); st.mode = b.dataset.mode; st.value = defaults[st.mode];
      root.innerHTML = draw(); mount(root);
    });
    const inp = $('#val', root);
    const show = () => { inp.value = st.mode === 'kg' ? kgTxt(st.value) : st.mode === 'sum' ? fmt(st.value) : st.value; };
    if (inp) {
      inp.oninput = () => {
        const raw = inp.value.replace(/\s/g, '').replace(',', '.');
        const n = st.mode === 'kg' ? parseFloat(raw) : parseInt(raw, 10);
        st.value = Number.isFinite(n) ? n : 0;
        if (st.mode === 'sum' && Number.isFinite(n)) inp.value = fmt(n);
        refresh(root);
      };
      inp.onfocus = () => inp.select();
    }
    root.querySelectorAll('[data-d]').forEach((b) => b.onclick = () => {
      hap('light');
      const d = Number(b.dataset.d);
      if (st.mode === 'kg') {
        const step = st.value < 1 || (st.value === 1 && d < 0) ? 0.1 : 0.5;
        st.value = Math.max(minKg, round3(st.value + d * step));
      } else if (st.mode === 'sum') st.value = Math.max(minSum, st.value + d * 1000);
      else st.value = Math.max(1, st.value + d);
      show(); refresh(root);
    });
    root.querySelectorAll('[data-set]').forEach((b) => b.onclick = () => { hap('light'); st.value = Number(b.dataset.set); show(); refresh(root); });
    const add = $('#addBtn', root);
    if (add) add.onclick = () => {
      if (!valid()) return;
      addToCart({ id: p.id, mode: st.mode, value: st.mode === 'kg' ? round3(st.value) : Math.floor(st.value) }, editLine?.k);
      toast(editLine ? tr('saved') : tr('added'), 'success');
      closeSheet(); refreshCards(p.id);
      if (route()[0] === 'cart') render(true);
    };
    const del = $('#delBtn', root);
    if (del) del.onclick = () => {
      S.cart = S.cart.filter((x) => x.k !== editLine.k); saveCart();
      closeSheet(); refreshCards(p.id); if (route()[0] === 'cart') render(true);
    };
    refresh(root);
  };
  openSheet(draw(), mount);
}

/* ---------- Cart ---------- */
function cart(v) {
  if (needCatalog(v)) return;
  const t = cartTotals();
  if (!S.cart.length) {
    v.innerHTML = navbar(tr('t_cart'), { back: false }) + emptyState('bag-4-linear', tr('emptyT'), tr('cartEmpty'),
      `<button class="btn" style="max-width:240px;margin:0 auto" data-go="home">${tr('goShop')}</button>`);
    return;
  }
  const allSel = S.cart.every((x) => x.sel !== false);
  v.innerHTML = `${navbar(tr('t_cart'), { back: false })}
    <div class="cart-bar"><button class="del" id="delSel">${tr('delSel')}</button>
      <button class="all" id="selAll"><span class="check ${allSel ? 'on' : ''}">${allSel ? ic('check-read-linear') : ''}</span>${tr('selAll')}</button></div>
    ${S.cart.map((it) => {
      const p = product(it.id); const pl = priceLine(p, it);
      return `<div class="ci">
        <div class="im" data-p="${p.id}">${img(p.image)}</div>
        <div class="tx"><b>${it.reward ? tr('gift') : (pl.est ? '~' : '') + fmt(pl.total) + ' ' + tr('sum')}</b><span>${e(pname(p))}</span><small>${lineLabel(p, it)}</small></div>
        <button class="check ${it.sel !== false ? 'on' : ''}" data-sel="${e(it.k)}">${it.sel !== false ? ic('check-read-linear') : ''}</button>
        <div class="bot"><div class="ics">
            <button class="${isFav(p.id) ? 'on' : ''}" data-fav="${p.id}">${ic(isFav(p.id) ? 'heart-bold' : 'heart-linear')}</button>
            <button data-del="${e(it.k)}">${ic('trash-bin-minimalistic-linear')}</button></div>
          ${it.reward ? '' : p.unit === 'dona'
            ? `<div class="qty"><button data-dec="${p.id}">${ic('minus-linear')}</button><b>${it.value}</b><button data-inc="${p.id}">${ic('add-linear')}</button></div>`
            : `<button class="edit" data-k="${e(it.k)}">${ic('pen-2-linear')}${tr('edit')}</button>`}
        </div></div>`;
    }).join('')}
    <div class="summary"><h3>${tr('yourOrder')}</h3>
      <div class="sumrow"><span>${tr('items', t.n)}:</span><span>${t.est ? '~' : ''}${fmt(t.subtotal)} ${tr('sum')}</span></div>
      <div class="sumrow"><span>${tr('fee')}:</span><span>${t.fee ? fmt(t.fee) + ' ' + tr('sum') : tr('free')}</span></div>
      ${t.coins ? `<div class="sumrow"><span>${tr('coinsUse')}:</span><span>−${t.coins} 🪙</span></div>` : ''}
      ${t.earn ? `<div class="sumrow"><span>${tr('willEarn')}:</span><span style="color:var(--accent)">+${t.earn} 🪙</span></div>` : ''}
      <div class="sumrow total"><span>${tr('totalPrice')}</span><span>${t.est ? '~' : ''}${fmt(t.total)} ${tr('sum')}</span></div>
    </div>
    <div style="height:80px"></div>
    <div class="paybar"><div class="sum"><b>${fmt(t.total)} ${tr('sum')}</b><small>${tr('items', t.n)}</small></div>
      <button class="btn" id="goCheckout" ${!t.n || (t.subtotal && t.subtotal < t.min) ? 'disabled' : ''}>${tr('checkout')}${t.subtotal && t.subtotal < t.min ? `<small>${tr('minOrder')} ${fmt(t.min)}</small>` : ''}</button></div>`;

  const rerender = () => { saveCart(); render(true); };
  $('#selAll').onclick = () => { hap('light'); S.cart.forEach((x) => { x.sel = !allSel; }); rerender(); };
  $('#delSel').onclick = () => {
    if (!S.cart.some((x) => x.sel !== false)) return;
    hap('medium'); const ids = S.cart.filter((x) => x.sel !== false).map((x) => x.id);
    S.cart = S.cart.filter((x) => x.sel === false); rerender(); ids.forEach(refreshCards);
  };
  v.querySelectorAll('[data-sel]').forEach((b) => b.onclick = () => { hap('light'); const it = S.cart.find((x) => x.k === b.dataset.sel); it.sel = it.sel === false; rerender(); });
  v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { hap('medium'); S.cart = S.cart.filter((x) => x.k !== b.dataset.del); rerender(); });
  v.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { const it = S.cart.find((x) => x.k === b.dataset.k); productSheet(product(it.id), it); });
  $('#goCheckout').onclick = () => go('checkout');
}

function checkout(v) {
  if (needCatalog(v)) return;
  const t = cartTotals();
  if (!t.n) return go('cart');
  const me = S.me || {};
  const addr = me.address || (me.lat != null ? `${me.lat.toFixed(4)}, ${me.lng.toFixed(4)}` : tr('noAddress'));
  v.innerHTML = `${navbar(tr('checkout'))}
    <div class="group">
      <button class="row" data-go="map">${ic('map-point-linear')}<span class="tx">${tr('address')}<small>${e(addr)}</small></span><span class="chev">${ic('alt-arrow-right-linear')}</span></button>
      <button class="row" data-go="edit">${ic('phone-linear')}<span class="tx">${tr('phone')}<small>${e(me.phone || '—')} · ${e(me.name || '')}</small></span><span class="chev">${ic('alt-arrow-right-linear')}</span></button>
    </div>
    <div class="field"><textarea id="comment" rows="2" placeholder="${tr('comment')}">${e(local.get('comment', ''))}</textarea></div>
    <div class="sec-h" style="padding-top:6px"><b style="font-size:17px">${tr('payment')}</b></div>
    <div class="group">
      <div class="row">${ic('wallet-money-linear')}<span class="tx">${tr('cash')}</span><span class="check on">${ic('check-read-linear')}</span></div>
      <div class="row" style="opacity:.55">${ic('card-linear')}<span class="tx">${tr('payme')}</span><span class="soon">${tr('soon')}</span></div>
    </div>
    ${t.est ? `<div class="pad"><div class="note">${ic('info-circle-bold')}<span>${tr('estNote')}</span></div></div>` : ''}
    <div class="summary" style="margin-top:4px">
      <div class="sumrow"><span>${tr('items', t.n)}:</span><span>${t.est ? '~' : ''}${fmt(t.subtotal)} ${tr('sum')}</span></div>
      <div class="sumrow"><span>${tr('fee')}:</span><span>${t.fee ? fmt(t.fee) + ' ' + tr('sum') : tr('free')}</span></div>
      ${t.coins ? `<div class="sumrow"><span>${tr('coinsUse')}:</span><span>−${t.coins} 🪙</span></div>` : ''}
      ${t.earn ? `<div class="sumrow"><span>${tr('willEarn')}:</span><span style="color:var(--accent)">+${t.earn} 🪙</span></div>` : ''}
      <div class="sumrow total"><span>${tr('totalPrice')}</span><span>${t.est ? '~' : ''}${fmt(t.total)} ${tr('sum')}</span></div>
    </div>
    <div style="height:80px"></div>
    <div class="paybar solo"><button class="btn" id="orderBtn">${tr('placeOrder')} · ${fmt(t.total)} ${tr('sum')}</button></div>`;
  $('#comment').oninput = (ev) => local.set('comment', ev.target.value);
  $('#orderBtn').onclick = placeOrder;
}

async function placeOrder() {
  const me = S.me;
  if (!me) return toast(tr('openInBot'), 'error');
  const t = cartTotals();
  if (!me.phone) { toast(tr('needPhone'), 'error'); return go('edit'); }
  if (me.lat == null) { toast(tr('needAddr'), 'error'); return go('map'); }
  const btn = $('#orderBtn'); btn.disabled = true;
  try {
    const sel = S.cart.filter((x) => x.sel !== false);
    const o = await api('/api/orders', {
      method: 'POST',
      body: { items: sel.map(({ id, mode, value, reward }) => ({ id, mode, value, reward })), comment: local.get('comment', '') },
    });
    S.cart = S.cart.filter((x) => x.sel === false); saveCart(); local.set('comment', '');
    if (t.coins) S.me.coins -= t.coins;
    hap('success');
    stack.length = 0;
    location.replace('#success/' + o.id);
  } catch (err) { toast(err.message, 'error'); btn.disabled = false; }
}

function success(v, id) {
  v.innerHTML = `<div style="height:var(--top)"></div><div class="success"><div class="ok">${ic('check-read-linear')}</div>
    <h2 style="margin:0 0 6px">${tr('success')}</h2><p style="color:var(--muted);margin:0">#${e(id)} · ${tr('successSub')}</p></div>
    <div class="pad"><button class="btn" data-go="orders">${tr('myOrders')}</button>
    <button class="btn ghost" style="margin-top:10px" data-go="home">${tr('toHome')}</button></div>`;
}

function fav(v) {
  if (needCatalog(v)) return;
  const list = S.fav.map(product).filter(Boolean);
  v.innerHTML = navbar(tr('t_fav'), { back: false }) + (list.length
    ? `<div class="p-grid" style="padding-top:6px">${list.map(pcard).join('')}</div>`
    : emptyState('heart-linear', tr('emptyT'), tr('favEmpty'), `<button class="btn" style="max-width:240px;margin:0 auto" data-go="home">${tr('goShop')}</button>`));
}

/* ---------- Profile ---------- */
function profile(v) {
  const me = S.me || {};
  const th = me.theme || local.get('theme', 'light');
  const info = setting('info', {});
  const row = (icon, text, attrs, right = `<span class="chev">${ic('alt-arrow-right-linear')}</span>`) =>
    `<button class="row" ${attrs}>${ic(icon)}<span class="tx">${text}</span>${right}</button>`;
  v.innerHTML = `${navbar(tr('t_profile'), { back: false })}
    <div class="p-head">
      <button class="ava press" id="ava">${avatarInner()}<span class="cam">${ic('camera-bold')}</span></button>
      <div class="tx"><b>${e(me.name || me.tg_name || tg?.initDataUnsafe?.user?.first_name || '—')}</b><small>${e(me.phone || '')}</small></div>
      <button class="press" data-go="edit" style="width:38px;height:38px;border-radius:50%;background:var(--fill);display:grid;place-items:center;font-size:19px">${ic('pen-2-linear')}</button>
    </div>
    <button class="coin-card press" data-go="bonus"><span class="c">${ic('dollar-minimalistic-bold')}</span>
      <span style="flex:1;position:relative;z-index:1"><b>${fmt(me.coins || 0)} ${tr('coins')}</b><small>${tr('bonuses')} →</small></span></button>
    <div class="group">
      ${row('bag-4-linear', tr('myOrders'), 'data-go="orders"')}
      ${row('map-point-linear', `${tr('address')}<small>${e(me.address || (me.lat != null ? `${me.lat.toFixed(4)}, ${me.lng.toFixed(4)}` : tr('noAddress')))}</small>`, 'data-go="map"')}
      ${row('user-id-linear', tr('myData'), 'data-go="edit"')}
    </div>
    <div class="group">
      ${row('global-linear', tr('lang'), 'id="langBtn"', `<span class="val">${S.lang === 'ru' ? 'Русский' : 'O\'zbekcha'}</span><span class="chev">${ic('alt-arrow-right-linear')}</span>`)}
      ${row('sun-2-linear', tr('theme'), 'id="themeBtn"', `<span class="val">${tr('th_' + th)}</span><span class="chev">${ic('alt-arrow-right-linear')}</span>`)}
    </div>
    <div class="group">
      ${row('info-circle-linear', tr('about'), 'data-go="info/about"')}
      ${row('delivery-linear', tr('deliveryTerms'), 'data-go="info/delivery"')}
      ${row('refresh-circle-linear', tr('returns'), 'data-go="info/returns"')}
      ${row('letter-linear', tr('contact'), 'data-go="support"')}
    </div>
    ${info.instagram || info.telegram ? `<div class="socials">${tr('socials')}:
      ${info.instagram ? `<a href="${e(info.instagram)}" target="_blank" style="background:linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2)"><iconify-icon icon="mdi:instagram"></iconify-icon></a>` : ''}
      ${info.telegram ? `<a href="${e(info.telegram)}" target="_blank" style="background:#2aabee"><iconify-icon icon="mdi:telegram"></iconify-icon></a>` : ''}</div>` : ''}
    <p style="text-align:center;color:var(--muted);font-size:12px">Green Market · v${e(String(window.APP_VERSION).slice(0, 7))}</p>`;

  $('#ava').onclick = async () => {
    if (!S.me) return toast(tr('openInBot'), 'error');
    const f = await pickFile(); if (!f) return;
    try {
      S.me = await api('/api/me', { method: 'PATCH', body: { avatar: await resizeImage(f, 320, 0.85) } });
      toast(tr('saved'), 'success'); render(true);
    } catch (err) { toast(err.message, 'error'); }
  };
  $('#langBtn').onclick = () => choiceSheet(tr('lang'), [['uz', 'O\'zbekcha'], ['ru', 'Русский']], S.lang, (val) => {
    S.lang = val; local.set('lang', val); savePref({ lang: val });
  });
  $('#themeBtn').onclick = () => choiceSheet(tr('theme'), ['light', 'dark', 'auto'].map((x) => [x, tr('th_' + x)]), th, (val) => {
    local.set('theme', val); if (S.me) S.me.theme = val; applyTheme(); savePref({ theme: val });
  });
}
async function savePref(patch) {
  render(true);
  if (!S.me) return;
  try { S.me = await api('/api/me', { method: 'PATCH', body: patch }); } catch (err) { toast(err.message, 'error'); }
}
function choiceSheet(title, opts, cur, onPick) {
  openSheet(`<h2 style="margin-bottom:14px">${e(title)}</h2><div class="group" style="margin:0">${opts.map(([k, t]) =>
    `<button class="row" data-c="${k}"><span class="tx">${e(t)}</span>${k === cur ? `<span style="color:var(--accent);font-size:22px">${ic('check-circle-bold')}</span>` : ''}</button>`).join('')}</div>`,
  (root) => root.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { hap('light'); closeSheet(); onPick(b.dataset.c); }));
}

function info(v, key) {
  const titles = { about: tr('about'), delivery: tr('deliveryTerms'), returns: tr('returns') };
  const text = setting('info', {})[key] || '—';
  v.innerHTML = navbar(titles[key] || '') + `<div class="info-text">${e(text)}</div>`;
}

function bonus(v) {
  if (needCatalog(v)) return;
  const coins = S.me?.coins || 0;
  const avail = coins - cartTotals(false).coins;
  const gifts = S.catalog.products.filter((p) => p.coin_price > 0 && p.in_stock).sort((a, b) => a.coin_price - b.coin_price);
  const next = gifts.find((g) => g.coin_price > coins);
  const prog = next ? Math.min(100, (coins / next.coin_price) * 100) : 100;
  v.innerHTML = `${navbar(tr('bonuses'))}
    <div class="coin-hero"><small style="opacity:.85">${tr('yourCoins')}</small>
      <div class="big">${ic('dollar-minimalistic-bold')}<span id="coinNum">0</span></div>
      ${next ? `<small style="opacity:.85">${tr('nextGift')}: ${e(pname(next))} — ${next.coin_price - coins} ${tr('coins')}</small><div class="bar"><i id="bar"></i></div>` : ''}
    </div>
    <div class="pad"><div class="note">${ic('star-shine-bold')}<span>${tr('earnRule', setting('coins', { sum_per_coin: 1000 }).sum_per_coin)}</span></div></div>
    <div class="sec-h" style="padding-top:8px"><b>${tr('gifts')}</b></div>
    ${gifts.length ? `<div class="p-grid">${gifts.map((p) => `<div class="pc">
        <div class="im">${img(p.image, 'gift-bold-duotone')}</div>
        <div class="price">🪙 ${p.coin_price}</div><div class="nm">${e(pname(p))}${p.unit === 'kg' ? ' · 1 ' + tr('kg') : ''}</div>
        <button class="buy ${avail >= p.coin_price ? '' : 'ghost'}" data-gift="${p.id}" ${avail >= p.coin_price ? '' : 'disabled'}>${avail >= p.coin_price ? tr('take') : tr('needMore', p.coin_price - avail)}</button>
      </div>`).join('')}</div>` : emptyState('gift-linear', tr('noGifts'), '')}`;
  const el = $('#coinNum'); const t0 = performance.now();
  const tick = (t) => { const k = Math.min(1, (t - t0) / 800); el.textContent = fmt(coins * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  setTimeout(() => { const b = $('#bar'); if (b) b.style.width = prog + '%'; }, 120);
  v.querySelectorAll('[data-gift]').forEach((b) => b.onclick = () => {
    addToCart({ id: Number(b.dataset.gift), mode: 'dona', value: 1, reward: true });
    toast(tr('giftAdded'), 'success'); render(true);
  });
}

function edit(v) {
  const me = S.me || {};
  v.innerHTML = `${navbar(tr('myData'))}
    <div class="field"><label>${tr('name')}</label><input id="fName" value="${e(me.name || '')}" maxlength="60"></div>
    <div class="field"><label>${tr('phone')}</label><input id="fPhone" type="tel" inputmode="tel" value="${e(me.phone || '+998')}" maxlength="16"></div>
    <div class="pad"><button class="btn" id="saveBtn">${tr('save')}</button></div>`;
  $('#saveBtn').onclick = async () => {
    if (!S.me) return toast(tr('openInBot'), 'error');
    try {
      S.me = await api('/api/me', { method: 'PATCH', body: { name: $('#fName').value, phone: $('#fPhone').value } });
      toast(tr('saved'), 'success'); history.back();
    } catch (err) { toast(err.message, 'error'); }
  };
}

function loadLeaflet() {
  if (window.L) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'; s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
function map(v) {
  const me = S.me || {};
  v.innerHTML = `${navbar(tr('address'))}
    <p style="color:var(--muted);margin:0 18px 10px;font-size:14px">${tr('pickMap')}</p>
    <div class="map-box"><div id="map"></div><div class="map-pin" id="pin">${ic('map-point-bold')}</div>
      <button class="map-me" id="meBtn">${ic('gps-bold')}</button></div>
    <div class="field"><textarea id="fAddr" rows="2" placeholder="${tr('addrDetail')}">${e(me.address || '')}</textarea></div>
    <div class="pad"><button class="btn" id="saveAddr">${tr('saveAddr')}</button></div>`;
  const start = me.lat != null ? [me.lat, me.lng] : [39.0573, 66.8341]; // Shahrisabz
  loadLeaflet().then(() => {
    if (!$('#map')) return;
    const m = window.L.map('map', { zoomControl: false, attributionControl: false }).setView(start, me.lat != null ? 17 : 14);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);
    m.on('movestart', () => $('#pin')?.classList.add('lift'));
    m.on('moveend', () => $('#pin')?.classList.remove('lift'));
    $('#meBtn').onclick = () => {
      hap('light');
      const use = (lat, lng) => m.setView([lat, lng], 17);
      const lm = tg?.LocationManager;
      if (lm && tg.isVersionAtLeast?.('8.0')) lm.init(() => lm.getLocation((loc) => (loc ? use(loc.latitude, loc.longitude) : lm.openSettings?.())));
      else navigator.geolocation?.getCurrentPosition((p) => use(p.coords.latitude, p.coords.longitude), () => toast(tr('error'), 'error'), { enableHighAccuracy: true, timeout: 10000 });
    };
    $('#saveAddr').onclick = async () => {
      if (!S.me) return toast(tr('openInBot'), 'error');
      const c = m.getCenter();
      try {
        S.me = await api('/api/me', { method: 'PATCH', body: { lat: c.lat, lng: c.lng, address: $('#fAddr').value } });
        toast(tr('saved'), 'success'); history.back();
      } catch (err) { toast(err.message, 'error'); }
    };
  }).catch(() => toast(tr('error'), 'error'));
}

function support(v) {
  const faq = S.catalog?.faq || [];
  const shop = setting('shop', {});
  v.innerHTML = `${navbar(tr('contact'))}
    <div class="sec-h"><b style="font-size:17px">${tr('faq')}</b></div>
    <div class="group">${faq.map((f) => `<div class="faq-item"><button class="faq-q">${e((S.lang === 'ru' && f.q_ru) || f.q_uz)}${ic('alt-arrow-down-linear')}</button>
      <div class="faq-a">${e((S.lang === 'ru' && f.a_ru) || f.a_uz)}</div></div>`).join('') || '<div class="row">—</div>'}</div>
    <div class="sec-h" style="padding-top:8px"><b style="font-size:17px">${tr('writeUs')}</b></div>
    <div class="field"><textarea id="msg" rows="3" placeholder="${tr('msgPh')}"></textarea></div>
    <div class="pad"><button class="btn" id="sendBtn">${ic('plain-2-bold')}${tr('send')}</button>
    ${shop.phone && shop.phone.length > 5 ? `<a class="btn ghost" style="margin-top:10px;text-decoration:none" href="tel:${e(shop.phone)}">${ic('phone-bold')}${tr('call')} · ${e(shop.phone)}</a>` : ''}
    ${shop.work_hours ? `<p style="text-align:center;color:var(--muted);font-size:13px">${ic('clock-circle-linear')} ${e(shop.work_hours)}</p>` : ''}</div>`;
  v.querySelectorAll('.faq-q').forEach((q) => q.onclick = () => { hap('light'); q.parentElement.classList.toggle('open'); });
  $('#sendBtn').onclick = async () => {
    const text = $('#msg').value.trim(); if (!text) return;
    if (!S.me) return toast(tr('openInBot'), 'error');
    try { await api('/api/support', { method: 'POST', body: { text } }); $('#msg').value = ''; toast(tr('sent'), 'success'); }
    catch (err) { toast(err.message, 'error'); }
  };
}

async function orders(v) {
  v.innerHTML = `${navbar(tr('myOrders'))}<div id="olist">${'<div class="sk" style="height:120px;margin:0 16px 12px"></div>'.repeat(3)}</div>`;
  if (!S.me) { $('#olist').innerHTML = emptyState('bag-4-linear', tr('openInBot'), ''); return; }
  try {
    const list = await api('/api/orders');
    if (route()[0] !== 'orders') return;
    $('#olist').innerHTML = list.length ? list.map((o) => orderCard(o)).join('') : emptyState('bag-4-linear', tr('noOrders'), '');
  } catch (err) { $('#olist').innerHTML = emptyState('cloud-cross-linear', err.message, ''); }
}
function orderCard(o, adminView = false) {
  const d = new Date(o.created_at);
  const est = o.items.some((l) => l.estimated);
  const q = (l) => (l.reward ? '🎁' : l.unit === 'dona' ? `${l.value} ${tr('pc')}` : l.mode === 'dona' ? `${l.value} ${tr('pc')} ≈${kgTxt(l.kg)} ${tr('kg')}` : `${kgTxt(l.kg)} ${tr('kg')}`);
  return `<div class="oc">
    <div class="h"><b>#${o.id}</b><span class="pill ${o.status}">${tr('st_' + o.status)}</span></div>
    <div class="d">${d.toLocaleDateString('ru-RU')} ${d.toTimeString().slice(0, 5)}</div>
    ${o.items.map((l) => `<div class="sumrow"><span style="color:var(--text)">${e(l.name)} · ${q(l)}</span><span>${l.reward ? '' : fmt(l.total)}</span></div>`).join('')}
    <div class="sumrow total"><span>${tr('total')}</span><span>${est ? '~' : ''}${fmt(o.total)} ${tr('sum')}</span></div>
    ${adminView ? `<div style="font-size:13px;color:var(--muted);margin-top:6px;line-height:1.6">👤 ${e(o.name)} · <a href="tel:${e(o.phone)}" style="color:var(--accent)">${e(o.phone)}</a>
      ${o.address ? '<br>🏠 ' + e(o.address) : ''}${o.comment ? '<br>💬 ' + e(o.comment) : ''}
      ${o.lat ? `<br><a href="https://maps.google.com/?q=${o.lat},${o.lng}" target="_blank" style="color:var(--accent)">📍 Xaritada ochish</a>` : ''}</div>${adminOrderActions(o)}` : ''}
  </div>`;
}

/* ================= ADMIN (alohida bot orqali /admin) ================= */
const SOLAR_ICONS = ['leaf', 'bottle', 'cup-hot', 'donut-bitten', 'box', 'cart-large-2', 'chef-hat', 'cookie', 'wineglass', 'tea-cup', 'fire', 'star', 'bag-4', 'gift', 'basket', 'washing-machine', 'baby-carriage', 'cat', 'medical-kit', 'pen', 'notebook', 'lightbulb', 't-shirt', 'sale'];
const NEXT = { new: ['accepted', 'cancelled'], accepted: ['delivering', 'done', 'cancelled'], delivering: ['done', 'cancelled'] };
function adminOrderActions(o) {
  const n = NEXT[o.status]; if (!n) return '';
  return `<div class="actions">${n.map((s) => `<button class="btn sm ${s === 'cancelled' ? 'ghost' : ''}" data-st="${o.id}:${s}">${tr('st_' + s)}</button>`).join('')}</div>`;
}

async function admin(v, tab = 'orders') {
  if (!S.me?.is_admin) { v.innerHTML = `<div style="height:var(--top)"></div>` + emptyState('shield-cross-linear', 'Ruxsat yo\'q', 'Admin panel faqat admin bot orqali ochiladi.'); return; }
  const tabs = [['orders', 'Buyurtmalar'], ['products', 'Mahsulotlar'], ['categories', 'Kategoriyalar'], ['banners', 'Bannerlar'], ['faq', 'Savollar'], ['settings', 'Sozlamalar']];
  v.innerHTML = `${navbar('Admin panel', { back: false })}
    <div class="admin-tabs">${tabs.map(([k, t]) => `<button class="chip ${k === tab ? 'on' : ''}" data-tab2="${k}">${t}</button>`).join('')}</div>
    <div id="adm"><div class="sk" style="height:120px;margin:0 16px"></div></div>`;
  v.querySelectorAll('[data-tab2]').forEach((b) => b.onclick = () => { hap('light'); location.replace('#admin/' + b.dataset.tab2); });
  $('.admin-tabs .chip.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  try {
    if (!S.admin) S.admin = await api('/api/admin/all');
    ({ orders: admOrders, products: admProducts, categories: admCategories, banners: admBanners, faq: admFaq, settings: admSettings })[tab]?.($('#adm'));
  } catch (err) { $('#adm').innerHTML = emptyState('cloud-cross-linear', err.message, ''); }
}
const reloadAdmin = async () => { S.admin = await api('/api/admin/all'); render(true); };
const addBtn = (id, text) => `<div class="pad" style="margin-bottom:12px"><button class="btn" id="${id}">${ic('add-circle-bold')}${text}</button></div>`;
const listRows = (items, fn) => `<div class="group">${items.map(fn).join('') || '<div class="row">—</div>'}</div>`;

async function admOrders(box) {
  const sts = ['new', 'accepted', 'delivering', 'done', 'cancelled', 'all'];
  box.innerHTML = `<div class="stats" id="stats"></div>
    <div class="admin-tabs" style="padding-top:0">${sts.map((s) => `<button class="chip ${S.adminStatus === s ? 'on' : ''}" data-fs="${s}">${s === 'all' ? 'Hammasi' : tr('st_' + s)}</button>`).join('')}</div>
    <div id="aol"><div class="sk" style="height:140px;margin:0 16px"></div></div>`;
  box.querySelectorAll('[data-fs]').forEach((b) => b.onclick = () => { S.adminStatus = b.dataset.fs; admOrders(box); });
  api('/api/admin/stats').then((s) => { const el = $('#stats'); if (el) el.innerHTML = `
    <div class="stat"><b>${s.today_orders}</b><small>Bugun buyurtma</small></div>
    <div class="stat"><b>${fmt(s.today_sum)}</b><small>Bugun, so'm</small></div>
    <div class="stat"><b>${s.users}</b><small>Mijozlar</small></div>`; }).catch(() => {});
  const list = await api('/api/admin/orders?status=' + S.adminStatus);
  const aol = $('#aol'); if (!aol) return;
  aol.innerHTML = list.length ? list.map((o) => orderCard(o, true)).join('') : emptyState('bag-4-linear', 'Buyurtma yo\'q', '');
  aol.querySelectorAll('[data-st]').forEach((b) => b.onclick = async () => {
    const [id, st] = b.dataset.st.split(':');
    if (st === 'cancelled' && !confirm('Bekor qilinsinmi?')) return;
    b.disabled = true;
    try { await api('/api/admin/orders/' + id, { method: 'PATCH', body: { status: st } }); toast('✓ ' + tr('st_' + st), 'success'); admOrders(box); }
    catch (err) { toast(err.message, 'error'); b.disabled = false; }
  });
}

function admProducts(box) {
  const A = S.admin;
  const catName = (id) => A.categories.find((c) => c.id === id)?.name_uz || '—';
  box.innerHTML = addBtn('addP', 'Mahsulot qo\'shish') + `<div class="pad" style="margin-bottom:12px"><label class="search-pill">${ic('magnifer-linear')}<input id="aq" placeholder="Qidirish…"></label></div><div id="apl"></div>`;
  const draw = () => {
    const q = $('#aq').value.toLowerCase();
    $('#apl').innerHTML = listRows(A.products.filter((p) => p.name_uz.toLowerCase().includes(q)), (p) => `
      <button class="row" data-id="${p.id}" style="${p.active ? '' : 'opacity:.4'}"><span class="thumb">${img(p.image)}</span>
        <span class="tx">${e(p.name_uz)}<small>${fmt(p.price)} ${p.unit === 'kg' ? '/kg' : '/dona'} · ${e(catName(p.category_id))}${p.popular ? ' · 🔥' : ''}${p.coin_price ? ' · 🪙' + p.coin_price : ''}${p.in_stock ? '' : ' · ❌ tugagan'}</small></span>${ic('pen-2-linear')}</button>`);
    $('#apl').querySelectorAll('[data-id]').forEach((r) => r.onclick = () => productForm(A.products.find((p) => p.id === Number(r.dataset.id))));
  };
  $('#aq').oninput = draw; draw();
  $('#addP').onclick = () => productForm(null);
}
function productForm(p) {
  const A = S.admin;
  formSheet('products', p, [
    { k: 'image', t: 'image', label: 'Rasm (kvadrat)' },
    { k: 'name_uz', label: 'Nomi (o\'zbekcha)', req: true },
    { k: 'name_ru', label: 'Nomi (ruscha)' },
    { k: 'category_id', t: 'select', label: 'Kategoriya', num: true, opts: [['', '—'], ...A.categories.map((c) => [c.id, c.name_uz])] },
    { k: 'unit', t: 'select', label: 'O\'lchov', opts: [['dona', 'Dona'], ['kg', 'Kilogramm']], def: 'dona' },
    { k: 'price', t: 'number', label: 'Narxi (1 kg yoki 1 dona), so\'m', req: true },
    { k: 'old_price', t: 'number', label: 'Eski narx (chegirma % ko\'rinadi)' },
    { k: 'piece_kg', t: 'number', step: '0.001', label: 'Kilolik: 1 dona ≈ necha kg (masalan 0.2) — dona bilan sotish uchun' },
    { k: 'min_kg', t: 'number', step: '0.001', label: 'Kilolik: minimal kg', def: 0.1 },
    { k: 'coin_price', t: 'number', label: 'Coinga sovg\'a: necha coin (bo\'sh = yo\'q)' },
    { k: 'desc_uz', t: 'textarea', label: 'Tavsif (o\'zbekcha)' },
    { k: 'desc_ru', t: 'textarea', label: 'Tavsif (ruscha)' },
    { k: 'sort', t: 'number', label: 'Tartib raqami', def: 0 },
    { k: 'popular', t: 'switch', label: '🔥 Ommabop bo\'limida', def: false },
    { k: 'in_stock', t: 'switch', label: 'Sotuvda bor', def: true },
    { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ]);
}
function admCategories(box) {
  box.innerHTML = addBtn('addC', 'Kategoriya qo\'shish') + listRows(S.admin.categories, (c, i) => `<button class="row" data-id="${c.id}" style="${c.active ? '' : 'opacity:.4'}">
    <span class="thumb tint-${i % TINTS}">${c.image ? img(c.image) : `<iconify-icon icon="${e(c.icon)}"></iconify-icon>`}</span><span class="tx">${e(c.name_uz)}<small>${e(c.name_ru || '')}</small></span>${ic('pen-2-linear')}</button>`);
  const form = (c) => formSheet('categories', c, [
    { k: 'image', t: 'image', label: 'Rasm (kvadrat, ixtiyoriy)' },
    { k: 'name_uz', label: 'Nomi (o\'zbekcha)', req: true },
    { k: 'name_ru', label: 'Nomi (ruscha)' },
    { k: 'icon', t: 'icon', label: 'Ikonka (rasm bo\'lmasa)', def: 'solar:bag-4-bold-duotone' },
    { k: 'sort', t: 'number', label: 'Tartib', def: 0 },
    { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ]);
  $('#addC').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => form(S.admin.categories.find((c) => c.id === Number(r.dataset.id))));
}
function admBanners(box) {
  const A = S.admin;
  box.innerHTML = `<div class="pad"><div class="note">${ic('info-circle-bold')}<span>Banner rasmi deyarli kvadrat bo'lsin (masalan 1080×1200). Aylanish tezligi — Sozlamalarda.</span></div></div>` +
    addBtn('addB', 'Banner qo\'shish') +
    listRows(A.banners, (b) => `<button class="row" data-id="${b.id}" style="${b.active ? '' : 'opacity:.4'}"><span class="thumb">${img(b.image)}</span><span class="tx">${e(b.title || 'Banner #' + b.id)}<small>${b.link_type === 'none' ? '—' : b.link_type + ' #' + b.link_id}</small></span>${ic('pen-2-linear')}</button>`);
  const linkOpts = [['none:', '— hech qayerga'], ...A.categories.map((c) => [`category:${c.id}`, '📂 ' + c.name_uz]), ...A.products.filter((p) => p.active).map((p) => [`product:${p.id}`, '🛒 ' + p.name_uz])];
  const form = (b) => formSheet('banners', b ? { ...b, link: `${b.link_type}:${b.link_id ?? ''}` } : null, [
    { k: 'image', t: 'image', label: 'Rasm', req: true },
    { k: 'title', label: 'Sarlavha (ixtiyoriy, rasm ustida)' },
    { k: 'subtitle', label: 'Qo\'shimcha matn (ixtiyoriy)' },
    { k: 'link', t: 'select', label: 'Bosilganda qayerga o\'tadi', opts: linkOpts, def: 'none:' },
    { k: 'sort', t: 'number', label: 'Tartib', def: 0 },
    { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ], (data) => {
    const [lt, lid] = String(data.link || 'none:').split(':');
    delete data.link; data.link_type = lt; data.link_id = lid ? Number(lid) : null;
    return data;
  });
  $('#addB').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => form(A.banners.find((b) => b.id === Number(r.dataset.id))));
}
function admFaq(box) {
  box.innerHTML = addBtn('addF', 'Savol qo\'shish') +
    listRows(S.admin.faq, (f) => `<button class="row" data-id="${f.id}">${ic('question-circle-linear')}<span class="tx">${e(f.q_uz)}<small>${e(f.a_uz)}</small></span>${ic('pen-2-linear')}</button>`);
  const form = (f) => formSheet('faq', f, [
    { k: 'q_uz', label: 'Savol (o\'zbekcha)', req: true }, { k: 'a_uz', t: 'textarea', label: 'Javob (o\'zbekcha)', req: true },
    { k: 'q_ru', label: 'Savol (ruscha)' }, { k: 'a_ru', t: 'textarea', label: 'Javob (ruscha)' },
    { k: 'sort', t: 'number', label: 'Tartib', def: 0 },
  ]);
  $('#addF').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => form(S.admin.faq.find((f) => f.id === Number(r.dataset.id))));
}
function admSettings(box) {
  const st = S.admin.settings;
  const shop = st.shop || {}, d = st.delivery || {}, c = st.coins || {}, b = st.banner || {}, th = st.theme || {}, inf = st.info || {};
  const f = (id, label, val, type = 'text') => `<div class="field"><label>${label}</label><input id="${id}" type="${type}" value="${e(val ?? '')}"></div>`;
  const ta = (id, label, val) => `<div class="field"><label>${label}</label><textarea id="${id}" rows="3">${e(val ?? '')}</textarea></div>`;
  const h = (t) => `<div class="sec-h" style="padding-top:10px"><b style="font-size:16px">${t}</b></div>`;
  box.innerHTML = `${h('Do\'kon')}${f('s_name', 'Nomi', shop.name)}${f('s_phone', 'Telefon', shop.phone)}${f('s_hours', 'Ish vaqti', shop.work_hours)}
    ${h('Ko\'rinish')}<div class="field"><label>Asosiy rang (tugmalar)</label><input id="s_accent" type="color" value="${e(th.accent || '#16a34a')}" style="height:52px;padding:4px"></div>
    ${f('s_bi', 'Banner aylanish oralig\'i, ms (1000 = 1 soniya)', b.interval_ms ?? 1000, 'number')}
    ${h('Yetkazib berish')}${f('s_fee', 'Narxi, so\'m', d.fee ?? 0, 'number')}${f('s_free', 'Shu summadan bepul (0 = yo\'q)', d.free_from ?? 0, 'number')}${f('s_min', 'Minimal buyurtma, so\'m', d.min_order ?? 0, 'number')}
    ${h('Coin tizimi')}${f('s_spc', 'Necha so\'m xarid = 1 coin', c.sum_per_coin ?? 1000, 'number')}
    <div class="group"><div class="row"><span class="tx">Coin yoqilgan</span><button class="switch ${c.enabled !== false ? 'on' : ''}" id="s_cen"></button></div></div>
    ${h('Ma\'lumot sahifalari')}${ta('i_about', 'Biz haqimizda', inf.about)}${ta('i_del', 'Yetkazib berish shartlari', inf.delivery)}${ta('i_ret', 'Qaytarish va almashtirish', inf.returns)}
    ${f('i_ig', 'Instagram havola', inf.instagram)}${f('i_tg', 'Telegram kanal havola', inf.telegram)}
    <div class="pad"><button class="btn" id="s_save">${tr('save')}</button></div>`;
  $('#s_cen').onclick = (ev) => ev.currentTarget.classList.toggle('on');
  $('#s_save').onclick = async () => {
    const n = (id) => Number($(id).value) || 0;
    const val = (id) => $(id).value.trim();
    try {
      S.admin.settings = await api('/api/admin/settings', { method: 'PATCH', body: {
        shop: { name: val('#s_name'), phone: val('#s_phone'), work_hours: val('#s_hours') },
        delivery: { fee: n('#s_fee'), free_from: n('#s_free'), min_order: n('#s_min') },
        coins: { sum_per_coin: Math.max(1, n('#s_spc')), enabled: $('#s_cen').classList.contains('on') },
        banner: { interval_ms: Math.max(700, n('#s_bi')) },
        theme: { accent: val('#s_accent') },
        info: { about: val('#i_about'), delivery: val('#i_del'), returns: val('#i_ret'), instagram: val('#i_ig'), telegram: val('#i_tg') },
      } });
      toast(tr('saved'), 'success');
    } catch (err) { toast(err.message, 'error'); }
  };
}

function formSheet(entity, item, fields, transform) {
  const val = (f) => (item && item[f.k] !== undefined && item[f.k] !== null ? item[f.k] : f.def ?? '');
  const html = `<h2 style="margin-bottom:14px">${item ? tr('edit') : 'Yangi'}</h2>` + fields.map((f) => {
    const v = val(f);
    if (f.t === 'image') return `<div class="field"><label>${f.label}</label><button class="img-pick" data-img="${f.k}">${v ? `<img src="${e(v)}">` : ic('gallery-add-linear') + '&nbsp;Rasm tanlash'}</button><input type="hidden" data-k="${f.k}" value="${e(v)}"></div>`;
    if (f.t === 'select') return `<div class="field"><label>${f.label}</label><select data-k="${f.k}">${f.opts.map(([k, t]) => `<option value="${e(k)}" ${String(k) === String(v) ? 'selected' : ''}>${e(t)}</option>`).join('')}</select></div>`;
    if (f.t === 'switch') return `<div class="group" style="margin:0 0 10px"><div class="row"><span class="tx">${f.label}</span><button class="switch ${v ? 'on' : ''}" data-sw="${f.k}"></button></div></div>`;
    if (f.t === 'textarea') return `<div class="field"><label>${f.label}</label><textarea data-k="${f.k}" rows="2">${e(v)}</textarea></div>`;
    if (f.t === 'icon') return `<div class="field"><label>${f.label}</label><input type="hidden" data-k="${f.k}" value="${e(v)}"><div class="chips">${SOLAR_ICONS.map((n) => `<button class="chip ${v === `solar:${n}-bold-duotone` ? 'on' : ''}" data-icon="solar:${n}-bold-duotone" style="font-size:20px;height:40px">${ic(n + '-bold-duotone')}</button>`).join('')}</div></div>`;
    return `<div class="field"><label>${f.label}${f.req ? ' *' : ''}</label><input data-k="${f.k}" ${f.t === 'number' ? `type="number" inputmode="decimal" step="${f.step || '1'}"` : ''} value="${e(v)}"></div>`;
  }).join('') + `<button class="btn" id="fSave">${tr('save')}</button>${item ? `<button class="btn danger" id="fDel" style="margin-top:4px">${ic('trash-bin-minimalistic-linear')}${tr('remove')}</button>` : ''}`;

  openSheet(html, (root) => {
    root.querySelectorAll('[data-sw]').forEach((s) => s.onclick = () => s.classList.toggle('on'));
    root.querySelectorAll('[data-icon]').forEach((b) => b.onclick = () => {
      root.querySelectorAll('[data-icon]').forEach((x) => x.classList.toggle('on', x === b));
      b.closest('.field').querySelector('[data-k]').value = b.dataset.icon;
    });
    root.querySelectorAll('[data-img]').forEach((b) => b.onclick = async () => {
      const f = await pickFile(); if (!f) return;
      b.innerHTML = '<div class="sk" style="width:100%;height:100%"></div>';
      try {
        const { url } = await api('/api/admin/upload', { method: 'POST', body: { image: await resizeImage(f, 1200, 0.85) } });
        root.querySelector(`[data-k="${b.dataset.img}"]`).value = url;
        b.innerHTML = `<img src="${e(url)}">`;
      } catch (err) { toast(err.message, 'error'); b.innerHTML = ic('gallery-add-linear'); }
    });
    $('#fSave', root).onclick = async () => {
      let data = {};
      for (const f of fields) {
        if (f.t === 'switch') { data[f.k] = root.querySelector(`[data-sw="${f.k}"]`).classList.contains('on'); continue; }
        let x = root.querySelector(`[data-k="${f.k}"]`).value.trim();
        if (f.req && !x) return toast(`${f.label} — to'ldiring`, 'error');
        if (f.t === 'number' || f.num) x = x === '' ? null : Number(x);
        else if (x === '') x = null;
        data[f.k] = x;
      }
      if (transform) data = transform(data);
      try {
        await api(`/api/admin/${entity}${item ? '/' + item.id : ''}`, { method: item ? 'PATCH' : 'POST', body: data });
        closeSheet(); toast(tr('saved'), 'success'); reloadAdmin();
      } catch (err) { toast(err.message, 'error'); }
    };
    const del = $('#fDel', root);
    if (del) del.onclick = async () => {
      if (!confirm('O\'chirilsinmi?')) return;
      try { await api(`/api/admin/${entity}/${item.id}`, { method: 'DELETE' }); closeSheet(); reloadAdmin(); }
      catch (err) { toast(err.message, 'error'); }
    };
  });
}

/* ---------------- AUTO-UPDATE ---------------- */
async function checkVersion() {
  if (window.__mockApi) return;
  try {
    const r = await fetch('/api/version', { cache: 'no-store' });
    const { version } = await r.json();
    if (version && version !== window.APP_VERSION) {
      local.set('justUpdated', true);
      const u = new URL(location.href); u.searchParams.set('v', version);
      location.replace(u.toString());
    }
  } catch {}
}
setInterval(checkVersion, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });

/* ---------------- BOOT ---------------- */
async function loadCatalog() {
  S.catalog = await api('/api/catalog');
  if (S.catalog.version && S.catalog.version !== window.APP_VERSION && !window.__mockApi) checkVersion();
}
function hideSplash() { const s = $('#splash'); if (s) { s.classList.add('out'); setTimeout(() => s.remove(), 500); } }

async function boot() {
  if (/[?&]demo=1/.test(location.search)) {
    await new Promise((res) => { const s = document.createElement('script'); s.src = '/demo.js?v=' + window.APP_VERSION; s.onload = res; s.onerror = res; document.head.appendChild(s); });
  }
  try {
    tg.ready(); tg.expand(); tg.disableVerticalSwipes?.();
    if (!ADMIN_MODE && tg.isVersionAtLeast?.('8.0') && ['ios', 'android'].includes(tg.platform)) tg.requestFullscreen?.();
  } catch {}
  try { tg.onEvent('themeChanged', applyTheme); } catch {}
  applyTheme(); updateBadge();
  const t0 = Date.now();
  try {
    const hasAuth = window.__mockApi || tg?.initData;
    const [, me, cl] = await Promise.all([
      loadCatalog(),
      hasAuth ? api('/api/me').catch(() => null) : null,
      cloud.load(['cart', 'fav']),
    ]);
    S.me = me;
    try { if (cl.cart) S.cart = JSON.parse(cl.cart); if (cl.fav) S.fav = JSON.parse(cl.fav); } catch {}
    if (me?.lang && me.lang !== S.lang) { S.lang = me.lang; local.set('lang', me.lang); }
    applyTheme(); updateBadge();
    await new Promise((r) => setTimeout(r, Math.max(0, 650 - (Date.now() - t0))));
    render();
    hideSplash();
    if (local.get('justUpdated', false)) { local.set('justUpdated', false); toast('✨ ' + tr('updated')); }
  } catch (err) {
    hideSplash();
    $('#view').innerHTML = `<div style="height:var(--top)"></div>` + emptyState('cloud-cross-linear', tr('error'), err.message, '<button class="btn" style="max-width:220px;margin:auto" onclick="location.reload()">↻</button>');
  }
}
boot();
})();
