import { describe, expect, it } from "vitest";
import { signAccessToken, verifyAccessToken } from "./jwt";

describe("access token (JWT)", () => {
  it("firma y verifica preservando el contexto", async () => {
    const token = await signAccessToken({
      userId: "u1",
      role: "ADMIN",
      permissions: ["user:manage"],
    });
    const ctx = await verifyAccessToken(token);
    expect(ctx.userId).toBe("u1");
    expect(ctx.role).toBe("ADMIN");
    expect(ctx.permissions).toContain("user:manage");
  });

  it("rechaza un token manipulado", async () => {
    await expect(verifyAccessToken("token.falso.xyz")).rejects.toThrow();
  });
});
