/**
 * Generación y hashing de refresh tokens.
 * El token en claro sólo viaja en la cookie httpOnly; en la base se guarda
 * únicamente su hash SHA-256 (docs/07-autenticacion.md §4).
 */
import { createHash, randomBytes } from "node:crypto";

/** Refresh token opaco de 256 bits (hex). */
export function generateRefreshToken(): string {
  return randomBytes(32).toString("hex");
}

/** Hash determinista del token para buscar/almacenar sin exponer el secreto. */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Identificador de familia de rotación (para detección de reuse). */
export function generateFamilyId(): string {
  return randomBytes(16).toString("hex");
}
