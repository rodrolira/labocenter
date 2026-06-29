/**
 * Implementación Prisma del SessionRepository (refresh tokens).
 */
import { type PrismaClient } from "@prisma/client";
import {
  type CreateSessionInput,
  type SessionRecord,
  type SessionRepository,
} from "../domain/session.repository";

export class PrismaSessionRepository implements SessionRepository {
  constructor(private readonly db: PrismaClient) {}

  async create(input: CreateSessionInput): Promise<void> {
    await this.db.session.create({ data: input });
  }

  async findByTokenHash(tokenHash: string): Promise<SessionRecord | null> {
    return this.db.session.findUnique({
      where: { tokenHash },
      select: {
        id: true,
        userId: true,
        tokenHash: true,
        family: true,
        revokedAt: true,
        expiresAt: true,
      },
    });
  }

  async revoke(id: string): Promise<void> {
    await this.db.session.update({
      where: { id },
      data: { revokedAt: new Date() },
    });
  }

  async revokeFamily(family: string): Promise<void> {
    await this.db.session.updateMany({
      where: { family, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }

  async revokeAllForUser(userId: string): Promise<void> {
    await this.db.session.updateMany({
      where: { userId, revokedAt: null },
      data: { revokedAt: new Date() },
    });
  }
}
