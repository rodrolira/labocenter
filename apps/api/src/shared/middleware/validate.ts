/**
 * Middleware de validación de entrada con Zod. Reemplaza `req.body` por los
 * datos ya parseados y transformados. Los errores se delegan al errorHandler.
 */
import { type NextFunction, type Request, type Response } from "express";
import { type ZodTypeAny } from "zod";

export function validateBody(schema: ZodTypeAny) {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      next(result.error);
      return;
    }
    req.body = result.data;
    next();
  };
}
