/**
 * Implementación Prisma del ExamRepository (capa de infraestructura).
 * Traduce los criterios de dominio a consultas Prisma con paginación.
 */
import { type Prisma, type PrismaClient } from "@prisma/client";
import {
  type ExamRepository,
  type ExamSearchParams,
  type PaginatedExams,
} from "../domain/exam.repository";

export class PrismaExamRepository implements ExamRepository {
  constructor(private readonly db: PrismaClient) {}

  findBySlug(slug: string) {
    return this.db.exam.findUnique({ where: { slug } });
  }

  async search(params: ExamSearchParams): Promise<PaginatedExams> {
    const page = Math.max(1, params.page ?? 1);
    const pageSize = Math.min(100, Math.max(1, params.pageSize ?? 20));

    const where: Prisma.ExamWhereInput = {
      isActive: true,
      ...(params.query
        ? { name: { contains: params.query, mode: "insensitive" } }
        : {}),
      ...(params.categorySlug
        ? { category: { slug: params.categorySlug } }
        : {}),
      ...(params.requiresFasting !== undefined
        ? { requiresFasting: params.requiresFasting }
        : {}),
    };

    // Consulta de página y conteo total en una transacción de lectura.
    const [items, total] = await this.db.$transaction([
      this.db.exam.findMany({
        where,
        orderBy: { name: "asc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.db.exam.count({ where }),
    ]);

    return { items, total };
  }
}
