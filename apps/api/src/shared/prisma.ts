/**
 * Cliente Prisma compartido (singleton).
 * Reutiliza la instancia entre recargas en desarrollo para no agotar
 * conexiones. Carga variables de entorno desde apps/api/.env.
 */
import { PrismaClient } from "@prisma/client";
import { config as loadEnv } from "dotenv";

loadEnv();

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
};

export const prisma: PrismaClient =
  globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
