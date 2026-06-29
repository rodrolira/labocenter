/**
 * Puerto del repositorio de usuarios (capa de dominio).
 * `AuthenticatedUser` es la vista de usuario que necesita la autenticación:
 * credenciales + rol + permisos efectivos.
 */
import { type RoleName } from "@labocenter/contracts";

export interface AuthenticatedUser {
  id: string;
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  isActive: boolean;
  role: RoleName;
  permissions: string[];
}

export interface CreateUserInput {
  email: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  phone?: string;
  rut?: string;
  roleName: RoleName;
}

export interface UserRepository {
  findByEmail(email: string): Promise<AuthenticatedUser | null>;
  findById(id: string): Promise<AuthenticatedUser | null>;
  create(input: CreateUserInput): Promise<AuthenticatedUser>;
  updateLastLogin(id: string): Promise<void>;
  updatePassword(id: string, passwordHash: string): Promise<void>;
}
