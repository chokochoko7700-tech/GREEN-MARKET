/* GREEN MARKET — Telegram Mini App (Magnit uslubi, oq fon) */
(() => {
'use strict';

const tg = window.Telegram?.WebApp || null;
const ADMIN_MODE = location.pathname.startsWith('/admin');
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const e = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ic = (n) => `<iconify-icon icon="${n.includes(':') ? n : 'lucide:' + n}"></iconify-icon>`;
const fmt = (n) => Math.round(Number(n || 0)).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const round100 = (x) => Math.round(x / 100) * 100;
const round3 = (x) => Math.round(x * 1000) / 1000;
const kgTxt = (x) => String(round3(x)).replace('.', ',');
const hap = (t = 'light') => { try { ['success', 'error', 'warning'].includes(t) ? tg.HapticFeedback.notificationOccurred(t) : tg.HapticFeedback.impactOccurred(t); } catch {} };
const local = {
  get(k, d) { try { const v = localStorage.getItem('gm_' + k); return v ? JSON.parse(v) : d; } catch { return d; } },
  set(k, v) { try { localStorage.setItem('gm_' + k, JSON.stringify(v)); } catch {} },
};
const cloud = { // Telegram CloudStorage — savat boshqa qurilmada ham saqlanadi
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
    sc_fav: 'Sevimlilar', sc_list: 'Ro\'yxat', sc_deals: 'Chegirmalar', sc_buys: 'Xaridlar', sc_recipes: 'Retseptlar', popular: 'Ommabop', look: 'Ko\'rish',
    gr: 'g', byWeight: 'Kg / gr', toTop: 'Yuqoriga', favEmpty: 'Sevimlilar bo\'sh', favEmptySub: 'Mahsulot sahifasida ♡ ni bosing — u shu yerda saqlanadi.',
    listPh: 'Nima olish kerak? Yozing va Enter', listClear: 'Belgilanganlarni o\'chirish', listEmpty: 'Xaridlar ro\'yxati bo\'sh', listEmptySub: 'Do\'konga borishdan oldin nima olishni yozib qo\'ying.',
    ingredients: (n) => `${n} ta masalliq`, noRecipes: 'Hozircha retseptlar yo\'q', needed: 'Kerakli mahsulotlar', allToCart: 'Hammasini savatga',
    aboutProduct: 'Mahsulot haqida', similar: 'O\'xshash mahsulotlar',
    t_home: 'Asosiy', t_catalog: 'Katalog', t_stores: 'Do\'konlar', t_profile: 'Profil', cart: 'Savat',
    welcome: 'Green Market\'ga xush kelibsiz', pickAddr: 'Manzilni tanlang', search: 'Mahsulot qidirish', cancel: 'Bekor qilish',
    sum: 'so\'m', kg: 'kg', pc: 'dona', soldOut: 'Tugagan', bigDeal: 'Eng katta chegirma', all: 'Barchasi', other: 'Boshqa',
    askTitle: 'Kerakli mahsulot topilmadimi?', askBtn: 'Olib kelishni so\'rash', askPh: 'Qaysi mahsulot kerak? Nomi, hajmi…', asked: 'So\'rov yuborildi. Rahmat!',
    lvl: (n, p) => `${n} · ${p}%`, collect: 'Ball yig\'ing', balls: 'ball', showCode: 'Buyurtma qiling va ball to\'plang',
    nextLvl: (s) => `Keyingi darajagacha ${fmt(s)} so'm`, maxLvl: 'Eng yuqori daraja',
    card: 'Sodiqlik kartasi', cardHint: 'Do\'konda kassirga shu kodni ko\'rsating', levels: 'Darajalar', fromSum: (s) => s ? `${fmt(s)} so'mdan` : 'Boshlang\'ich',
    cashback: (p) => `Har xariddan ${p}% ball`, history: 'Ballar tarixi', gifts: 'Ballga sovg\'alar', take: 'Olish', needMore: (n) => `yana ${fmt(n)}`,
    giftAdded: 'Sovg\'a savatga qo\'shildi', gift: 'Sovg\'a', bdayNote: (b) => `Tug'ilgan kuningizda ${fmt(b)} ball sovg'a qilamiz 🎂`,
    r_order: 'Xarid uchun', r_gift: 'Sovg\'aga sarflandi', r_refund: 'Qaytarildi', r_birthday: 'Tug\'ilgan kun sovg\'asi 🎂', r_manual: 'Do\'kon tomonidan',
    byKg: 'Kilo', bySum: 'Summa', byPc: 'Dona', enterSum: 'Qancha so\'mlik?', approx: 'taxminan', perKg: 'kg narxi',
    estNote: 'Dona tanlanganda narx taxminiy. Aniq summa tortilgandan keyin hisoblanadi.',
    addCart: 'Savatga qo\'shish', save: 'Saqlash', remove: 'O\'chirish', added: 'Savatga qo\'shildi', minIs: 'Kamida',
    cartEmpty: 'Savat bo\'sh', cartEmptySub: 'Katalogdan mahsulot tanlang — ular shu yerda paydo bo\'ladi.', goShop: 'Katalogga o\'tish',
    items: (n) => `${n} ta mahsulot`, fee: 'Yetkazib berish', free: 'Bepul', giftBalls: 'Sovg\'a (ball)', willEarn: 'Sizga tushadi',
    total: 'Jami', checkout: 'Rasmiylashtirish', minOrder: 'Min. buyurtma', address: 'Yetkazish manzili', noAddress: 'Manzil tanlanmagan',
    phone: 'Telefon', name: 'Ism', comment: 'Izoh: podyezd, qavat, mo\'ljal…', payment: 'To\'lov usuli', cash: 'Naqd yoki kartaga kuryerga',
    payme: 'Payme orqali onlayn', soon: 'Tez kunda', placeOrder: 'Buyurtma berish', needPhone: 'Telefon raqamingizni kiriting', needAddr: 'Yetkazish manzilini tanlang',
    success: 'Buyurtma qabul qilindi!', successSub: 'Holati haqida botda xabar beramiz.', toHome: 'Asosiyga',
    purchases: 'Xaridlarim', tabOrders: 'Xaridlar', tabHistory: 'Ballar tarixi', noOrders: 'Hozircha xaridlar yo\'q', noOrdersSub: 'Birinchi buyurtmangizni bering — u shu yerda ko\'rinadi.',
    noHistory: 'Hozircha ballar yo\'q', noHistorySub: 'Har bir yetkazilgan buyurtmadan ball tushadi.',
    sec_buy: 'Xaridlar', sec_acc: 'Hisob', sec_info: 'Ma\'lumot', editProfile: 'Profilni tahrirlash', notifs: 'Bildirishnomalar', theme: 'Mavzu',
    settings: 'Sozlamalar', help: 'Yordam', feedback: 'Ilova haqida fikr qoldirish', lang: 'Til', about: 'Biz haqimizda',
    deliveryTerms: 'Yetkazib berish shartlari', returns: 'Qaytarish va almashtirish', th_light: 'Kunduzgi', th_dark: 'Tungi', th_auto: 'Telegram bo\'yicha',
    needHelp: 'Yordam kerakmi?', faq: 'Ko\'p so\'raladigan savollar', writeUs: 'Bizga yozing', msgPh: 'Savolingizni yozing…', send: 'Yuborish', sent: 'Xabar yuborildi',
    call: 'Qo\'ng\'iroq qilish', fbTitle: 'Ilova sizga yoqdimi?', fbPh: 'Fikringiz (ixtiyoriy)', fbThanks: 'Fikringiz uchun rahmat!',
    st_new: 'Yangi', st_accepted: 'Qabul qilindi', st_delivering: 'Yo\'lda', st_done: 'Yetkazildi', st_cancelled: 'Bekor qilindi',
    pickMap: 'Xaritani surib, uyingizni markazga keltiring', addrDetail: 'Uy, podyezd, qavat, xonadon', saveAddr: 'Manzilni saqlash',
    stores: 'Do\'konlar', list: 'Ro\'yxat', route: 'Yo\'nalish', hours: 'Ish vaqti',
    skip: 'O\'tkazib yuborish', next: 'Keyingisi', start: 'Boshlash',
    onb1t: 'Har bir xariddan ball', onb1p: 'Buyurtma yetkazilgach ball darhol hisobingizga tushadi. Uni sovg\'alarga almashtiring.',
    onb2t: 'Qancha ko\'p xarid qilsangiz, shuncha ko\'p qaytadi', onb2p: 'Har bir xarid sizni yangi darajaga yaqinlashtiradi, har bir daraja esa ko\'proq qaytaradi.',
    onb3t: 'Uyingizgacha yetkazamiz', onb3p: 'Kilolab, summasiga yoki donalab buyurtma bering — tez va ehtiyotkorlik bilan olib boramiz.',
    onb4t: 'Kassada bitta kod', onb4p: 'Sodiqlik kartangiz doim ilovada. Do\'konda QR-kodni ko\'rsating — ball sizniki.',
    meet: 'Tanishamiz', meetSub: 'Tug\'ilgan kuningizda sovg\'a ball olasiz. Sanani bir marta kiritasiz.', birthday: 'Tug\'ilgan kun', later: 'Keyinroq',
    bdayFixed: 'Tug\'ilgan kun o\'zgartirilmaydi', notifT: 'Bildirishnomalarni yoqing', notifP: 'Muhim narsalarni o\'tkazib yubormang',
    n1: 'Ball muddati va yangi ballar', n2: 'Shaxsiy chegirma va aksiyalar', n3: 'Buyurtma holati', enable: 'Yoqish', notNow: 'Hozir emas',
    promoNotif: 'Aksiya va chegirmalar', orderNotif: 'Buyurtma holati', saved: 'Saqlandi', edit: 'O\'zgartirish',
    openInBot: 'Ilovani Telegram bot orqali oching', error: 'Xatolik yuz berdi', updated: 'Ilova yangilandi', nothing: 'Hech narsa topilmadi',
    bdayGift: (n) => `🎂 Tug'ilgan kuningiz bilan! Sizga ${fmt(n)} ball sovg'a`,
  },
  ru: {
    sc_fav: 'Избранное', sc_list: 'Список', sc_deals: 'Скидки', sc_buys: 'Покупки', sc_recipes: 'Рецепты', popular: 'Популярное', look: 'Смотреть',
    gr: 'г', byWeight: 'Кг / гр', toTop: 'Наверх', favEmpty: 'В избранном пусто', favEmptySub: 'Нажмите ♡ на странице товара — он сохранится здесь.',
    listPh: 'Что купить? Напишите и Enter', listClear: 'Удалить отмеченные', listEmpty: 'Список покупок пуст', listEmptySub: 'Запишите, что купить, перед походом в магазин.',
    ingredients: (n) => `${n} ингредиента`, noRecipes: 'Рецептов пока нет', needed: 'Нужные продукты', allToCart: 'Всё в корзину',
    aboutProduct: 'О товаре', similar: 'Похожие товары',
    t_home: 'Главная', t_catalog: 'Каталог', t_stores: 'Магазины', t_profile: 'Профиль', cart: 'Корзина',
    welcome: 'Добро пожаловать в Green Market', pickAddr: 'Выберите адрес', search: 'Поиск товаров', cancel: 'Отмена',
    sum: 'сум', kg: 'кг', pc: 'шт', soldOut: 'Нет в наличии', bigDeal: 'Самые большие скидки', all: 'Все', other: 'Другое',
    askTitle: 'Не нашли нужный товар?', askBtn: 'Попросить привезти', askPh: 'Какой товар нужен? Название, объём…', asked: 'Запрос отправлен. Спасибо!',
    lvl: (n, p) => `${n} · ${p}%`, collect: 'Копите баллы', balls: 'баллов', showCode: 'Заказывайте и копите баллы',
    nextLvl: (s) => `До следующего уровня ${fmt(s)} сум`, maxLvl: 'Максимальный уровень',
    card: 'Карта лояльности', cardHint: 'Покажите код кассиру в магазине', levels: 'Уровни', fromSum: (s) => s ? `от ${fmt(s)} сум` : 'Начальный',
    cashback: (p) => `${p}% баллами с покупки`, history: 'История баллов', gifts: 'Подарки за баллы', take: 'Взять', needMore: (n) => `ещё ${fmt(n)}`,
    giftAdded: 'Подарок добавлен в корзину', gift: 'Подарок', bdayNote: (b) => `В день рождения дарим ${fmt(b)} баллов 🎂`,
    r_order: 'За покупку', r_gift: 'Потрачено на подарок', r_refund: 'Возврат', r_birthday: 'Подарок на день рождения 🎂', r_manual: 'От магазина',
    byKg: 'Вес', bySum: 'Сумма', byPc: 'Штуки', enterSum: 'На какую сумму?', approx: 'примерно', perKg: 'за кг',
    estNote: 'При выборе штук цена примерная. Точная сумма — после взвешивания.',
    addCart: 'В корзину', save: 'Сохранить', remove: 'Удалить', added: 'Добавлено в корзину', minIs: 'Минимум',
    cartEmpty: 'Корзина пуста', cartEmptySub: 'Выберите товары в каталоге — они появятся здесь.', goShop: 'В каталог',
    items: (n) => `${n} товара`, fee: 'Доставка', free: 'Бесплатно', giftBalls: 'Подарок (баллы)', willEarn: 'Вам начислится',
    total: 'Итого', checkout: 'Оформить', minOrder: 'Мин. заказ', address: 'Адрес доставки', noAddress: 'Адрес не выбран',
    phone: 'Телефон', name: 'Имя', comment: 'Комментарий: подъезд, этаж, ориентир…', payment: 'Способ оплаты', cash: 'Наличными или картой курьеру',
    payme: 'Онлайн через Payme', soon: 'Скоро', placeOrder: 'Оформить заказ', needPhone: 'Укажите номер телефона', needAddr: 'Выберите адрес доставки',
    success: 'Заказ принят!', successSub: 'О статусе сообщим в боте.', toHome: 'На главную',
    purchases: 'Мои покупки', tabOrders: 'Покупки', tabHistory: 'История баллов', noOrders: 'Покупок пока нет', noOrdersSub: 'Сделайте первый заказ — он появится здесь.',
    noHistory: 'Баллов пока нет', noHistorySub: 'Баллы начисляются за каждый доставленный заказ.',
    sec_buy: 'Покупки', sec_acc: 'Аккаунт', sec_info: 'Информация', editProfile: 'Редактировать профиль', notifs: 'Уведомления', theme: 'Тема',
    settings: 'Настройки', help: 'Помощь', feedback: 'Оставить отзыв о приложении', lang: 'Язык', about: 'О нас',
    deliveryTerms: 'Условия доставки', returns: 'Возврат и обмен', th_light: 'Светлая', th_dark: 'Тёмная', th_auto: 'Как в Telegram',
    needHelp: 'Нужна помощь?', faq: 'Частые вопросы', writeUs: 'Напишите нам', msgPh: 'Напишите вопрос…', send: 'Отправить', sent: 'Сообщение отправлено',
    call: 'Позвонить', fbTitle: 'Вам нравится приложение?', fbPh: 'Ваш отзыв (необязательно)', fbThanks: 'Спасибо за отзыв!',
    st_new: 'Новый', st_accepted: 'Принят', st_delivering: 'В пути', st_done: 'Доставлен', st_cancelled: 'Отменён',
    pickMap: 'Двигайте карту, чтобы дом был в центре', addrDetail: 'Дом, подъезд, этаж, квартира', saveAddr: 'Сохранить адрес',
    stores: 'Магазины', list: 'Список', route: 'Маршрут', hours: 'Часы работы',
    skip: 'Пропустить', next: 'Далее', start: 'Начать',
    onb1t: 'Баллы с каждой покупки', onb1p: 'После доставки баллы сразу приходят на счёт. Обменивайте их на подарки.',
    onb2t: 'Чем больше покупок, тем больше возвращается', onb2p: 'Каждая покупка приближает к новому уровню, а каждый уровень возвращает больше.',
    onb3t: 'Доставим до двери', onb3p: 'Заказывайте на вес, на сумму или поштучно — привезём быстро и бережно.',
    onb4t: 'Один код на кассе', onb4p: 'Карта лояльности всегда в приложении. Покажите QR-код в магазине — баллы ваши.',
    meet: 'Давайте знакомиться', meetSub: 'В день рождения получите подарочные баллы. Дата указывается один раз.', birthday: 'Дата рождения', later: 'Позже',
    bdayFixed: 'Дату рождения изменить нельзя', notifT: 'Включите уведомления', notifP: 'Не пропускайте важное',
    n1: 'Срок баллов и новые баллы', n2: 'Персональные скидки и акции', n3: 'Статус заказа', enable: 'Включить', notNow: 'Не сейчас',
    promoNotif: 'Акции и скидки', orderNotif: 'Статус заказа', saved: 'Сохранено', edit: 'Изменить',
    openInBot: 'Откройте приложение через Telegram-бота', error: 'Произошла ошибка', updated: 'Приложение обновлено', nothing: 'Ничего не найдено',
    bdayGift: (n) => `🎂 С днём рождения! Дарим вам ${fmt(n)} баллов`,
  },
};

/* ---------------- STATE ---------------- */
const S = {
  catalog: null, me: null,
  lang: local.get('lang', (tg?.initDataUnsafe?.user?.language_code || '').startsWith('ru') ? 'ru' : 'uz'),
  cart: local.get('cart', []), fav: local.get('fav', []), list: local.get('list', []), admin: null, adminStatus: 'new',
};
const tr = (k, ...a) => { const v = (L[S.lang] || L.uz)[k] ?? L.uz[k] ?? k; return typeof v === 'function' ? v(...a) : v; };
const pname = (p) => (S.lang === 'ru' && p.name_ru) || p.name_uz;
const pdesc = (p) => (S.lang === 'ru' && p.desc_ru) || p.desc_uz || '';
const cname = (c) => (S.lang === 'ru' && c.name_ru) || c.name_uz;
const setting = (k, d = {}) => ({ ...d, ...(S.catalog?.settings?.[k] || {}) });
const product = (id) => S.catalog?.products.find((p) => p.id === Number(id));

async function api(path, { method = 'GET', body } = {}) {
  if (window.__mockApi) return window.__mockApi(path, method, body);
  const res = await fetch(path, {
    method, headers: { 'Content-Type': 'application/json', 'X-Init-Data': tg?.initData || '' },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || tr('error'));
  return data;
}

/* ---------------- UI helpers ---------------- */
document.addEventListener('load', (ev) => { if (ev.target.tagName === 'IMG') ev.target.classList.add('ok'); }, true);
const img = (src, fb = 'package') => (src ? `<img class="lz" src="${e(src)}" loading="lazy" alt="">` : ic(fb));

let toastT;
function toast(msg, type) {
  const t = $('#toast'); t.textContent = msg; t.classList.add('show');
  if (type) hap(type);
  clearTimeout(toastT); toastT = setTimeout(() => t.classList.remove('show'), 2400);
}
function openSheet(html, onMount) {
  const w = $('#sheetWrap');
  $('#sheetBody').innerHTML = html; w.hidden = false;
  requestAnimationFrame(() => requestAnimationFrame(() => w.classList.add('open')));
  onMount?.($('#sheetBody')); hap('light');
}
function closeSheet() {
  const w = $('#sheetWrap'); if (w.hidden) return;
  w.classList.remove('open');
  setTimeout(() => { if (!w.classList.contains('open')) { w.hidden = true; $('#sheetBody').innerHTML = ''; } }, 380);
}
$('.sheet-backdrop').addEventListener('click', closeSheet);
(() => {
  const sh = $('.sheet'); let y0 = null, dy = 0;
  sh.addEventListener('touchstart', (ev) => { if (sh.scrollTop <= 0) { y0 = ev.touches[0].clientY; dy = 0; } }, { passive: true });
  sh.addEventListener('touchmove', (ev) => { if (y0 === null) return; dy = ev.touches[0].clientY - y0; if (dy > 0) { sh.style.transition = 'none'; sh.style.transform = `translateY(${dy}px)`; } }, { passive: true });
  sh.addEventListener('touchend', () => { sh.style.transition = ''; sh.style.transform = ''; if (y0 !== null && dy > 110) closeSheet(); y0 = null; });
})();
const sheetHead = (title) => `<div class="sh-head"><h2>${e(title)}</h2><button class="x" data-close>${ic('x')}</button></div>`;
document.addEventListener('click', (ev) => { if (ev.target.closest('[data-close]')) closeSheet(); });

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
    const inp = document.createElement('input'); inp.type = 'file'; inp.accept = 'image/*';
    inp.onchange = () => resolve(inp.files[0] || null); inp.click();
  });
}
function loadScript(src) {
  return new Promise((res, rej) => { const s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); });
}
const navbar = (title, back = true, act = '') =>
  `<div class="navbar"><div class="in">${back ? `<button class="back press" data-back>${ic('chevron-left')}</button>` : ''}<h1>${e(title)}</h1>${act}</div></div>`;
const emptyState = (icon, title, text, btn = '') => `<div class="empty"><div class="ill">${ic(icon)}</div><b>${e(title)}</b><p>${e(text)}</p>${btn}</div>`;

// Fondagi nozik to'lqin chiziqlar
function wavesSvg(color = 'currentColor', op = 0.08) {
  let p = '';
  for (let i = 0; i < 26; i++) {
    const o = i * 7;
    p += `<path d="M-20 ${260 + o} C 120 ${120 + o}, 220 ${380 - o * 0.4}, 420 ${40 + o * 0.6}" />`;
  }
  return `<svg class="waves" viewBox="0 0 400 600" preserveAspectRatio="xMidYMid slice" fill="none" stroke="${color}" stroke-opacity="${op}" stroke-width="1">${p}</svg>`;
}

// QR-kod (qrcode-generator kutubxonasi CDN'dan)
let qrLib = null;
async function qrSvg(text) {
  try {
    if (!window.qrcode) { if (!qrLib) qrLib = loadScript('https://cdn.jsdelivr.net/npm/qrcode-generator@1.4.4/qrcode.min.js'); await qrLib; }
    const q = window.qrcode(0, 'M'); q.addData(text); q.make();
    const n = q.getModuleCount(); let d = '';
    for (let r = 0; r < n; r++) for (let c = 0; c < n; c++) if (q.isDark(r, c)) d += `M${c} ${r}h1v1h-1z`;
    return `<svg viewBox="0 0 ${n} ${n}" shape-rendering="crispEdges"><path d="${d}" fill="#111"/></svg>`;
  } catch { return ic('qr-code'); }
}
const cardCode = () => `GM-${S.me?.id || 0}`;
function fillQr(root = document) {
  $$('[data-qr]', root).forEach(async (el) => { el.innerHTML = await qrSvg(cardCode()) + '<span class="mid">G</span>'; });
}

/* ---------------- THEME ---------------- */
function applyTheme() {
  const pref = S.me?.theme || local.get('theme', 'light');
  const mode = pref === 'auto' ? (tg?.colorScheme || 'light') : pref;
  document.documentElement.dataset.theme = mode;
  const accent = setting('theme', {}).accent;
  if (accent && /^#[0-9a-f]{6}$/i.test(accent)) document.documentElement.style.setProperty('--accent', accent);
  const bg = mode === 'dark' ? '#0e0e10' : '#ffffff';
  try { tg.setHeaderColor(bg); tg.setBackgroundColor(bg); tg.setBottomBarColor?.(bg); } catch {}
}

/* ---------------- LEVELS ---------------- */
function levels() {
  const lv = setting('coins', {}).levels;
  return (Array.isArray(lv) && lv.length ? lv : [{ name: 'Bronza', pct: 1, from: 0 }]).slice().sort((a, b) => a.from - b.from);
}
function levelInfo() {
  const spent = Number(S.me?.spent || 0); const lv = levels();
  let i = 0; lv.forEach((l, k) => { if (spent >= l.from) i = k; });
  const cur = lv[i], next = lv[i + 1];
  const prog = next ? Math.min(100, ((spent - cur.from) / (next.from - cur.from)) * 100) : 100;
  return { cur, next, idx: i, prog, left: next ? next.from - spent : 0 };
}
const MEDALS = ['#b87333', '#9ca3af', '#d4a017', '#6b7280', '#111113'];

/* ---------------- PRICING ---------------- */
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
  if (it.reward) return `🎁 ${fmt(p.coin_price)} ${tr('balls')}`;
  if (p.unit === 'dona') return `${fmt(p.price)} ${tr('sum')} × ${it.value}`;
  if (it.mode === 'kg') return `${wtTxt(it.value)} × ${fmt(p.price)}`;
  if (it.mode === 'sum') return `${fmt(it.value)} ${tr('sum')} ≈ ${wtTxt(pl.kg)}`;
  return `${it.value} ${tr('pc')} ≈ ${kgTxt(pl.kg)} ${tr('kg')}`;
}

/* ---------------- CART ---------------- */
const saveCart = () => { cloud.set('cart', S.cart); updateBadge(); };
function cartTotals() {
  let subtotal = 0, coins = 0, est = false, n = 0;
  S.cart = S.cart.filter((it) => product(it.id));
  for (const it of S.cart) { const pl = priceLine(product(it.id), it); subtotal += pl.total; coins += pl.coins; est = est || pl.est; n++; }
  const d = setting('delivery', { fee: 0, free_from: 0, min_order: 0 });
  const fee = !subtotal || (d.free_from && subtotal >= d.free_from) ? 0 : Number(d.fee || 0);
  const c = setting('coins', { enabled: true });
  const earn = c.enabled ? Math.floor((subtotal * levelInfo().cur.pct) / 100) : 0;
  return { subtotal, coins, est, fee, total: subtotal + fee, earn, n, min: Number(d.min_order || 0) };
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
const donaLine = (id) => S.cart.find((x) => x.id === id && !x.reward && product(id)?.unit === 'dona');
function kgInCart(id) {
  const p = product(id); const lines = S.cart.filter((x) => x.id === id && !x.reward);
  return lines.length ? round3(lines.reduce((s, x) => s + (priceLine(p, x).kg || 0), 0)) : null;
}
const isFav = (id) => S.fav.includes(Number(id));
function updateBadge() { const b = $('#cartBadge'); b.hidden = !S.cart.length; b.textContent = S.cart.length; }

/* ---------------- Components ---------------- */
function cartCtl(p) {
  if (!p.in_stock) return '';
  if (p.unit === 'dona') {
    const l = donaLine(p.id);
    if (l) return `<div class="inq"><button data-dec="${p.id}">${ic('minus')}</button>${l.value}<button data-inc="${p.id}">${ic('plus')}</button></div>`;
  } else {
    const kg = kgInCart(p.id);
    if (kg) return `<div class="inq kg" data-open="${p.id}">${ic('check')} ${kgTxt(kg)} ${tr('kg')}</div>`;
  }
  return `<button class="add" data-add="${p.id}">${ic('plus')}</button>`;
}
function pcard(p, i = 0) {
  const disc = p.old_price && p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
  return `<div class="pc" data-pc="${p.id}" style="animation-delay:${Math.min(i, 8) * 35}ms">
    <div class="im press" data-p="${p.id}">${img(p.image)}${disc ? `<span class="disc">−${disc}%</span>` : ''}
      ${p.in_stock ? '' : `<div class="soldout">${tr('soldOut')}</div>`}${cartCtl(p)}</div>
    ${disc ? `<div class="old">${fmt(p.old_price)} ${tr('sum')}</div>` : ''}
    <div class="price">${fmt(p.price)} ${tr('sum')}${p.unit === 'kg' ? `<span style="font-weight:600;color:var(--muted);font-size:12px">/${tr('kg')}</span>` : ''}</div>
    <div class="nm" data-p="${p.id}">${e(pname(p))}</div>
  </div>`;
}
function refreshCards(id) {
  const p = product(id); if (!p) return;
  $$(`[data-pc="${id}"]`).forEach((el) => {
    const d = document.createElement('div'); d.innerHTML = pcard(p).trim();
    const n = d.firstChild; n.style.animation = 'none'; el.replaceWith(n);
  });
}
function loyaltyCard() {
  const li = levelInfo(); const coins = S.me?.coins || 0;
  return `<button class="lcard press" data-go="card">${wavesSvg()}
    <div class="l"><div class="lvl">${e(tr('lvl', li.cur.name, li.cur.pct))}</div>
      <div class="ttl">${coins ? `${fmt(coins)} ${tr('balls')}` : tr('collect')}</div>
      <div class="hint">${S.me ? tr('cardHint') : tr('showCode')}</div>
      <div class="next">${li.next ? tr('nextLvl', li.left) : tr('maxLvl')}</div>
      <div class="prog"><i data-prog="${li.prog}"></i></div></div>
    <div class="qr" data-qr></div></button>`;
}
function animateProg(root = document) {
  setTimeout(() => $$('[data-prog]', root).forEach((i) => { i.style.width = i.dataset.prog + '%'; }), 120);
}

// Bitta umumiy bosish boshqaruvchisi
document.addEventListener('click', (ev) => {
  const t = ev.target.closest('[data-add],[data-inc],[data-dec],[data-open],[data-p],[data-go],[data-back],[data-act]');
  if (!t) return;
  if (t.closest('#sheetWrap') && !t.matches('[data-go],[data-act]')) return;
  if (t.dataset.back !== undefined) { history.back(); return; }
  if (t.dataset.go) { hap('light'); closeSheet(); go(t.dataset.go); return; }
  if (t.dataset.act) { hap('light'); ACTIONS[t.dataset.act]?.(t); return; }
  const id = Number(t.dataset.add || t.dataset.inc || t.dataset.dec || t.dataset.open || t.dataset.p);
  const p = product(id); if (!p) return;
  ev.stopPropagation();
  if (t.dataset.add) {
    if (p.unit === 'kg') return qtySheet(p);
    hap('medium'); addToCart({ id, mode: 'dona', value: 1 }); refreshCards(id); return;
  }
  if (t.dataset.inc || t.dataset.dec) {
    hap('light'); const l = donaLine(id); if (!l) return;
    l.value += t.dataset.inc ? 1 : -1;
    if (l.value <= 0) S.cart = S.cart.filter((x) => x !== l);
    saveCart(); refreshCards(id); if (route()[0] === 'cart') render(true); return;
  }
  if (t.dataset.open) return qtySheet(p, S.cart.find((x) => x.id === id && !x.reward));
  hap('light'); go('p/' + id);
});
const ACTIONS = {
  card: () => cardSheet(),
  help: () => helpSheet(),
  ask: () => writeSheet(tr('askTitle'), tr('askPh'), (txt) => `🛒 Mahsulot so'rovi: ${txt}`, tr('asked')),
  write: () => writeSheet(tr('writeUs'), tr('msgPh'), (txt) => txt, tr('sent')),
  feedback: () => feedbackSheet(),
  lang: () => choiceSheet(tr('lang'), [['uz', 'O\'zbekcha'], ['ru', 'Русский']], S.lang, (v) => { S.lang = v; local.set('lang', v); savePref({ lang: v }); }),
  theme: () => {
    const th = S.me?.theme || local.get('theme', 'light');
    choiceSheet(tr('theme'), ['light', 'dark', 'auto'].map((x) => [x, tr('th_' + x)]), th, (v) => { local.set('theme', v); if (S.me) S.me.theme = v; applyTheme(); savePref({ theme: v }); });
  },
};

/* ---------------- ROUTER ---------------- */
const TABS = ['home', 'catalog', 'stores', 'profile'];
const stack = [];
const route = () => (location.hash.slice(1) || (ADMIN_MODE ? 'admin/orders' : 'home')).split('/');
function go(h) { if (location.hash !== '#' + h) location.hash = h; else render(true); }
window.addEventListener('hashchange', () => { closeSheet(); render(); });
$$('#fnav [data-tab]').forEach((b) => b.addEventListener('click', () => {
  hap('light');
  if (route()[0] === b.dataset.tab) return window.scrollTo({ top: 0, behavior: 'smooth' });
  if (TABS.includes(b.dataset.tab)) stack.length = 0;
  go(b.dataset.tab);
}));

let timers = [];
const clearTimers = () => { timers.forEach(clearInterval); timers = []; };
function render(silent = false) {
  clearTimers();
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
  const nav = $('#fnav');
  nav.hidden = ADMIN_MODE;
  nav.classList.toggle('hide', !isTab);
  $$('#fnav [data-tab]').forEach((x) => x.classList.toggle('on', x.dataset.tab === page));
  $$('[data-i]').forEach((el) => { el.textContent = tr(el.dataset.i); });
  const back = !isTab && !(ADMIN_MODE && page === 'admin') && page !== 'intro';
  try { back ? tg.BackButton.show() : tg.BackButton.hide(); } catch {}
  document.body.classList.toggle('tg-back', !!(back && tg?.initData && tg.isVersionAtLeast?.('6.1')));
  const v = $('#view');
  v.classList.toggle('bare', !isTab);
  if (!silent) { v.classList.remove('anim-fade', 'anim-push', 'anim-pop'); void v.offsetWidth; v.classList.add(anim); window.scrollTo(0, 0); }
  const R = { home, catalog, cat: category, p: productPage, fav: favPage, list: shopList, deals, recipes, recipe, search, stores, profile, cart, checkout, card, purchases, edit, notif, settings, addr, info, success, intro, admin };
  (R[page] || home)(v, a, b);
}
try { tg.BackButton.onClick(() => { const so = $('.story'); if (so) return so.close(); if (!$('#sheetWrap').hidden) return closeSheet(); history.length > 1 ? history.back() : go('home'); }); } catch {}

const needCatalog = (v) => {
  if (S.catalog) return false;
  v.innerHTML = `<div class="top-space"></div><div class="pad"><div class="sk" style="height:48px;margin:10px 0 14px"></div><div class="sk" style="height:150px;margin-bottom:14px;border-radius:22px"></div><div class="sk" style="height:140px"></div></div>`;
  return true;
};

/* ---------------- PAGES ---------------- */
const SHORTCUTS = [
  ['fav', 'heart-with-ribbon', 'sc_fav'], ['list', 'spiral-notepad', 'sc_list'], ['deals', 'label', 'sc_deals'],
  ['purchases', 'shopping-bags', 'sc_buys'], ['recipes', 'spaghetti', 'sc_recipes'],
];
const fe = (n) => `https://api.iconify.design/fluent-emoji/${n}.svg`;

function home(v) {
  if (needCatalog(v)) return;
  const { categories, products, banners } = S.catalog;
  const me = S.me || {};
  const promos = banners.filter((b) => (b.style || 'card') === 'card');
  const blocks = banners.filter((b) => b.style === 'block');
  const secs = categories.map((c) => ({ c, list: products.filter((p) => p.category_id === c.id) })).filter((s) => s.list.length);
  const deals = products.filter((p) => p.old_price > p.price && p.in_stock).sort((a, b) => (b.old_price - b.price) / b.old_price - (a.old_price - a.price) / a.old_price);
  const pop = products.filter((p) => p.popular);
  const section = (title, list, goTo) => `<div class="sec"><div class="sec-h"><b>${e(title)}</b>${goTo ? `<button class="arrow press" data-go="${goTo}">${ic('chevron-right')}</button>` : ''}</div>
    <div class="h-scroll">${list.slice(0, 12).map(pcard).join('')}</div></div>`;
  const first = secs.slice(0, 2), rest = secs.slice(2);
  v.innerHTML = `
    <div class="home-head">
      <button class="where press" data-go="addr"><small>${tr('welcome')}</small><b><span>${e(me.address || tr('pickAddr'))}</span>${ic('chevron-down')}</b></button>
      <button class="cbtn press" data-go="search">${ic('search')}</button>
      <button class="cbtn press" data-act="card">${ic('scan-line')}</button>
      <button class="cbtn press" data-go="purchases">${ic('bell')}</button>
    </div>
    <div class="search-line"><button class="search-pill press" data-go="search">${ic('search')}${tr('search')}</button><button class="sq-btn press" data-act="card">${ic('scan-line')}</button></div>
    ${loyaltyCard()}
    ${promos.length ? `<div class="promo-row" id="promos">${promos.map((b, i) => promoCard(b, i)).join('')}</div>` : ''}
    <div class="shortcuts">${SHORTCUTS.map(([to, icon, key], i) => `<button class="sc press" data-go="${to}" style="animation-delay:${i * 50}ms"><img src="${fe(icon)}" alt=""><span>${tr(key)}</span></button>`).join('')}</div>
    ${pop.length ? section(tr('popular'), pop, 'deals') : ''}
    ${first.map(({ c, list }) => section(cname(c), list, `cat/${c.id}`)).join('')}
    ${deals.length ? `<div class="sec"><div class="deal"><div class="sec-h"><b>${tr('bigDeal')}</b><button class="arrow press" data-go="deals" style="background:var(--bg)">${ic('chevron-right')}</button></div><div class="h-scroll">${deals.slice(0, 12).map(pcard).join('')}</div></div></div>` : ''}
    ${blocks.map(blockHtml).join('')}
    ${rest.map(({ c, list }) => section(cname(c), list, `cat/${c.id}`)).join('')}
    <div class="ask"><div><b>${tr('askTitle')}</b><button class="pill-btn press" data-act="ask">${ic('plus')}${tr('askBtn')}</button></div><div class="q">?</div></div>`;
  fillQr(v); animateProg(v);
  v.querySelectorAll('[data-story]').forEach((el) => el.onclick = () => {
    const i = Number(el.dataset.story); hap('light');
    if (storiesOf(promos[i]).length) openStories(promos, i); else openBanner(promos[i]);
  });
  autoScroll($('#promos'));
  blocks.forEach((b) => startBlock(b));
}
function promoCard(b, i) {
  if (b.color) {
    return `<div class="promo press" data-story="${i}" style="background:${e(b.color)}"><div class="cap"><small>${e(b.subtitle || '')}</small><b>${e(b.title || '')}</b></div>
      ${b.image ? `<img class="pimg lz" src="${e(b.image)}" alt="">` : ''}${storiesOf(b).length ? `<span class="pplay">${ic('mdi:play')}${storiesOf(b).map(() => '<i></i>').join('')}</span>` : ''}</div>`;
  }
  return `<div class="promo press" data-story="${i}">${img(b.image, 'image')}${b.title ? `<div class="cap"><small>${e(b.subtitle || '')}</small><b>${e(b.title)}</b></div>` : ''}</div>`;
}
function blockHtml(b) {
  const { products } = S.catalog;
  const list = b.link_type === 'category' ? products.filter((p) => p.category_id === b.link_id && p.in_stock) : [];
  const goTo = b.link_type === 'category' ? `cat/${b.link_id}` : '';
  const feats = (b.link_type === 'product' && product(b.link_id) ? [product(b.link_id)] : list).slice(0, 4);
  return `<div class="block" id="blk${b.id}" style="background:${e(b.color || '#e11d2a')}">
    ${goTo ? `<button class="all press" data-go="${goTo}">${tr('all')} ${ic('chevron-right')}</button>` : ''}
    <div class="head"><b class="logo">${e(b.title || '')}</b>
      <div class="feats">${feats.map((p, i) => `<div class="feat ${i ? '' : 'on'}" data-p="${p.id}"><div class="t"><small>${e(pname(p))}</small><strong>${fmt(p.price)} ${tr('sum')}</strong></div>
        ${p.image ? `<img class="lz" src="${e(p.image)}" alt="">` : ''}</div>`).join('')}</div>
      ${feats.length > 1 ? `<div class="bdots">${feats.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div>` : ''}
    </div>
    ${list.length ? `<div class="h-scroll">${list.slice(0, 10).map(pcard).join('')}</div>` : ''}
  </div>`;
}
function startBlock(b) {
  const el = $('#blk' + b.id); if (!el) return;
  const feats = $$('.feat', el), dots = $$('.bdots i', el);
  if (feats.length < 2) return;
  let i = 0;
  timers.push(setInterval(() => {
    if (document.hidden) return;
    i = (i + 1) % feats.length;
    feats.forEach((f, k) => f.classList.toggle('on', k === i));
    dots.forEach((d, k) => d.classList.toggle('on', k === i));
  }, 3200));
}
function autoScroll(row) {
  if (!row || row.children.length < 2) return;
  let paused = false;
  row.addEventListener('touchstart', () => { paused = true; }, { passive: true });
  row.addEventListener('touchend', () => setTimeout(() => { paused = false; }, 2500));
  const ms = Math.max(1000, Number(setting('banner', { interval_ms: 3000 }).interval_ms) || 3000);
  timers.push(setInterval(() => {
    if (paused || document.hidden || $('.story')) return;
    const w = row.children[0].offsetWidth + 10;
    const atEnd = row.scrollLeft + row.clientWidth >= row.scrollWidth - 8;
    row.scrollTo({ left: atEnd ? 0 : row.scrollLeft + w, behavior: 'smooth' });
  }, ms + 400));
}
function openBanner(b) {
  if (!b) return;
  if (b.link_type === 'product' && product(b.link_id)) go('p/' + b.link_id);
  if (b.link_type === 'category') go('cat/' + b.link_id);
}

/* ---------- Istoriyalar (bannerga bosilganda) ---------- */
const storiesOf = (b) => (Array.isArray(b?.stories) ? b.stories.filter((s) => s && (s.title || s.image)) : []);
function openStories(groups, gi) {
  const DUR = 5000;
  const el = document.createElement('div'); el.className = 'story';
  document.body.appendChild(el);
  let g = gi, s = 0, t0 = 0, elapsed = 0, paused = false, raf = 0;
  try { tg.BackButton.show(); } catch {}
  const close = () => {
    cancelAnimationFrame(raf); el.classList.add('out');
    setTimeout(() => el.remove(), 300);
    try { if (TABS.includes(route()[0])) tg.BackButton.hide(); } catch {}
  };
  el.close = close;
  const draw = () => {
    const b = groups[g]; const list = storiesOf(b); const st = list[s];
    el.innerHTML = `<div class="st-top"><div class="st-bars">${list.map((_, k) => `<i><b style="width:${k < s ? 100 : 0}%"></b></i>`).join('')}</div>
      <div class="st-head"><b>${e(b.story_title || b.title || '')}</b><button class="st-x">${ic('x')}</button></div></div>
      <div class="st-body"><h1>${e(st.title || '')}</h1>${st.text ? `<p>${e(st.text)}</p>` : ''}${st.image ? `<img src="${e(st.image)}" alt="">` : ''}</div>
      ${b.link_type !== 'none' && b.link_type ? `<div class="st-foot"><button class="btn" data-more>${tr('look')}</button></div>` : ''}
      <div class="st-tap l"></div><div class="st-tap r"></div>`;
    $('.st-x', el).onclick = close;
    const more = $('[data-more]', el); if (more) more.onclick = () => { close(); openBanner(b); };
    $('.st-tap.l', el).onclick = () => step(-1);
    $('.st-tap.r', el).onclick = () => step(1);
    elapsed = 0; t0 = performance.now();
  };
  const step = (d) => {
    hap('light');
    const n = storiesOf(groups[g]).length;
    if (s + d >= n) { let ng = g + 1; while (ng < groups.length && !storiesOf(groups[ng]).length) ng++; if (ng >= groups.length) return close(); g = ng; s = 0; }
    else if (s + d < 0) { let pg = g - 1; while (pg >= 0 && !storiesOf(groups[pg]).length) pg--; if (pg < 0) { s = 0; } else { g = pg; s = storiesOf(groups[g]).length - 1; } }
    else s += d;
    draw();
  };
  const tick = (now) => {
    if (!el.isConnected) return;
    if (!paused) { elapsed += now - t0; }
    t0 = now;
    const bar = $$('.st-bars i b', el)[s];
    if (bar) bar.style.width = Math.min(100, (elapsed / DUR) * 100) + '%';
    if (elapsed >= DUR) step(1);
    raf = requestAnimationFrame(tick);
  };
  el.addEventListener('pointerdown', () => { paused = true; });
  el.addEventListener('pointerup', () => { paused = false; });
  let y0 = null;
  el.addEventListener('touchstart', (ev) => { y0 = ev.touches[0].clientY; }, { passive: true });
  el.addEventListener('touchend', (ev) => { if (y0 !== null && ev.changedTouches[0].clientY - y0 > 90) close(); y0 = null; });
  draw(); raf = requestAnimationFrame(tick);
}

function catalog(v) {
  if (needCatalog(v)) return;
  const groups = [];
  for (const c of S.catalog.categories) {
    const g = c.grp || tr('other');
    let x = groups.find((y) => y.g === g); if (!x) groups.push(x = { g, list: [] });
    x.list.push(c);
  }
  // Magnit kabi mozaika: juft qatorlar 7/5, toq qatorlar 6/6, yolg'iz plitka butun qator
  const span = (i, n) => {
    if (n % 2 && i === n - 1) return 12;
    const row = Math.floor(i / 2);
    return row % 2 ? (i % 2 ? 5 : 7) : 6;
  };
  v.innerHTML = `<div class="top-space"></div>
    <div class="search-line"><button class="search-pill press" data-go="search">${ic('search')}${tr('search')}<span style="margin-left:auto;font-size:20px;color:var(--text)">${ic('scan-line')}</span></button></div>
    ${groups.map(({ g, list }) => `<div class="grp"><h2>${e(g)}</h2><div class="ctiles">${list.map((c, i) => `
      <button class="ctile press" data-go="cat/${c.id}" style="grid-column:span ${span(i, list.length)};animation-delay:${i * 40}ms">
        <b>${e(cname(c))}</b>${c.image ? `<img class="lz ${String(c.image).includes('iconify.design') ? 'emo' : ''}" src="${e(c.image)}" alt="">` : `<span class="ico"><iconify-icon icon="${e(c.icon || 'lucide:package')}"></iconify-icon></span>`}</button>`).join('')}</div></div>`).join('')}`;
}

// Kategoriya ichi: tepada bo'lim kategoriyalari, ostida kichik bo'limlar (scrollspy), har biri o'z sarlavhasi bilan
function category(v, id) {
  if (needCatalog(v)) return;
  const c = S.catalog.categories.find((x) => x.id === Number(id));
  if (!c) { v.innerHTML = navbar(tr('t_catalog')) + emptyState('package', tr('nothing'), ''); return; }
  const siblings = S.catalog.categories.filter((x) => (x.grp || '') === (c.grp || ''));
  const list = S.catalog.products.filter((p) => p.category_id === c.id);
  const subs = [];
  for (const p of list) {
    const s = p.sub || cname(c);
    let x = subs.find((y) => y.s === s); if (!x) subs.push(x = { s, list: [] });
    x.list.push(p);
  }
  v.innerHTML = `<div class="navbar cat-nav"><div class="in"><button class="back press" data-back>${ic('chevron-left')}</button><h1>${tr('t_catalog')}</h1></div>
      <div class="tabs1" id="tabs1">${siblings.map((x) => `<button class="${x.id === c.id ? 'on' : ''}" data-cid="${x.id}">${e(cname(x))}</button>`).join('')}</div>
      ${subs.length > 1 ? `<div class="tabs2" id="tabs2">${subs.map((x, i) => `<button class="${i ? '' : 'on'}" data-sub="${i}">${e(x.s)}</button>`).join('')}</div>` : ''}
    </div>
    ${list.length ? subs.map((x, i) => `<section class="subsec" id="sub${i}"><h3>${e(x.s)}</h3><div class="p-grid">${x.list.map(pcard).join('')}</div></section>`).join('') : emptyState('package', tr('nothing'), '')}
    <button class="totop" id="totop">${ic('arrow-up')}${tr('toTop')}</button>`;
  $('#tabs1 .on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  v.querySelectorAll('[data-cid]').forEach((b) => b.onclick = () => { if (Number(b.dataset.cid) === c.id) return; hap('light'); location.replace('#cat/' + b.dataset.cid); });
  const navH = () => $('.cat-nav').offsetHeight + 6;
  v.querySelectorAll('[data-sub]').forEach((b) => b.onclick = () => {
    hap('light'); lock = true;
    const sec = $('#sub' + b.dataset.sub);
    window.scrollTo({ top: sec.getBoundingClientRect().top + window.scrollY - navH(), behavior: 'smooth' });
    setActive(Number(b.dataset.sub)); setTimeout(() => { lock = false; }, 700);
  });
  let lock = false;
  const setActive = (i) => {
    $$('#tabs2 button').forEach((x, k) => x.classList.toggle('on', k === i));
    const btn = $$('#tabs2 button')[i];
    if (btn) $('#tabs2').scrollTo({ left: btn.offsetLeft - 16, behavior: 'smooth' });
  };
  const onScroll = () => {
    if (!$('#totop')) return window.removeEventListener('scroll', onScroll);
    $('#totop').classList.toggle('show', window.scrollY > 500);
    if (lock || subs.length < 2) return;
    const y = navH() + 10; let cur = 0;
    $$('.subsec').forEach((s, i) => { if (s.getBoundingClientRect().top <= y) cur = i; });
    if (!$$('#tabs2 button')[cur]?.classList.contains('on')) setActive(cur);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  $('#totop').onclick = () => { hap('light'); window.scrollTo({ top: 0, behavior: 'smooth' }); };
}

function favPage(v) {
  if (needCatalog(v)) return;
  const list = S.fav.map(product).filter(Boolean);
  v.innerHTML = navbar(tr('sc_fav')) + (list.length ? `<div class="p-grid" style="padding-top:8px">${list.map(pcard).join('')}</div>`
    : emptyState('heart', tr('favEmpty'), tr('favEmptySub'), `<button class="btn" style="max-width:240px;margin:0 auto" data-go="catalog">${tr('goShop')}</button>`));
}
function deals(v) {
  if (needCatalog(v)) return;
  const pop = S.catalog.products.filter((p) => p.popular);
  const list = S.catalog.products.filter((p) => p.old_price > p.price);
  v.innerHTML = navbar(tr('sc_deals')) + (list.length ? `<div class="p-grid" style="padding-top:8px">${list.map(pcard).join('')}</div>` : emptyState('percent', tr('nothing'), '')) +
    (pop.length ? `<div class="sec"><div class="sec-h"><b>${tr('popular')}</b></div><div class="p-grid">${pop.map(pcard).join('')}</div></div>` : '');
}
function shopList(v) {
  const draw = () => {
    v.innerHTML = navbar(tr('sc_list')) + `<div class="search-line"><label class="search-pill">${ic('plus')}<input id="liIn" placeholder="${tr('listPh')}" enterkeyhint="done"></label></div>
      ${S.list.length ? `<div class="rows">${S.list.map((x, i) => `<div class="row li ${x.done ? 'done' : ''}"><button class="lchk ${x.done ? 'on' : ''}" data-li="${i}">${x.done ? ic('check') : ''}</button>
        <span class="tx">${e(x.t)}</span><button class="trash muted" data-ld="${i}">${ic('x')}</button></div>`).join('')}</div>
        ${S.list.some((x) => x.done) ? `<div class="pad" style="margin-top:12px"><button class="btn ghost" id="liClear">${tr('listClear')}</button></div>` : ''}`
      : emptyState('list-checks', tr('listEmpty'), tr('listEmptySub'))}`;
    const inp = $('#liIn');
    inp.onkeydown = (ev) => { if (ev.key === 'Enter' && inp.value.trim()) { S.list.unshift({ t: inp.value.trim().slice(0, 80), done: false }); cloud.set('list', S.list); hap('light'); draw(); $('#liIn').focus(); } };
    v.querySelectorAll('[data-li]').forEach((b) => b.onclick = () => { const x = S.list[b.dataset.li]; x.done = !x.done; cloud.set('list', S.list); hap('light'); draw(); });
    v.querySelectorAll('[data-ld]').forEach((b) => b.onclick = () => { S.list.splice(b.dataset.ld, 1); cloud.set('list', S.list); draw(); });
    const cl = $('#liClear'); if (cl) cl.onclick = () => { S.list = S.list.filter((x) => !x.done); cloud.set('list', S.list); draw(); };
  };
  draw();
}
function recipes(v) {
  if (needCatalog(v)) return;
  const list = S.catalog.recipes || [];
  v.innerHTML = navbar(tr('sc_recipes')) + (list.length ? `<div class="rgrid">${list.map((r, i) => `<button class="rcard press" data-go="recipe/${r.id}" style="animation-delay:${i * 50}ms">
      <div class="rim">${img(r.image, 'chef-hat')}</div><b>${e((S.lang === 'ru' && r.title_ru) || r.title_uz)}</b><small>${tr('ingredients', (r.product_ids || []).length)}</small></button>`).join('')}</div>`
    : emptyState('chef-hat', tr('noRecipes'), ''));
}
function recipe(v, id) {
  if (needCatalog(v)) return;
  const r = (S.catalog.recipes || []).find((x) => x.id === Number(id));
  if (!r) { v.innerHTML = navbar(tr('sc_recipes')) + emptyState('chef-hat', tr('nothing'), ''); return; }
  const items = (r.product_ids || []).map(product).filter(Boolean);
  v.innerHTML = navbar((S.lang === 'ru' && r.title_ru) || r.title_uz) + `<div class="rhero">${img(r.image, 'chef-hat')}</div>
    <div class="pad"><p style="white-space:pre-wrap;line-height:1.6;font-size:15px">${e((S.lang === 'ru' && r.body_ru) || r.body_uz || '')}</p></div>
    ${items.length ? `<div class="sec"><div class="sec-h"><b>${tr('needed')}</b></div><div class="p-grid">${items.map(pcard).join('')}</div></div>
    <div style="height:90px"></div><div class="paybar"><button class="btn" id="allIn">${ic('shopping-bag')}${tr('allToCart')}</button></div>` : ''}`;
  const b = $('#allIn');
  if (b) b.onclick = () => {
    items.filter((p) => p.in_stock).forEach((p) => { if (!S.cart.some((x) => x.id === p.id && !x.reward)) addToCart(p.unit === 'kg' ? { id: p.id, mode: 'kg', value: 0.5 } : { id: p.id, mode: 'dona', value: 1 }); refreshCards(p.id); });
    toast(tr('added'), 'success');
  };
}

function search(v) {
  if (needCatalog(v)) return;
  v.innerHTML = `<div class="navbar"><div class="search-row"><label class="search-pill">${ic('search')}<input id="q" type="search" placeholder="${tr('search')}" autocomplete="off" enterkeyhint="search"></label><button class="cancel" data-back>${tr('cancel')}</button></div></div><div id="sres"></div>`;
  const q = $('#q');
  const draw = () => {
    const s = q.value.trim().toLowerCase(); const box = $('#sres');
    if (!s) {
      box.innerHTML = `<div class="pad chips" style="margin:6px 0 18px">${S.catalog.categories.slice(0, 10).map((c) => `<button class="chip" data-q="${e(cname(c))}">${e(cname(c))}</button>`).join('')}</div>
        <div class="p-grid">${(S.catalog.products.filter((p) => p.popular).length ? S.catalog.products.filter((p) => p.popular) : S.catalog.products).slice(0, 12).map(pcard).join('')}</div>`;
      box.querySelectorAll('[data-q]').forEach((b) => b.onclick = () => { q.value = b.dataset.q; draw(); });
      return;
    }
    const cats = S.catalog.categories.filter((c) => `${c.name_uz} ${c.name_ru || ''}`.toLowerCase().includes(s));
    const prods = S.catalog.products.filter((p) => `${p.name_uz} ${p.name_ru || ''}`.toLowerCase().includes(s));
    if (!cats.length && !prods.length) { box.innerHTML = emptyState('search-x', tr('nothing'), ''); return; }
    box.innerHTML = `${cats.length ? `<div class="rows" style="margin-bottom:10px">${cats.map((c) => `<button class="row" data-go="cat/${c.id}"><span class="tx">${e(cname(c))}</span><span class="chev">${ic('chevron-right')}</span></button>`).join('')}</div>` : ''}
      <div class="p-grid">${prods.map(pcard).join('')}</div>`;
  };
  q.oninput = draw; q.onkeydown = (ev) => { if (ev.key === 'Enter') q.blur(); };
  draw(); setTimeout(() => q.focus(), 350);
}

/* ---------- Miqdor tanlash (dona / kg-gr / summa) ---------- */
const wtTxt = (kg) => (kg < 1 ? `${Math.round(kg * 1000)} ${tr('gr')}` : `${kgTxt(kg)} ${tr('kg')}`);
function qtyState(p, line) {
  if (line) return { mode: line.mode === 'dona' && p.unit === 'kg' ? 'kg' : line.mode, value: line.mode === 'dona' && p.unit === 'kg' ? 1 : line.value };
  return { mode: p.unit === 'kg' ? 'kg' : 'dona', value: p.unit === 'kg' ? 1 : 1 };
}
function qtyHtml(p, st) {
  if (!p.in_stock) return '';
  if (p.unit !== 'kg') {
    return `<div class="stepper"><button data-d="-1">${ic('minus')}</button><div class="v"><b class="big" id="qv">${st.value}</b><small>${tr('pc')}</small></div><button data-d="1">${ic('plus')}</button></div>`;
  }
  const minKg = Number(p.min_kg || 0.1), minSum = round100(p.price * minKg);
  return `<div class="segm"><button data-mode="kg" class="${st.mode === 'kg' ? 'on' : ''}">${tr('byWeight')}</button><button data-mode="sum" class="${st.mode === 'sum' ? 'on' : ''}">${tr('bySum')}</button></div>
    ${st.mode === 'kg'
      ? `<div class="stepper"><button data-d="-1">${ic('minus')}</button><div class="v"><b class="big" id="qv">${wtTxt(st.value)}</b><small>${fmt(round100(p.price * st.value))} ${tr('sum')}</small></div><button data-d="1">${ic('plus')}</button></div>
        <div class="chips">${[0.2, 0.3, 0.5, 1, 1.5, 2, 3].filter((x) => x >= minKg).map((x) => `<button class="chip ${x === st.value ? 'on' : ''}" data-set="${x}">${wtTxt(x)}</button>`).join('')}</div>`
      : `<div class="stepper"><button data-d="-1">${ic('minus')}</button><div class="v"><input id="qsum" type="text" inputmode="numeric" value="${fmt(st.value)}"><small id="qkg">≈ ${wtTxt(st.value / p.price)}</small></div><button data-d="1">${ic('plus')}</button></div>
        <div class="chips">${[3000, 5000, 10000, 15000, 20000, 50000].filter((x) => x >= minSum).map((x) => `<button class="chip ${x === st.value ? 'on' : ''}" data-set="${x}">${fmt(x)}</button>`).join('')}</div>`}`;
}
// Boshqaruv tugmalarini ulaydi; onChange(st) — summa/tugmani yangilash uchun
function bindQty(root, p, st, onChange) {
  const minKg = Number(p.min_kg || 0.1), minSum = round100(p.price * minKg);
  const redraw = () => { $('#qtyBox', root).innerHTML = qtyHtml(p, st); bind(); onChange(st); };
  const bind = () => {
    root.querySelectorAll('#qtyBox [data-mode]').forEach((b) => b.onclick = () => {
      hap('light'); const kg = st.mode === 'kg' ? st.value : st.value / p.price;
      st.mode = b.dataset.mode; st.value = st.mode === 'kg' ? Math.max(minKg, round3(Math.round(kg * 10) / 10 || 1)) : Math.max(minSum, round100(p.price * kg) || 10000);
      redraw();
    });
    root.querySelectorAll('#qtyBox [data-d]').forEach((b) => b.onclick = () => {
      hap('light'); const d = Number(b.dataset.d);
      if (p.unit !== 'kg') st.value = Math.max(1, st.value + d);
      else if (st.mode === 'kg') { const stp = st.value < 1 || (st.value === 1 && d < 0) ? 0.1 : 0.25; st.value = Math.max(minKg, round3(st.value + d * stp)); }
      else st.value = Math.max(minSum, st.value + d * 1000);
      redraw();
    });
    root.querySelectorAll('#qtyBox [data-set]').forEach((b) => b.onclick = () => { hap('light'); st.value = Number(b.dataset.set); redraw(); });
    const inp = $('#qsum', root);
    if (inp) {
      inp.onfocus = () => inp.select();
      inp.oninput = () => {
        const n = parseInt(inp.value.replace(/\D/g, ''), 10) || 0;
        st.value = n; inp.value = n ? fmt(n) : '';
        $('#qkg', root).textContent = n >= minSum ? `≈ ${wtTxt(n / p.price)}` : `${tr('minIs')} ${fmt(minSum)} ${tr('sum')}`;
        onChange(st);
      };
    }
  };
  bind(); onChange(st);
}
const qtyValid = (p, st) => {
  if (p.unit !== 'kg') return st.value >= 1;
  const minKg = Number(p.min_kg || 0.1);
  return st.mode === 'kg' ? st.value >= minKg : st.value >= round100(p.price * minKg);
};
function commitQty(p, st, line) {
  addToCart({ id: p.id, mode: st.mode, value: st.mode === 'kg' ? round3(st.value) : Math.floor(st.value) }, line?.k);
  refreshCards(p.id);
}

// Tezkor oyna: kilolik mahsulotdagi "+" yoki savatdagi "O'zgartirish"
function qtySheet(p, line) {
  const st = qtyState(p, line);
  openSheet(`<div class="qhead"><div class="qim">${img(p.image)}</div><div><h3>${e(pname(p))}</h3><div class="sub" style="margin:0">${fmt(p.price)} ${tr('sum')}${p.unit === 'kg' ? ' / ' + tr('kg') : ''}</div></div></div>
    <div id="qtyBox">${qtyHtml(p, st)}</div>
    <button class="btn" id="qAdd"></button>${line ? `<button class="btn danger" id="qDel" style="margin-top:4px">${ic('trash-2')}${tr('remove')}</button>` : ''}`, (root) => {
    bindQty(root, p, st, () => {
      const b = $('#qAdd', root); const ok = qtyValid(p, st); b.disabled = !ok;
      b.textContent = `${line ? tr('save') : tr('addCart')} · ${fmt(priceLine(p, st).total)} ${tr('sum')}`;
    });
    $('#qAdd', root).onclick = () => { if (!qtyValid(p, st)) return; commitQty(p, st, line); toast(line ? tr('saved') : tr('added'), 'success'); closeSheet(); if (route()[0] === 'cart') render(true); };
    const d = $('#qDel', root);
    if (d) d.onclick = () => { S.cart = S.cart.filter((x) => x.k !== line.k); saveCart(); closeSheet(); refreshCards(p.id); if (route()[0] === 'cart') render(true); };
  });
}

/* ---------- Mahsulot sahifasi ---------- */
function productPage(v, id) {
  if (needCatalog(v)) return;
  const p = product(id);
  if (!p) { v.innerHTML = navbar('') + emptyState('package', tr('nothing'), ''); return; }
  const disc = p.old_price && p.old_price > p.price ? Math.round((1 - p.price / p.old_price) * 100) : 0;
  const similar = S.catalog.products.filter((x) => x.id !== p.id && x.category_id === p.category_id)
    .sort((a, b) => (b.sub === p.sub) - (a.sub === p.sub)).slice(0, 12);
  const line = S.cart.find((x) => x.id === p.id && !x.reward);
  const st = qtyState(p, line);
  v.innerHTML = `<div class="pp-hero">${img(p.image)}
      <button class="pp-btn l press" data-back>${ic('chevron-left')}</button>
      <div class="pp-r"><button class="pp-btn press" id="ppFav">${ic(isFav(p.id) ? 'mdi:heart' : 'heart')}</button><button class="pp-btn press" id="ppShare">${ic('share')}</button></div>
      ${disc ? `<span class="pp-disc">−${disc}%</span>` : ''}</div>
    <div class="pp-body">
      <h1>${e(pname(p))}</h1>
      <div class="pp-price">${fmt(p.price)} ${tr('sum')}${p.unit === 'kg' ? `<small> / ${tr('kg')}</small>` : ''}${disc ? `<s>${fmt(p.old_price)}</s>` : ''}</div>
      ${p.in_stock ? `<div id="qtyBox">${qtyHtml(p, st)}</div>` : `<div class="note">${ic('info')}<span>${tr('soldOut')}</span></div>`}
      ${pdesc(p) ? `<h3>${tr('aboutProduct')}</h3><p class="muted" style="line-height:1.55;margin:0 0 8px">${e(pdesc(p))}</p>` : ''}
    </div>
    ${similar.length ? `<div class="sec" style="padding-top:12px"><div class="sec-h"><b style="font-size:20px">${tr('similar')}</b></div><div class="p-grid">${similar.map(pcard).join('')}</div></div>` : ''}
    <div style="height:96px"></div>
    ${p.in_stock ? `<div class="paybar"><div class="sum"><b id="ppTotal"></b><small id="ppSub"></small></div><button class="btn" id="ppAdd"></button></div>` : ''}`;
  $('#ppFav').onclick = () => {
    hap('light'); S.fav = isFav(p.id) ? S.fav.filter((x) => x !== p.id) : [p.id, ...S.fav]; cloud.set('fav', S.fav);
    $('#ppFav').innerHTML = ic(isFav(p.id) ? 'mdi:heart' : 'heart'); $('#ppFav').classList.toggle('on', isFav(p.id));
  };
  $('#ppFav').classList.toggle('on', isFav(p.id));
  $('#ppShare').onclick = () => {
    const bot = tg?.initDataUnsafe?.receiver?.username;
    const text = `${pname(p)} — ${fmt(p.price)} ${tr('sum')}`;
    const url = `https://t.me/share/url?url=${encodeURIComponent(bot ? `https://t.me/${bot}` : location.origin)}&text=${encodeURIComponent(text)}`;
    try { tg.openTelegramLink(url); } catch { open(url); }
  };
  if (!p.in_stock) return;
  bindQty(v, p, st, () => {
    const ok = qtyValid(p, st);
    const pl = priceLine(p, st);
    $('#ppTotal').textContent = `${fmt(ok ? pl.total : 0)} ${tr('sum')}`;
    $('#ppSub').textContent = p.unit === 'kg' ? (st.mode === 'kg' ? wtTxt(st.value) : `≈ ${wtTxt(st.value / p.price)}`) : `${st.value} ${tr('pc')}`;
    const b = $('#ppAdd'); b.disabled = !ok;
    b.innerHTML = `${ic('shopping-bag')}${line ? tr('save') : tr('addCart')}`;
  });
  $('#ppAdd').onclick = () => {
    if (!qtyValid(p, st)) return;
    commitQty(p, st, line); hap('success'); toast(line ? tr('saved') : tr('added'));
    render(true);
  };
}

/* ---------- Stores (map) ---------- */
function loadLeaflet() {
  if (window.L) return Promise.resolve();
  const css = document.createElement('link'); css.rel = 'stylesheet'; css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'; document.head.appendChild(css);
  return loadScript('https://unpkg.com/leaflet@1.9.4/dist/leaflet.js');
}
const TILES = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';
function stores(v) {
  if (needCatalog(v)) return;
  const list = S.catalog.stores || [];
  v.innerHTML = `<div class="map-full"><div id="smap"></div></div>
    <div class="map-title">${tr('stores')} · ${list.length}<button data-slist>${tr('list')}</button></div>
    <div class="map-tools"><button id="locBtn">${ic('navigation')}</button></div>`;
  const storeSheet = (s) => openSheet(`${sheetHead(s.name)}
    <div class="rows" style="padding:0">
      ${s.address ? `<div class="row">${ic('map-pin')}<span class="tx">${e(s.address)}</span></div>` : ''}
      ${s.hours ? `<div class="row">${ic('clock')}<span class="tx">${tr('hours')}<small>${e(s.hours)}</small></span></div>` : ''}
      ${s.phone ? `<a class="row" href="tel:${e(s.phone)}">${ic('phone')}<span class="tx">${e(s.phone)}</span></a>` : ''}
    </div>
    <button class="btn" style="margin-top:12px" id="routeBtn">${ic('navigation')}${tr('route')}</button>`, (root) => {
    $('#routeBtn', root).onclick = () => { const u = `https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`; try { tg.openLink(u); } catch { open(u); } };
  });
  $('[data-slist]').onclick = () => openSheet(sheetHead(tr('stores')) + `<div class="rows" style="padding:0">${list.map((s, i) => `<button class="row" data-si="${i}">${ic('store')}<span class="tx">${e(s.name)}<small>${e(s.address || '')}</small></span><span class="chev">${ic('chevron-right')}</span></button>`).join('')}</div>`,
    (root) => root.querySelectorAll('[data-si]').forEach((b) => b.onclick = () => { closeSheet(); setTimeout(() => { m?.setView([list[b.dataset.si].lat, list[b.dataset.si].lng], 16); storeSheet(list[b.dataset.si]); }, 400); }));
  let m = null;
  loadLeaflet().then(() => {
    if (!$('#smap')) return;
    const c = list[0] ? [list[0].lat, list[0].lng] : [39.0573, 66.8341];
    m = window.L.map('smap', { zoomControl: false, attributionControl: false }).setView(c, 14);
    window.L.tileLayer(TILES, { maxZoom: 19, subdomains: 'abcd' }).addTo(m);
    list.forEach((s) => window.L.marker([s.lat, s.lng], { icon: window.L.divIcon({ className: '', html: '<div class="mk">G</div>', iconSize: [40, 40], iconAnchor: [20, 20] }) })
      .addTo(m).on('click', () => { hap('light'); storeSheet(s); }));
    if (list.length > 1) m.fitBounds(list.map((s) => [s.lat, s.lng]), { padding: [60, 60] });
    $('#locBtn').onclick = () => locate((lat, lng) => {
      m.setView([lat, lng], 15);
      window.L.circleMarker([lat, lng], { radius: 8, color: '#fff', weight: 3, fillColor: '#2563eb', fillOpacity: 1 }).addTo(m);
    });
  }).catch(() => toast(tr('error'), 'error'));
}
function locate(cb) {
  hap('light');
  const lm = tg?.LocationManager;
  if (lm && tg.isVersionAtLeast?.('8.0')) lm.init(() => lm.getLocation((loc) => (loc ? cb(loc.latitude, loc.longitude) : lm.openSettings?.())));
  else navigator.geolocation?.getCurrentPosition((p) => cb(p.coords.latitude, p.coords.longitude), () => toast(tr('error'), 'error'), { enableHighAccuracy: true, timeout: 10000 });
}

function addr(v) {
  const me = S.me || {};
  v.innerHTML = `${navbar(tr('address'))}
    <p class="muted" style="margin:0 18px 10px;font-size:14px">${tr('pickMap')}</p>
    <div class="map-box"><div id="amap"></div><div class="map-pin" id="pin">${ic('map-pin')}</div><button class="map-me" id="meBtn">${ic('locate-fixed')}</button></div>
    <div class="field"><textarea id="fAddr" rows="2" placeholder="${tr('addrDetail')}">${e(me.address || '')}</textarea></div>
    <div class="pad"><button class="btn" id="saveAddr">${tr('saveAddr')}</button></div>`;
  const start = me.lat != null ? [me.lat, me.lng] : [39.0573, 66.8341];
  loadLeaflet().then(() => {
    if (!$('#amap')) return;
    const m = window.L.map('amap', { zoomControl: false, attributionControl: false }).setView(start, me.lat != null ? 17 : 14);
    window.L.tileLayer(TILES, { maxZoom: 19, subdomains: 'abcd' }).addTo(m);
    m.on('movestart', () => $('#pin')?.classList.add('lift'));
    m.on('moveend', () => $('#pin')?.classList.remove('lift'));
    $('#meBtn').onclick = () => locate((lat, lng) => m.setView([lat, lng], 17));
    $('#saveAddr').onclick = async () => {
      if (!S.me) return toast(tr('openInBot'), 'error');
      const c = m.getCenter();
      try { S.me = await api('/api/me', { method: 'PATCH', body: { lat: c.lat, lng: c.lng, address: $('#fAddr').value } }); toast(tr('saved'), 'success'); history.back(); }
      catch (err) { toast(err.message, 'error'); }
    };
  }).catch(() => toast(tr('error'), 'error'));
}

/* ---------- Profile ---------- */
function profile(v) {
  const me = S.me || {};
  const name = me.name || me.tg_name || tg?.initDataUnsafe?.user?.first_name || 'Mehmon';
  const ph = me.avatar || tg?.initDataUnsafe?.user?.photo_url;
  const row = (icon, text, attrs, right = `<span class="chev">${ic('chevron-right')}</span>`) => `<button class="row" ${attrs}>${ic(icon)}<span class="tx">${text}</span>${right}</button>`;
  const th = me.theme || local.get('theme', 'light');
  v.innerHTML = `
    <div class="p-head"><button class="ava press" id="ava">${ph ? `<img src="${e(ph)}" alt="">` : e(name[0].toUpperCase())}</button>
      <div class="tx"><b>${e(name)}</b><small>${e(me.phone || '')}</small></div>
      <button class="ghost-pill press" data-go="edit">${ic('pencil')}${tr('edit')}</button></div>
    ${loyaltyCard()}
    <div class="label">${tr('sec_buy')}</div>
    <div class="rows">
      ${row('receipt-text', tr('purchases'), 'data-go="purchases"')}
      ${row('map-pin', `${tr('address')}<small>${e(me.address || tr('noAddress'))}</small>`, 'data-go="addr"')}
    </div>
    <div class="label">${tr('sec_acc')}</div>
    <div class="rows">
      ${row('user-pen', tr('editProfile'), 'data-go="edit"')}
      ${row('bell', tr('notifs'), 'data-go="notif"')}
      ${row('palette', tr('theme'), 'data-act="theme"', `<span class="val">${tr('th_' + th)}</span><span class="chev">${ic('chevron-right')}</span>`)}
      ${row('settings', tr('settings'), 'data-go="settings"')}
      ${row('circle-help', tr('help'), 'data-act="help"')}
      ${row('star', tr('feedback'), 'data-act="feedback"')}
    </div>
    <p class="muted" style="text-align:center;font-size:12px;margin-top:22px">Green Market · v${e(String(window.APP_VERSION).slice(0, 7))}</p>`;
  fillQr(v); animateProg(v);
  $('#ava').onclick = async () => {
    if (!S.me) return toast(tr('openInBot'), 'error');
    const f = await pickFile(); if (!f) return;
    try { S.me = await api('/api/me', { method: 'PATCH', body: { avatar: await resizeImage(f, 320, 0.85) } }); toast(tr('saved'), 'success'); render(true); }
    catch (err) { toast(err.message, 'error'); }
  };
}
async function savePref(patch) {
  render(true);
  if (!S.me) return;
  try { S.me = await api('/api/me', { method: 'PATCH', body: patch }); } catch (err) { toast(err.message, 'error'); }
}
function choiceSheet(title, opts, cur, onPick) {
  openSheet(sheetHead(title) + `<div class="rows" style="padding:0">${opts.map(([k, t]) =>
    `<button class="row" data-c="${k}"><span class="tx">${e(t)}</span>${k === cur ? `<span style="font-size:20px">${ic('check')}</span>` : ''}</button>`).join('')}</div>`,
  (root) => root.querySelectorAll('[data-c]').forEach((b) => b.onclick = () => { hap('light'); closeSheet(); onPick(b.dataset.c); }));
}

function settings(v) {
  v.innerHTML = navbar(tr('settings')) + `<div class="rows">
    <button class="row" data-act="lang">${ic('globe')}<span class="tx">${tr('lang')}</span><span class="val">${S.lang === 'ru' ? 'Русский' : 'O\'zbekcha'}</span><span class="chev">${ic('chevron-right')}</span></button>
    <button class="row" data-go="info/about">${ic('info')}<span class="tx">${tr('about')}</span><span class="chev">${ic('chevron-right')}</span></button>
    <button class="row" data-go="info/delivery">${ic('truck')}<span class="tx">${tr('deliveryTerms')}</span><span class="chev">${ic('chevron-right')}</span></button>
    <button class="row" data-go="info/returns">${ic('rotate-ccw')}<span class="tx">${tr('returns')}</span><span class="chev">${ic('chevron-right')}</span></button>
  </div>`;
}
function info(v, key) {
  const titles = { about: tr('about'), delivery: tr('deliveryTerms'), returns: tr('returns') };
  const inf = setting('info', {});
  v.innerHTML = navbar(titles[key] || '') + `<div class="pad" style="white-space:pre-wrap;line-height:1.6;font-size:15px">${e(inf[key] || '—')}</div>
    ${key === 'about' && (inf.instagram || inf.telegram) ? `<div class="pad" style="display:flex;gap:10px;margin-top:18px">
      ${inf.instagram ? `<a class="ghost-pill" href="${e(inf.instagram)}" target="_blank">${ic('instagram')}Instagram</a>` : ''}
      ${inf.telegram ? `<a class="ghost-pill" href="${e(inf.telegram)}" target="_blank">${ic('send')}Telegram</a>` : ''}</div>` : ''}`;
}
function notif(v) {
  const on = S.me?.notify_promo !== false;
  v.innerHTML = navbar(tr('notifs')) + `<div class="rows">
    <div class="row">${ic('package')}<span class="tx">${tr('orderNotif')}</span><span class="switch on" style="opacity:.5"></span></div>
    <div class="row">${ic('percent')}<span class="tx">${tr('promoNotif')}</span><button class="switch ${on ? 'on' : ''}" id="swPromo"></button></div></div>`;
  $('#swPromo').onclick = (ev) => { const b = ev.currentTarget; b.classList.toggle('on'); hap('light'); if (S.me) api('/api/me', { method: 'PATCH', body: { notify_promo: b.classList.contains('on') } }).then((m) => { S.me = m; }).catch(() => {}); };
}
function edit(v) {
  const me = S.me || {};
  v.innerHTML = `${navbar(tr('editProfile'))}
    <div class="field"><label>${tr('name')}</label><input id="fName" value="${e(me.name || '')}" maxlength="60"></div>
    <div class="field"><label>${tr('phone')}</label><input id="fPhone" type="tel" inputmode="tel" value="${e(me.phone || '+998')}" maxlength="16"></div>
    <div class="field"><label>${tr('birthday')}</label><input id="fBday" type="date" value="${e(me.birthday || '')}" ${me.birthday ? 'disabled' : ''}>
      <div class="hint">${me.birthday ? tr('bdayFixed') : tr('bdayNote', setting('coins', {}).birthday_bonus || 0)}</div></div>
    <div class="pad"><button class="btn" id="saveBtn">${tr('save')}</button></div>`;
  $('#saveBtn').onclick = async () => {
    if (!S.me) return toast(tr('openInBot'), 'error');
    const body = { name: $('#fName').value, phone: $('#fPhone').value };
    if (!me.birthday && $('#fBday').value) body.birthday = $('#fBday').value;
    try { S.me = await api('/api/me', { method: 'PATCH', body }); toast(tr('saved'), 'success'); history.back(); }
    catch (err) { toast(err.message, 'error'); }
  };
}

/* ---------- Loyalty ---------- */
function cardSheet() {
  const li = levelInfo();
  openSheet(sheetHead(tr('card')) + `<div class="big-qr" data-qr></div>
    <p class="muted" style="text-align:center;margin:0 0 4px;font-size:14px">${tr('cardHint')}</p>
    <p style="text-align:center;margin:0 0 16px;font-weight:800;letter-spacing:.12em">${e(cardCode())}</p>
    <div class="box" style="margin:0 0 12px;padding:14px 16px"><div class="lvl muted" style="font-size:12px;font-weight:700;text-transform:uppercase">${e(tr('lvl', li.cur.name, li.cur.pct))}</div>
      <b style="font-size:22px">${fmt(S.me?.coins || 0)} ${tr('balls')}</b></div>
    <button class="btn ghost" data-go="card">${tr('levels')} · ${tr('gifts')}</button>`, (root) => fillQr(root));
}
function card(v) {
  if (needCatalog(v)) return;
  const li = levelInfo(); const coins = S.me?.coins || 0;
  const gifts = S.catalog.products.filter((p) => p.coin_price > 0 && p.in_stock).sort((a, b) => a.coin_price - b.coin_price);
  const avail = coins - cartTotals().coins;
  const bday = setting('coins', {}).birthday_bonus;
  v.innerHTML = `${navbar(tr('card'))}
    ${loyaltyCard()}
    <div class="label">${tr('levels')}</div>
    <div class="pad">${levels().map((l, i) => `<div class="lv ${i === li.idx ? 'cur' : ''}"><span class="medal" style="background:${MEDALS[i % MEDALS.length]}">${l.pct}%</span>
      <span class="tx"><b>${e(l.name)}${i === li.idx ? ' ✓' : ''}</b><small>${tr('fromSum', l.from)} · ${tr('cashback', l.pct)}</small></span></div>`).join('')}</div>
    ${bday ? `<div class="pad" style="margin-top:8px"><div class="note">${ic('cake')}<span>${tr('bdayNote', bday)}</span></div></div>` : ''}
    <div class="pad"><button class="btn ghost" data-go="purchases/history">${ic('history')}${tr('history')}</button></div>
    ${gifts.length ? `<div class="sec"><div class="sec-h"><b>${tr('gifts')}</b></div><div class="p-grid">${gifts.map((p) => `<div class="pc">
        <div class="im">${img(p.image, 'gift')}</div><div class="price">${fmt(p.coin_price)} ${tr('balls')}</div><div class="nm">${e(pname(p))}${p.unit === 'kg' ? ' · 1 ' + tr('kg') : ''}</div>
        <button class="btn sm ${avail >= p.coin_price ? '' : 'ghost'}" style="width:100%;margin-top:8px;height:36px" data-gift="${p.id}" ${avail >= p.coin_price ? '' : 'disabled'}>${avail >= p.coin_price ? tr('take') : tr('needMore', p.coin_price - avail)}</button></div>`).join('')}</div></div>` : ''}`;
  fillQr(v); animateProg(v);
  v.querySelectorAll('[data-gift]').forEach((b) => b.onclick = () => { addToCart({ id: Number(b.dataset.gift), mode: 'dona', value: 1, reward: true }); toast(tr('giftAdded'), 'success'); render(true); });
}

async function purchases(v, tab = 'orders') {
  v.innerHTML = `${navbar(tr('purchases'))}<div class="segm"><button class="${tab === 'orders' ? 'on' : ''}" data-t="orders">${tr('tabOrders')}</button><button class="${tab === 'history' ? 'on' : ''}" data-t="history">${tr('tabHistory')}</button></div><div id="plist">${'<div class="sk" style="height:110px;margin:0 16px 12px"></div>'.repeat(3)}</div>`;
  v.querySelectorAll('[data-t]').forEach((b) => b.onclick = () => { hap('light'); location.replace('#purchases/' + b.dataset.t); });
  const box = $('#plist');
  if (!S.me) { box.innerHTML = emptyState('receipt-text', tr('openInBot'), ''); return; }
  try {
    if (tab === 'history') {
      const list = await api('/api/coins');
      if (!box.isConnected) return;
      box.innerHTML = list.length ? list.map((h) => { const d = new Date(h.created_at); return `<div class="hist"><span class="ic">${ic(h.delta > 0 ? (h.reason === 'birthday' ? 'cake' : 'coins') : 'gift')}</span>
        <span class="tx">${tr('r_' + h.reason)}${h.order_id ? ` · #${h.order_id}` : ''}<small>${d.toLocaleDateString('ru-RU')} ${d.toTimeString().slice(0, 5)}</small></span>
        <span class="d ${h.delta > 0 ? 'plus' : ''}">${h.delta > 0 ? '+' : ''}${fmt(h.delta)}</span></div>`; }).join('') : emptyState('coins', tr('noHistory'), tr('noHistorySub'));
    } else {
      const list = await api('/api/orders');
      if (!box.isConnected) return;
      box.innerHTML = list.length ? list.map((o) => orderCard(o)).join('') : emptyState('receipt-text', tr('noOrders'), tr('noOrdersSub'));
    }
  } catch (err) { box.innerHTML = emptyState('cloud-off', err.message, ''); }
}
function orderCard(o, adminView = false) {
  const d = new Date(o.created_at); const est = o.items.some((l) => l.estimated);
  const q = (l) => (l.reward ? '🎁' : l.unit === 'dona' ? `${l.value} ${tr('pc')}` : l.mode === 'dona' ? `${l.value} ${tr('pc')} ≈${kgTxt(l.kg)} ${tr('kg')}` : `${kgTxt(l.kg)} ${tr('kg')}`);
  return `<div class="oc"><div class="h"><b>#${o.id}</b><span class="pill ${o.status}">${tr('st_' + o.status)}</span></div>
    <div class="d">${d.toLocaleDateString('ru-RU')} ${d.toTimeString().slice(0, 5)}</div>
    ${o.items.map((l) => `<div class="sumrow"><span style="color:var(--text)">${e(l.name)} · ${q(l)}</span><span>${l.reward ? '' : fmt(l.total)}</span></div>`).join('')}
    <div class="sumrow total"><span>${tr('total')}</span><span>${est ? '~' : ''}${fmt(o.total)} ${tr('sum')}</span></div>
    ${!adminView && o.coins_earned && o.status !== 'cancelled' ? `<div class="muted" style="font-size:13px">${o.status === 'done' ? '+' : ''}${fmt(o.coins_earned)} ${tr('balls')}</div>` : ''}
    ${adminView ? `<div class="muted" style="font-size:13px;margin-top:6px;line-height:1.6">👤 ${e(o.name)} · <a href="tel:${e(o.phone)}" style="color:var(--text);font-weight:700">${e(o.phone)}</a>
      ${o.address ? '<br>🏠 ' + e(o.address) : ''}${o.comment ? '<br>💬 ' + e(o.comment) : ''}
      ${o.lat ? `<br><a href="https://maps.google.com/?q=${o.lat},${o.lng}" target="_blank" style="color:var(--text);font-weight:700">📍 Xaritada ochish</a>` : ''}</div>${adminOrderActions(o)}` : ''}</div>`;
}

/* ---------- Sheets: help, write, feedback ---------- */
function helpSheet() {
  const faq = S.catalog?.faq || []; const shop = setting('shop', {});
  openSheet(sheetHead(tr('needHelp')) + `<div class="label" style="padding:0 0 4px">${tr('faq')}</div>
    ${faq.map((f) => `<div class="faq-item"><button class="faq-q">${e((S.lang === 'ru' && f.q_ru) || f.q_uz)}${ic('chevron-down')}</button><div class="faq-a">${e((S.lang === 'ru' && f.a_ru) || f.a_uz)}</div></div>`).join('')}
    <button class="btn" style="margin-top:14px" data-act="write">${ic('message-circle')}${tr('writeUs')}</button>
    ${shop.phone && shop.phone.length > 5 ? `<a class="btn ghost" style="margin-top:8px" href="tel:${e(shop.phone)}">${ic('phone')}${tr('call')}</a>` : ''}`,
  (root) => root.querySelectorAll('.faq-q').forEach((q) => q.onclick = () => { hap('light'); q.parentElement.classList.toggle('open'); }));
}
function writeSheet(title, ph, wrap, okMsg) {
  openSheet(sheetHead(title) + `<div class="field"><textarea id="wText" rows="4" placeholder="${e(ph)}"></textarea></div><button class="btn" id="wSend">${ic('send')}${tr('send')}</button>`, (root) => {
    setTimeout(() => $('#wText', root)?.focus(), 400);
    $('#wSend', root).onclick = async () => {
      const t = $('#wText', root).value.trim(); if (!t) return;
      if (!S.me) return toast(tr('openInBot'), 'error');
      try { await api('/api/support', { method: 'POST', body: { text: wrap(t) } }); closeSheet(); toast(okMsg, 'success'); }
      catch (err) { toast(err.message, 'error'); }
    };
  });
}
function feedbackSheet() {
  let stars = 0;
  openSheet(sheetHead(tr('feedback')) + `<p class="muted" style="text-align:center;margin:0">${tr('fbTitle')}</p>
    <div class="stars">${[1, 2, 3, 4, 5].map((i) => `<button data-s="${i}">${ic('star')}</button>`).join('')}</div>
    <div class="field"><textarea id="fbText" rows="3" placeholder="${tr('fbPh')}"></textarea></div><button class="btn" id="fbSend" disabled>${tr('send')}</button>`, (root) => {
    root.querySelectorAll('[data-s]').forEach((b) => b.onclick = () => {
      hap('light'); stars = Number(b.dataset.s);
      root.querySelectorAll('[data-s]').forEach((x) => { const on = Number(x.dataset.s) <= stars; x.classList.toggle('on', on); x.innerHTML = ic(on ? 'mdi:star' : 'star'); });
      $('#fbSend', root).disabled = false;
    });
    $('#fbSend', root).onclick = async () => {
      if (!S.me) return toast(tr('openInBot'), 'error');
      try { await api('/api/support', { method: 'POST', body: { text: `⭐ Ilova haqida fikr: ${'★'.repeat(stars)}${'☆'.repeat(5 - stars)} (${stars}/5)\n${$('#fbText', root).value.trim()}` } }); closeSheet(); toast(tr('fbThanks'), 'success'); }
      catch (err) { toast(err.message, 'error'); }
    };
  });
}

/* ---------- Cart & checkout ---------- */
function cart(v) {
  if (needCatalog(v)) return;
  const t = cartTotals();
  if (!S.cart.length) {
    v.innerHTML = navbar(tr('cart')) + emptyState('shopping-bag', tr('cartEmpty'), tr('cartEmptySub'), `<button class="btn" style="max-width:240px;margin:0 auto" data-go="catalog">${tr('goShop')}</button>`);
    return;
  }
  v.innerHTML = `${navbar(tr('cart'))}
    ${S.cart.map((it) => {
      const p = product(it.id); const pl = priceLine(p, it);
      return `<div class="ci"><div class="im" data-p="${p.id}">${img(p.image)}</div>
        <div class="tx"><b>${it.reward ? tr('gift') : (pl.est ? '~' : '') + fmt(pl.total) + ' ' + tr('sum')}</b><span>${e(pname(p))}</span><small>${lineLabel(p, it)}</small></div>
        <div class="ctl"><button class="trash" data-del="${e(it.k)}">${ic('trash-2')}</button>
          ${it.reward ? '' : p.unit === 'dona'
            ? `<div class="stp"><button data-dec="${p.id}">${ic('minus')}</button><b>${it.value}</b><button data-inc="${p.id}">${ic('plus')}</button></div>`
            : `<button class="edit" data-k="${e(it.k)}">${ic('pencil')}${tr('edit')}</button>`}</div></div>`;
    }).join('')}
    <div class="summary">
      <div class="sumrow"><span>${tr('items', t.n)}</span><span>${t.est ? '~' : ''}${fmt(t.subtotal)} ${tr('sum')}</span></div>
      <div class="sumrow"><span>${tr('fee')}</span><span>${t.fee ? fmt(t.fee) + ' ' + tr('sum') : tr('free')}</span></div>
      ${t.coins ? `<div class="sumrow"><span>${tr('giftBalls')}</span><span>−${fmt(t.coins)}</span></div>` : ''}
      ${t.earn ? `<div class="sumrow"><span>${tr('willEarn')}</span><span style="color:var(--accent)">+${fmt(t.earn)} ${tr('balls')}</span></div>` : ''}
      <div class="sumrow total"><span>${tr('total')}</span><span>${t.est ? '~' : ''}${fmt(t.total)} ${tr('sum')}</span></div>
    </div><div style="height:90px"></div>
    <div class="paybar"><div class="sum"><b>${fmt(t.total)} ${tr('sum')}</b><small>${tr('items', t.n)}</small></div>
      <button class="btn" id="goCheckout" ${t.subtotal && t.subtotal < t.min ? 'disabled' : ''}>${tr('checkout')}${t.subtotal && t.subtotal < t.min ? `<small>${tr('minOrder')} ${fmt(t.min)}</small>` : ''}</button></div>`;
  v.querySelectorAll('[data-del]').forEach((b) => b.onclick = () => { hap('medium'); const it = S.cart.find((x) => x.k === b.dataset.del); S.cart = S.cart.filter((x) => x !== it); saveCart(); render(true); });
  v.querySelectorAll('[data-k]').forEach((b) => b.onclick = () => { const it = S.cart.find((x) => x.k === b.dataset.k); qtySheet(product(it.id), it); });
  $('#goCheckout').onclick = () => go('checkout');
}
function checkout(v) {
  if (needCatalog(v)) return;
  const t = cartTotals(); if (!t.n) return go('cart');
  const me = S.me || {};
  v.innerHTML = `${navbar(tr('checkout'))}
    <div class="rows">
      <button class="row" data-go="addr">${ic('map-pin')}<span class="tx">${tr('address')}<small>${e(me.address || (me.lat != null ? `${me.lat.toFixed(4)}, ${me.lng.toFixed(4)}` : tr('noAddress')))}</small></span><span class="chev">${ic('chevron-right')}</span></button>
      <button class="row" data-go="edit">${ic('phone')}<span class="tx">${tr('phone')}<small>${e(me.phone || '—')} · ${e(me.name || '')}</small></span><span class="chev">${ic('chevron-right')}</span></button>
    </div>
    <div class="field" style="margin-top:8px"><textarea id="comment" rows="2" placeholder="${tr('comment')}">${e(local.get('comment', ''))}</textarea></div>
    <div class="label">${tr('payment')}</div>
    <div class="rows">
      <div class="row">${ic('wallet')}<span class="tx">${tr('cash')}</span><span class="radio on"></span></div>
      <div class="row" style="opacity:.5">${ic('credit-card')}<span class="tx">${tr('payme')}</span><span class="soon">${tr('soon')}</span></div>
    </div>
    ${t.est ? `<div class="pad" style="margin-top:8px"><div class="note">${ic('info')}<span>${tr('estNote')}</span></div></div>` : ''}
    <div class="summary">
      <div class="sumrow"><span>${tr('items', t.n)}</span><span>${t.est ? '~' : ''}${fmt(t.subtotal)} ${tr('sum')}</span></div>
      <div class="sumrow"><span>${tr('fee')}</span><span>${t.fee ? fmt(t.fee) + ' ' + tr('sum') : tr('free')}</span></div>
      ${t.coins ? `<div class="sumrow"><span>${tr('giftBalls')}</span><span>−${fmt(t.coins)}</span></div>` : ''}
      ${t.earn ? `<div class="sumrow"><span>${tr('willEarn')}</span><span style="color:var(--accent)">+${fmt(t.earn)} ${tr('balls')}</span></div>` : ''}
      <div class="sumrow total"><span>${tr('total')}</span><span>${t.est ? '~' : ''}${fmt(t.total)} ${tr('sum')}</span></div>
    </div><div style="height:90px"></div>
    <div class="paybar"><button class="btn" id="orderBtn">${tr('placeOrder')} · ${fmt(t.total)} ${tr('sum')}</button></div>`;
  $('#comment').oninput = (ev) => local.set('comment', ev.target.value);
  $('#orderBtn').onclick = placeOrder;
}
async function placeOrder() {
  const me = S.me; if (!me) return toast(tr('openInBot'), 'error');
  if (!me.phone) { toast(tr('needPhone'), 'error'); return go('edit'); }
  if (me.lat == null) { toast(tr('needAddr'), 'error'); return go('addr'); }
  const t = cartTotals(); const btn = $('#orderBtn'); btn.disabled = true;
  try {
    const o = await api('/api/orders', { method: 'POST', body: { items: S.cart.map(({ id, mode, value, reward }) => ({ id, mode, value, reward })), comment: local.get('comment', '') } });
    S.cart = []; saveCart(); local.set('comment', '');
    if (t.coins) S.me.coins -= t.coins;
    hap('success'); stack.length = 0; location.replace('#success/' + o.id);
  } catch (err) { toast(err.message, 'error'); btn.disabled = false; }
}
function success(v, id) {
  v.innerHTML = `<div class="success"><div class="ok">${ic('check')}</div><h2 style="margin:0 0 6px;font-weight:800">${tr('success')}</h2><p class="muted" style="margin:0">#${e(id)} · ${tr('successSub')}</p></div>
    <div class="pad"><button class="btn" data-go="purchases">${tr('purchases')}</button><button class="btn text" style="margin-top:6px" data-go="home">${tr('toHome')}</button></div>`;
}

/* ---------- Onboarding & intro ---------- */
function coinStack(cx, base, n, w = 34) {
  let s = '';
  for (let i = 0; i < n; i++) {
    const y = base - i * 9;
    s += `<rect x="${cx - w}" y="${y - 9}" width="${w * 2}" height="9" fill="url(#side)"/><ellipse cx="${cx}" cy="${y}" rx="${w}" ry="${w * 0.3}" fill="url(#side)"/><ellipse cx="${cx}" cy="${y - 9}" rx="${w}" ry="${w * 0.3}" fill="url(#top)" stroke="#fff" stroke-opacity=".6"/>`;
  }
  return s;
}
const DEFS = `<defs><linearGradient id="side" x1="0" x2="1"><stop offset="0" stop-color="#9aa0a6"/><stop offset=".5" stop-color="#e5e7eb"/><stop offset="1" stop-color="#8b9096"/></linearGradient>
  <linearGradient id="top" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f8fafc"/><stop offset="1" stop-color="#c7ccd1"/></linearGradient>
  <linearGradient id="gtop" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4ade80"/><stop offset="1" stop-color="#15803d"/></linearGradient></defs>`;
const ART = [
  `<svg width="240" height="200" viewBox="0 0 240 200">${DEFS}<ellipse cx="110" cy="178" rx="70" ry="10" fill="#000" opacity=".08"/>${coinStack(105, 165, 7, 46)}<g transform="rotate(-18 190 120)"><ellipse cx="190" cy="120" rx="26" ry="44" fill="url(#side)"/><ellipse cx="184" cy="120" rx="24" ry="42" fill="url(#gtop)"/><text x="184" y="132" text-anchor="middle" font-size="34" font-weight="900" fill="#fff" font-family="Manrope,sans-serif">G</text></g></svg>`,
  `<svg width="250" height="200" viewBox="0 0 250 200">${DEFS}<ellipse cx="125" cy="182" rx="105" ry="10" fill="#000" opacity=".07"/>${coinStack(55, 170, 3, 28)}${coinStack(125, 170, 7, 28)}${coinStack(195, 170, 12, 28)}</svg>`,
  `<svg width="230" height="210" viewBox="0 0 230 210"><ellipse cx="115" cy="192" rx="80" ry="10" fill="#000" opacity=".07"/><rect x="50" y="50" width="130" height="140" rx="22" fill="#111"/><path d="M85 60 v-12 a30 30 0 0 1 60 0 v12" stroke="#111" stroke-width="10" fill="none" stroke-linecap="round"/><circle cx="115" cy="118" r="30" fill="#16a34a"/><path d="M101 118 l10 10 l19 -20" stroke="#fff" stroke-width="7" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>`,
  `<div style="position:relative;width:190px;height:190px;display:grid;place-items:center"><svg width="190" height="190" viewBox="0 0 190 190" style="position:absolute;inset:0" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"><path d="M10 40 V18 a8 8 0 0 1 8-8 H40 M150 10 H172 a8 8 0 0 1 8 8 V40 M180 150 V172 a8 8 0 0 1-8 8 H150 M40 180 H18 a8 8 0 0 1-8-8 V150"/></svg><div class="qr" style="width:140px;height:140px;border-radius:22px;box-shadow:var(--shadow)" data-qr></div></div>`,
];
function showOnboarding() {
  return new Promise((done) => {
    const slides = [1, 2, 3, 4].map((i) => ({ t: tr('onb' + i + 't'), p: tr('onb' + i + 'p'), a: ART[i - 1] }));
    const el = document.createElement('div'); el.className = 'onb';
    el.innerHTML = `${wavesSvg('#111', 0.07)}<button class="skip">${tr('skip')}</button>
      <div class="track">${slides.map((s, i) => `<div class="slide ${i ? '' : 'in'}"><div class="art">${s.a}</div><h2>${e(s.t)}</h2><p>${e(s.p)}</p></div>`).join('')}</div>
      <div class="foot"><div class="dots">${slides.map((_, i) => `<i class="${i ? '' : 'on'}"></i>`).join('')}</div><button class="btn" id="onbNext">${tr('next')}</button></div>`;
    document.body.appendChild(el); fillQr(el);
    let i = 0;
    const finish = () => { local.set('onb_done', true); el.classList.add('out'); setTimeout(() => el.remove(), 420); done(); };
    const show = (k) => {
      i = k; hap('light');
      $('.track', el).style.transform = `translateX(-${k * 100}%)`;
      $$('.slide', el).forEach((s, j) => s.classList.toggle('in', j === k));
      $$('.dots i', el).forEach((d, j) => d.classList.toggle('on', j === k));
      $('#onbNext', el).textContent = k === slides.length - 1 ? tr('start') : tr('next');
    };
    $('#onbNext', el).onclick = () => (i < slides.length - 1 ? show(i + 1) : finish());
    $('.skip', el).onclick = finish;
    let x0 = null;
    el.addEventListener('touchstart', (ev) => { x0 = ev.touches[0].clientX; }, { passive: true });
    el.addEventListener('touchend', (ev) => { const dx = ev.changedTouches[0].clientX - x0; if (dx < -50 && i < slides.length - 1) show(i + 1); if (dx > 50 && i > 0) show(i - 1); });
  });
}
function intro(v) {
  const me = S.me || {};
  v.innerHTML = `${navbar(tr('meet'), false)}
    <p class="muted" style="text-align:center;margin:0 28px 22px;font-size:14px;line-height:1.5">${tr('meetSub')}</p>
    <div class="field"><label>${tr('name')}</label><input id="iName" value="${e(me.name || '')}" maxlength="60"></div>
    <div class="field"><label>${tr('birthday')}</label><input id="iBday" type="date" max="${new Date().toISOString().slice(0, 10)}">
      <div class="hint">${tr('bdayNote', setting('coins', {}).birthday_bonus || 0)}</div></div>
    <div class="pad" style="margin-top:20px"><button class="btn" id="iSave">${tr('save')}</button><button class="btn text" id="iLater">${tr('later')}</button></div>`;
  const next = () => { local.set('intro_done', true); stack.length = 0; location.replace('#home'); setTimeout(notifPrompt, 600); };
  $('#iLater').onclick = next;
  $('#iSave').onclick = async () => {
    const body = { name: $('#iName').value };
    if ($('#iBday').value) body.birthday = $('#iBday').value;
    try { if (S.me) S.me = await api('/api/me', { method: 'PATCH', body }); hap('success'); } catch (err) { toast(err.message, 'error'); return; }
    next();
  };
}
function notifPrompt() {
  if (local.get('notif_asked', false) || !S.me) return;
  local.set('notif_asked', true);
  openSheet(`<div class="bell">${ic('bell-ring')}</div><h2 style="text-align:center;margin:0 0 4px;font-weight:800">${tr('notifT')}</h2><p class="muted" style="text-align:center;margin:0 0 14px">${tr('notifP')}</p>
    <div class="rows" style="padding:0;margin-bottom:14px">
      <div class="row">${ic('coins')}<span class="tx">${tr('n1')}</span></div><div class="row">${ic('percent')}<span class="tx">${tr('n2')}</span></div><div class="row">${ic('package')}<span class="tx">${tr('n3')}</span></div></div>
    <button class="btn" id="nYes">${ic('check')}${tr('enable')}</button><button class="btn text" id="nNo">${tr('notNow')}</button>`, (root) => {
    const set = (on) => { closeSheet(); api('/api/me', { method: 'PATCH', body: { notify_promo: on } }).then((m) => { S.me = m; }).catch(() => {}); };
    $('#nYes', root).onclick = () => { try { tg.requestWriteAccess?.(() => {}); } catch {} set(true); };
    $('#nNo', root).onclick = () => set(false);
  });
}

/* ================= ADMIN (alohida bot orqali /admin) ================= */
const NEXT = { new: ['accepted', 'cancelled'], accepted: ['delivering', 'done', 'cancelled'], delivering: ['done', 'cancelled'] };
const ICONS = ['carrot', 'apple', 'milk', 'egg', 'beef', 'fish', 'croissant', 'cookie', 'candy', 'ice-cream-cone', 'cup-soda', 'coffee', 'wine', 'wheat', 'soup', 'pizza', 'baby', 'spray-can', 'shirt', 'pill', 'dog', 'gift', 'package', 'percent'];
function adminOrderActions(o) {
  const n = NEXT[o.status]; if (!n) return '';
  return `<div class="actions">${n.map((s) => `<button class="btn sm ${s === 'cancelled' ? 'ghost' : ''}" data-st="${o.id}:${s}">${tr('st_' + s)}</button>`).join('')}</div>`;
}
async function admin(v, tab = 'orders') {
  if (!S.me?.is_admin) { v.innerHTML = '<div class="top-space"></div>' + emptyState('shield-x', 'Ruxsat yo\'q', 'Admin panel faqat admin bot orqali ochiladi.'); return; }
  const tabs = [['orders', 'Buyurtmalar'], ['products', 'Mahsulotlar'], ['categories', 'Kategoriyalar'], ['banners', 'Banner va istoriya'], ['recipes', 'Retseptlar'], ['stores', 'Do\'konlar'], ['faq', 'Savollar'], ['settings', 'Sozlamalar']];
  v.innerHTML = `${navbar('Admin panel', false)}<div class="admin-tabs">${tabs.map(([k, t]) => `<button class="chip ${k === tab ? 'on' : ''}" data-tab2="${k}">${t}</button>`).join('')}</div><div id="adm"><div class="sk" style="height:120px;margin:0 16px"></div></div>`;
  v.querySelectorAll('[data-tab2]').forEach((b) => b.onclick = () => { hap('light'); location.replace('#admin/' + b.dataset.tab2); });
  $('.admin-tabs .chip.on')?.scrollIntoView({ inline: 'center', block: 'nearest' });
  try {
    if (!S.admin) S.admin = await api('/api/admin/all');
    ({ orders: admOrders, products: admProducts, categories: admCategories, banners: admBanners, recipes: admRecipes, stores: admStores, faq: admFaq, settings: admSettings })[tab]?.($('#adm'));
  } catch (err) { $('#adm').innerHTML = emptyState('cloud-off', err.message, ''); }
}
const reloadAdmin = async () => { S.admin = await api('/api/admin/all'); render(true); };
const addBtn = (id, text) => `<div class="pad" style="margin-bottom:12px"><button class="btn" id="${id}">${ic('plus')}${text}</button></div>`;
const listRows = (items, fn) => `<div class="box">${items.map(fn).join('') || '<div class="arow muted">—</div>'}</div>`;
const iconOf = (x) => (x?.includes(':') ? x : 'lucide:' + (x || 'package'));

async function admOrders(box) {
  const sts = ['new', 'accepted', 'delivering', 'done', 'cancelled', 'all'];
  box.innerHTML = `<div class="stats" id="stats"></div><div class="admin-tabs" style="padding-top:0">${sts.map((s) => `<button class="chip ${S.adminStatus === s ? 'on' : ''}" data-fs="${s}">${s === 'all' ? 'Hammasi' : tr('st_' + s)}</button>`).join('')}</div><div id="aol"><div class="sk" style="height:140px;margin:0 16px"></div></div>`;
  box.querySelectorAll('[data-fs]').forEach((b) => b.onclick = () => { S.adminStatus = b.dataset.fs; admOrders(box); });
  api('/api/admin/stats').then((s) => { const el = $('#stats'); if (el) el.innerHTML = `<div class="stat"><b>${s.today_orders}</b><small>Bugun buyurtma</small></div><div class="stat"><b>${fmt(s.today_sum)}</b><small>Bugun, so'm</small></div><div class="stat"><b>${s.users}</b><small>Mijozlar</small></div>`; }).catch(() => {});
  const list = await api('/api/admin/orders?status=' + S.adminStatus);
  const aol = $('#aol'); if (!aol) return;
  aol.innerHTML = list.length ? list.map((o) => orderCard(o, true)).join('') : emptyState('receipt-text', 'Buyurtma yo\'q', '');
  aol.querySelectorAll('[data-st]').forEach((b) => b.onclick = async () => {
    const [id, st] = b.dataset.st.split(':');
    if (st === 'cancelled' && !confirm('Bekor qilinsinmi?')) return;
    b.disabled = true;
    try { await api('/api/admin/orders/' + id, { method: 'PATCH', body: { status: st } }); toast('✓ ' + tr('st_' + st), 'success'); admOrders(box); }
    catch (err) { toast(err.message, 'error'); b.disabled = false; }
  });
}
function admProducts(box) {
  const A = S.admin; const catName = (id) => A.categories.find((c) => c.id === id)?.name_uz || '—';
  box.innerHTML = addBtn('addP', 'Mahsulot qo\'shish') + `<div class="search-line" style="padding-top:0"><label class="search-pill">${ic('search')}<input id="aq" placeholder="Qidirish…"></label></div><div id="apl"></div>`;
  const draw = () => {
    const q = $('#aq').value.toLowerCase();
    $('#apl').innerHTML = listRows(A.products.filter((p) => p.name_uz.toLowerCase().includes(q)), (p) => `<button class="arow" data-id="${p.id}" style="${p.active ? '' : 'opacity:.4'}"><span class="thumb">${img(p.image)}</span>
      <span class="tx">${e(p.name_uz)}<small>${fmt(p.price)} ${p.unit === 'kg' ? '/kg' : '/dona'} · ${e(catName(p.category_id))}${p.popular ? ' · 🔥' : ''}${p.coin_price ? ' · 🎁' + fmt(p.coin_price) : ''}${p.in_stock ? '' : ' · ❌ tugagan'}</small></span>${ic('pencil')}</button>`);
    $('#apl').querySelectorAll('[data-id]').forEach((r) => r.onclick = () => productForm(A.products.find((p) => p.id === Number(r.dataset.id))));
  };
  $('#aq').oninput = draw; draw(); $('#addP').onclick = () => productForm(null);
}
function productForm(p) {
  const A = S.admin;
  formSheet('products', p, [
    { k: 'image', t: 'image', label: 'Rasm (kvadrat)' },
    { k: 'name_uz', label: 'Nomi (o\'zbekcha)', req: true }, { k: 'name_ru', label: 'Nomi (ruscha)' },
    { k: 'category_id', t: 'select', label: 'Kategoriya', num: true, opts: [['', '—'], ...A.categories.map((c) => [c.id, c.name_uz])] },
    { k: 'sub', label: 'Kichik bo\'lim (masalan: Bodringlar, Pomidorlar)' },
    { k: 'unit', t: 'select', label: 'O\'lchov', opts: [['dona', 'Dona'], ['kg', 'Kilogramm']], def: 'dona' },
    { k: 'price', t: 'number', label: 'Narxi (1 kg yoki 1 dona), so\'m', req: true },
    { k: 'old_price', t: 'number', label: 'Eski narx (chegirma % chiqadi)' },
    { k: 'piece_kg', t: 'number', step: '0.001', label: 'Kilolik: 1 dona ≈ necha kg (dona bilan sotish uchun)' },
    { k: 'min_kg', t: 'number', step: '0.001', label: 'Kilolik: minimal kg', def: 0.1 },
    { k: 'coin_price', t: 'number', label: 'Ballga sovg\'a: necha ball (bo\'sh = yo\'q)' },
    { k: 'desc_uz', t: 'textarea', label: 'Tavsif (o\'zbekcha)' }, { k: 'desc_ru', t: 'textarea', label: 'Tavsif (ruscha)' },
    { k: 'sort', t: 'number', label: 'Tartib raqami', def: 0 },
    { k: 'popular', t: 'switch', label: '🔥 Ommabop', def: false },
    { k: 'in_stock', t: 'switch', label: 'Sotuvda bor', def: true },
    { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ]);
}
function admCategories(box) {
  box.innerHTML = addBtn('addC', 'Kategoriya qo\'shish') + listRows(S.admin.categories, (c) => `<button class="arow" data-id="${c.id}" style="${c.active ? '' : 'opacity:.4'}">
    <span class="thumb">${c.image ? img(c.image) : `<iconify-icon icon="${e(iconOf(c.icon))}"></iconify-icon>`}</span><span class="tx">${e(c.name_uz)}<small>${e(c.grp || '—')}</small></span>${ic('pencil')}</button>`);
  const groups = [...new Set(S.admin.categories.map((c) => c.grp).filter(Boolean))];
  const form = (c) => formSheet('categories', c, [
    { k: 'image', t: 'image', label: 'Rasm (fonsiz PNG yaxshi)' },
    { k: 'name_uz', label: 'Nomi (o\'zbekcha)', req: true }, { k: 'name_ru', label: 'Nomi (ruscha)' },
    { k: 'grp', label: `Bo'lim (katalogda guruh)${groups.length ? ': ' + groups.join(', ') : ''}` },
    { k: 'icon', t: 'icon', label: 'Ikonka (rasm bo\'lmasa)', def: 'lucide:package' },
    { k: 'sort', t: 'number', label: 'Tartib', def: 0 },
    { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ]);
  $('#addC').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => form(S.admin.categories.find((c) => c.id === Number(r.dataset.id))));
}
function admBanners(box) {
  const A = S.admin;
  box.innerHTML = `<div class="pad"><div class="note">${ic('info')}<span><b>Promo karta</b> — asosiy sahifadagi aylanib turadigan kartalar (rasm 2:1).<br><b>Brend bloki</b> — rangli katta blok: sarlavha, rasm va bog'langan kategoriya mahsulotlari.</span></div></div>` +
    addBtn('addB', 'Banner qo\'shish') +
    listRows(A.banners, (b) => `<button class="arow" data-id="${b.id}" style="${b.active ? '' : 'opacity:.4'}"><span class="thumb" style="${b.style === 'block' ? `background:${e(b.color || '#e11d2a')}` : ''}">${img(b.image)}</span><span class="tx">${e(b.title || 'Banner #' + b.id)}<small>${b.style === 'block' ? 'Brend bloki' : 'Promo karta'} · ${b.link_type === 'none' ? '—' : b.link_type + ' #' + b.link_id}</small></span>${ic('pencil')}</button>`);
  const linkOpts = [['none:', '— hech qayerga'], ...A.categories.map((c) => [`category:${c.id}`, '📂 ' + c.name_uz]), ...A.products.filter((p) => p.active).map((p) => [`product:${p.id}`, '🛒 ' + p.name_uz])];
  const form = (b) => formSheet('banners', b ? { ...b, link: `${b.link_type}:${b.link_id ?? ''}` } : null, [
    { k: 'style', t: 'select', label: 'Turi', opts: [['card', 'Promo karta'], ['block', 'Brend bloki']], def: 'card' },
    { k: 'image', t: 'image', label: 'Rasm' },
    { k: 'title', label: 'Sarlavha' }, { k: 'subtitle', label: 'Qo\'shimcha matn' },
    { k: 'color', t: 'color', label: 'Fon rangi (karta / blok)', def: '#eaf6ec' },
    { k: 'story_title', label: 'Istoriya sarlavhasi (masalan: Bonuslar)' },
    { k: 'stories', t: 'stories', label: 'Istoriya slaydlari (bannerga bosilganda ochiladi)' },
    { k: 'link', t: 'select', label: 'Bog\'lash (bosilganda / blok mahsulotlari)', opts: linkOpts, def: 'none:' },
    { k: 'sort', t: 'number', label: 'Tartib', def: 0 },
    { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ], (data) => { const [lt, lid] = String(data.link || 'none:').split(':'); delete data.link; data.link_type = lt; data.link_id = lid ? Number(lid) : null; return data; });
  $('#addB').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => form(A.banners.find((b) => b.id === Number(r.dataset.id))));
}
function admStores(box) {
  box.innerHTML = `<div class="pad"><div class="note">${ic('info')}<span>Koordinatani Google Maps'dan oling: joyni bosib turing → raqamlarni nusxalang (masalan 39.0573, 66.8341).</span></div></div>` + addBtn('addS', 'Do\'kon qo\'shish') +
    listRows(S.admin.stores || [], (s) => `<button class="arow" data-id="${s.id}" style="${s.active ? '' : 'opacity:.4'}"><span class="thumb">${ic('store')}</span><span class="tx">${e(s.name)}<small>${e(s.address || '')} · ${s.lat}, ${s.lng}</small></span>${ic('pencil')}</button>`);
  const form = (s) => formSheet('stores', s ? { ...s, coords: `${s.lat}, ${s.lng}` } : null, [
    { k: 'name', label: 'Nomi', req: true }, { k: 'address', label: 'Manzil' },
    { k: 'coords', label: 'Koordinata (kenglik, uzunlik)', req: true }, { k: 'hours', label: 'Ish vaqti' }, { k: 'phone', label: 'Telefon' },
    { k: 'sort', t: 'number', label: 'Tartib', def: 0 }, { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ], (d) => { const [lat, lng] = String(d.coords || '').split(/[,\s]+/).map(Number); delete d.coords; if (!Number.isFinite(lat) || !Number.isFinite(lng)) throw new Error('Koordinata noto\'g\'ri'); d.lat = lat; d.lng = lng; return d; });
  $('#addS').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => form(S.admin.stores.find((s) => s.id === Number(r.dataset.id))));
}
function admFaq(box) {
  box.innerHTML = addBtn('addF', 'Savol qo\'shish') + listRows(S.admin.faq, (f) => `<button class="arow" data-id="${f.id}"><span class="thumb">${ic('circle-help')}</span><span class="tx">${e(f.q_uz)}<small>${e(f.a_uz)}</small></span>${ic('pencil')}</button>`);
  const form = (f) => formSheet('faq', f, [
    { k: 'q_uz', label: 'Savol (o\'zbekcha)', req: true }, { k: 'a_uz', t: 'textarea', label: 'Javob (o\'zbekcha)', req: true },
    { k: 'q_ru', label: 'Savol (ruscha)' }, { k: 'a_ru', t: 'textarea', label: 'Javob (ruscha)' }, { k: 'sort', t: 'number', label: 'Tartib', def: 0 },
  ]);
  $('#addF').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((r) => r.onclick = () => form(S.admin.faq.find((f) => f.id === Number(r.dataset.id))));
}
function admSettings(box) {
  const st = S.admin.settings;
  const shop = st.shop || {}, d = st.delivery || {}, c = st.coins || {}, b = st.banner || {}, th = st.theme || {}, inf = st.info || {};
  const lv = Array.isArray(c.levels) && c.levels.length ? c.levels : [{ name: 'Bronza', pct: 1, from: 0 }];
  const f = (id, label, val, type = 'text') => `<div class="field"><label>${label}</label><input id="${id}" type="${type}" value="${e(val ?? '')}"></div>`;
  const ta = (id, label, val) => `<div class="field"><label>${label}</label><textarea id="${id}" rows="3">${e(val ?? '')}</textarea></div>`;
  const h = (t) => `<div class="label">${t}</div>`;
  box.innerHTML = `${h('Do\'kon')}${f('s_name', 'Nomi', shop.name)}${f('s_phone', 'Telefon', shop.phone)}${f('s_hours', 'Ish vaqti', shop.work_hours)}
    ${h('Ko\'rinish')}<div class="field"><label>Brend rangi (ball, belgilar)</label><input id="s_accent" type="color" value="${e(th.accent || '#16a34a')}" style="padding:4px"></div>
    ${f('s_bi', 'Promo kartalar aylanish oralig\'i, ms (1000 = 1 soniya)', b.interval_ms ?? 3000, 'number')}
    ${h('Yetkazib berish')}${f('s_fee', 'Narxi, so\'m', d.fee ?? 0, 'number')}${f('s_free', 'Shu summadan bepul (0 = yo\'q)', d.free_from ?? 0, 'number')}${f('s_min', 'Minimal buyurtma, so\'m', d.min_order ?? 0, 'number')}
    ${h('Ball tizimi — darajalar')}<div class="pad"><div class="lvl-edit muted" style="font-size:12px"><span>Nomi</span><span>% ball</span><span>Shu summadan, so'm</span></div>
      <div id="lvls">${lv.map((l) => `<div class="lvl-edit"><input value="${e(l.name)}"><input type="number" step="0.1" value="${l.pct}"><input type="number" value="${l.from}"></div>`).join('')}</div>
      <button class="btn ghost sm" id="addLvl" style="margin-bottom:12px">${ic('plus')}Daraja qo'shish</button></div>
    ${f('s_bday', 'Tug\'ilgan kun sovg\'asi, ball', c.birthday_bonus ?? 0, 'number')}
    <div class="box"><div class="arow"><span class="tx">Ball tizimi yoqilgan</span><button class="switch ${c.enabled !== false ? 'on' : ''}" id="s_cen"></button></div></div>
    ${h('Ma\'lumot sahifalari')}${ta('i_about', 'Biz haqimizda', inf.about)}${ta('i_del', 'Yetkazib berish shartlari', inf.delivery)}${ta('i_ret', 'Qaytarish va almashtirish', inf.returns)}
    ${f('i_ig', 'Instagram havola', inf.instagram)}${f('i_tg', 'Telegram kanal havola', inf.telegram)}
    <div class="pad"><button class="btn" id="s_save">${tr('save')}</button></div>`;
  $('#s_cen').onclick = (ev) => ev.currentTarget.classList.toggle('on');
  $('#addLvl').onclick = () => { const r = document.createElement('div'); r.className = 'lvl-edit'; r.innerHTML = '<input placeholder="Nomi"><input type="number" step="0.1" placeholder="%"><input type="number" placeholder="so\'m">'; $('#lvls').appendChild(r); };
  $('#s_save').onclick = async () => {
    const n = (id) => Number($(id).value) || 0; const val = (id) => $(id).value.trim();
    const levelsArr = $$('#lvls .lvl-edit').map((r) => { const [a, p, fr] = $$('input', r).map((x) => x.value.trim()); return { name: a, pct: Number(p) || 0, from: Number(fr) || 0 }; }).filter((l) => l.name).sort((x, y) => x.from - y.from);
    if (levelsArr.length) levelsArr[0].from = 0;
    try {
      S.admin.settings = await api('/api/admin/settings', { method: 'PATCH', body: {
        shop: { name: val('#s_name'), phone: val('#s_phone'), work_hours: val('#s_hours') },
        delivery: { fee: n('#s_fee'), free_from: n('#s_free'), min_order: n('#s_min') },
        coins: { enabled: $('#s_cen').classList.contains('on'), birthday_bonus: n('#s_bday'), levels: levelsArr },
        banner: { interval_ms: Math.max(1000, n('#s_bi')) },
        theme: { accent: val('#s_accent') },
        info: { about: val('#i_about'), delivery: val('#i_del'), returns: val('#i_ret'), instagram: val('#i_ig'), telegram: val('#i_tg') },
      } });
      toast(tr('saved'), 'success');
    } catch (err) { toast(err.message, 'error'); }
  };
}
function storyRow(x) {
  return `<div class="strow"><button type="button" class="stimg" data-stimg>${x.image ? `<img src="${e(x.image)}">` : ic('image-plus')}</button><input type="hidden" data-si value="${e(x.image || '')}">
    <div class="stf"><input data-st placeholder="Sarlavha" value="${e(x.title || '')}"><input data-sx placeholder="Matn" value="${e(x.text || '')}"></div><button type="button" class="trash muted" data-strm>${ic('x')}</button></div>`;
}
function admRecipes(box) {
  box.innerHTML = addBtn('addR', 'Retsept qo\'shish') + listRows(S.admin.recipes || [], (r) => `<button class="arow" data-id="${r.id}" style="${r.active ? '' : 'opacity:.4'}"><span class="thumb">${img(r.image, 'chef-hat')}</span><span class="tx">${e(r.title_uz)}<small>${(r.product_ids || []).length} ta mahsulot</small></span>${ic('pencil')}</button>`);
  const form = (r) => formSheet('recipes', r, [
    { k: 'image', t: 'image', label: 'Rasm' }, { k: 'title_uz', label: 'Nomi (o\'zbekcha)', req: true }, { k: 'title_ru', label: 'Nomi (ruscha)' },
    { k: 'body_uz', t: 'textarea', label: 'Tayyorlanishi (o\'zbekcha)' }, { k: 'body_ru', t: 'textarea', label: 'Tayyorlanishi (ruscha)' },
    { k: 'product_ids', t: 'products', label: 'Kerakli mahsulotlar' }, { k: 'sort', t: 'number', label: 'Tartib', def: 0 }, { k: 'active', t: 'switch', label: 'Ko\'rinadi', def: true },
  ]);
  $('#addR').onclick = () => form(null);
  box.querySelectorAll('[data-id]').forEach((b) => b.onclick = () => form(S.admin.recipes.find((r) => r.id === Number(b.dataset.id))));
}
function formSheet(entity, item, fields, transform) {
  const val = (f) => (item && item[f.k] !== undefined && item[f.k] !== null ? item[f.k] : f.def ?? '');
  const html = sheetHead(item ? tr('edit') : 'Yangi') + fields.map((f) => {
    const v = val(f);
    if (f.t === 'image') return `<div class="field"><label>${f.label}</label><button class="img-pick" data-img="${f.k}">${v ? `<img src="${e(v)}">` : ic('image-plus') + '&nbsp;Rasm tanlash'}</button><input type="hidden" data-k="${f.k}" value="${e(v)}"></div>`;
    if (f.t === 'select') return `<div class="field"><label>${f.label}</label><select data-k="${f.k}">${f.opts.map(([k, t]) => `<option value="${e(k)}" ${String(k) === String(v) ? 'selected' : ''}>${e(t)}</option>`).join('')}</select></div>`;
    if (f.t === 'switch') return `<div class="box" style="margin:0 0 10px"><div class="arow"><span class="tx">${f.label}</span><button class="switch ${v ? 'on' : ''}" data-sw="${f.k}"></button></div></div>`;
    if (f.t === 'textarea') return `<div class="field"><label>${f.label}</label><textarea data-k="${f.k}" rows="2">${e(v)}</textarea></div>`;
    if (f.t === 'stories') return `<div class="field"><label>${f.label}</label><div id="stList">${(Array.isArray(v) ? v : []).map(storyRow).join('')}</div>
      <button class="btn ghost sm" id="stAdd" type="button">${ic('plus')}Slayd qo'shish</button></div>`;
    if (f.t === 'products') return `<div class="field"><label>${f.label}</label><div class="pchk">${S.admin.products.filter((x) => x.active).map((x) => `<label><input type="checkbox" data-pid="${x.id}" ${(v || []).includes(x.id) ? 'checked' : ''}> ${e(x.name_uz)}</label>`).join('')}</div></div>`;
    if (f.t === 'color') return `<div class="field"><label>${f.label}</label><input data-k="${f.k}" type="color" value="${e(v || '#e11d2a')}" style="padding:4px"></div>`;
    if (f.t === 'icon') return `<div class="field"><label>${f.label}</label><input type="hidden" data-k="${f.k}" value="${e(v)}"><div class="chips">${ICONS.map((n) => `<button class="chip ${v === 'lucide:' + n ? 'on' : ''}" data-icon="lucide:${n}" style="font-size:19px;height:40px">${ic(n)}</button>`).join('')}</div></div>`;
    return `<div class="field"><label>${f.label}${f.req ? ' *' : ''}</label><input data-k="${f.k}" ${f.t === 'number' ? `type="number" inputmode="decimal" step="${f.step || '1'}"` : ''} value="${e(v)}"></div>`;
  }).join('') + `<button class="btn" id="fSave">${tr('save')}</button>${item ? `<button class="btn danger" id="fDel" style="margin-top:4px">${ic('trash-2')}${tr('remove')}</button>` : ''}`;
  openSheet(html, (root) => {
    root.querySelectorAll('[data-sw]').forEach((s) => s.onclick = () => s.classList.toggle('on'));
    const stAdd = $('#stAdd', root);
    const bindStories = () => {
      $$('[data-stimg]', root).forEach((b) => b.onclick = async () => {
        const f = await pickFile(); if (!f) return;
        b.innerHTML = '<div class="sk" style="width:100%;height:100%"></div>';
        try { const { url } = await api('/api/admin/upload', { method: 'POST', body: { image: await resizeImage(f, 1000, 0.85) } }); b.closest('.strow').querySelector('[data-si]').value = url; b.innerHTML = `<img src="${e(url)}">`; }
        catch (err) { toast(err.message, 'error'); b.innerHTML = ic('image-plus'); }
      });
      $$('[data-strm]', root).forEach((b) => b.onclick = () => b.closest('.strow').remove());
    };
    if (stAdd) { stAdd.onclick = () => { $('#stList', root).insertAdjacentHTML('beforeend', storyRow({})); bindStories(); }; bindStories(); }
    root.querySelectorAll('[data-icon]').forEach((b) => b.onclick = () => { root.querySelectorAll('[data-icon]').forEach((x) => x.classList.toggle('on', x === b)); b.closest('.field').querySelector('[data-k]').value = b.dataset.icon; });
    root.querySelectorAll('[data-img]').forEach((b) => b.onclick = async () => {
      const f = await pickFile(); if (!f) return;
      b.innerHTML = '<div class="sk" style="width:100%;height:100%"></div>';
      try {
        const { url } = await api('/api/admin/upload', { method: 'POST', body: { image: await resizeImage(f, 1200, 0.85) } });
        root.querySelector(`[data-k="${b.dataset.img}"]`).value = url; b.innerHTML = `<img src="${e(url)}">`;
      } catch (err) { toast(err.message, 'error'); b.innerHTML = ic('image-plus'); }
    });
    $('#fSave', root).onclick = async () => {
      let data = {};
      for (const f of fields) {
        if (f.t === 'switch') { data[f.k] = root.querySelector(`[data-sw="${f.k}"]`).classList.contains('on'); continue; }
        if (f.t === 'stories') { data[f.k] = $$('.strow', root).map((r) => ({ image: $('[data-si]', r).value || null, title: $('[data-st]', r).value.trim(), text: $('[data-sx]', r).value.trim() })).filter((x) => x.title || x.image); continue; }
        if (f.t === 'products') { data[f.k] = $$('[data-pid]:checked', root).map((x) => Number(x.dataset.pid)); continue; }
        let x = root.querySelector(`[data-k="${f.k}"]`).value.trim();
        if (f.req && !x) return toast(`${f.label} — to'ldiring`, 'error');
        if (f.t === 'number' || f.num) x = x === '' ? null : Number(x); else if (x === '') x = null;
        data[f.k] = x;
      }
      try {
        if (transform) data = transform(data);
        await api(`/api/admin/${entity}${item ? '/' + item.id : ''}`, { method: item ? 'PATCH' : 'POST', body: data });
        closeSheet(); toast(tr('saved'), 'success'); reloadAdmin();
      } catch (err) { toast(err.message, 'error'); }
    };
    const del = $('#fDel', root);
    if (del) del.onclick = async () => {
      if (!confirm('O\'chirilsinmi?')) return;
      try { await api(`/api/admin/${entity}/${item.id}`, { method: 'DELETE' }); closeSheet(); reloadAdmin(); } catch (err) { toast(err.message, 'error'); }
    };
  });
}

/* ---------------- AUTO-UPDATE ---------------- */
async function checkVersion() {
  if (window.__mockApi) return;
  try {
    const { version } = await (await fetch('/api/version', { cache: 'no-store' })).json();
    if (version && version !== window.APP_VERSION) {
      local.set('justUpdated', true);
      const u = new URL(location.href); u.searchParams.set('v', version); location.replace(u.toString());
    }
  } catch {}
}
setInterval(checkVersion, 30000);
document.addEventListener('visibilitychange', () => { if (!document.hidden) checkVersion(); });

/* ---------------- BOOT ---------------- */
function hideSplash() { const s = $('#splash'); if (s) { s.classList.add('out'); setTimeout(() => s.remove(), 500); } }
async function boot() {
  if (/[?&]demo=1/.test(location.search)) await loadScript('/demo.js?v=' + window.APP_VERSION).catch(() => {});
  try {
    tg.ready(); tg.expand(); tg.disableVerticalSwipes?.();
    if (!ADMIN_MODE && tg.isVersionAtLeast?.('8.0') && ['ios', 'android'].includes(tg.platform)) tg.requestFullscreen?.();
  } catch {}
  try { tg.onEvent('themeChanged', applyTheme); } catch {}
  applyTheme(); updateBadge();
  const t0 = Date.now();
  try {
    const hasAuth = window.__mockApi || tg?.initData;
    const [cat, me, cl] = await Promise.all([api('/api/catalog'), hasAuth ? api('/api/me').catch(() => null) : null, cloud.load(['cart', 'fav', 'list'])]);
    S.catalog = cat; S.me = me;
    if (cat.version && cat.version !== window.APP_VERSION && !window.__mockApi) checkVersion();
    try { if (cl.cart) S.cart = JSON.parse(cl.cart); if (cl.fav) S.fav = JSON.parse(cl.fav); if (cl.list) S.list = JSON.parse(cl.list); } catch {}
    if (me?.lang && me.lang !== S.lang) { S.lang = me.lang; local.set('lang', me.lang); }
    applyTheme(); updateBadge();
    await new Promise((r) => setTimeout(r, Math.max(0, 650 - (Date.now() - t0))));
    if (!ADMIN_MODE && !local.get('onb_done', false)) { render(); hideSplash(); await showOnboarding(); }
    else { render(); hideSplash(); }
    if (!ADMIN_MODE && me && !me.birthday && !local.get('intro_done', false)) go('intro');
    else if (!ADMIN_MODE && me) setTimeout(notifPrompt, 1200);
    if (me?.birthday_gift) setTimeout(() => toast(tr('bdayGift', me.birthday_gift), 'success'), 1500);
    if (local.get('justUpdated', false)) { local.set('justUpdated', false); toast('✨ ' + tr('updated')); }
  } catch (err) {
    hideSplash();
    $('#view').innerHTML = '<div class="top-space"></div>' + emptyState('cloud-off', tr('error'), err.message, '<button class="btn" style="max-width:220px;margin:auto" onclick="location.reload()">↻</button>');
  }
}
boot();
})();
