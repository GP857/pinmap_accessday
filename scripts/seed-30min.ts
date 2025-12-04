import { getDb } from "../server/db";
import { hourlyAccesses } from "../drizzle/schema";

async function seed() {
  const db = await getDb();
  if (!db) {
    console.error("❌ Banco de dados não disponível");
    process.exit(1);
  }

  // Limpar dados antigos
  await db.delete(hourlyAccesses);
  console.log("✅ Dados antigos removidos");

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Gerar dados para os últimos 7 dias
  for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
    const currentDate = new Date(today);
    currentDate.setDate(currentDate.getDate() - dayOffset);
    const dayOfWeek = currentDate.getDay();

    // Para cada hora (0-23) e cada intervalo de 30min (0, 30)
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of [0, 30]) {
        // Padrão de acessos realista
        let base = 10;
        if (hour >= 6 && hour < 9) base = 50 + Math.random() * 30;
        else if (hour >= 9 && hour < 12) base = 80 + Math.random() * 50;
        else if (hour >= 12 && hour < 14) base = 60 + Math.random() * 40;
        else if (hour >= 14 && hour < 18) base = 100 + Math.random() * 80;
        else if (hour >= 18 && hour < 22) base = 70 + Math.random() * 50;
        else base = 5 + Math.random() * 15;

        // Meia hora tem ~85% dos acessos da hora cheia
        const count = Math.floor(minute === 30 ? base * 0.85 : base);

        // Para hoje, só gerar até hora atual
        if (dayOffset === 0) {
          const now = new Date();
          if (hour > now.getHours() || (hour === now.getHours() && minute > now.getMinutes())) {
            continue;
          }
        }

        await db.insert(hourlyAccesses).values({
          accessDate: currentDate,
          hour,
          minute,
          dayOfWeek,
          accessCount: count,
        });
      }
    }
    console.log(`✅ Dados gerados para ${currentDate.toISOString().split('T')[0]}`);
  }

  console.log("🎉 Concluído!");
  process.exit(0);
}

seed();
