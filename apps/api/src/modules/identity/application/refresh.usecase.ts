/**
 * Caso de uso: rotación del refresh token con detección de reuse.
 * - Token desconocido → 401.
 * - Token ya revocado (reuse) → se revoca toda la familia → 401.
 * - Token válido → se revoca y se emite uno nuevo en la misma familia.
 */
import { AppError } from "../../../shared/errors";
import { hashToken } from "../../../shared/security/tokens";
import { type SessionRepository } from "../domain/session.repository";
import { type UserRepository } from "../domain/user.repository";
import { type AuthTokens, issueTokens } from "./issue-tokens";

export class RefreshUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
  ) {}

  async execute(
    rawToken: string | undefined,
    meta: { userAgent?: string; ip?: string },
  ): Promise<AuthTokens> {
    if (!rawToken) throw AppError.unauthorized();

    const session = await this.sessions.findByTokenHash(hashToken(rawToken));
    if (!session) throw AppError.unauthorized("Sesión inválida");

    // Reuse de un token ya rotado: posible robo → revocar la familia entera.
    if (session.revokedAt) {
      await this.sessions.revokeFamily(session.family);
      throw AppError.unauthorized("Sesión comprometida, vuelva a iniciar sesión");
    }

    if (session.expiresAt.getTime() < Date.now()) {
      await this.sessions.revoke(session.id);
      throw AppError.unauthorized("Sesión expirada");
    }

    const user = await this.users.findById(session.userId);
    if (!user || !user.isActive) throw AppError.unauthorized();

    // Rotación: invalida el token usado y emite uno nuevo en la misma familia.
    await this.sessions.revoke(session.id);
    return issueTokens(user, this.sessions, meta, session.family);
  }
}
