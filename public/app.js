/* GREEN MARKET — Telegram Mini App */
(() => {
'use strict';

const tg = window.Telegram?.WebApp || null;
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const e = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n) => `<iconify-icon icon="solar:${n}"></iconify-icon>`;
const fmt = (n) => Math.round(Number(n || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const round100 = (x) => Math.round(x / 100) * 100;
const round3 = (x) => Math.round(x * 1000) / 1000;
const kgTxt = (x) => String(round3(x)).replace('.', ',');
const hap = (t = 'light') => { try { ['success', 'error', 'warning'].includes(t) ? tg.HapticFeedback.notificationOccurred(t) : tg.HapticFeedback.impactOccurred(t); } catch {} };
const store = {
  get(k, d) { try { const v = localStorage.getItem('gm_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('gm_' + k, JSON.stringify(v)); } catch {} },
};

/* ---------------- I18N ---------------- */
const L = {
  uz: {
    t_home: 'Asosiy', t_cart: 'Savat', t_bonus: 'Bonus', t_profile: 'Profil',
    hello: 'Salom', search: 'Mahsulot qidirish…', all: 'Hammasi', products: 'Mahsulotlar', found: 'ta',
    sum: "so'm", perKg: '/ kg', perPc: '/ dona', kg: 'kg', pc: 'dona',
    byKg: 'Kilo', bySum: 'Summa', byPc: 'Dona', enterSum: 'Qancha so\'mlik?',
    approx: 'taxminan', estNote: 'Dona tanlanganda narx taxminiy. Aniq summa tortilgandan keyin hisoblanadi.',
    addCart: 'Savatga qo\'shish', save: 'Saqlash', remove: 'O\'chirish', outStock: 'Mavjud emas',
    added: 'Savatga qo\'shildi', minIs: 'Kamida', cartEmpty: 'Savatingiz bo\'sh', goShop: 'Xarid qilish',
    delivery: 'Yetkazib berish', address: 'Manzil', noAddress: 'Manzil tanlanmagan', phone: 'Telefon',
    comment: 'Izoh (podyezd, qavat, mo\'ljal…)', payment: 'To\'lov usuli', cash: 'Naqd yoki kartaga kuryerga',
    payme: 'Payme orqali onlayn', soon: 'tez kunda', subtotal: 'Mahsulotlar', fee: 'Yetkazish', free: 'Bepul',
    coinsUse: 'Coin bilan', willEarn: 'Sizga qo\'shiladi', total: 'Jami', order: 'Buyurtma berish',
    needPhone: 'Telefon raqamingizni kiriting', needAddr: 'Yetkazish manzilini tanlang', minOrder: 'Minimal buyurtma',
    success: 'Buyurtma qabul qilindi!', successSub: 'Holati haqida botda xabar beramiz.', myOrders: 'Buyurtmalarim', toHome: 'Bosh sahifa',
    coins: 'coin', yourCoins: 'Sizning coinlaringiz', nextGift: 'Keyingi sovg\'agacha', howEarn: 'Qanday yig\'iladi?',
    earnRule: (s) => `Har ${fmt(s)} so'mlik xarid = 1 coin. Coin buyurtma yetkazilgach hisobingizga tushadi.`,
    gifts: 'Coinga sovg\'alar', take: 'Olish', needMore: (n) => `yana ${n}`, noGifts: 'Hozircha sovg\'alar yo\'q',
    giftAdded: 'Sovg\'a savatga qo\'shildi',
    myData: 'Ma\'lumotlarim', name: 'Ism', lang: 'Til', theme: 'Mavzu', support: 'Yordam', admin: 'Admin panel',
    th_auto: 'Telegram bo\'yicha', th_light: 'Kunduzgi', th_dark: 'Tungi', changePhoto: 'Rasmni o\'zgartirish',
    saved: 'Saqlandi', faq: 'Ko\'p beriladigan savollar', writeUs: 'Bizga yozing', msgPh: 'Savolingizni yozing…',
    send: 'Yuborish', sent: 'Xabar yuborildi', call: 'Qo\'ng\'iroq qilish', noOrders: 'Hali buyurtma yo\'q',
    st_new: 'Yangi', st_accepted: 'Qabul qilindi', st_delivering: 'Yo\'lda', st_done: 'Yetkazildi', st_cancelled: 'Bekor qilindi',
    pickMap: 'Xaritada joyni tanlang', myLoc: 'Mening joylashuvim', addrDetail: 'Uy, podyezd, qavat, xonadon',
    saveAddr: 'Manzilni saqlash', openInBot: 'Ilovani Telegram bot orqali oching', error: 'Xatolik yuz berdi',
    updated: 'Ilova yangilandi', gift: 'Sovg\'a', edit: 'Tahrirlash',
  },
  ru: {
    t_home: 'Главная', t_cart: 'Корзина', t_bonus: 'Бонусы', t_profile: 'Профиль',
    hello: 'Привет', search: 'Поиск товаров…', all: 'Все', products: 'Товары', found: 'шт',
    sum: 'сум', perKg: '/ кг', perPc: '/ шт', kg: 'кг', pc: 'шт',
    byKg: 'Вес', bySum: 'Сумма', byPc: 'Штуки', enterSum: 'На какую сумму?',
    approx: 'примерно', estNote: 'При выборе штук цена примерная. Точная сумма — после взвешивания.',
    addCart: 'В корзину', save: 'Сохранить', remove: 'Удалить', outStock: 'Нет в наличии',
    added: 'Добавлено в корзину', minIs: 'Минимум', cartEmpty: 'Корзина пуста', goShop: 'За покупками',
    delivery: 'Доставка', address: 'Адрес', noAddress: 'Адрес не выбран', phone: 'Телефон',
    comment: 'Комментарий (подъезд, этаж, ориентир…)', payment: 'Способ оплаты', cash: 'Наличными или картой курьеру',
    payme: 'Онлайн через Payme', soon: 'скоро', subtotal: 'Товары', fee: 'Доставка', free: 'Бесплатно',
    coinsUse: 'Коинами', willEarn: 'Вам начислится', total: 'Итого', order: 'Оформить заказ',
    needPhone: 'Укажите номер телефона', needAddr: 'Выберите адрес доставки', minOrder: 'Минимальный заказ',
    success: 'Заказ принят!', successSub: 'О статусе сообщим в боте.', myOrders: 'Мои заказы', toHome: 'На главную',
    coins: 'коин', yourCoins: 'Ваши коины', nextGift: 'До следующего подарка', howEarn: 'Как накопить?',
    earnRule: (s) => `Каждые ${fmt(s)} сум покупок = 1 коин. Коины начисляются после доставки заказа.`,
    gifts: 'Подарки за коины', take: 'Взять', needMore: (n) => `ещё ${n}`, noGifts: 'Пока подарков нет',
    giftAdded: 'Подарок добавлен в корзину',
    myData: 'Мои данные', name: 'Имя', lang: 'Язык', theme: 'Тема', support: 'Поддержка', admin: 'Админ-панель',
    th_auto: 'Как в Telegram', th_light: 'Светлая', th_dark: 'Тёмная', changePhoto: 'Сменить фото',
    saved: 'Сохранено', faq: 'Частые вопросы', writeUs: 'Напишите нам', msgPh: 'Напишите вопрос…',
    send: 'Отправить', sent: 'Сообщение отправлено', call: 'Позвонить', noOrders: 'Заказов пока нет',
    st_new: 'Новый', st_accepted: 'Принят', st_delivering: 'В пути', st_done: 'Доставлен', st_cancelled: 'Отменён',
    pickMap: 'Выберите место на карте', myLoc: 'Моё местоположение', addrDetail: 'Дом, подъезд, этаж, квартира',
    saveAddr: 'Сохранить адрес', openInBot: 'Откройте приложение через Telegram-бота', error: 'Произошла ошибка',
    updated: 'Приложение обновлено', gift: 'Подарок', edit: 'Изменить',
  },
};

/* ---------------- STATE ---------------- */
const S = {
  catalog: null,
  me: null,
  lang: store.get('lang', (tg?.initDataUnsafe?.user?.language_code || '').startsWith('ru') ? 'ru' : 'uz'),
  cart: store.get('cart', []),
  catId: 'all',
  q: '',
  admin: null,
  adminOrders: null,
  adminStatus: 'new',
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
let toastT;
function toast(msg, type) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  if (type) hap(type);
  clearTimeout(toastT);
  toastT = setTimeout(() => t.classList.remove('show'), 2200);
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
  w.classList.remove('open');
  setTimeout(() => { w.hidden = true; $('#sheetBody').innerHTML = ''; }, 380);
}
$('.sheet-backdrop').addEventListener('click', closeSheet);
// pastga surib yopish
(() => {
  const sh = $('.sheet'); let y0 = null, dy = 0;
  sh.addEventListener('touchstart', (ev) => { if (sh.scrollTop <= 0) { y0 = ev.touches[0].clientY; dy = 0; } }, { passive: true });
  sh.addEventListener('touchmove', (ev) => {
    if (y0 === null) return; dy = ev.touches[0].clientY - y0;
    if (dy > 0) { sh.style.transition = 'none'; sh.style.transform = `translateY(${dy}px)`; }
  }, { passive: true });
  sh.addEventListener('touchend', () => {
    sh.style.transition = ''; sh.style.transform = '';
    if (y0 !== null && dy > 110) closeSheet();
    y0 = null;
  });
})();

function img(src, fallback = 'bag-4-bold-duotone') {
  return src ? `<img src="${e(src)}" loading="lazy" alt="">` : ic(fallback);
}

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
      im.onerror = reject;
      im.src = r.result;
    };
    r.onerror = reject;
    r.readAsDataURL(file);
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

/* ---------------- THEME ---------------- */
function applyTheme() {
  const pref = S.me?.theme || store.get('theme', 'auto');
  const mode = pref === 'auto' ? (tg?.colorScheme || (matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')) : pref;
  document.documentElement.dataset.theme = mode;
  const bg = mode === 'dark' ? '#0c0d0c' : '#f4f5f2';
  try { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); tg.setBottomBarColor?.(bg); } catch {}
}

/* ---------------- PRICING (server bilan bir xil) ---------------- */
function priceLine(p, it) {
  if (!p) return null;
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
  if (it.reward) return `🎁 ${it.value} × ${p.coin_price} ${tr('coins')}`;
  if (p.unit === 'dona') return `${it.value} ${tr('pc')} × ${fmt(p.price)}`;
  if (it.mode === 'kg') return `${kgTxt(it.value)} ${tr('kg')}`;
  if (it.mode === 'sum') return `${fmt(it.value)} ${tr('sum')} ≈ ${kgTxt(pl.kg)} ${tr('kg')}`;
  return `${it.value} ${tr('pc')} ≈ ${kgTxt(pl.kg)} ${tr('kg')}`;
}

/* ---------------- CART ---------------- */
const saveCart = () => { store.set('cart', S.cart); updateBadge(); };
function cartTotals() {
  let subtotal = 0, coins = 0, est = false;
  S.cart = S.cart.filter((it) => product(it.id));
  for (const it of S.cart) {
    const pl = priceLine(product(it.id), it);
    subtotal += pl.total; coins += pl.coins; est = est || pl.est;
  }
  const d = setting('delivery', { fee: 0, free_from: 0, min_order: 0 });
  const fee = d.free_from && subtotal >= d.free_from ? 0 : Number(d.fee || 0);
  const c = setting('coins', { sum_per_coin: 1000, enabled: true });
  const earn = c.enabled && c.sum_per_coin ? Math.floor(subtotal / c.sum_per_coin) : 0;
  return { subtotal, coins, est, fee, total: subtotal + fee, earn, min: Number(d.min_order || 0) };
}
function addToCart(it, replaceKey) {
  const key = `${it.id}:${it.reward ? 'r' : it.mode}`;
  if (replaceKey) S.cart = S.cart.filter((x) => x.k !== replaceKey);
  const ex = S.cart.find((x) => x.k === key);
  if (ex && !replaceKey) ex.value = it.mode === 'kg' ? round3(ex.value + it.value) : ex.value + it.value;
  else S.cart.push({ ...it, k: key });
  saveCart();
  const b = $('#cartBadge'); b.classList.remove('bump'); void b.offsetWidth; b.classList.add('bump');
}
function inCart(id) {
  const lines = S.cart.filter((x) => x.id === id && !x.reward);
  if (!lines.length) return '';
  const p = product(id);
  if (p.unit === 'dona') return lines.reduce((s, x) => s + x.value, 0) + ' ' + tr('pc');
  const kg = lines.reduce((s, x) => s + (priceLine(p, x).kg || 0), 0);
  return kgTxt(round3(kg)) + ' ' + tr('kg');
}
function updateBadge() {
  const b = $('#cartBadge');
  const n = S.cart.length;
  b.hidden = !n; b.textContent = n;
}

/* ---------------- ROUTER ---------------- */
const TABS = ['home', 'cart', 'bonus', 'profile'];
function route() { return (location.hash.slice(1) || 'home').split('/'); }
function go(h) { if (location.hash !== '#' + h) location.hash = h; else render(); }

window.addEventListener('hashchange', () => { closeSheetIfOpen(); render(); });
function closeSheetIfOpen() { if (!$('#sheetWrap').hidden) closeSheet(); }

$$('#tabbar button').forEach((b) => b.addEventListener('click', () => { hap('light'); go(b.dataset.tab); }));

let bannerTimer = null;
function render() {
  clearInterval(bannerTimer);
  const [page, sub, id] = route();
  const isTab = TABS.includes(page);
  $('#tabbar').classList.toggle('hide', !isTab);
  $$('#tabbar button').forEach((b) => b.classList.toggle('on', b.dataset.tab === page));
  $$('[data-i]').forEach((el) => { el.textContent = tr(el.dataset.i); });
  try {
    if (isTab) tg.BackButton.hide(); else tg.BackButton.show();
  } catch {}
  const v = $('#view');
  v.classList.remove('enter'); void v.offsetWidth; v.classList.add('enter');
  window.scrollTo(0, 0);
  const R = { home, cart, bonus, profile, orders, edit, map, support, success, admin };
  (R[page] || home)(v, sub, id);
}
try { tg.BackButton.onClick(() => { if (!$('#sheetWrap').hidden) return closeSheet(); history.length > 1 ? history.back() : go('home'); }); } catch {}

/* ---------------- PAGES ---------------- */
function avatarHtml(size = '') {
  const m = S.me;
  if (m?.avatar) return `<div class="avatar" ${size}><img src="${e(m.avatar)}" alt=""></div>`;
  const ph = tg?.initDataUnsafe?.user?.photo_url;
  if (ph) return `<div class="avatar" ${size}><img src="${e(ph)}" alt=""></div>`;
  const letter = (m?.name || tg?.initDataUnsafe?.user?.first_name || 'G')[0].toUpperCase();
  return `<div class="avatar" ${size}>${e(letter)}</div>`;
}

function home(v) {
  if (!S.catalog) {
    v.innerHTML = `<div class="sk" style="height:48px;margin-bottom:16px"></div><div class="sk" style="aspect-ratio:2.1;margin-bottom:18px"></div><div class="grid">${'<div class="sk" style="aspect-ratio:.75"></div>'.repeat(4)}</div>`;
    return;
  }
  const { categories, banners } = S.catalog;
  const name = S.me?.name || tg?.initDataUnsafe?.user?.first_name || '';
  v.innerHTML = `
    <div class="top">
      <button class="press" data-go="profile">${avatarHtml()}</button>
      <div class="hi"><small>${tr('hello')} 👋</small><b>${e(name || setting('shop').name || 'Green Market')}</b></div>
      <button class="coin-chip press" data-go="bonus">${ic('dollar-minimalistic-bold-duotone')}${fmt(S.me?.coins || 0)}</button>
    </div>
    <label class="search">${ic('magnifer-linear')}<input id="q" type="search" placeholder="${tr('search')}" value="${e(S.q)}" autocomplete="off"></label>
    ${banners.length ? `<div class="banner" id="banner"><div class="banner-track">${[...banners, banners[0]].map((b, i) => `
      <div class="banner-slide" data-b="${i % banners.length}">${img(b.image, 'gallery-bold-duotone')}
        ${b.title || b.subtitle ? `<div class="cap"><b>${e(b.title)}</b><small>${e(b.subtitle)}</small></div>` : ''}</div>`).join('')}
      </div>${banners.length > 1 ? `<div class="banner-dots">${banners.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}</div>` : ''}
    <div class="cats" id="cats">
      <button class="cat press ${S.catId === 'all' ? 'on' : ''}" data-cat="all">${ic('widget-5-bold-duotone')}${tr('all')}</button>
      ${categories.map((c) => `<button class="cat press ${S.catId === c.id ? 'on' : ''}" data-cat="${c.id}"><iconify-icon icon="${e(c.icon || 'solar:box-bold-duotone')}"></iconify-icon>${e(cname(c))}</button>`).join('')}
    </div>
    <div class="section-h" id="gridHead"></div>
    <div class="grid" id="grid"></div>`;

  v.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => go(b.dataset.go));
  $('#q').oninput = (ev) => { S.q = ev.target.value; drawGrid(); };
  v.querySelectorAll('[data-cat]').forEach((b) => b.onclick = () => {
    hap('light');
    S.catId = b.dataset.cat === 'all' ? 'all' : Number(b.dataset.cat);
    v.querySelectorAll('[data-cat]').forEach((x) => x.classList.toggle('on', x === b));
    b.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
    drawGrid();
  });
  drawGrid();
  if (banners.length) startBanner(banners);
}

function drawGrid() {
  const grid = $('#grid'); if (!grid) return;
  const q = S.q.trim().toLowerCase();
  const list = S.catalog.products.filter((p) =>
    (S.catId === 'all' || p.category_id === S.catId) &&
    (!q || `${p.name_uz} ${p.name_ru || ''}`.toLowerCase().includes(q)));
  const cat = S.catalog.categories.find((c) => c.id === S.catId);
  $('#gridHead').innerHTML = `<b>${e(cat ? cname(cat) : tr('products'))}</b><small>${list.length} ${tr('found')}</small>`;
  if (!list.length) { grid.innerHTML = `<div class="empty" style="grid-column:1/-1">${ic('box-minimalistic-bold-duotone')}—</div>`; return; }
  grid.innerHTML = list.map((p, i) => {
    const q2 = inCart(p.id);
    return `<div class="pcard press ${p.in_stock ? '' : 'off'}" data-p="${p.id}" style="animation-delay:${Math.min(i, 10) * 30}ms">
      <div class="ph">${img(p.image)}</div>
      ${p.unit === 'kg' ? `<span class="tag">${tr('kg')}</span>` : ''}
      ${q2 ? `<span class="qty-pill">${q2}</span>` : ''}
      <div class="nm">${e(pname(p))}</div>
      ${p.old_price ? `<div class="old">${fmt(p.old_price)}</div>` : ''}
      <div class="pr"><div><b>${fmt(p.price)}</b> <small>${p.unit === 'kg' ? tr('perKg') : tr('sum')}</small></div>
      ${p.in_stock ? `<button class="add" data-add="${p.id}">${ic('add-circle-linear')}</button>` : ''}</div>
    </div>`;
  }).join('');
  grid.querySelectorAll('[data-p]').forEach((c) => c.onclick = (ev) => {
    const p = product(c.dataset.p);
    if (ev.target.closest('[data-add]') && p.unit === 'dona') {
      ev.stopPropagation();
      addToCart({ id: p.id, mode: 'dona', value: 1 });
      toast(tr('added'), 'success'); drawGrid(); return;
    }
    productSheet(p);
  });
}

function startBanner(banners) {
  const box = $('#banner'); if (!box) return;
  const track = box.querySelector('.banner-track');
  const dots = box.querySelectorAll('.banner-dots i');
  const n = banners.length;
  let i = 0, paused = false;
  const show = (k, anim = true) => {
    track.style.transition = anim ? '' : 'none';
    track.style.transform = `translateX(-${k * 100}%)`;
    dots.forEach((d, j) => d.classList.toggle('on', j === k % n));
  };
  track.addEventListener('transitionend', () => { if (i >= n) { i = 0; show(0, false); } });
  const next = () => { if (!paused && n > 1) { i++; show(i); } };
  const ms = Math.max(700, Number(setting('banner', { interval_ms: 1000 }).interval_ms) || 1000);
  bannerTimer = setInterval(next, ms + 600); // 600ms — o'tish animatsiyasi
  let x0 = null;
  box.addEventListener('touchstart', (ev) => { paused = true; x0 = ev.touches[0].clientX; }, { passive: true });
  box.addEventListener('touchend', (ev) => {
    const dx = ev.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 40 && n > 1) { i = (i % n + (dx < 0 ? 1 : n - 1)) % n; show(i); }
    else if (Math.abs(dx) < 8) openBanner(banners[i % n]);
    setTimeout(() => { paused = false; }, 1500);
    x0 = null;
  });
  box.addEventListener('click', (ev) => { if (!('ontouchstart' in window)) openBanner(banners[i % n]); ev.preventDefault(); });
}
function openBanner(b) {
  if (!b) return;
  hap('light');
  if (b.link_type === 'product' && product(b.link_id)) productSheet(product(b.link_id));
  if (b.link_type === 'category') {
    S.catId = Number(b.link_id);
    $$('[data-cat]').forEach((x) => x.classList.toggle('on', String(x.dataset.cat) === String(S.catId)));
    drawGrid();
    $('#gridHead')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

/* ---------- Product sheet ---------- */
function productSheet(p, editLine) {
  const isKg = p.unit === 'kg';
  const st = {
    mode: editLine ? editLine.mode : (isKg ? 'kg' : 'dona'),
    value: editLine ? editLine.value : (isKg ? 1 : 1),
  };
  const minKg = Number(p.min_kg || 0.1);
  const minSum = round100(p.price * minKg);
  const defaults = { kg: 1, sum: 10000, dona: 1 };

  const draw = () => {
    const modes = isKg ? [['kg', tr('byKg')], ['sum', tr('bySum')], ...(p.piece_kg ? [['dona', tr('byPc')]] : [])] : [];
    let body = '';
    if (st.mode === 'kg') {
      body = `<div class="stepper"><button data-d="-1">${ic('minus-circle-linear')}</button>
        <div class="val"><input id="val" type="text" inputmode="decimal" value="${kgTxt(st.value)}"><small>${tr('kg')}</small></div>
        <button data-d="1">${ic('add-circle-linear')}</button></div>
        <div class="chips">${[0.5, 1, 1.5, 2, 3, 5].filter((x) => x >= minKg).map((x) => `<button class="chip" data-set="${x}">${kgTxt(x)} ${tr('kg')}</button>`).join('')}</div>`;
    } else if (st.mode === 'sum') {
      body = `<div class="field"><label>${tr('enterSum')}</label>
        <div class="stepper"><button data-d="-1">${ic('minus-circle-linear')}</button>
        <div class="val"><input id="val" type="text" inputmode="numeric" value="${fmt(st.value)}"><small>${tr('sum')}</small></div>
        <button data-d="1">${ic('add-circle-linear')}</button></div></div>
        <div class="chips">${[2000, 3000, 5000, 10000, 20000, 50000].filter((x) => x >= minSum).map((x) => `<button class="chip" data-set="${x}">${fmt(x)}</button>`).join('')}</div>`;
    } else {
      body = `<div class="stepper"><button data-d="-1">${ic('minus-circle-linear')}</button>
        <div class="val"><input id="val" type="text" inputmode="numeric" value="${st.value}"><small>${tr('pc')}</small></div>
        <button data-d="1">${ic('add-circle-linear')}</button></div>
        ${isKg ? `<div class="note">${ic('info-circle-bold-duotone')}<span>${tr('estNote')}</span></div>` : ''}`;
    }
    return `
      <div class="hero">${img(p.image)}</div>
      <h2>${e(pname(p))}</h2>
      <div class="sub"><b style="color:var(--text)">${fmt(p.price)} ${tr('sum')}</b> ${isKg ? tr('perKg') : tr('perPc')}
        ${p.old_price ? ` · <s>${fmt(p.old_price)}</s>` : ''}</div>
      ${pdesc(p) ? `<p class="sub">${e(pdesc(p))}</p>` : ''}
      ${modes.length ? `<div class="seg">${modes.map(([m, t]) => `<button data-mode="${m}" class="${st.mode === m ? 'on' : ''}">${t}</button>`).join('')}</div>` : ''}
      ${body}
      <div id="calc" class="sub" style="text-align:center;min-height:20px"></div>
      ${p.in_stock
        ? `<button class="btn" id="addBtn">${ic('cart-plus-bold-duotone')}<span id="addTxt"></span></button>`
        : `<button class="btn" disabled>${tr('outStock')}</button>`}
      ${editLine ? `<button class="btn danger" id="delBtn" style="margin-top:6px">${ic('trash-bin-trash-linear')}${tr('remove')}</button>` : ''}`;
  };

  const valid = () => {
    if (st.mode === 'kg') return st.value >= minKg;
    if (st.mode === 'sum') return st.value >= minSum;
    return st.value >= 1;
  };
  const refresh = (root) => {
    const pl = priceLine(p, { mode: st.mode, value: st.value });
    const calc = $('#calc', root);
    if (!valid()) {
      calc.innerHTML = `<span style="color:var(--danger)">${tr('minIs')} ${st.mode === 'sum' ? fmt(minSum) + ' ' + tr('sum') : st.mode === 'kg' ? kgTxt(minKg) + ' ' + tr('kg') : '1'}</span>`;
    } else if (st.mode === 'sum') calc.textContent = `≈ ${kgTxt(pl.kg)} ${tr('kg')}`;
    else if (st.mode === 'dona' && isKg) calc.textContent = `≈ ${kgTxt(pl.kg)} ${tr('kg')} · ${tr('approx')} ${fmt(pl.total)} ${tr('sum')}`;
    else calc.textContent = '';
    const btn = $('#addBtn', root);
    if (btn) {
      btn.disabled = !valid();
      $('#addTxt', root).textContent = `${editLine ? tr('save') : tr('addCart')} · ${pl.est ? '~' : ''}${fmt(pl.total)} ${tr('sum')}`;
    }
  };
  const mount = (root) => {
    root.querySelectorAll('[data-mode]').forEach((b) => b.onclick = () => {
      hap('light');
      st.mode = b.dataset.mode; st.value = defaults[st.mode];
      root.innerHTML = draw(); mount(root);
    });
    const inp = $('#val', root);
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
      } else if (st.mode === 'sum') {
        st.value = Math.max(minSum, st.value + d * 1000);
      } else st.value = Math.max(1, st.value + d);
      inp.value = st.mode === 'kg' ? kgTxt(st.value) : st.mode === 'sum' ? fmt(st.value) : st.value;
      refresh(root);
    });
    root.querySelectorAll('[data-set]').forEach((b) => b.onclick = () => {
      hap('light');
      st.value = Number(b.dataset.set);
      inp.value = st.mode === 'kg' ? kgTxt(st.value) : fmt(st.value);
      refresh(root);
    });
    const add = $('#addBtn', root);
    if (add) add.onclick = () => {
      if (!valid()) return;
      const val = st.mode === 'kg' ? round3(st.value) : Math.floor(st.value);
      addToCart({ id: p.id, mode: st.mode, value: val }, editLine?.k);
      toast(editLine ? tr('saved') : tr('added'), 'success');
      closeSheet();
      route()[0] === 'cart' ? render() : drawGrid();
    };
    const del = $('#delBtn', root);
    if (del) del.onclick = () => {
      S.cart = S.cart.filter((x) => x.k !== editLine.k); saveCart();
      closeSheet(); render();
    };
    refresh(root);
  };
  openSheet(draw(), mount);
}

/* ---------- Cart ---------- */
function cart(v) {
  if (!S.catalog) return home(v);
  const t = cartTotals();
  if (!S.cart.length) {
    v.innerHTML = `<div class="page-title">${tr('t_cart')}</div>
      <div class="empty">${ic('cart-large-minimalistic-bold-duotone')}<p>${tr('cartEmpty')}</p>
      <button class="btn" style="max-width:240px;margin:16px auto 0" data-go="home">${tr('goShop')}</button></div>`;
    v.querySelector('[data-go]').onclick = () => go('home');
    return;
  }
  const me = S.me || {};
  v.innerHTML = `
    <div class="page-title">${tr('t_cart')}</div>
    <div class="card" style="padding:4px 16px">
      ${S.cart.map((it) => {
        const p = product(it.id); const pl = priceLine(p, it);
        return `<div class="cline press" data-k="${e(it.k)}">
          <div class="ph">${img(p.image)}</div>
          <div class="tx"><b>${e(pname(p))}</b><small>${lineLabel(p, it)}</small></div>
          <div class="sum">${it.reward ? `<span style="color:var(--accent)">${tr('gift')}</span>` : (pl.est ? '~' : '') + fmt(pl.total)}</div>
          <button class="icon-btn" data-del="${e(it.k)}">${ic('trash-bin-minimalistic-linear')}</button>
        </div>`;
      }).join('')}
    </div>

    <div class="list">
      <button class="row" data-go="map"><span class="ic">${ic('map-point-wave-bold-duotone')}</span>
        <span class="tx">${tr('delivery')}<small>${e(me.address || (me.lat ? `${me.lat.toFixed(4)}, ${me.lng.toFixed(4)}` : tr('noAddress')))}</small></span>${ic('alt-arrow-right-linear')}</button>
      <button class="row" data-go="edit"><span class="ic">${ic('phone-calling-rounded-bold-duotone')}</span>
        <span class="tx">${tr('phone')}<small>${e(me.phone || '—')}</small></span>${ic('alt-arrow-right-linear')}</button>
    </div>

    <div class="field"><textarea id="comment" placeholder="${tr('comment')}" rows="2">${e(store.get('comment', ''))}</textarea></div>

    <div class="section-h"><b style="font-size:16px">${tr('payment')}</b></div>
    <div class="list">
      <div class="row"><span class="ic">${ic('wallet-money-bold-duotone')}</span><span class="tx">${tr('cash')}</span>${ic('check-circle-bold')}</div>
      <div class="row" style="opacity:.45"><span class="ic">${ic('card-bold-duotone')}</span><span class="tx">${tr('payme')}<small>${tr('soon')}</small></span></div>
    </div>

    <div class="card">
      <div class="sumrow"><span>${tr('subtotal')}</span><span>${t.est ? '~' : ''}${fmt(t.subtotal)} ${tr('sum')}</span></div>
      <div class="sumrow"><span>${tr('fee')}</span><span>${t.fee ? fmt(t.fee) + ' ' + tr('sum') : tr('free')}</span></div>
      ${t.coins ? `<div class="sumrow"><span>${tr('coinsUse')}</span><span>−${t.coins} 🪙</span></div>` : ''}
      ${t.earn ? `<div class="sumrow"><span>${tr('willEarn')}</span><span style="color:var(--accent)">+${t.earn} 🪙</span></div>` : ''}
      <div class="sumrow total"><span>${tr('total')}</span><span>${t.est ? '~' : ''}${fmt(t.total)} ${tr('sum')}</span></div>
      ${t.est ? `<div class="note" style="margin:10px 0 0">${ic('info-circle-bold-duotone')}<span>${tr('estNote')}</span></div>` : ''}
    </div>
    <div style="height:70px"></div>
    <div class="sticky-cta"><button class="btn" id="orderBtn">${ic('bag-check-bold-duotone')}${tr('order')} · ${fmt(t.total)} ${tr('sum')}</button></div>`;

  v.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => go(b.dataset.go));
  v.querySelectorAll('[data-del]').forEach((b) => b.onclick = (ev) => {
    ev.stopPropagation(); hap('medium');
    S.cart = S.cart.filter((x) => x.k !== b.dataset.del); saveCart(); render();
  });
  v.querySelectorAll('[data-k]').forEach((r) => r.onclick = () => {
    const it = S.cart.find((x) => x.k === r.dataset.k);
    if (it && !it.reward) productSheet(product(it.id), it);
  });
  $('#comment').oninput = (ev) => store.set('comment', ev.target.value);
  $('#orderBtn').onclick = placeOrder;
}

async function placeOrder() {
  const me = S.me;
  if (!me) return toast(tr('openInBot'), 'error');
  const t = cartTotals();
  if (!me.phone) { toast(tr('needPhone'), 'error'); return go('edit'); }
  if (me.lat == null) { toast(tr('needAddr'), 'error'); return go('map'); }
  if (t.subtotal && t.subtotal < t.min) return toast(`${tr('minOrder')}: ${fmt(t.min)} ${tr('sum')}`, 'error');
  const btn = $('#orderBtn'); btn.disabled = true;
  try {
    const o = await api('/api/orders', {
      method: 'POST',
      body: { items: S.cart.map(({ id, mode, value, reward }) => ({ id, mode, value, reward })), comment: store.get('comment', '') },
    });
    S.cart = []; saveCart(); store.set('comment', '');
    if (t.coins) S.me.coins -= t.coins;
    hap('success');
    go('success/' + o.id);
  } catch (err) {
    toast(err.message, 'error');
    btn.disabled = false;
  }
}

function success(v, id) {
  v.innerHTML = `<div class="success"><div class="ok">${ic('check-read-linear')}</div>
    <h2 style="margin:0 0 6px">${tr('success')}</h2><p class="sub" style="color:var(--muted)">#${e(id)} · ${tr('successSub')}</p></div>
    <button class="btn" data-go="orders">${tr('myOrders')}</button>
    <button class="btn ghost" style="margin-top:10px" data-go="home">${tr('toHome')}</button>`;
  v.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => go(b.dataset.go));
}

/* ---------- Bonus ---------- */
function bonus(v) {
  if (!S.catalog) return home(v);
  const coins = S.me?.coins || 0;
  const inCartCoins = cartTotals().coins;
  const avail = coins - inCartCoins;
  const gifts = S.catalog.products.filter((p) => p.coin_price > 0 && p.in_stock).sort((a, b) => a.coin_price - b.coin_price);
  const next = gifts.find((g) => g.coin_price > coins);
  const prog = next ? Math.min(100, (coins / next.coin_price) * 100) : 100;
  const rule = setting('coins', { sum_per_coin: 1000 }).sum_per_coin;
  v.innerHTML = `
    <div class="page-title">${tr('t_bonus')}</div>
    <div class="coin-hero">
      <small>${tr('yourCoins')}</small>
      <div class="big">${ic('dollar-minimalistic-bold-duotone')}<span id="coinNum">0</span></div>
      ${next ? `<small>${tr('nextGift')}: ${e(pname(next))} — ${next.coin_price - coins} ${tr('coins')}</small><div class="bar"><i style="width:0" id="bar"></i></div>` : ''}
    </div>
    <div class="note">${ic('star-shine-bold-duotone')}<span><b>${tr('howEarn')}</b><br>${tr('earnRule', rule)}</span></div>
    <div class="section-h"><b>${tr('gifts')}</b></div>
    ${gifts.length ? `<div class="grid">${gifts.map((p) => `
      <div class="pcard">
        <div class="ph">${img(p.image, 'gift-bold-duotone')}</div>
        <div class="nm">${e(pname(p))}${p.unit === 'kg' ? ' · 1 ' + tr('kg') : ''}</div>
        <button class="btn sm ${avail >= p.coin_price ? '' : 'ghost'}" style="width:100%;margin-top:6px" data-gift="${p.id}" ${avail >= p.coin_price ? '' : 'disabled'}>
          🪙 ${p.coin_price} ${avail >= p.coin_price ? '· ' + tr('take') : '· ' + tr('needMore', p.coin_price - avail)}</button>
      </div>`).join('')}</div>` : `<div class="empty">${ic('gift-bold-duotone')}${tr('noGifts')}</div>`}`;

  // coin sanog'i animatsiyasi
  const el = $('#coinNum'); const t0 = performance.now();
  const tick = (t) => { const k = Math.min(1, (t - t0) / 700); el.textContent = fmt(coins * (1 - Math.pow(1 - k, 3))); if (k < 1) requestAnimationFrame(tick); };
  requestAnimationFrame(tick);
  setTimeout(() => { const b = $('#bar'); if (b) b.style.width = prog + '%'; }, 80);

  v.querySelectorAll('[data-gift]').forEach((b) => b.onclick = () => {
    addToCart({ id: Number(b.dataset.gift), mode: 'dona', value: 1, reward: true });
    toast(tr('giftAdded'), 'success'); render();
  });
}

/* ---------- Profile ---------- */
function profile(v) {
  const me = S.me || {};
  const th = me.theme || 'auto';
  v.innerHTML = `
    <div style="text-align:center;margin:10px 0 18px">
      <button id="ava" class="press" style="position:relative;display:inline-block">
        ${avatarHtml('style="width:96px;height:96px;font-size:36px;margin:0 auto"')}
        <span style="position:absolute;right:0;bottom:0;width:32px;height:32px;border-radius:50%;background:var(--accent);color:#fff;display:grid;place-items:center;border:3px solid var(--bg)">${ic('camera-bold')}</span>
      </button>
      <h2 style="margin:12px 0 2px;letter-spacing:-.02em">${e(me.name || me.tg_name || '—')}</h2>
      <div style="color:var(--muted)">${e(me.phone || '')}</div>
      <button class="coin-chip press" style="margin-top:12px" data-go="bonus">${ic('dollar-minimalistic-bold-duotone')}${fmt(me.coins || 0)} ${tr('coins')}</button>
    </div>
    <div class="list">
      <button class="row" data-go="orders"><span class="ic">${ic('bag-4-bold-duotone')}</span><span class="tx">${tr('myOrders')}</span>${ic('alt-arrow-right-linear')}</button>
      <button class="row" data-go="edit"><span class="ic">${ic('user-id-bold-duotone')}</span><span class="tx">${tr('myData')}<small>${e(me.name || '')} · ${e(me.phone || '')}</small></span>${ic('alt-arrow-right-linear')}</button>
      <button class="row" data-go="map"><span class="ic">${ic('map-point-wave-bold-duotone')}</span><span class="tx">${tr('address')}<small>${e(me.address || (me.lat ? `${me.lat.toFixed(4)}, ${me.lng.toFixed(4)}` : tr('noAddress')))}</small></span>${ic('alt-arrow-right-linear')}</button>
    </div>
    <div class="list">
      <button class="row" id="langBtn"><span class="ic">${ic('global-bold-duotone')}</span><span class="tx">${tr('lang')}<small>${S.lang === 'ru' ? 'Русский' : 'O\'zbekcha'}</small></span>${ic('alt-arrow-right-linear')}</button>
      <button class="row" id="themeBtn"><span class="ic">${ic('moon-stars-bold-duotone')}</span><span class="tx">${tr('theme')}<small>${tr('th_' + th)}</small></span>${ic('alt-arrow-right-linear')}</button>
      <button class="row" data-go="support"><span class="ic">${ic('chat-round-dots-bold-duotone')}</span><span class="tx">${tr('support')}<small>${tr('faq')}</small></span>${ic('alt-arrow-right-linear')}</button>
      ${me.is_admin ? `<button class="row" data-go="admin"><span class="ic">${ic('shield-user-bold-duotone')}</span><span class="tx">${tr('admin')}</span>${ic('alt-arrow-right-linear')}</button>` : ''}
    </div>
    <p style="text-align:center;color:var(--muted);font-size:12px">Green Market · v${e(window.APP_VERSION)}</p>`;

  v.querySelectorAll('[data-go]').forEach((b) => b.onclick = () => go(b.dataset.go));
  $('#ava').onclick = async () => {
    if (!S.me) return toast(tr('openInBot'), 'error');
    const f = await pickFile(); if (!f) return;
    try {
      const data = await resizeImage(f, 320, 0.85);
      S.me = await api('/api/me', { method: 'PATCH', body: { avatar: data } });
      toast(tr('saved'), 'success'); render();
    } catch (err) { toast(err.message, 'error'); }
  };
  $('#langBtn').onclick = () => choiceSheet(tr('lang'), [['uz', 'O\'zbekcha'], ['ru', 'Русский']], S.lang, (val) => {
    S.lang = val; store.set('lang', val); savePref({ lang: val });
  });
  $('#themeBtn').onclick = () => choiceSheet(tr('theme'), ['auto', 'light', 'dark'].map((x) => [x, tr('th_' + x)]), th, (val) => {
    store.set('theme', val); if (S.me) S.me.theme = val; applyTheme(); savePref({ theme: val });
  });
}
async function savePref(patch) {
  render();
  if (!S.me) return;
  try { S.me = await api('/api/me', { method: 'PATCH', body: patch }); } catch (err) { toast(err.message, 'error'); }
}
function choiceSheet(title, opts, cur, onPick) {
  openSheet(`<h2 style="margin-bottom:14px">${e(title)}</h2><div class="list">${opts.map(([k, t]) =>
    `<button class="row" data-c="${k}"><span class="tx">${e(t)}</span>${k === cur ? `<span style="color:var(--accent)">${ic('check-circle-bold')}</span>` : ''}</button>`).join('')}</div>`,
  (root) => root.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { hap('light'); closeSheet(); onPick(b.dataset.c); }));
}

function edit(v) {
  const me = S.me || {};
  v.innerHTML = `<div class="page-title"><button class="back" onclick="history.back()">${ic('alt-arrow-left-linear')}</button>${tr('myData')}</div>
    <div class="field"><label>${tr('name')}</label><input id="fName" value="${e(me.name || '')}" maxlength="60"></div>
    <div class="field"><label>${tr('phone')}</label><input id="fPhone" type="tel" inputmode="tel" value="${e(me.phone || '+998')}" maxlength="16"></div>
    <button class="btn" id="saveBtn">${tr('save')}</button>`;
  $('#saveBtn').onclick = async () => {
    if (!S.me) return toast(tr('openInBot'), 'error');
    try {
      S.me = await api('/api/me', { method: 'PATCH', body: { name: $('#fName').value, phone: $('#fPhone').value } });
      toast(tr('saved'), 'success'); history.back();
    } catch (err) { toast(err.message, 'error'); }
  };
}

/* ---------- Map ---------- */
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(css);
    const s = document.createElement('script');
    s.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    s.onload = resolve; s.onerror = reject;
    document.head.appendChild(s);
  });
}
function map(v) {
  const me = S.me || {};
  v.innerHTML = `<div class="page-title"><button class="back" onclick="history.back()">${ic('alt-arrow-left-linear')}</button>${tr('address')}</div>
    <p class="sub" style="color:var(--muted);margin:-6px 2px 12px">${tr('pickMap')}</p>
    <div class="map-box"><div id="map"></div><div class="map-pin" id="pin">${ic('map-point-bold')}</div>
      <button class="map-me" id="meBtn">${ic('gps-bold-duotone')}</button></div>
    <div class="field"><textarea id="fAddr" rows="2" placeholder="${tr('addrDetail')}">${e(me.address || '')}</textarea></div>
    <button class="btn" id="saveAddr">${tr('saveAddr')}</button>`;
  const start = me.lat != null ? [me.lat, me.lng] : [39.0573, 66.8341]; // Shahrisabz
  loadLeaflet().then(() => {
    const m = window.L.map('map', { zoomControl: false, attributionControl: false }).setView(start, me.lat != null ? 17 : 14);
    window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(m);
    m.on('movestart', () => $('#pin')?.classList.add('lift'));
    m.on('moveend', () => $('#pin')?.classList.remove('lift'));
    $('#meBtn').onclick = () => {
      hap('light');
      const useCoords = (lat, lng) => m.setView([lat, lng], 17);
      const lm = tg?.LocationManager;
      if (lm && tg.isVersionAtLeast?.('8.0')) {
        lm.init(() => lm.getLocation((loc) => loc ? useCoords(loc.latitude, loc.longitude) : lm.openSettings?.()));
      } else if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((p) => useCoords(p.coords.latitude, p.coords.longitude), () => toast(tr('error'), 'error'), { enableHighAccuracy: true, timeout: 10000 });
      }
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

/* ---------- Support ---------- */
function support(v) {
  const faq = S.catalog?.faq || [];
  const shop = setting('shop', {});
  v.innerHTML = `<div class="page-title"><button class="back" onclick="history.back()">${ic('alt-arrow-left-linear')}</button>${tr('support')}</div>
    <div class="section-h"><b style="font-size:16px">${tr('faq')}</b></div>
    <div class="list">${faq.map((f) => `<div class="faq-item"><button class="faq-q">${e((S.lang === 'ru' && f.q_ru) || f.q_uz)}${ic('alt-arrow-down-linear')}</button>
      <div class="faq-a">${e((S.lang === 'ru' && f.a_ru) || f.a_uz)}</div></div>`).join('') || '<div class="row">—</div>'}</div>
    <div class="section-h"><b style="font-size:16px">${tr('writeUs')}</b></div>
    <div class="field"><textarea id="msg" rows="3" placeholder="${tr('msgPh')}"></textarea></div>
    <button class="btn" id="sendBtn">${ic('plain-bold-duotone')}${tr('send')}</button>
    ${shop.phone && shop.phone.length > 5 ? `<a class="btn ghost" style="margin-top:10px;text-decoration:none" href="tel:${e(shop.phone)}">${ic('phone-bold-duotone')}${tr('call')} · ${e(shop.phone)}</a>` : ''}
    ${shop.work_hours ? `<p style="text-align:center;color:var(--muted);font-size:13px">${ic('clock-circle-linear')} ${e(shop.work_hours)}</p>` : ''}`;
  v.querySelectorAll('.faq-q').forEach((q) => q.onclick = () => { hap('light'); q.parentElement.classList.toggle('open'); });
  $('#sendBtn').onclick = async () => {
    const text = $('#msg').value.trim(); if (!text) return;
    if (!S.me) return toast(tr('openInBot'), 'error');
    try { await api('/api/support', { method: 'POST', body: { text } }); $('#msg').value = ''; toast(tr('sent'), 'success'); }
    catch (err) { toast(err.message, 'error'); }
  };
}

/* ---------- Orders ---------- */
async function orders(v) {
  v.innerHTML = `<div class="page-title"><button class="back" onclick="history.back()">${ic('alt-arrow-left-linear')}</button>${tr('myOrders')}</div>
    <div id="olist">${'<div class="sk" style="height:110px;margin-bottom:12px"></div>'.repeat(3)}</div>`;
  if (!S.me) { $('#olist').innerHTML = `<div class="empty">${tr('openInBot')}</div>`; return; }
  try {
    const list = await api('/api/orders');
    if (route()[0] !== 'orders') return;
    $('#olist').innerHTML = list.length ? list.map(orderCard).join('') : `<div class="empty">${ic('bag-4-bold-duotone')}${tr('noOrders')}</div>`;
  } catch (err) { $('#olist').innerHTML = `<div class="empty">${e(err.message)}</div>`; }
}
function orderCard(o, admin = false) {
  const d = new Date(o.created_at);
  const date = `${d.toLocaleDateString('ru-RU')} ${d.toTimeString().slice(0, 5)}`;
  const est = o.items.some((l) => l.estimated);
  return `<div class="card">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px">
      <b>#${o.id}</b><span class="pill ${o.status}">${tr('st_' + o.status)}</span></div>
    <div style="color:var(--muted);font-size:13px;margin-bottom:8px">${date}</div>
    ${o.items.map((l) => `<div class="sumrow" style="color:var(--text)"><span>${e(l.name)} <small style="color:var(--muted)">${l.reward ? '🎁' : l.unit === 'dona' ? l.value + ' ' + tr('pc') : l.mode === 'dona' ? l.value + ' ' + tr('pc') + ' ≈' + kgTxt(l.kg) + ' ' + tr('kg') : kgTxt(l.kg) + ' ' + tr('kg')}</small></span><span>${l.reward ? '' : fmt(l.total)}</span></div>`).join('')}
    <div class="sumrow total"><span>${tr('total')}</span><span>${est ? '~' : ''}${fmt(o.total)} ${tr('sum')}</span></div>
    ${admin ? `<div style="font-size:13px;color:var(--muted);margin-top:8px">👤 ${e(o.name)} · <a href="tel:${e(o.phone)}" style="color:var(--accent)">${e(o.phone)}</a><br>${o.address ? '🏠 ' + e(o.address) + '<br>' : ''}${o.comment ? '💬 ' + e(o.comment) : ''}
      ${o.lat ? `<br><a href="https://maps.google.com/?q=${o.lat},${o.lng}" target="_blank" style="color:var(--accent)">📍 Xaritada ochish</a>` : ''}</div>` : ''}
    ${admin ? adminOrderActions(o) : ''}
  </div>`;
}

/* ---------------- ADMIN ---------------- */
const SOLAR_ICONS = ['leaf', 'bottle', 'cup-hot', 'donut-bitten', 'box', 'cart-large-2', 'chef-hat', 'cookie', 'wineglass', 'confetti', 'tea-cup', 'fire', 'star', 'heart', 'bag-4', 'gift', 'basket', 'soap', 'washing-machine', 'baby-carriage', 'dumbbell', 'cat', 'medical-kit', 'lightbulb'];
const NEXT = { new: ['accepted', 'cancelled'], accepted: ['delivering', 'done', 'cancelled'], delivering: ['done', 'cancelled'] };
function adminOrderActions(o) {
  const n = NEXT[o.status]; if (!n) return '';
  return `<div class="actions">${n.map((s) => `<button class="btn sm ${s === 'cancelled' ? 'ghost' : ''}" data-st="${o.id}:${s}">${tr('st_' + s)}</button>`).join('')}</div>`;
}

async function admin(v, tab = 'orders') {
  if (!S.me?.is_admin) { v.innerHTML = `<div class="empty">403</div>`; return; }
  const tabs = [['orders', 'Buyurtmalar'], ['products', 'Mahsulotlar'], ['categories', 'Kategoriyalar'], ['banners', 'Bannerlar'], ['faq', 'Savollar'], ['settings', 'Sozlamalar']];
  v.innerHTML = `<div class="page-title"><button class="back" onclick="history.back()">${ic('alt-arrow-left-linear')}</button>Admin</div>
    <div class="admin-tabs">${tabs.map(([k, t]) => `<button class="chip ${k === tab ? 'on' : ''}" data-tab2="${k}">${t}</button>`).join('')}</div>
    <div id="adm"><div class="sk" style="height:120px"></div></div>`;
  v.querySelectorAll('[data-tab2]').forEach((b) => b.onclick = () => { location.replace('#admin/' + b.dataset.tab2); });
  try {
    if (!S.admin) S.admin = await api('/api/admin/all');
    const box = $('#adm');
    ({ orders: admOrders, products: admProducts, categories: admCategories, banners: admBanners, faq: admFaq, settings: admSettings })[tab]?.(box);
  } catch (err) { $('#adm').innerHTML = `<div class="empty">${e(err.message)}</div>`; }
}
const reloadAdmin = async () => { S.admin = await api('/api/admin/all'); await loadCatalog(); render(); };

async function admOrders(box) {
  const sts = ['new', 'accepted', 'delivering', 'done', 'cancelled', 'all'];
  box.innerHTML = `<div class="stats" id="stats"></div>
    <div class="chips">${sts.map((s) => `<button class="chip ${S.adminStatus === s ? 'on' : ''}" data-fs="${s}">${s === 'all' ? tr('all') : tr('st_' + s)}</button>`).join('')}</div>
    <div id="aol"><div class="sk" style="height:140px"></div></div>`;
  box.querySelectorAll('[data-fs]').forEach((b) => b.onclick = () => { S.adminStatus = b.dataset.fs; admOrders(box); });
  api('/api/admin/stats').then((s) => { $('#stats').innerHTML = `
    <div class="stat"><b>${s.today_orders}</b><small>Bugun buyurtma</small></div>
    <div class="stat"><b>${fmt(s.today_sum)}</b><small>Bugun so'm</small></div>
    <div class="stat"><b>${s.users}</b><small>Mijozlar</small></div>`; }).catch(() => {});
  const list = await api('/api/admin/orders?status=' + S.adminStatus);
  const aol = $('#aol'); if (!aol) return;
  aol.innerHTML = list.length ? list.map((o) => orderCard(o, true)).join('') : `<div class="empty">—</div>`;
  aol.querySelectorAll('[data-st]').forEach((b) => b.onclick = async () => {
    const [id, st] = b.dataset.st.split(':');
    if (st === 'cancelled' && !confirm('Bekor qilinsinmi?')) return;
    b.disabled = true;
    try { await api('/api/admin/orders/' + id, { method: 'PATCH', body: { status: st } }); toast('✓', 'success'); admOrders(box); }
    catch (err) { toast(err.message, 'error'); b.disabled = false; }
  });
}

function listRows(items, rowFn) {
  return `<div class="list">${items.map(rowFn).join('') || '<div class="row">—</div>'}</div>`;
}

function admProducts(box) {
  const A = S.admin;
  const catName = (id) => A.categories.find((c) => c.id === id)?.name_uz || '—';
  box.innerHTML = `<button class="btn" id="addP" style="margin-bottom:12px">${ic('add-circle-bold')}Mahsulot qo'shish</button>
    <label class="search">${ic('magnifer-linear')}<input id="aq" placeholder="Qidirish…"></label><div id="apl"></div>`;
  const draw = () => {
    const q = $('#aq').value.toLowerCase();
    $('#apl').innerHTML = listRows(A.products.filter((p) => p.name_uz.toLowerCase().includes(q)), (p) => `
      <button class="row" data-id="${p.id}" style="${p.active ? '' : 'opacity:.4'}">
        <span class="cline" style="padding:0"><span class="ph" style="width:44px;height:44px">${img(p.image)}</span></span>
        <span class="tx">${e(p.name_uz)}<small>${fmt(p.price)} ${p.unit === 'kg' ? '/kg' : '/dona'} · ${e(catName(p.category_id))}${p.coin_price ? ' · 🪙' + p.coin_price : ''}${p.in_stock ? '' : ' · ❌ tugagan'}</small></span>${ic('pen-linear')}</button>`);
    $('#apl').querySelectorAll('[data-id]').forEach((r) => r.onclick = () => productForm(A.products.find((p) => p.id === Number(r.dataset.id))));
  };
  $('#aq').oninput = draw; draw();
  $('#addP').onclick = () => productForm(null);
}
function productForm(p) {
  const A = S.admin;
  formSheet('products', p, [
    { k: 'image', t: 'image', label: 'Rasm' },
    { k: 'name_uz', label: 'Nomi (o\'zbekcha)', req: true },
    { k: 'name_ru', label: 'Nomi (ruscha)' },
    { k: 'category_id', t: 'select', label: 'Kategoriya', num: true, opts: [['', '—'], ...A.categories.map((c) => [c.id, c.name_uz])] },
    { k: 'unit', t: 'select', label: 'O\'lchov', opts: [['dona', 'Dona'], ['kg', 'Kilogramm']], def: 'dona' },
    { k: 'price', t: 'number', label: 'Narxi (1 kg yoki 1 dona), so\'m', req: true },
    { k: 'old_price', t: 'number', label: 'Eski narx (chegirma ko\'rsatish uchun)' },
    { k: 'piece_kg', t: 'number', label: 'Kilolik: 1 dona taxminan necha kg (masalan 0.2) — dona bilan sotish uchun', step: '0.001' },
    { k: 'min_kg', t: 'number', label: 'Kilolik: minimal kg', step: '0.001', def: 0.1 },
    { k: 'coin_price', t: 'number', label: 'Coin evaziga sovg\'a: necha coin (bo\'sh = sovg\'a emas)' },
    { k: 'desc_uz', t: 'textarea', label: 'Tavsif (o\'zbekcha)' },
    { k: 'desc_ru', t: 'textarea', label: 'Tavsif (ruscha)' },
    { k: 'sort', t: 'number', label: 'Tartib raqami', def: 0 },
    { k: 'in_stock', t: 'switch', label: 'Sotuvda bor', def: true },
    { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ]);
}
function admCategories(box) {
  box.innerHTML = `<button class="btn" id="addC" style="margin-bottom:12px">${ic('add-circle-bold')}Kategoriya qo'shish</button>` +
    listRows(S.admin.categories, (c) => `<button class="row" data-id="${c.id}" style="${c.active ? '' : 'opacity:.4'}"><span class="ic"><iconify-icon icon="${e(c.icon)}"></iconify-icon></span><span class="tx">${e(c.name_uz)}<small>${e(c.name_ru || '')}</small></span>${ic('pen-linear')}</button>`);
  const form = (c) => formSheet('categories', c, [
    { k: 'name_uz', label: 'Nomi (o\'zbekcha)', req: true },
    { k: 'name_ru', label: 'Nomi (ruscha)' },
    { k: 'icon', t: 'icon', label: 'Ikonka', def: 'solar:box-bold-duotone' },
    { k: 'sort', t: 'number', label: 'Tartib', def: 0 },
    { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ]);
  $('#addC').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => form(S.admin.categories.find((c) => c.id === Number(r.dataset.id))));
}
function admBanners(box) {
  const A = S.admin;
  box.innerHTML = `<div class="note">${ic('info-circle-bold-duotone')}<span>Banner rasmi 2:1 nisbatda bo'lsin (masalan 1200×600). Aylanish tezligi — Sozlamalar bo'limida.</span></div>
    <button class="btn" id="addB" style="margin-bottom:12px">${ic('add-circle-bold')}Banner qo'shish</button>` +
    listRows(A.banners, (b) => `<button class="row" data-id="${b.id}" style="${b.active ? '' : 'opacity:.4'}"><span class="cline" style="padding:0"><span class="ph" style="width:70px;height:36px;border-radius:9px">${img(b.image)}</span></span><span class="tx">${e(b.title || 'Banner #' + b.id)}<small>${b.link_type === 'none' ? '—' : b.link_type + ' #' + b.link_id}</small></span>${ic('pen-linear')}</button>`);
  const linkOpts = [['none:', '— hech qayerga'], ...A.categories.map((c) => [`category:${c.id}`, '📂 ' + c.name_uz]), ...A.products.filter((p) => p.active).map((p) => [`product:${p.id}`, '🛒 ' + p.name_uz])];
  const form = (b) => formSheet('banners', b ? { ...b, link: `${b.link_type}:${b.link_id ?? ''}` } : null, [
    { k: 'image', t: 'image', label: 'Rasm (2:1)', req: true },
    { k: 'title', label: 'Sarlavha (ixtiyoriy)' },
    { k: 'subtitle', label: 'Qo\'shimcha matn (ixtiyoriy)' },
    { k: 'link', t: 'select', label: 'Bosilganda qayerga o\'tadi', opts: linkOpts, def: 'none:' },
    { k: 'sort', t: 'number', label: 'Tartib', def: 0 },
    { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ], (data) => {
    const [lt, lid] = String(data.link || 'none:').split(':');
    delete data.link;
    data.link_type = lt; data.link_id = lid ? Number(lid) : null;
    return data;
  });
  $('#addB').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => form(A.banners.find((b) => b.id === Number(r.dataset.id))));
}
function admFaq(box) {
  box.innerHTML = `<button class="btn" id="addF" style="margin-bottom:12px">${ic('add-circle-bold')}Savol qo'shish</button>` +
    listRows(S.admin.faq, (f) => `<button class="row" data-id="${f.id}"><span class="ic">${ic('question-circle-bold-duotone')}</span><span class="tx">${e(f.q_uz)}<small>${e(f.a_uz)}</small></span>${ic('pen-linear')}</button>`);
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
  const shop = st.shop || {}, d = st.delivery || {}, c = st.coins || {}, b = st.banner || {};
  box.innerHTML = `
    <div class="section-h"><b style="font-size:16px">Do'kon</b></div>
    <div class="field"><label>Nomi</label><input id="s_name" value="${e(shop.name || '')}"></div>
    <div class="two"><div class="field"><label>Telefon</label><input id="s_phone" value="${e(shop.phone || '')}"></div>
    <div class="field"><label>Ish vaqti</label><input id="s_hours" value="${e(shop.work_hours || '')}"></div></div>
    <div class="section-h"><b style="font-size:16px">Yetkazib berish</b></div>
    <div class="two"><div class="field"><label>Narxi, so'm</label><input id="s_fee" type="number" value="${d.fee ?? 0}"></div>
    <div class="field"><label>Bepul (shu summadan)</label><input id="s_free" type="number" value="${d.free_from ?? 0}"></div></div>
    <div class="field"><label>Minimal buyurtma, so'm</label><input id="s_min" type="number" value="${d.min_order ?? 0}"></div>
    <div class="section-h"><b style="font-size:16px">Coin tizimi</b></div>
    <div class="field"><label>Necha so'm xarid = 1 coin</label><input id="s_spc" type="number" value="${c.sum_per_coin ?? 1000}"></div>
    <div class="row" style="background:var(--card);border-radius:14px;margin-bottom:12px"><span class="tx">Coin yoqilgan</span><button class="switch ${c.enabled !== false ? 'on' : ''}" id="s_cen"></button></div>
    <div class="section-h"><b style="font-size:16px">Banner</b></div>
    <div class="field"><label>Aylanish oralig'i, millisekund (1000 = 1 soniya)</label><input id="s_bi" type="number" value="${b.interval_ms ?? 1000}"></div>
    <button class="btn" id="s_save">${tr('save')}</button>`;
  $('#s_cen').onclick = (ev) => ev.currentTarget.classList.toggle('on');
  $('#s_save').onclick = async () => {
    const n = (id) => Number($(id).value) || 0;
    try {
      S.admin.settings = await api('/api/admin/settings', { method: 'PATCH', body: {
        shop: { name: $('#s_name').value, phone: $('#s_phone').value, work_hours: $('#s_hours').value },
        delivery: { fee: n('#s_fee'), free_from: n('#s_free'), min_order: n('#s_min') },
        coins: { sum_per_coin: Math.max(1, n('#s_spc')), enabled: $('#s_cen').classList.contains('on') },
        banner: { interval_ms: Math.max(700, n('#s_bi')) },
      } });
      await loadCatalog();
      toast(tr('saved'), 'success');
    } catch (err) { toast(err.message, 'error'); }
  };
}

// Umumiy forma (sheet ichida)
function formSheet(entity, item, fields, transform) {
  const val = (f) => (item && item[f.k] !== undefined && item[f.k] !== null ? item[f.k] : f.def ?? '');
  const html = `<h2 style="margin-bottom:14px">${item ? tr('edit') : 'Yangi'}</h2>` + fields.map((f) => {
    const v = val(f);
    if (f.t === 'image') return `<div class="field"><label>${f.label}</label><button class="img-pick" data-img="${f.k}" style="width:100%">${v ? `<img src="${e(v)}">` : ic('gallery-add-bold-duotone') + ' Rasm tanlash'}</button><input type="hidden" data-k="${f.k}" value="${e(v)}"></div>`;
    if (f.t === 'select') return `<div class="field"><label>${f.label}</label><select data-k="${f.k}">${f.opts.map(([k, t]) => `<option value="${e(k)}" ${String(k) === String(v) ? 'selected' : ''}>${e(t)}</option>`).join('')}</select></div>`;
    if (f.t === 'switch') return `<div class="row" style="background:var(--card);border-radius:14px;margin-bottom:12px"><span class="tx">${f.label}</span><button class="switch ${v ? 'on' : ''}" data-sw="${f.k}"></button></div>`;
    if (f.t === 'textarea') return `<div class="field"><label>${f.label}</label><textarea data-k="${f.k}" rows="2">${e(v)}</textarea></div>`;
    if (f.t === 'icon') return `<div class="field"><label>${f.label}</label><input type="hidden" data-k="${f.k}" value="${e(v)}"><div class="chips">${SOLAR_ICONS.map((n) => `<button class="chip ${v === `solar:${n}-bold-duotone` ? 'on' : ''}" data-icon="solar:${n}-bold-duotone" style="font-size:20px">${ic(n + '-bold-duotone')}</button>`).join('')}</div></div>`;
    return `<div class="field"><label>${f.label}${f.req ? ' *' : ''}</label><input data-k="${f.k}" ${f.t === 'number' ? `type="number" inputmode="decimal" step="${f.step || '1'}"` : ''} value="${e(v)}"></div>`;
  }).join('') + `<button class="btn" id="fSave">${tr('save')}</button>${item ? `<button class="btn danger" id="fDel" style="margin-top:6px">${ic('trash-bin-trash-linear')}${tr('remove')}</button>` : ''}`;

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
        const data = await resizeImage(f, 1200, 0.85);
        const { url } = await api('/api/admin/upload', { method: 'POST', body: { image: data } });
        root.querySelector(`[data-k="${b.dataset.img}"]`).value = url;
        b.innerHTML = `<img src="${e(url)}">`;
      } catch (err) { toast(err.message, 'error'); b.innerHTML = ic('gallery-add-bold-duotone'); }
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
// Yangi versiya chiqsa, ilova o'zi qayta yuklanadi (savat saqlanib qoladi)
async function checkVersion() {
  if (window.__mockApi) return;
  try {
    const r = await fetch('/api/version', { cache: 'no-store' });
    const { version } = await r.json();
    if (version && version !== window.APP_VERSION) {
      store.set('justUpdated', true);
      const u = new URL(location.href);
      u.searchParams.set('v', version);
      location.replace(u.toString());
    }
  } catch {}
}
setInterval(checkVersion, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });

/* ---------------- BOOT ---------------- */
async function loadCatalog() {
  const c = await api('/api/catalog');
  S.catalog = c;
  if (c.version && c.version !== window.APP_VERSION && !window.__mockApi) checkVersion();
}

async function boot() {
  if (/[?&]demo=1/.test(location.search)) {
    await new Promise((res) => { const s = document.createElement('script'); s.src = '/demo.js?v=' + window.APP_VERSION; s.onload = res; document.head.appendChild(s); });
  }
  try { tg.ready(); tg.expand(); tg.disableVerticalSwipes?.(); } catch {}
  try { tg.onEvent('themeChanged', applyTheme); } catch {}
  applyTheme();
  updateBadge();
  render();
  try {
    const hasAuth = window.__mockApi || tg?.initData;
    const [, me] = await Promise.all([loadCatalog(), hasAuth ? api('/api/me').catch(() => null) : null]);
    S.me = me;
    if (me?.lang && me.lang !== S.lang) { S.lang = me.lang; store.set('lang', me.lang); }
    applyTheme();
    render();
    if (store.get('justUpdated', false)) { store.set('justUpdated', false); toast('✨ ' + tr('updated')); }
  } catch (err) {
    $('#view').innerHTML = `<div class="empty">${ic('cloud-cross-bold-duotone')}<p>${e(err.message)}</p><button class="btn" style="max-width:220px;margin:auto" onclick="location.reload()">↻</button></div>`;
  }
}
boot();
})();
