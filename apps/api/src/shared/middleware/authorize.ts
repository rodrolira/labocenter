/**
 * Middleware de autorización RBAC. Exige un permiso concreto.
 * ADMIN pasa siempre. Las reglas de "propiedad" (acceso a lo propio) se
 * verifican además en el caso de uso, no aquí (docs/08-permisos.md §5).
 */
import { type PermissionCode } from "@labocenter/contracts";
import { type NextFunction, type Request, type Response } from "express";
import { AppError } from "../errors";

export function requirePermission(code: PermissionCode) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    if (!req.auth) {
      next(AppError.unauthorized());
      return;
    }
    if (req.auth.role === "ADMIN" || req.auth.permissions.includes(code)) {
      next();
      return;
    }
    next(AppError.forbidden(`Falta el permiso: ${code}`));
  };
}
