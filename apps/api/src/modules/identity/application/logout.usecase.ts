/**
 * Caso de uso: cierre de sesión. Revoca la sesión asociada al refresh token.
 */
import { hashToken } from "../../../shared/security/tokens";
import { type SessionRepository } from "../domain/session.repository";

export class LogoutUseCase {
  constructor(private readonly sessions: SessionRepository) {}

  async execute(rawToken: string | undefined): Promise<void> {
    if (!rawToken) return;
    const session = await this.sessions.findByTokenHash(hashToken(rawToken));
    if (session && !session.revokedAt) {
      await this.sessions.revoke(session.id);
    }
  }
}
