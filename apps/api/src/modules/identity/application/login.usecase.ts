/**
 * Caso de uso: inicio de sesión.
 * Verifica credenciales con mensaje genérico (no revela si el correo existe),
 * bloquea cuentas inactivas y emite tokens.
 */
import { type LoginInput } from "@labocenter/contracts";
import { AppError } from "../../../shared/errors";
import { type SessionRepository } from "../domain/session.repository";
import { type PasswordHasher } from "../domain/services";
import { type UserRepository } from "../domain/user.repository";
import { type AuthTokens, issueTokens } from "./issue-tokens";

export class LoginUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly sessions: SessionRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(
    input: LoginInput,
    meta: { userAgent?: string; ip?: string },
  ): Promise<AuthTokens> {
    const invalid = () => AppError.unauthorized("Credenciales inválidas");

    const user = await this.users.findByEmail(input.email);
    if (!user) throw invalid();
    if (!user.isActive) throw AppError.forbidden("Cuenta deshabilitada");

    const ok = await this.hasher.verify(user.passwordHash, input.password);
    if (!ok) throw invalid();

    await this.users.updateLastLogin(user.id);
    return issueTokens(user, this.sessions, meta);
  }
}
