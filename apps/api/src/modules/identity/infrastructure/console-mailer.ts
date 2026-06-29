/**
 * Mailer de desarrollo: registra el correo en el log en vez de enviarlo.
 * En la Fase 7 se reemplaza por un transporte SMTP real sin tocar los casos
 * de uso (gracias a la interfaz Mailer).
 */
import { logger } from "../../../shared/logger";
import { type Mailer } from "../domain/services";

export class ConsoleMailer implements Mailer {
  async send(message: { to: string; subject: string; body: string }): Promise<void> {
    logger.info({ mail: message }, "📧 [DEV] Correo simulado");
  }
}
