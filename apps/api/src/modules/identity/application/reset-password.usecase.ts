/**
 * Caso de uso: restablecer contraseña con un token válido.
 * Marca el token como usado y revoca todas las sesiones del usuario.
 */
import { type ResetPasswordInput } from "@labocenter/contracts";
import { AppError } from "../../../shared/errors";
import { hashToken } from "../../../shared/security/tokens";
import { type PasswordResetRepository } from "../domain/password-reset.repository";
import { type SessionRepository } from "../domain/session.repository";
import { type PasswordHasher } from "../domain/services";
import { type UserRepository } from "../domain/user.repository";

export class ResetPasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly resets: PasswordResetRepository,
    private readonly sessions: SessionRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: ResetPasswordInput): Promise<void> {
    const record = await this.resets.findByTokenHash(hashToken(input.token));
    if (!record || record.usedAt || record.expiresAt.getTime() < Date.now()) {
      throw AppError.businessRule("Token inválido o expirado");
    }

    const passwordHash = await this.hasher.hash(input.password);
    await this.users.updatePassword(record.userId, passwordHash);
    await this.resets.markUsed(record.id);
    // Seguridad: invalida todas las sesiones tras cambiar la contraseña.
    await this.sessions.revokeAllForUser(record.userId);
  }
}
