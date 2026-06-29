/**
 * Manejo centralizado de errores y rutas no encontradas.
 * Traduce AppError y ZodError a la envoltura uniforme de @labocenter/contracts
 * (docs/06-api.md). Cualquier otro error se reporta como 500 sin filtrar detalles.
 */
import { type ApiError, ErrorCode } from "@labocenter/contracts";
import { type NextFunction, type Request, type Response } from "express";
import { ZodError } from "zod";
import { AppError } from "./errors";
import { logger } from "./logger";

export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiError = {
    error: { code: ErrorCode.NOT_FOUND, message: "Recurso no encontrado" },
  };
  res.status(404).json(body);
}

export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  // Errores de validación de Zod → 400 con detalle por campo.
  if (err instanceof ZodError) {
    const body: ApiError = {
      error: {
        code: ErrorCode.VALIDATION_ERROR,
        message: "Datos inválidos",
        details: err.issues.map((i) => ({
          path: i.path.join("."),
          message: i.message,
        })),
      },
    };
    res.status(400).json(body);
    return;
  }

  // Errores de dominio controlados.
  if (err instanceof AppError) {
    const body: ApiError = {
      error: { code: err.code, message: err.message, details: err.details },
    };
    res.status(err.statusCode).json(body);
    return;
  }

  // No controlado: log completo, respuesta genérica.
  logger.error({ err }, "Error no controlado");
  const body: ApiError = {
    error: { code: ErrorCode.INTERNAL, message: "Error interno del servidor" },
  };
  res.status(500).json(body);
}
