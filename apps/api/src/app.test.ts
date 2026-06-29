import { healthStatusSchema } from "@labocenter/contracts";
import request from "supertest";
import { describe, expect, it } from "vitest";
import { createApp } from "./app";

const app = createApp();

describe("GET /health", () => {
  it("responde 200 con un cuerpo que cumple el contrato HealthStatus", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(() => healthStatusSchema.parse(res.body)).not.toThrow();
  });

  it("expone también la ruta versionada /api/v1/health", async () => {
    const res = await request(app).get("/api/v1/health");
    expect(res.status).toBe(200);
    expect(res.body.service).toBe("api");
  });
});

describe("rutas inexistentes", () => {
  it("devuelve 404 con el formato de error uniforme", async () => {
    const res = await request(app).get("/no-existe");
    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("NOT_FOUND");
  });
});
