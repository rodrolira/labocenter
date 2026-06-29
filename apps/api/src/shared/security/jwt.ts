/**
 * Firma y verificación del access token (JWT, HS256) con `jose`.
 * El access token es de vida corta y porta el rol y permisos para autorizar
 * sin consultar la base en cada request (docs/07-autenticacion.md).
 */
import { type RoleName } from "@labocenter/contracts";
import { SignJWT, jwtVerify } from "jose";
import { config } from "../config";

const secret = new TextEncoder().encode(config.JWT_SECRET);

/** Identidad y permisos del solicitante, extraídos del token. */
export interface AuthContext {
  userId: string;
  role: RoleName;
  permissions: string[];
}

export async function signAccessToken(ctx: AuthContext): Promise<string> {
  return new SignJWT({ role: ctx.role, permissions: ctx.permissions })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(ctx.userId)
    .setIssuedAt()
    .setExpirationTime(config.JWT_ACCESS_TTL)
    .sign(secret);
}

export async function verifyAccessToken(token: string): Promise<AuthContext> {
  const { payload } = await jwtVerify(token, secret);
  return {
    userId: String(payload.sub),
    role: payload.role as RoleName,
    permissions: Array.isArray(payload.permissions)
      ? (payload.permissions as string[])
      : [],
  };
}
