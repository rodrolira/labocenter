/**
 * Caso de uso: solicitud de recuperación de contraseña.
 * Genera un token de un solo uso (sólo se guarda su hash) y "envía" el correo.
 * No revela si el correo existe: el controlador siempre responde 200.
 */
import { config } from "../../../shared/config";
import {
  generateRefreshToken,
  hashToken,
} from "../../../shared/security/tokens";
import { type PasswordResetRepository } from "../domain/password-reset.repository";
import { type Mailer } from "../domain/services";
import { type UserRepository } from "../domain/user.repository";

const RESET_TTL_MS = 60 * 60 * 1000; // 1 hora

export class ForgotPasswordUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly resets: PasswordResetRepository,
    private readonly mailer: Mailer,
  ) {}

  async execute(email: string): Promise<void> {
    const user = await this.users.findByEmail(email);
    if (!user) return; // silencioso: no filtra existencia

    const rawToken = generateRefreshToken();
    await this.resets.create({
      userId: user.id,
      tokenHash: hashToken(rawToken),
      expiresAt: new Date(Date.now() + RESET_TTL_MS),
    });

    const link = `${config.CORS_ORIGIN}/restablecer/${rawToken}`;
    await this.mailer.send({
      to: email,
      subject: "Recuperación de contraseña - Labocenter",
      body: `Para restablecer tu contraseña visita: ${link}`,
    });
  }
}
