import { describe, expect, it } from "vitest";
import { SITE, whatsappLink } from "./site";

describe("whatsappLink", () => {
  it("genera un enlace wa.me bien formado (resuelve BP-1)", () => {
    const link = whatsappLink("hola");
    expect(link).toBe(`https://wa.me/${SITE.whatsapp}?text=hola`);
    // No debe contener corchetes como en el sitio actual.
    expect(link).not.toMatch(/[[\]]/);
  });

  it("codifica correctamente el mensaje por defecto", () => {
    expect(whatsappLink()).toContain("https://wa.me/56997716818?text=");
  });
});
