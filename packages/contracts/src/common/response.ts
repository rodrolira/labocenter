/**
 * Envoltura uniforme de respuestas y errores de la API.
 * Implementa el contrato definido en docs/06-api.md, compartido por
 * backend (al construir respuestas) y frontend (al tiparlas/validarlas).
 */
import { z } from "zod";

/** Códigos de error internos estables que el frontend puede mapear a UX. */
export const ErrorCode = {
  VALIDATION_ERROR: "VALIDATION_ERROR",
  UNAUTHENTICATED: "UNAUTHENTICATED",
  FORBIDDEN: "FORBIDDEN",
  NOT_FOUND: "NOT_FOUND",
  CONFLICT: "CONFLICT",
  BUSINESS_RULE: "BUSINESS_RULE",
  RATE_LIMITED: "RATE_LIMITED",
  INTERNAL: "INTERNAL",
} as const;

export type ErrorCode = (typeof ErrorCode)[keyof typeof ErrorCode];

/** Detalle de error a nivel de campo (p. ej. fallos de validación Zod). */
export const errorDetailSchema = z.object({
  path: z.string(),
  message: z.string(),
});
export type ErrorDetail = z.infer<typeof errorDetailSchema>;

/** Cuerpo de error uniforme. */
export const apiErrorSchema = z.object({
  error: z.object({
    code: z.nativeEnum(ErrorCode),
    message: z.string(),
    details: z.array(errorDetailSchema).optional(),
    requestId: z.string().optional(),
  }),
});
export type ApiError = z.infer<typeof apiErrorSchema>;

/** Metadatos de paginación para respuestas de lista. */
export const paginationMetaSchema = z.object({
  page: z.number().int().positive(),
  pageSize: z.number().int().positive(),
  total: z.number().int().nonnegative(),
  totalPages: z.number().int().nonnegative(),
});
export type PaginationMeta = z.infer<typeof paginationMetaSchema>;

/**
 * Construye el esquema de una respuesta exitosa para un `data` dado.
 * Uso: `const schema = apiSuccessSchema(userSchema)`.
 */
export function apiSuccessSchema<T extends z.ZodTypeAny>(data: T) {
  return z.object({
    data,
    meta: paginationMetaSchema.partial().optional(),
  });
}
