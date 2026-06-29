/**
 * Endpoints de salud del sistema, usados por Docker/Nginx y monitoreo.
 * La respuesta cumple el contrato `HealthStatus` de @labocenter/contracts.
 */
import { type HealthStatus } from "@labocenter/contracts";
import { Router } from "express";

export const healthRouter: Router = Router();

// GET /health — liveness: el proceso responde.
healthRouter.get("/health", (_req, res) => {
  const body: HealthStatus = {
    status: "ok",
    service: "api",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  };
  res.json(body);
});

// GET /ready — readiness: listo para recibir tráfico.
// En fases posteriores incluirá el chequeo de conexión a PostgreSQL.
healthRouter.get("/ready", (_req, res) => {
  res.json({ status: "ok" });
});
