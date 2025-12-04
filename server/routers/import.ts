import { z } from "zod";
import { publicProcedure, router } from "../_core/trpc";
import { getDb } from "../db";
import { hourlyAccesses } from "../../drizzle/schema";
import { sql } from "drizzle-orm";

/**
 * Router para importação de dados do Pinmap
 */
export const importRouter = router({
  /**
   * Importa dados do arquivo eclub_db.dailyaccesses.json
   * Processa cada acesso e agrupa por dia + hora + minuto (intervalos de 30min)
   */
  importPinmapData: publicProcedure
    .input(
      z.object({
        data: z.array(
          z.object({
            _id: z.object({
              $oid: z.string(),
            }),
            userId: z.string(),
            sequenceNumber: z.number(),
            accessDay: z.object({
              $date: z.string(),
            }),
            createdAt: z.object({
              $date: z.string(),
            }),
            updatedAt: z.object({
              $date: z.string(),
            }),
            __v: z.number(),
          })
        ),
      })
    )
    .mutation(async ({ input }) => {
      const db = await getDb();
      if (!db) {
        throw new Error("Database not available");
      }

      try {
        // Limpar dados existentes
        await db.delete(hourlyAccesses);

        // Processar dados do Pinmap
        const accessMap = new Map<string, number>();

        for (const record of input.data) {
          // Converter data UTC para GMT-3 (Brasil)
          const accessDate = new Date(record.accessDay.$date);
          
          // Ajustar para GMT-3
          accessDate.setHours(accessDate.getHours() - 3);

          const year = accessDate.getFullYear();
          const month = accessDate.getMonth() + 1;
          const day = accessDate.getDate();
          const hour = accessDate.getHours();
          const minute = accessDate.getMinutes();

          // Arredondar para intervalo de 30 minutos
          const roundedMinute = minute < 30 ? 0 : 30;

          // Criar chave única para dia + hora + minuto
          const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}_${hour}_${roundedMinute}`;

          // Incrementar contador
          accessMap.set(key, (accessMap.get(key) || 0) + 1);
        }

        // Inserir dados processados no banco
        const records = [];
        for (const [key, count] of Array.from(accessMap.entries())) {
          const [dateStr, hourStr, minuteStr] = key.split("_");
          const accessDate = new Date(dateStr);
          const dayOfWeek = accessDate.getDay();
          
          records.push({
            accessDate,
            hour: parseInt(hourStr),
            minute: parseInt(minuteStr),
            dayOfWeek,
            accessCount: count,
          });
        }

        if (records.length > 0) {
          await db.insert(hourlyAccesses).values(records);
        }

        return {
          success: true,
          message: `Importados ${input.data.length} registros, processados ${records.length} intervalos únicos`,
          totalRecords: input.data.length,
          processedIntervals: records.length,
        };
      } catch (error) {
        console.error("[Import] Error processing Pinmap data:", error);
        throw new Error(`Failed to import data: ${error}`);
      }
    }),

  /**
   * Retorna estatísticas dos dados importados
   */
  getImportStats: publicProcedure.query(async () => {
    const db = await getDb();
    if (!db) {
      return {
        totalRecords: 0,
        dateRange: null,
        lastImport: null,
      };
    }

    try {
      const result = await db
        .select({
          count: sql<number>`COUNT(*)`,
          minDate: sql<string>`MIN(accessDate)`,
          maxDate: sql<string>`MAX(accessDate)`,
        })
        .from(hourlyAccesses);

      return {
        totalRecords: result[0]?.count || 0,
        dateRange: {
          start: result[0]?.minDate || null,
          end: result[0]?.maxDate || null,
        },
        lastImport: new Date().toISOString(),
      };
    } catch (error) {
      console.error("[Import] Error getting stats:", error);
      return {
        totalRecords: 0,
        dateRange: null,
        lastImport: null,
      };
    }
  }),
});
