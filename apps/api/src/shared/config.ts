/**
 * Configuración del backend validada con Zod.
 * Centraliza el acceso a variables de entorno y falla rápido (fail-fast)
 * si una variable obligatoria falta o es inválida.
 */
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  // En Fase 0 sólo hay variables con defaults; aun así validamos el patrón.
  console.error("Configuración inválida:", parsed.error.flatten().fieldErrors);
  throw new Error("Variables de entorno inválidas");
}

export const config = parsed.data;
export const isProduction = config.NODE_ENV === "production";
