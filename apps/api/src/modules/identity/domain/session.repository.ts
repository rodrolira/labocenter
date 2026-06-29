/**
 * Puerto del repositorio de sesiones (refresh tokens rotativos).
 * Sólo se persiste el hash del token; la rotación y la detección de reuse
 * se apoyan en `family` y `revokedAt` (docs/07-autenticacion.md §3).
 */
export interface SessionRecord {
  id: string;
  userId: string;
  tokenHash: string;
  family: string;
  revokedAt: Date | null;
  expiresAt: Date;
}

export interface CreateSessionInput {
  userId: string;
  tokenHash: string;
  family: string;
  expiresAt: Date;
  userAgent?: string;
  ip?: string;
}

export interface SessionRepository {
  create(input: CreateSessionInput): Promise<void>;
  findByTokenHash(tokenHash: string): Promise<SessionRecord | null>;
  revoke(id: string): Promise<void>;
  revokeFamily(family: string): Promise<void>;
  revokeAllForUser(userId: string): Promise<void>;
}
