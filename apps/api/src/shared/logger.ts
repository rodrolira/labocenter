/**
 * Logger estructurado (pino). En desarrollo usa salida legible (pino-pretty);
 * en producción emite JSON apto para agregadores de logs.
 */
import { pino } from "pino";
import { isProduction } from "./config";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? (isProduction ? "info" : "debug"),
  transport: isProduction
    ? undefined
    : { target: "pino-pretty", options: { colorize: true } },
});
