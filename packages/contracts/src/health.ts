/**
 * Contrato del endpoint de salud del sistema (GET /health).
 * Sirve como primer contrato compartido extremo a extremo en la Fase 0.
 */
import { z } from "zod";

export const healthStatusSchema = z.object({
  status: z.literal("ok"),
  service: z.string(),
  timestamp: z.string().datetime(),
  uptime: z.number().nonnegative(),
});

export type HealthStatus = z.infer<typeof healthStatusSchema>;
