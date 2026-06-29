/**
 * Implementación de PasswordHasher con argon2id (@node-rs/argon2),
 * memory-hard y con binarios precompilados (sin paso de compilación).
 */
import { hash, verify } from "@node-rs/argon2";
import { type PasswordHasher } from "../domain/services";

export class ArgonPasswordService implements PasswordHasher {
  hash(plain: string): Promise<string> {
    return hash(plain);
  }

  async verify(hashed: string, plain: string): Promise<boolean> {
    try {
      return await verify(hashed, plain);
    } catch {
      // Hash corrupto o formato inválido → no coincide.
      return false;
    }
  }
}
