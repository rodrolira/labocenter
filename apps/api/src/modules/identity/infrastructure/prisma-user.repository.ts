/**
 * Implementación Prisma del UserRepository.
 * Mapea el usuario + rol + permisos a la vista de dominio AuthenticatedUser.
 */
import { type Prisma, type PrismaClient } from "@prisma/client";
import {
  type AuthenticatedUser,
  type CreateUserInput,
  type UserRepository,
} from "../domain/user.repository";

// Incluye rol y permisos para construir el contexto de autorización.
const userInclude = {
  role: { include: { permissions: { include: { permission: true } } } },
} satisfies Prisma.UserInclude;

type UserWithRole = Prisma.UserGetPayload<{ include: typeof userInclude }>;

function toDomain(user: UserWithRole): AuthenticatedUser {
  return {
    id: user.id,
    email: user.email,
    passwordHash: user.passwordHash,
    firstName: user.firstName,
    lastName: user.lastName,
    isActive: user.isActive,
    role: user.role.name,
    permissions: user.role.permissions.map((rp) => rp.permission.code),
  };
}

export class PrismaUserRepository implements UserRepository {
  constructor(private readonly db: PrismaClient) {}

  async findByEmail(email: string): Promise<AuthenticatedUser | null> {
    const user = await this.db.user.findUnique({
      where: { email },
      include: userInclude,
    });
    return user ? toDomain(user) : null;
  }

  async findById(id: string): Promise<AuthenticatedUser | null> {
    const user = await this.db.user.findUnique({
      where: { id },
      include: userInclude,
    });
    return user ? toDomain(user) : null;
  }

  async create(input: CreateUserInput): Promise<AuthenticatedUser> {
    const role = await this.db.role.findUniqueOrThrow({
      where: { name: input.roleName },
    });
    const user = await this.db.user.create({
      data: {
        email: input.email,
        passwordHash: input.passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        phone: input.phone,
        rut: input.rut,
        roleId: role.id,
      },
      include: userInclude,
    });
    return toDomain(user);
  }

  async updateLastLogin(id: string): Promise<void> {
    await this.db.user.update({
      where: { id },
      data: { lastLoginAt: new Date() },
    });
  }

  async updatePassword(id: string, passwordHash: string): Promise<void> {
    await this.db.user.update({ where: { id }, data: { passwordHash } });
  }
}
