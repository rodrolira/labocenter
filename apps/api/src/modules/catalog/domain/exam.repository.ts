/**
 * Puerto (interfaz) del repositorio de exámenes — capa de dominio.
 * Define QUÉ operaciones existen, no CÓMO se implementan (DIP/SOLID).
 * La infraestructura (Prisma) provee la implementación concreta.
 */
import { type Exam } from "@prisma/client";

/** Criterios de búsqueda del catálogo (resuelve UX-1: buscador). */
export interface ExamSearchParams {
  /** Texto libre sobre el nombre del examen. */
  query?: string;
  /** Filtra por slug de categoría. */
  categorySlug?: string;
  /** Filtra por requerimiento de ayuno. */
  requiresFasting?: boolean;
  page?: number;
  pageSize?: number;
}

export interface PaginatedExams {
  items: Exam[];
  total: number;
}

export interface ExamRepository {
  findBySlug(slug: string): Promise<Exam | null>;
  search(params: ExamSearchParams): Promise<PaginatedExams>;
}
