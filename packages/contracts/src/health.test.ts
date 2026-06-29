import { describe, expect, it } from "vitest";
import { healthStatusSchema } from "./health";

describe("healthStatusSchema", () => {
  it("acepta un estado de salud válido", () => {
    const value = {
      status: "ok",
      service: "api",
      timestamp: new Date().toISOString(),
      uptime: 12.5,
    };
    expect(() => healthStatusSchema.parse(value)).not.toThrow();
  });

  it("rechaza un estado con status inválido", () => {
    const value = {
      status: "down",
      service: "api",
      timestamp: new Date().toISOString(),
      uptime: 1,
    };
    expect(healthStatusSchema.safeParse(value).success).toBe(false);
  });
});
