/**
 * Caso de uso: registro de paciente.
 * Crea un usuario con rol PATIENT. Lanza CONFLICT si el correo ya existe.
 */
import { type RegisterInput } from "@labocenter/contracts";
import { AppError } from "../../../shared/errors";
import { type PasswordHasher } from "../domain/services";
import {
  type AuthenticatedUser,
  type UserRepository,
} from "../domain/user.repository";

export class RegisterUseCase {
  constructor(
    private readonly users: UserRepository,
    private readonly hasher: PasswordHasher,
  ) {}

  async execute(input: RegisterInput): Promise<AuthenticatedUser> {
    const existing = await this.users.findByEmail(input.email);
    if (existing) {
      throw AppError.conflict("El correo ya está registrado");
    }
    const passwordHash = await this.hasher.hash(input.password);
    return this.users.create({
      email: input.email,
      passwordHash,
      firstName: input.firstName,
      lastName: input.lastName,
      phone: input.phone,
      rut: input.rut,
      roleName: "PATIENT",
    });
  }
}
