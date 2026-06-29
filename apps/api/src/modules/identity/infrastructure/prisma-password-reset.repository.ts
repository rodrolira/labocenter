/**
 * Implementación Prisma del PasswordResetRepository.
 */
import { type PrismaClient } from "@prisma/client";
import {
  type PasswordResetRecord,
  type PasswordResetRepository,
} from "../domain/password-reset.repository";

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: {
    userId: string;
    tokenHash: string;
    expiresAt: Date;
  }): Promise<void> {
    await this.db.passwordResetToken.create({ data: input });
  }

  async findByTokenHash(tokenHash: string): Promise<PasswordResetRecord | null> {
    return this.db.passwordResetToken.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        expiresAt: true,
        usedAt: true,
      },
    });
  }

  async markUsed(id: string): Promise<void> {
    await this.db.passwordResetToken.update({
      where: { id },
      data: { usedAt: new Date() },
    });
  }
}
