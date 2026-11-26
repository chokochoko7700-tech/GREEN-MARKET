// Mijozlar boti
const db = require('./db');
const { shop: tg, admin: adminTg } = require('./tg');
const t = require('./texts');
const cfg = require('./config');

const send = (chat_id, text, extra = {}) => tg.call('sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });
const esc = (s) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

const openButton = (lang) => ({
  inline_keyboard: [[{ text: t(lang).open, web_app: { url: cfg.webAppUrl() } }]],
});

async function ensureUser(from) {
  let user = await db.one('users', `id=eq.${from.id}`);
  if (!user) {
    user = await db.insert('users', {
      id: from.id,
      tg_name: [from.first_name, from.last_name].filter(Boolean).join(' '),
      username: from.username || null,
      name: from.first_name || null,
      lang: (from.language_code || '').startsWith('ru') ? 'ru' : 'uz',
    });
  }
  return user;
}

async function nextStep(user) {
  const tx = t(user.lang);
  if (user.lat == null) {
    return send(user.id, tx.askLocation, {
      reply_markup: { keyboard: [[{ text: tx.btnLocation, request_location: true }]], resize_keyboard: true, one_time_keyboard: true },
    });
  }
  if (!user.phone) {
    return send(user.id, tx.askPhone, {
      reply_markup: { keyboard: [[{ text: tx.btnPhone, request_contact: true }]], resize_keyboard: true, one_time_keyboard: true },
    });
  }
  return send(user.id, tx.welcome, { reply_markup: openButton(user.lang) });
}

async function onMessage(msg) {
  const from = msg.from;
  if (!from || msg.chat.type !== 'private') return;
  const user = await ensureUser(from);
  const tx = t(user.lang);

  if (msg.text && msg.text.startsWith('/start')) {
    if (user.lat == null) await send(from.id, tx.hello(esc(from.first_name || '')));
    return nextStep(user);
  }

  if (msg.location) {
    const upd = await db.update('users', `id=eq.${from.id}`, { lat: msg.location.latitude, lng: msg.location.longitude });
    if (user.lat != null && user.phone) {
      return send(from.id, tx.locationSaved, { reply_markup: { remove_keyboard: true } });
    }
    return nextStep(upd);
  }

  if (msg.contact) {
    if (msg.contact.user_id !== from.id) return send(from.id, tx.notYourPhone);
    const phone = '+' + String(msg.contact.phone_number).replace(/[^\d]/g, '');
    const upd = await db.update('users', `id=eq.${from.id}`, { phone });
    await send(from.id, tx.thanks, { reply_markup: { remove_keyboard: true } });
    return nextStep(upd);
  }

  // Boshqa har qanday matn — yordam xizmatiga
  if (msg.text) {
    await forwardSupport(user, msg.text);
    return send(from.id, tx.supportSent);
  }
}

// Mijoz xabari admin botga boradi; admin "Reply" qilsa — mijozga shu bot orqali qaytadi
async function forwardSupport(user, text) {
  const clean = String(text).slice(0, 2000);
  for (const adminId of cfg.ADMIN_IDS) {
    const m = await adminTg.call('sendMessage', {
      chat_id: adminId, parse_mode: 'HTML',
      text: `💬 <b>Yordam so'rovi</b>\n👤 ${esc(user.name || user.tg_name || '')} ${user.username ? '@' + esc(user.username) : ''}\n📞 ${esc(user.phone || '—')}\n\n${esc(clean)}\n\n<i>Javob berish uchun shu xabarga Reply qiling.</i>`,
    });
    await db.insert('support', { user_id: user.id, text: clean, admin_msg_id: m?.message_id || null });
  }
}

async function handleUpdate(u) {
  try {
    if (u.message) await onMessage(u.message);
    else if (u.callback_query) await tg.call('answerCallbackQuery', { callback_query_id: u.callback_query.id });
  } catch (e) {
    console.error('Bot xatosi:', e);
  }
}

async function setup() {
  if (!tg.token || cfg.PUBLIC_URL.includes('localhost')) return console.log('Mijoz boti sozlanmadi');
  await tg.call('setWebhook', {
    url: `${cfg.PUBLIC_URL}/webhook/${cfg.WEBHOOK_SECRET}`,
    secret_token: cfg.WEBHOOK_SECRET,
    allowed_updates: ['message', 'callback_query'],
  });
  await tg.call('setChatMenuButton', {
    menu_button: { type: 'web_app', text: '🛒 Do\'kon', web_app: { url: cfg.webAppUrl() } },
  });
  await tg.call('setMyCommands', { commands: [{ command: 'start', description: 'Boshlash / Начать' }] });
  console.log('Mijoz boti sozlandi, versiya', cfg.VERSION);
}

module.exports = { handleUpdate, setup, forwardSupport };
