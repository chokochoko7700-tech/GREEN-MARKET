// Narx hisob-kitobi (server tomonda — mijoz narxni o'zgartira olmaydi)
// Savat elementi: { id, mode: 'kg' | 'sum' | 'dona', value, reward?: true }

const round100 = (x) => Math.round(x / 100) * 100;
const round3 = (x) => Math.round(x * 1000) / 1000;

function priceLine(p, item) {
  const value = Number(item.value);
  if (!p || !p.active || !p.in_stock) throw new Error(`Mahsulot mavjud emas: ${p ? p.name_uz : item.id}`);
  if (!Number.isFinite(value) || value <= 0) throw new Error('Miqdor noto\'g\'ri');

  // Coin evaziga sovg'a
  if (item.reward) {
    if (!p.coin_price) throw new Error(`${p.name_uz} bonus emas`);
    const count = Math.floor(value);
    if (count < 1 || count > 20) throw new Error('Bonus soni noto\'g\'ri');
    return {
      id: p.id, name: p.name_uz, unit: p.unit, mode: 'dona', value: count,
      kg: p.unit === 'kg' ? count : null, total: 0, coins: p.coin_price * count,
      estimated: false, reward: true,
    };
  }

  const base = { id: p.id, name: p.name_uz, unit: p.unit, price: p.price, reward: false, coins: 0 };

  if (p.unit === 'dona') {
    const count = Math.floor(value);
    if (count < 1 || count > 999) throw new Error('Soni noto\'g\'ri');
    return { ...base, mode: 'dona', value: count, kg: null, total: p.price * count, estimated: false };
  }

  // Kilolik mahsulot
  const minKg = Number(p.min_kg || 0.1);
  if (item.mode === 'kg') {
    const kg = round3(value);
    if (kg < minKg || kg > 100) throw new Error(`Kamida ${minKg} kg`);
    return { ...base, mode: 'kg', value: kg, kg, total: round100(p.price * kg), estimated: false };
  }
  if (item.mode === 'sum') {
    const sum = Math.floor(value);
    const minSum = round100(p.price * minKg);
    if (sum < minSum || sum > 10_000_000) throw new Error(`Kamida ${minSum} so'm`);
    return { ...base, mode: 'sum', value: sum, kg: round3(sum / p.price), total: sum, estimated: false };
  }
  if (item.mode === 'dona') {
    if (!p.piece_kg) throw new Error(`${p.name_uz} dona bo'yicha sotilmaydi`);
    const count = Math.floor(value);
    if (count < 1 || count > 999) throw new Error('Soni noto\'g\'ri');
    const kg = round3(count * Number(p.piece_kg));
    return { ...base, mode: 'dona', value: count, kg, total: round100(p.price * kg), estimated: true };
  }
  throw new Error('Rejim noto\'g\'ri');
}

module.exports = { priceLine, round100 };
