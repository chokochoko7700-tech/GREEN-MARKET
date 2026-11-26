-- GREEN MARKET — Supabase sxemasi
-- Supabase → SQL Editor → New query → shu faylni to'liq joylab, RUN bosing.

create table if not exists users (
  id            bigint primary key,            -- Telegram user id
  tg_name       text,
  username      text,
  name          text,
  phone         text,
  lat           double precision,
  lng           double precision,
  address       text,
  lang          text not null default 'uz',
  theme         text not null default 'auto',  -- auto | light | dark
  avatar        text,
  coins         integer not null default 0,
  blocked       boolean not null default false,
  created_at    timestamptz not null default now()
);

create table if not exists categories (
  id        serial primary key,
  name_uz   text not null,
  name_ru   text,
  icon      text default 'solar:box-bold-duotone',
  sort      integer not null default 0,
  active    boolean not null default true
);

create table if not exists products (
  id           serial primary key,
  category_id  integer references categories(id) on delete set null,
  name_uz      text not null,
  name_ru      text,
  desc_uz      text,
  desc_ru      text,
  image        text,
  unit         text not null default 'dona' check (unit in ('kg','dona')),
  price        integer not null check (price >= 0),   -- 1 kg yoki 1 dona narxi
  old_price    integer,
  piece_kg     numeric(6,3),        -- kilolik mahsulot 1 donasining taxminiy og'irligi (masalan piyoz 0.2)
  min_kg       numeric(6,3) not null default 0.1,
  coin_price   integer,             -- coin evaziga berilsa: nechta coin
  in_stock     boolean not null default true,
  sort         integer not null default 0,
  active       boolean not null default true,
  created_at   timestamptz not null default now()
);

create table if not exists banners (
  id         serial primary key,
  image      text not null,
  title      text,
  subtitle   text,
  link_type  text not null default 'none' check (link_type in ('none','product','category')),
  link_id    integer,
  sort       integer not null default 0,
  active     boolean not null default true
);

create table if not exists faq (
  id     serial primary key,
  q_uz   text not null,
  a_uz   text not null,
  q_ru   text,
  a_ru   text,
  sort   integer not null default 0
);

create table if not exists orders (
  id            serial primary key,
  user_id       bigint not null references users(id),
  items         jsonb not null,
  subtotal      integer not null,
  delivery_fee  integer not null default 0,
  total         integer not null,
  coins_used    integer not null default 0,
  coins_earned  integer not null default 0,
  payment       text not null default 'cash',
  paid          boolean not null default false,
  status        text not null default 'new'
                check (status in ('new','accepted','delivering','done','cancelled')),
  name          text,
  phone         text,
  lat           double precision,
  lng           double precision,
  address       text,
  comment       text,
  admin_msg     jsonb,
  created_at    timestamptz not null default now()
);
create index if not exists orders_user_idx on orders(user_id, created_at desc);
create index if not exists orders_status_idx on orders(status, created_at desc);

create table if not exists support (
  id            serial primary key,
  user_id       bigint not null references users(id),
  text          text not null,
  admin_msg_id  bigint,
  created_at    timestamptz not null default now()
);
create index if not exists support_msg_idx on support(admin_msg_id);

create table if not exists settings (
  key    text primary key,
  value  jsonb not null
);

insert into settings(key, value) values
  ('shop',  '{"name":"Green Market","phone":"+998","work_hours":"08:00–23:00"}'),
  ('delivery', '{"fee":0,"free_from":0,"min_order":0}'),
  ('coins', '{"sum_per_coin":1000,"enabled":true}'),
  ('banner', '{"interval_ms":1000}')
on conflict (key) do nothing;

-- Coinlarni xavfsiz qo'shish/ayirish (minusga tushmaydi)
create or replace function add_coins(uid bigint, delta integer)
returns integer language plpgsql as $$
declare new_balance integer;
begin
  update users set coins = coins + delta
   where id = uid and coins + delta >= 0
   returning coins into new_balance;
  return new_balance; -- null => yetarli coin yo'q
end $$;

-- Xavfsizlik: RLS yoqiladi, siyosat yo'q => faqat server (service_role) kira oladi
alter table users      enable row level security;
alter table categories enable row level security;
alter table products   enable row level security;
alter table banners    enable row level security;
alter table faq        enable row level security;
alter table orders     enable row level security;
alter table support    enable row level security;
alter table settings   enable row level security;

-- Rasmlar uchun ochiq bucket
insert into storage.buckets (id, name, public)
values ('images', 'images', true)
on conflict (id) do nothing;

-- Boshlang'ich namunaviy ma'lumotlar (keyin admin paneldan o'zgartirasiz)
insert into categories (name_uz, name_ru, icon, sort)
select * from (values
  ('Meva-sabzavot', 'Фрукты и овощи', 'solar:leaf-bold-duotone', 1),
  ('Ichimliklar',   'Напитки',        'solar:bottle-bold-duotone', 2),
  ('Sut mahsulotlari','Молочные',     'solar:cup-hot-bold-duotone', 3),
  ('Shirinliklar',  'Сладости',       'solar:donut-bitten-bold-duotone', 4)
) v where not exists (select 1 from categories);

insert into products (category_id, name_uz, name_ru, unit, price, piece_kg, image, sort)
select * from (values
  (1, 'Piyoz',      'Лук',        'kg',   7000,  0.2,  null::text, 1),
  (1, 'Kartoshka',  'Картофель',  'kg',   6000,  0.2,  null, 2),
  (1, 'Olma',       'Яблоки',     'kg',  15000,  0.25, null, 3),
  (2, 'Coca-Cola 1.5 L', 'Coca-Cola 1.5 л', 'dona', 12000, null, null, 1),
  (2, 'Suv 1 L',    'Вода 1 л',   'dona',  3000, null, null, 2),
  (3, 'Sut 1 L',    'Молоко 1 л', 'dona', 11000, null, null, 1)
) v where not exists (select 1 from products);

insert into faq (q_uz, a_uz, q_ru, a_ru, sort)
select * from (values
  ('Yetkazib berish qancha vaqt oladi?', 'Odatda 30–60 daqiqa ichida yetkazamiz.', 'Сколько времени занимает доставка?', 'Обычно 30–60 минут.', 1),
  ('Kilolik mahsulot narxi qanday hisoblanadi?', 'Kilo, summa yoki dona bo''yicha tanlaysiz. Dona tanlansa, narx taxminiy — aniq summa tortilgandan keyin chiqadi.', 'Как считается весовой товар?', 'Выбираете по весу, сумме или штукам. При выборе штук цена примерная — точная после взвешивания.', 2),
  ('Coin nima?', 'Har bir xariddan coin yig''ilib boradi. Coinlarga Bonus bo''limidagi mahsulotlarni bepul olasiz.', 'Что такое коины?', 'С каждой покупки начисляются коины. На них можно получить товары из раздела Бонусы.', 3)
) v where not exists (select 1 from faq);

-- v2: ommabop mahsulotlar, rang va ma'lumot sahifalari
alter table products add column if not exists popular boolean not null default false;
insert into settings(key, value) values
  ('theme', '{"accent":"#16a34a"}'),
  ('info', '{"about":"","delivery":"","returns":"","instagram":"","telegram":""}')
on conflict (key) do nothing;
-- Yangi Supabase loyihalarida service_role'ga ruxsat
grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on function public.add_coins(bigint, integer) to service_role;
alter table categories add column if not exists image text;

-- v4: istoriyalar, kichik bo'limlar, retseptlar
alter table products add column if not exists sub text;
alter table banners add column if not exists stories jsonb not null default '[]';
alter table banners add column if not exists story_title text;
create table if not exists recipes (
  id serial primary key, title_uz text not null, title_ru text, image text, body_uz text, body_ru text,
  product_ids integer[] not null default '{}', sort integer not null default 0, active boolean not null default true
);
alter table recipes enable row level security;
grant select, insert, update, delete on recipes to service_role;
alter table banners alter column image drop not null;

-- v5: shtrix-kod
alter table products add column if not exists barcode text;
create index if not exists products_barcode_idx on products(barcode);
