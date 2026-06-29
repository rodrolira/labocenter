/**
 * Test de integración del flujo de autenticación contra la base real.
 * Cubre el DoD de la Fase 2: register → login → me → refresh → reuse → logout.
 * Requiere DB migrada y sembrada (admin del seed).
 */
import request from "supertest";
import { afterAll, describe, expect, it } from "vitest";
import { createApp } from "../../../app";
import { REFRESH_COOKIE } from "../../../shared/config";
import { prisma } from "../../../shared/prisma";

const app = createApp();
const base = "/api/v1/auth";

// Correo único por ejecución para no chocar con datos previos.
const testEmail = `paciente_${Date.now()}@test.cl`;

/** Extrae el valor del refresh token de la cabecera Set-Cookie. */
function getRefreshCookie(res: request.Response): string | undefined {
  const raw = res.headers["set-cookie"] as unknown as string[] | undefined;
  const cookie = raw?.find((c) => c.startsWith(`${REFRESH_COOKIE}=`));
  return cookie?.split(";")[0]?.split("=")[1];
}

afterAll(async () => {
  // Limpia el usuario de prueba creado en el registro.
  await prisma.user.deleteMany({ where: { email: testEmail } });
  await prisma.$disconnect();
});

describe("Flujo de autenticación", () => {
  it("registra un paciente y devuelve tokens", async () => {
    const res = await request(app).post(`${base}/register`).send({
      email: testEmail,
      password: "Secreta123",
      firstName: "Pedro",
      lastName: "Pérez",
    });
    expect(res.status).toBe(201);
    expect(res.body.data.accessToken).toBeTruthy();
    expect(res.body.data.user.role).toBe("PATIENT");
    expect(getRefreshCookie(res)).toBeTruthy();
  });

  it("rechaza credenciales inválidas", async () => {
    const res = await request(app)
      .post(`${base}/login`)
      .send({ email: testEmail, password: "incorrecta" });
    expect(res.status).toBe(401);
  });

  it("inicia sesión como admin y /me devuelve rol y permisos", async () => {
    const login = await request(app)
      .post(`${base}/login`)
      .send({ email: "admin@labocenter.cl", password: "Admin1234!" });
    expect(login.status).toBe(200);
    const token = login.body.data.accessToken as string;

    const me = await request(app)
      .get(`${base}/me`)
      .set("Authorization", `Bearer ${token}`);
    expect(me.status).toBe(200);
    expect(me.body.data.user.role).toBe("ADMIN");
    expect(me.body.data.user.permissions).toContain("user:manage");
  });

  it("bloquea /me sin token", async () => {
    const res = await request(app).get(`${base}/me`);
    expect(res.status).toBe(401);
  });

  it("rota el refresh token y detecta reuse del antiguo", async () => {
    const login = await request(app)
      .post(`${base}/login`)
      .send({ email: "admin@labocenter.cl", password: "Admin1234!" });
    const oldCookie = getRefreshCookie(login);
    expect(oldCookie).toBeTruthy();

    // Rotación: el token antiguo se invalida y se emite uno nuevo.
    const refreshed = await request(app)
      .post(`${base}/refresh`)
      .set("Cookie", `${REFRESH_COOKIE}=${oldCookie}`);
    expect(refreshed.status).toBe(200);
    expect(refreshed.body.data.accessToken).toBeTruthy();
    const newCookie = getRefreshCookie(refreshed);
    expect(newCookie).not.toBe(oldCookie);

    // Reuse del token antiguo (ya rotado) → 401.
    const reuse = await request(app)
      .post(`${base}/refresh`)
      .set("Cookie", `${REFRESH_COOKIE}=${oldCookie}`);
    expect(reuse.status).toBe(401);

    // Por reuse se revoca la familia: el token nuevo también queda inválido.
    const afterReuse = await request(app)
      .post(`${base}/refresh`)
      .set("Cookie", `${REFRESH_COOKIE}=${newCookie}`);
    expect(afterReuse.status).toBe(401);
  });

  it("cierra sesión correctamente", async () => {
    const login = await request(app)
      .post(`${base}/login`)
      .send({ email: "admin@labocenter.cl", password: "Admin1234!" });
    const cookie = getRefreshCookie(login);
    const res = await request(app)
      .post(`${base}/logout`)
      .set("Cookie", `${REFRESH_COOKIE}=${cookie}`);
    expect(res.status).toBe(200);
  });
});
