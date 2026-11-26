const db = require('./db');
const tg = require('./tg');
const t = require('./texts');
const cfg = require('./config');
const orders = require('./orders');

const send = (chat_id, text, extra = {}) => tg.call('sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });

const openButton = (lang, hash = '') => ({
  inline_keyboard: [[{ text: t(lang).open, web_app: { url: cfg.webAppUrl(hash) } }]],
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
  const admin = cfg.isAdmin(from.id);

  // Admin support xabariga "Reply" qilsa — mijozga yuboriladi
  if (admin && msg.reply_to_message && msg.text) {
    const s = await db.one('support', `admin_msg_id=eq.${msg.reply_to_message.message_id}`);
    if (s) {
      const u = await db.one('users', `id=eq.${s.user_id}`);
      await send(s.user_id, t(u?.lang).supportReply(escapeHtml(msg.text)));
      return send(from.id, '✅ Javob yuborildi');
    }
  }

  if (msg.text && msg.text.startsWith('/start')) {
    if (user.lat == null) await send(from.id, tx.hello(escapeHtml(from.first_name || '')));
    return nextStep(user);
  }

  if (msg.text === '/admin' && admin) {
    return send(from.id, '🛠 Admin panel', { reply_markup: openButton(user.lang, '#admin') });
  }

  if (msg.location) {
    const upd = await db.update('users', `id=eq.${from.id}`, {
      lat: msg.location.latitude, lng: msg.location.longitude,
    });
    if (user.lat != null && user.phone) {
      return send(from.id, tx.locationSaved, { reply_markup: { remove_keyboard: true } });
    }
    return nextStep(upd);
  }

  if (msg.contact) {
    if (msg.contact.user_id !== from.id) return send(from.id, tx.notYourPhone);
    let phone = String(msg.contact.phone_number).replace(/[^\d]/g, '');
    phone = '+' + phone;
    const upd = await db.update('users', `id=eq.${from.id}`, { phone });
    await send(from.id, tx.thanks, { reply_markup: { remove_keyboard: true } });
    return nextStep(upd);
  }

  // Boshqa matn — yordam xizmatiga
  if (msg.text && !admin) {
    await forwardSupport(user, msg.text);
    return send(from.id, tx.supportSent);
  }
}

async function forwardSupport(user, text) {
  const clean = String(text).slice(0, 2000);
  for (const adminId of cfg.ADMIN_IDS) {
    const m = await send(adminId,
      `💬 <b>Yordam so'rovi</b>\n👤 ${escapeHtml(user.name || user.tg_name || '')} ${user.username ? '@' + user.username : ''}\n📞 ${user.phone || '—'}\n\n${escapeHtml(clean)}\n\n<i>Javob berish uchun shu xabarga Reply qiling.</i>`);
    await db.insert('support', { user_id: user.id, text: clean, admin_msg_id: m?.message_id || null });
  }
}

async function onCallback(cq) {
  const [kind, id, status] = String(cq.data || '').split(':');
  if (kind === 'st') {
    if (!cfg.isAdmin(cq.from.id)) return tg.call('answerCallbackQuery', { callback_query_id: cq.id, text: 'Ruxsat yo\'q' });
    try {
      await orders.setStatus(id, status);
      return tg.call('answerCallbackQuery', { callback_query_id: cq.id, text: 'Yangilandi' });
    } catch (e) {
      return tg.call('answerCallbackQuery', { callback_query_id: cq.id, text: e.message, show_alert: true });
    }
  }
  return tg.call('answerCallbackQuery', { callback_query_id: cq.id });
}

function escapeHtml(s) {
  return String(s).replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));
}

async function handleUpdate(u) {
  try {
    if (u.message) await onMessage(u.message);
    else if (u.callback_query) await onCallback(u.callback_query);
  } catch (e) {
    console.error('Bot xatosi:', e);
  }
}

// Server ishga tushganda: webhook + menyu tugmasi (har doim yangi versiya URL bilan)
async function setup() {
  if (!tg.TOKEN || cfg.PUBLIC_URL.includes('localhost')) {
    console.log('Bot sozlanmadi (BOT_TOKEN yoki PUBLIC_URL yo\'q)');
    return;
  }
  await tg.call('setWebhook', {
    url: `${cfg.PUBLIC_URL}/webhook/${cfg.WEBHOOK_SECRET}`,
    secret_token: cfg.WEBHOOK_SECRET,
    allowed_updates: ['message', 'callback_query'],
    drop_pending_updates: false,
  });
  await tg.call('setChatMenuButton', {
    menu_button: { type: 'web_app', text: '🛒 Do\'kon', web_app: { url: cfg.webAppUrl() } },
  });
  await tg.call('setMyCommands', { commands: [{ command: 'start', description: 'Boshlash / Начать' }] });
  console.log('Bot sozlandi, versiya', cfg.VERSION);
}

module.exports = { handleUpdate, setup, forwardSupport };
