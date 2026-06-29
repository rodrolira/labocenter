/**
 * Emite un par de tokens (access + refresh) y persiste la sesión.
 * Reutilizado por login y refresh; en refresh se conserva la `family`
 * para la detección de reuse (docs/07-autenticacion.md §3).
 */
import { config } from "../../../shared/config";
import { signAccessToken } from "../../../shared/security/jwt";
import {
  generateFamilyId,
  generateRefreshToken,
  hashToken,
} from "../../../shared/security/tokens";
import { type SessionRepository } from "../domain/session.repository";
import { type AuthenticatedUser } from "../domain/user.repository";

export interface AuthTokens {
  user: AuthenticatedUser;
  accessToken: string;
  refreshToken: string;
}

export async function issueTokens(
  user: AuthenticatedUser,
  sessions: SessionRepository,
  meta: { userAgent?: string; ip?: string },
  family?: string,
): Promise<AuthTokens> {
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + config.REFRESH_TTL_DAYS * 86_400_000);

  await sessions.create({
    userId: user.id,
    tokenHash: hashToken(refreshToken),
    family: family ?? generateFamilyId(),
    expiresAt,
    userAgent: meta.userAgent,
    ip: meta.ip,
  });

  const accessToken = await signAccessToken({
    userId: user.id,
    role: user.role,
    permissions: user.permissions,
  });

  return { user, accessToken, refreshToken };
}
