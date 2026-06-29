/**
 * Ensamblado de la aplicación Express (sin escuchar puerto).
 * Separar `app` de `server` permite testear con supertest sin abrir sockets.
 */
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type Express } from "express";
import helmet from "helmet";
import { pinoHttp } from "pino-http";
import { authRouter } from "./modules/identity/interface/auth.router";
import { healthRouter } from "./modules/health/health.router";
import { config } from "./shared/config";
import { errorHandler, notFoundHandler } from "./shared/error-handler";
import { logger } from "./shared/logger";

export function createApp(): Express {
  const app = express();

  // Seguridad y middlewares base (ver docs/06-api.md §6).
  app.use(helmet());
  app.use(cors({ origin: config.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(pinoHttp({ logger }));

  // Healthchecks a nivel raíz (para orquestadores).
  app.use("/", healthRouter);

  // API versionada: routers de cada bounded context.
  const v1 = express.Router();
  v1.use("/", healthRouter);
  v1.use("/auth", authRouter);
  app.use("/api/v1", v1);

  // 404 + manejador de errores al final de la cadena.
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
