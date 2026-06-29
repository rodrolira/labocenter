import { expect, test } from "@playwright/test";

/**
 * E2E del flujo de autenticación (DoD Fase 2): login válido → portal,
 * credenciales inválidas → error. Usa el admin del seed.
 */
test("inicia sesión como admin y entra al portal", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill("admin@labocenter.cl");
  await page.getByLabel("Contraseña").fill("Admin1234!");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page).toHaveURL(/\/portal/);
  await expect(page.getByRole("heading", { name: /Hola,/ })).toBeVisible();
  await expect(page.getByText("ADMIN", { exact: true })).toBeVisible();
});

test("muestra error con credenciales inválidas", async ({ page }) => {
  await page.goto("/login");
  await page.getByLabel("Correo").fill("admin@labocenter.cl");
  await page.getByLabel("Contraseña").fill("contrasena-mala");
  await page.getByRole("button", { name: "Ingresar" }).click();

  await expect(page.getByRole("alert")).toBeVisible();
});

test("redirige al login al acceder al portal sin sesión", async ({ page }) => {
  await page.goto("/portal");
  await expect(page).toHaveURL(/\/login/);
});
