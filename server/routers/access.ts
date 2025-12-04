import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { hourlyAccesses } from "../../drizzle/schema";
import { and, gte, lte, sql } from "drizzle-orm";

export const accessRouter = router({
  getComparativeData: publicProcedure
    .input(z.object({ referenceDate: z.string().optional() }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados não disponível");

      const today = input.referenceDate ? new Date(input.referenceDate) : new Date();
      today.setHours(0, 0, 0, 0);
      
      const yesterday = new Date(today);
      yesterday.setDate(yesterday.getDate() - 1);
      
      const dayBeforeYesterday = new Date(today);
      dayBeforeYesterday.setDate(dayBeforeYesterday.getDate() - 2);

      const fetchDayData = async (date: Date) => {
        const data = await db
          .select({
            hour: hourlyAccesses.hour,
            minute: hourlyAccesses.minute,
            accessCount: sql<number>`SUM(${hourlyAccesses.accessCount})`,
          })
          .from(hourlyAccesses)
          .where(sql`DATE(${hourlyAccesses.accessDate}) = DATE(${date.toISOString().split('T')[0]})`)
          .groupBy(hourlyAccesses.hour, hourlyAccesses.minute)
          .orderBy(hourlyAccesses.hour, hourlyAccesses.minute);

        // 48 pontos: 24h x 2 (0min e 30min)
        const slots: Array<{ hour: number; minute: number; accessCount: number }> = [];
        for (let h = 0; h < 24; h++) {
          slots.push({ hour: h, minute: 0, accessCount: 0 });
          slots.push({ hour: h, minute: 30, accessCount: 0 });
        }
        data.forEach((r) => {
          const idx = r.hour * 2 + (r.minute === 30 ? 1 : 0);
          if (idx < 48) slots[idx] = { hour: r.hour, minute: r.minute, accessCount: Number(r.accessCount) };
        });
        return slots;
      };

      return {
        today: await fetchDayData(today),
        yesterday: await fetchDayData(yesterday),
        dayBeforeYesterday: await fetchDayData(dayBeforeYesterday),
      };
    }),

  getWeekdayAverage: publicProcedure
    .input(z.object({ weeks: z.number().default(4) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados não disponível");

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.weeks * 7);

      const results = await db
        .select({
          hour: hourlyAccesses.hour,
          minute: hourlyAccesses.minute,
          avgAccessCount: sql<number>`AVG(${hourlyAccesses.accessCount})`,
        })
        .from(hourlyAccesses)
        .where(
          and(
            gte(hourlyAccesses.accessDate, startDate),
            lte(hourlyAccesses.accessDate, endDate),
            sql`${hourlyAccesses.dayOfWeek} >= 1 AND ${hourlyAccesses.dayOfWeek} <= 5`
          )
        )
        .groupBy(hourlyAccesses.hour, hourlyAccesses.minute)
        .orderBy(hourlyAccesses.hour, hourlyAccesses.minute);

      const slots: Array<{ hour: number; minute: number; accessCount: number }> = [];
      for (let h = 0; h < 24; h++) {
        slots.push({ hour: h, minute: 0, accessCount: 0 });
        slots.push({ hour: h, minute: 30, accessCount: 0 });
      }
      results.forEach((r) => {
        const idx = r.hour * 2 + (r.minute === 30 ? 1 : 0);
        if (idx < 48) slots[idx] = { hour: r.hour, minute: r.minute, accessCount: Math.round(Number(r.avgAccessCount)) };
      });
      return slots;
    }),

  getAllDaysAverage: publicProcedure
    .input(z.object({ weeks: z.number().default(4) }))
    .query(async ({ input }) => {
      const db = await getDb();
      if (!db) throw new Error("Banco de dados não disponível");

      const endDate = new Date();
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - input.weeks * 7);

      const results = await db
        .select({
          hour: hourlyAccesses.hour,
          minute: hourlyAccesses.minute,
          avgAccessCount: sql<number>`AVG(${hourlyAccesses.accessCount})`,
        })
        .from(hourlyAccesses)
        .where(
          and(
            gte(hourlyAccesses.accessDate, startDate),
            lte(hourlyAccesses.accessDate, endDate)
          )
        )
        .groupBy(hourlyAccesses.hour, hourlyAccesses.minute)
        .orderBy(hourlyAccesses.hour, hourlyAccesses.minute);

      const slots: Array<{ hour: number; minute: number; accessCount: number }> = [];
      for (let h = 0; h < 24; h++) {
        slots.push({ hour: h, minute: 0, accessCount: 0 });
        slots.push({ hour: h, minute: 30, accessCount: 0 });
      }
      results.forEach((r) => {
        const idx = r.hour * 2 + (r.minute === 30 ? 1 : 0);
        if (idx < 48) slots[idx] = { hour: r.hour, minute: r.minute, accessCount: Math.round(Number(r.avgAccessCount)) };
      });
      return slots;
    }),
});
