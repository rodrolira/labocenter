import { describe, expect, it } from "vitest";
import { computeDv, isValidRut, normalizeRut } from "./rut";

describe("RUT chileno", () => {
  it("normaliza quitando puntos y guion", () => {
    expect(normalizeRut("12.345.678-5")).toBe("12345678-5");
  });

  it("calcula el dígito verificador", () => {
    expect(computeDv("12345678")).toBe("5");
  });

  it("valida RUT correcto e incorrecto", () => {
    expect(isValidRut("12.345.678-5")).toBe(true);
    expect(isValidRut("12.345.678-9")).toBe(false);
    expect(isValidRut("no-rut")).toBe(false);
  });
});
