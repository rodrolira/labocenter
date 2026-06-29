/**
 * Puertos de servicios de infraestructura usados por los casos de uso.
 * Definirlos como interfaces permite testear la aplicación con dobles (DIP).
 */

/** Hashing y verificación de contraseñas. */
export interface PasswordHasher {
  hash(plain: string): Promise<string>;
  verify(hash: string, plain: string): Promise<boolean>;
}

/** Envío de correos (implementación real en Fase 7). */
export interface Mailer {
  send(message: {
    to: string;
    subject: string;
    body: string;
  }): Promise<void>;
}
