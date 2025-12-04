import { getDb } from '../server/db';
import { hourlyAccesses } from '../drizzle/schema';

async function main() {
  console.log('🚀 Gerando dados simulados...');
  const db = await getDb();
  if (!db) {
    console.error('❌ Banco não disponível');
    process.exit(1);
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dataToInsert = [];

  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - dayOffset);
    const dayOfWeek = currentDate.getDay();

    for (let hour = 0; hour < 24; hour++) {
      let baseAccess = 0;
      if (hour >= 8 && hour <= 11) baseAccess = Math.floor(Math.random() * 150) + 100;
      else if (hour >= 14 && hour <= 17) baseAccess = Math.floor(Math.random() * 200) + 150;
      else if (hour >= 19 && hour <= 22) baseAccess = Math.floor(Math.random() * 120) + 80;
      else if (hour >= 0 && hour <= 6) baseAccess = Math.floor(Math.random() * 20) + 5;
      else baseAccess = Math.floor(Math.random() * 80) + 40;

      if (dayOfWeek === 0 || dayOfWeek === 6) baseAccess = Math.floor(baseAccess * 0.6);
      if (dayOffset === 0) baseAccess = Math.floor(baseAccess * 1.15);

      dataToInsert.push({ accessDate: currentDate, hour, dayOfWeek, accessCount: baseAccess, userId: null });
    }
  }

  const batchSize = 100;
  for (let i = 0; i < dataToInsert.length; i += batchSize) {
    await db.insert(hourlyAccesses).values(dataToInsert.slice(i, i + batchSize));
  }

  console.log(`✅ ${dataToInsert.length} registros inseridos`);
  process.exit(0);
}

main().catch(console.error);
