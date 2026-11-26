const db = require('./db');
const { shop: tg, admin: adminTg } = require('./tg');
const t = require('./texts');
const cfg = require('./config');
const { priceLine } = require('./pricing');

const fmt = (n) => Number(n || 0).toLocaleString('ru-RU').replace(/,/g, ' ');
const esc = (s) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

async function getSetting(key, def) {
  const row = await db.one('settings', `key=eq.${db.enc(key)}`);
  return row ? row.value : def;
}

function lineLabel(l) {
  if (l.reward) return `${l.value} × (🎁 ${l.coins} coin)`;
  if (l.unit === 'dona') return `${l.value} dona`;
  if (l.mode === 'kg') return `${l.kg} kg`;
  if (l.mode === 'sum') return `${fmt(l.value)} so'mlik (~${l.kg} kg)`;
  return `${l.value} dona (~${l.kg} kg, taxminiy)`;
}

const STATUS_UZ = {
  new: '🆕 Yangi', accepted: '✅ Qabul qilindi', delivering: '🚚 Yo\'lda',
  done: '✔️ Yetkazildi', cancelled: '❌ Bekor qilindi',
};

function adminText(o) {
  const lines = o.items.map((l, i) => `${i + 1}. ${esc(l.name)} — ${lineLabel(l)} = <b>${fmt(l.total)}</b>`).join('\n');
  const hasEst = o.items.some((l) => l.estimated);
  return [
    `🧾 <b>Buyurtma #${o.id}</b> — ${STATUS_UZ[o.status]}`,
    '',
    lines,
    '',
    `Mahsulotlar: ${fmt(o.subtotal)} so'm`,
    o.delivery_fee ? `Yetkazish: ${fmt(o.delivery_fee)} so'm` : null,
    o.coins_used ? `Coin bilan: −${o.coins_used} 🪙` : null,
    `<b>Jami: ${fmt(o.total)} so'm</b>${hasEst ? ' (taxminiy, tortilgandan keyin aniqlanadi)' : ''}`,
    `To'lov: ${o.payment === 'cash' ? 'Naqd / kuryerga karta' : o.payment}`,
    '',
    `👤 ${esc(o.name)}  <a href="tg://user?id=${o.user_id}">profil</a>`,
    `📞 ${esc(o.phone)}`,
    o.address ? `🏠 ${esc(o.address)}` : null,
    o.comment ? `💬 ${esc(o.comment)}` : null,
  ].filter((x) => x !== null).join('\n');
}

function adminButtons(o) {
  const b = (text, st) => ({ text, callback_data: `st:${o.id}:${st}` });
  const rows = {
    new: [[b('✅ Qabul qilish', 'accepted'), b('❌ Bekor', 'cancelled')]],
    accepted: [[b('🚚 Yo\'lga chiqdi', 'delivering')], [b('✔️ Yetkazildi', 'done'), b('❌ Bekor', 'cancelled')]],
    delivering: [[b('✔️ Yetkazildi', 'done'), b('❌ Bekor', 'cancelled')]],
  }[o.status];
  return rows ? { inline_keyboard: rows } : { inline_keyboard: [] };
}

async function create(user, body) {
  const items = Array.isArray(body.items) ? body.items.slice(0, 60) : [];
  if (!items.length) throw new Error('Savat bo\'sh');
  if (!user.phone) throw new Error('Telefon raqam kerak');

  const ids = [...new Set(items.map((i) => Number(i.id)).filter(Boolean))];
  const products = await db.select('products', `id=in.(${ids.join(',')})`);
  const byId = Object.fromEntries(products.map((p) => [p.id, p]));
  const lines = items.map((i) => priceLine(byId[Number(i.id)], i));

  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const coinsUsed = lines.reduce((s, l) => s + l.coins, 0);
  const delivery = await getSetting('delivery', { fee: 0, free_from: 0, min_order: 0 });
  const coinsCfg = await getSetting('coins', { sum_per_coin: 1000, enabled: true });

  if (subtotal > 0 && subtotal < (delivery.min_order || 0)) {
    throw new Error(`Minimal buyurtma: ${fmt(delivery.min_order)} so'm`);
  }
  if (subtotal === 0 && !coinsUsed) throw new Error('Savat bo\'sh');
  const fee = delivery.free_from && subtotal >= delivery.free_from ? 0 : Number(delivery.fee || 0);
  const total = subtotal + fee;
  const earned = coinsCfg.enabled && coinsCfg.sum_per_coin ? Math.floor(subtotal / coinsCfg.sum_per_coin) : 0;

  if (coinsUsed) {
    const left = await db.rpc('add_coins', { uid: user.id, delta: -coinsUsed });
    if (left === null) throw new Error('Coin yetarli emas');
  }

  const order = await db.insert('orders', {
    user_id: user.id,
    items: lines,
    subtotal,
    delivery_fee: fee,
    total,
    coins_used: coinsUsed,
    coins_earned: earned,
    payment: 'cash',
    name: String(body.name || user.name || user.tg_name || '').slice(0, 80),
    phone: String(body.phone || user.phone).slice(0, 20),
    lat: body.lat ?? user.lat,
    lng: body.lng ?? user.lng,
    address: String(body.address ?? user.address ?? '').slice(0, 200),
    comment: String(body.comment || '').slice(0, 300),
  });

  // Mijozga va adminlarga xabar
  tg.call('sendMessage', { chat_id: user.id, text: t(user.lang).orderPlaced(order.id), parse_mode: 'HTML' });
  const msgs = [];
  for (const adminId of cfg.ADMIN_IDS) {
    const m = await adminTg.call('sendMessage', {
      chat_id: adminId, text: adminText(order), parse_mode: 'HTML',
      reply_markup: adminButtons(order), link_preview_options: { is_disabled: true },
    });
    if (m) msgs.push({ chat_id: adminId, message_id: m.message_id });
    if (order.lat && order.lng) adminTg.call('sendLocation', { chat_id: adminId, latitude: order.lat, longitude: order.lng, reply_to_message_id: m?.message_id });
  }
  if (msgs.length) db.update('orders', `id=eq.${order.id}`, { admin_msg: msgs }).catch(console.error);
  return order;
}

const FLOW = {
  new: ['accepted', 'cancelled'],
  accepted: ['delivering', 'done', 'cancelled'],
  delivering: ['done', 'cancelled'],
};

async function setStatus(id, status) {
  const o = await db.one('orders', `id=eq.${Number(id)}`);
  if (!o) throw new Error('Buyurtma topilmadi');
  if (!(FLOW[o.status] || []).includes(status)) return o; // ruxsat yo'q yoki allaqachon
  const upd = await db.update('orders', `id=eq.${o.id}&status=eq.${o.status}`, { status });
  if (!upd) return o; // boshqa admin allaqachon o'zgartirgan

  const user = await db.one('users', `id=eq.${o.user_id}`);
  const tx = t(user?.lang);
  await tg.call('sendMessage', { chat_id: o.user_id, text: `🧾 #${o.id}: ${tx.status[status]}` });

  if (status === 'done' && o.coins_earned > 0) {
    await db.rpc('add_coins', { uid: o.user_id, delta: o.coins_earned });
    tg.call('sendMessage', { chat_id: o.user_id, text: tx.coinsEarned(o.coins_earned), parse_mode: 'HTML' });
  }
  if (status === 'cancelled' && o.coins_used > 0) {
    await db.rpc('add_coins', { uid: o.user_id, delta: o.coins_used });
  }

  for (const m of upd.admin_msg || []) {
    adminTg.call('editMessageText', {
      chat_id: m.chat_id, message_id: m.message_id, text: adminText(upd),
      parse_mode: 'HTML', reply_markup: adminButtons(upd), link_preview_options: { is_disabled: true },
    });
  }
  return upd;
}

module.exports = { create, setStatus, getSetting };
