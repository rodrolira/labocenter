/**
 * Tests unitarios del RefreshUseCase con repositorios simulados (DIP).
 * Verifica la rotación y la detección de reuse sin tocar la base.
 */
import { describe, expect, it, vi } from "vitest";
import { type SessionRepository } from "../domain/session.repository";
import { type UserRepository } from "../domain/user.repository";
import { RefreshUseCase } from "./refresh.usecase";

function makeUser() {
  return {
    id: "u1",
    email: "a@b.cl",
    passwordHash: "x",
    firstName: "A",
    lastName: "B",
    isActive: true,
    role: "PATIENT" as const,
    permissions: [],
  };
}

function makeSessions(overrides: Partial<SessionRepository> = {}): SessionRepository {
  return {
    create: vi.fn(),
    findByTokenHash: vi.fn(),
    revoke: vi.fn(),
    revokeFamily: vi.fn(),
    revokeAllForUser: vi.fn(),
    ...overrides,
  };
}

function makeUsers(overrides: Partial<UserRepository> = {}): UserRepository {
  return {
    findByEmail: vi.fn(),
    findById: vi.fn().mockResolvedValue(makeUser()),
    create: vi.fn(),
    updateLastLogin: vi.fn(),
    updatePassword: vi.fn(),
    ...overrides,
  };
}

describe("RefreshUseCase", () => {
  it("rechaza si no hay token", async () => {
    const uc = new RefreshUseCase(makeUsers(), makeSessions());
    await expect(uc.execute(undefined, {})).rejects.toThrow();
  });

  it("detecta reuse y revoca la familia completa", async () => {
    const sessions = makeSessions({
      findByTokenHash: vi.fn().mockResolvedValue({
        id: "s1",
        userId: "u1",
        tokenHash: "h",
        family: "fam1",
        revokedAt: new Date(), // ya revocado → reuse
        expiresAt: new Date(Date.now() + 100000),
      }),
    });
    const uc = new RefreshUseCase(makeUsers(), sessions);
    await expect(uc.execute("raw", {})).rejects.toThrow();
    expect(sessions.revokeFamily).toHaveBeenCalledWith("fam1");
  });

  it("rota: revoca el token usado y emite uno nuevo en la misma familia", async () => {
    const sessions = makeSessions({
      findByTokenHash: vi.fn().mockResolvedValue({
        id: "s1",
        userId: "u1",
        tokenHash: "h",
        family: "fam1",
        revokedAt: null,
        expiresAt: new Date(Date.now() + 100000),
      }),
    });
    const uc = new RefreshUseCase(makeUsers(), sessions);
    const result = await uc.execute("raw", {});
    expect(sessions.revoke).toHaveBeenCalledWith("s1");
    expect(sessions.create).toHaveBeenCalledTimes(1);
    expect(result.accessToken).toBeTruthy();
    // La nueva sesión mantiene la familia original.
    const createMock = sessions.create as ReturnType<typeof vi.fn>;
    expect(createMock.mock.calls[0]?.[0]).toMatchObject({ family: "fam1" });
  });
});
