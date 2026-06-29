/**
 * Test de integración del PrismaExamRepository contra PostgreSQL.
 * Requiere la base migrada y sembrada (`pnpm db:migrate && pnpm db:seed`).
 * Sólo lecturas: no muta datos.
 */
import { PrismaClient } from "@prisma/client";
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { PrismaExamRepository } from "./exam.repository.prisma";

const prisma = new PrismaClient();
const repo = new PrismaExamRepository(prisma);

beforeAll(async () => {
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

describe("PrismaExamRepository", () => {
  it("encuentra un examen sembrado por slug", async () => {
    const exam = await repo.findBySlug("perfil-lipidico");
    expect(exam).not.toBeNull();
    expect(exam?.requiresFasting).toBe(true);
  });

  it("busca exámenes por texto (resuelve UX-1)", async () => {
    const { items, total } = await repo.search({ query: "perfil" });
    expect(total).toBeGreaterThan(0);
    expect(items.every((e) => e.name.toLowerCase().includes("perfil"))).toBe(true);
  });

  it("filtra por requerimiento de ayuno", async () => {
    const { items } = await repo.search({ requiresFasting: true, pageSize: 100 });
    expect(items.length).toBeGreaterThan(0);
    expect(items.every((e) => e.requiresFasting)).toBe(true);
  });

  it("pagina los resultados", async () => {
    const firstPage = await repo.search({ page: 1, pageSize: 2 });
    expect(firstPage.items.length).toBeLessThanOrEqual(2);
  });
});
