/**
 * Caso de uso: obtener el usuario actual con su rol y permisos frescos.
 * Consulta la base (no se fía sólo del token) para reflejar cambios y estado.
 */
import { AppError } from "../../../shared/errors";
import {
  type AuthenticatedUser,
  type UserRepository,
} from "../domain/user.repository";

export class GetMeUseCase {
  constructor(private readonly users: UserRepository) {}

  async execute(userId: string): Promise<AuthenticatedUser> {
    const user = await this.users.findById(userId);
    if (!user || !user.isActive) throw AppError.unauthorized();
    return user;
  }
}
