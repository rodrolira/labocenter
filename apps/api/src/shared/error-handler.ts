/**
 * Manejo centralizado de errores y rutas no encontradas.
 * Traduce cualquier error a la envoltura uniforme de @labocenter/contracts
 * (ver docs/06-api.md). En fases siguientes mapeará errores de dominio.
 */
import { type ApiError, ErrorCode } from "@labocenter/contracts";
import { type NextFunction, type Request, type Response } from "express";
import { logger } from "./logger";

/** Middleware 404: ninguna ruta coincidió. */
export function notFoundHandler(_req: Request, res: Response): void {
  const body: ApiError = {
    error: { code: ErrorCode.NOT_FOUND, message: "Recurso no encontrado" },
  };
  res.status(404).json(body);
}

/** Middleware de error final. */
export function errorHandler(
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void {
  logger.error({ err }, "Error no controlado");
  const body: ApiError = {
    error: { code: ErrorCode.INTERNAL, message: "Error interno del servidor" },
  };
  res.status(500).json(body);
}
