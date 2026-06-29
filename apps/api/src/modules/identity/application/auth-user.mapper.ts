/**
 * Convierte la vista de dominio AuthenticatedUser en el contrato público
 * AuthUser (sin hash de contraseña ni campos internos).
 */
import { type AuthUser } from "@labocenter/contracts";
import { type AuthenticatedUser } from "../domain/user.repository";

export function toAuthUser(user: AuthenticatedUser): AuthUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    permissions: user.permissions,
  };
}
