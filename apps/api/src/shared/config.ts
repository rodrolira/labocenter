/**
 * Configuración del backend validada con Zod (fail-fast).
 * Centraliza variables de entorno: servidor, CORS, JWT y cookies.
 */
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  API_PORT: z.coerce.number().int().positive().default(3000),
  CORS_ORIGIN: z.string().default("http://localhost:5173"),

  // Autenticación (ver docs/07-autenticacion.md).
  JWT_SECRET: z
    .string()
    .min(16, "JWT_SECRET debe tener al menos 16 caracteres")
    .default("dev-secret-cambiar-en-produccion-min-16"),
  JWT_ACCESS_TTL: z.string().default("15m"),
  REFRESH_TTL_DAYS: z.coerce.number().int().positive().default(30),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error("Configuración inválida:", parsed.error.flatten().fieldErrors);
  throw new Error("Variables de entorno inválidas");
}

export const config = parsed.data;
export const isProduction = config.NODE_ENV === "production";

/** Nombre y opciones de la cookie del refresh token. */
export const REFRESH_COOKIE = "labocenter_rt";
export const refreshCookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: "strict" as const,
  path: "/api/v1/auth",
  maxAge: config.REFRESH_TTL_DAYS * 24 * 60 * 60 * 1000,
};
