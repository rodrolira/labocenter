/**
 * Errores de aplicación con código estable (contrato) y status HTTP.
 * Los casos de uso lanzan estos errores; el errorHandler los traduce a la
 * envoltura uniforme de la API (docs/06-api.md §2).
 */
import { type ErrorDetail, ErrorCode } from "@labocenter/contracts";

export class AppError extends Error {
  constructor(
    public readonly code: ErrorCode,
    public readonly statusCode: number,
    message: string,
    public readonly details?: ErrorDetail[],
  ) {
    super(message);
    this.name = "AppError";
  }

  static unauthorized(message = "No autenticado"): AppError {
    return new AppError(ErrorCode.UNAUTHENTICATED, 401, message);
  }

  static forbidden(message = "No autorizado"): AppError {
    return new AppError(ErrorCode.FORBIDDEN, 403, message);
  }

  static notFound(message = "Recurso no encontrado"): AppError {
    return new AppError(ErrorCode.NOT_FOUND, 404, message);
  }

  static conflict(message: string): AppError {
    return new AppError(ErrorCode.CONFLICT, 409, message);
  }

  static businessRule(message: string): AppError {
    return new AppError(ErrorCode.BUSINESS_RULE, 422, message);
  }

  static validation(message: string, details?: ErrorDetail[]): AppError {
    return new AppError(ErrorCode.VALIDATION_ERROR, 400, message, details);
  }
}
