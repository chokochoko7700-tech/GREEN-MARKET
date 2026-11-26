# 🛒 Green Market — Telegram Mini App

Do'kon mahsulotlarini onlayn buyurtma qilish: Telegram bot + Mini App + admin panel.

## Imkoniyatlar
- **Bot:** /start → lokatsiya → telefon raqam → do'kon ochiladi. Yangi buyurtmalar adminga tugmalar bilan keladi (Qabul / Yo'lda / Yetkazildi / Bekor), mijozga holat xabari boradi.
- **Kilolik mahsulotlar:** kilo bo'yicha (0.5 kg, 1 kg…), summa bo'yicha (10 000 so'mlik) yoki dona bo'yicha (taxminiy narx).
- **Coin tizimi:** har N so'm xarid = 1 coin (yetkazilgandan keyin tushadi). Coinga sovg'a mahsulotlar.
- **Banner:** avtomatik aylanadi (tezligi admin sozlamalarida), bosilsa mahsulot yoki kategoriyaga o'tadi.
- **Profil:** rasm, ism, telefon, xaritadan manzil, til (uz/ru), mavzu (kunduzgi/tungi/auto), yordam + FAQ.
- **Admin panel** alohida admin botda (`/admin` sahifa, faqat ADMIN_IDS uchun): buyurtmalar, mahsulotlar, kategoriyalar, bannerlar, savollar, sozlamalar.
- **Avtomatik yangilanish:** yangi deploy chiqsa, mijozlarda ilova o'zi yangilanadi — /start shart emas.

## Texnologiya
Node.js (tashqi kutubxonasiz), Supabase (Postgres + Storage), Render, Solar ikonkalari (Iconify).

## Render environment o'zgaruvchilari
| Kalit | Qiymat |
|---|---|
| `BOT_TOKEN` | @BotFather tokeni |
| `ADMIN_BOT_TOKEN` | admin bot tokeni (buyurtmalar va admin panel shu botda) |
| `ADMIN_IDS` | admin Telegram ID (bir nechta bo'lsa vergul bilan) |
| `SUPABASE_URL` | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Supabase **secret** kaliti (`sb_secret_...`) |

Kalitlarni hech qachon kodga yoki GitHub'ga yozmang.

## Baza
`supabase/schema.sql` ni Supabase SQL Editor'da bir marta ishga tushiring.

## UptimeRobot
Monitor turi HTTP(s), manzil: `https://<servis>.onrender.com/health`, har 5 daqiqada. (Bepul Render uxlab qolmasligi uchun.)

## Dizaynni ko'rish (serversiz)
`/?demo=1` — namunaviy ma'lumotlar bilan.
