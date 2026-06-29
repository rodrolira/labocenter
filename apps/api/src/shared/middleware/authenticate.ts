/**
 * Middleware de autenticación: valida el access token (Bearer) y puebla
 * `req.auth`. No consulta la base: confía en la firma del JWT.
 */
import { type NextFunction, type Request, type Response } from "express";
import { AppError } from "../errors";
import { verifyAccessToken } from "../security/jwt";

export async function authenticate(
  req: Request,
  _res: Response,
  next: NextFunction,
): Promise<void> {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    next(AppError.unauthorized());
    return;
  }
  try {
    req.auth = await verifyAccessToken(header.slice(7));
    next();
  } catch {
    next(AppError.unauthorized("Token inválido o expirado"));
  }
}
