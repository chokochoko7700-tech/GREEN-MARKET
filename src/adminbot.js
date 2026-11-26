// Admin boti: buyurtmalar, yordam so'rovlariga javob, admin panel
const db = require('./db');
const tgs = require('./tg');
const t = require('./texts');
const cfg = require('./config');
const orders = require('./orders');

const tg = tgs.admin;
const send = (chat_id, text, extra = {}) => tg.call('sendMessage', { chat_id, text, parse_mode: 'HTML', ...extra });
const esc = (s) => String(s ?? '').replace(/[<>&]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]));

const panelButton = () => ({ inline_keyboard: [[{ text: '🛠 Admin panelni ochish', web_app: { url: cfg.adminAppUrl() } }]] });

async function onMessage(msg) {
  const from = msg.from;
  if (!from || msg.chat.type !== 'private') return;
  if (!cfg.isAdmin(from.id)) {
    return send(from.id, `⛔️ Bu bot faqat do'kon adminlari uchun.\nSizning ID: <code>${from.id}</code>`);
  }

  // Yordam xabariga Reply — mijozga do'kon boti orqali yuboriladi
  if (msg.reply_to_message && msg.text) {
    const s = await db.one('support', `admin_msg_id=eq.${msg.reply_to_message.message_id}`);
    if (s) {
      const u = await db.one('users', `id=eq.${s.user_id}`);
      const ok = await tgs.shop.call('sendMessage', {
        chat_id: s.user_id, parse_mode: 'HTML', text: t(u?.lang).supportReply(esc(msg.text)),
      });
      return send(from.id, ok ? '✅ Javob mijozga yuborildi' : '❌ Yuborilmadi (mijoz botni bloklagan bo\'lishi mumkin)');
    }
  }

  if (msg.text === '/stats') {
    const since = new Date(); since.setHours(0, 0, 0, 0);
    const today = await db.select('orders', `created_at=gte.${since.toISOString()}&status=neq.cancelled&select=total`);
    const fresh = await db.select('orders', 'status=eq.new&select=id');
    return send(from.id, `📊 <b>Bugun</b>\nBuyurtmalar: ${today.length}\nSumma: ${today.reduce((s, o) => s + o.total, 0).toLocaleString('ru-RU')} so'm\nYangi (kutilmoqda): ${fresh.length}`);
  }

  return send(from.id, '🛠 <b>Green Market — admin</b>\n\nYangi buyurtmalar shu yerga keladi. Mahsulot, banner, narx va sozlamalarni panel orqali boshqarasiz.\n\n/stats — bugungi statistika', { reply_markup: panelButton() });
}

async function onCallback(cq) {
  const [kind, id, status] = String(cq.data || '').split(':');
  if (kind !== 'st') return tg.call('answerCallbackQuery', { callback_query_id: cq.id });
  if (!cfg.isAdmin(cq.from.id)) return tg.call('answerCallbackQuery', { callback_query_id: cq.id, text: 'Ruxsat yo\'q' });
  try {
    await orders.setStatus(id, status);
    return tg.call('answerCallbackQuery', { callback_query_id: cq.id, text: 'Yangilandi' });
  } catch (e) {
    return tg.call('answerCallbackQuery', { callback_query_id: cq.id, text: e.message, show_alert: true });
  }
}

async function handleUpdate(u) {
  try {
    if (u.message) await onMessage(u.message);
    else if (u.callback_query) await onCallback(u.callback_query);
  } catch (e) {
    console.error('Admin bot xatosi:', e);
  }
}

async function setup() {
  if (!tgs.hasAdminBot || cfg.PUBLIC_URL.includes('localhost')) return console.log('Admin bot sozlanmadi');
  await tg.call('setWebhook', {
    url: `${cfg.PUBLIC_URL}/webhook-admin/${cfg.ADMIN_WEBHOOK_SECRET}`,
    secret_token: cfg.ADMIN_WEBHOOK_SECRET,
    allowed_updates: ['message', 'callback_query'],
  });
  await tg.call('setChatMenuButton', { menu_button: { type: 'web_app', text: '🛠 Panel', web_app: { url: cfg.adminAppUrl() } } });
  await tg.call('setMyCommands', { commands: [{ command: 'start', description: 'Admin panel' }, { command: 'stats', description: 'Bugungi statistika' }] });
  console.log('Admin bot sozlandi');
}

module.exports = { handleUpdate, setup };
