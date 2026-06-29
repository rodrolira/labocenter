/**
 * Router de autenticación (/api/v1/auth) — composition root del módulo.
 * Conecta repositorios, servicios y casos de uso, y expone handlers delgados
 * que sólo traducen HTTP ↔ caso de uso (docs/06-api.md §4 Auth).
 */
import {
  forgotPasswordSchema,
  loginSchema,
  type LoginResponse,
  type MeResponse,
  registerSchema,
  resetPasswordSchema,
} from "@labocenter/contracts";
import { type Request, type Response, Router } from "express";
import { REFRESH_COOKIE, refreshCookieOptions } from "../../../shared/config";
import { authenticate } from "../../../shared/middleware/authenticate";
import { validateBody } from "../../../shared/middleware/validate";
import { prisma } from "../../../shared/prisma";
import { toAuthUser } from "../application/auth-user.mapper";
import { ForgotPasswordUseCase } from "../application/forgot-password.usecase";
import { GetMeUseCase } from "../application/get-me.usecase";
import { issueTokens, type AuthTokens } from "../application/issue-tokens";
import { LoginUseCase } from "../application/login.usecase";
import { LogoutUseCase } from "../application/logout.usecase";
import { RefreshUseCase } from "../application/refresh.usecase";
import { RegisterUseCase } from "../application/register.usecase";
import { ResetPasswordUseCase } from "../application/reset-password.usecase";
import { ArgonPasswordService } from "../infrastructure/argon-password.service";
import { ConsoleMailer } from "../infrastructure/console-mailer";
import { PrismaPasswordResetRepository } from "../infrastructure/prisma-password-reset.repository";
import { PrismaSessionRepository } from "../infrastructure/prisma-session.repository";
import { PrismaUserRepository } from "../infrastructure/prisma-user.repository";

// ── Composición de dependencias ──
const users = new PrismaUserRepository(prisma);
const sessions = new PrismaSessionRepository(prisma);
const resets = new PrismaPasswordResetRepository(prisma);
const hasher = new ArgonPasswordService();
const mailer = new ConsoleMailer();

const registerUC = new RegisterUseCase(users, hasher);
const loginUC = new LoginUseCase(users, sessions, hasher);
const refreshUC = new RefreshUseCase(users, sessions);
const logoutUC = new LogoutUseCase(sessions);
const meUC = new GetMeUseCase(users);
const forgotUC = new ForgotPasswordUseCase(users, resets, mailer);
const resetUC = new ResetPasswordUseCase(users, resets, sessions, hasher);

/** Metadatos de la request usados para auditar la sesión. */
function requestMeta(req: Request) {
  return { userAgent: req.headers["user-agent"], ip: req.ip };
}

/** Fija la cookie httpOnly del refresh token y arma la respuesta de auth. */
function buildAuthResponse(res: Response, tokens: AuthTokens): LoginResponse {
  res.cookie(REFRESH_COOKIE, tokens.refreshToken, refreshCookieOptions);
  return { accessToken: tokens.accessToken, user: toAuthUser(tokens.user) };
}

export const authRouter: Router = Router();

// Registro de paciente: crea la cuenta e inicia sesión de inmediato.
authRouter.post("/register", validateBody(registerSchema), async (req, res) => {
  const user = await registerUC.execute(req.body);
  const tokens = await issueTokens(user, sessions, requestMeta(req));
  res.status(201).json({ data: buildAuthResponse(res, tokens) });
});

authRouter.post("/login", validateBody(loginSchema), async (req, res) => {
  const tokens = await loginUC.execute(req.body, requestMeta(req));
  res.status(200).json({ data: buildAuthResponse(res, tokens) });
});

authRouter.post("/refresh", async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  const tokens = await refreshUC.execute(raw, requestMeta(req));
  res.status(200).json({ data: buildAuthResponse(res, tokens) });
});

authRouter.post("/logout", async (req, res) => {
  const raw = req.cookies?.[REFRESH_COOKIE] as string | undefined;
  await logoutUC.execute(raw);
  res.clearCookie(REFRESH_COOKIE, { path: refreshCookieOptions.path });
  res.status(200).json({ data: { success: true } });
});

authRouter.get("/me", authenticate, async (req, res) => {
  const user = await meUC.execute(req.auth!.userId);
  const body: MeResponse = { user: toAuthUser(user) };
  res.status(200).json({ data: body });
});

authRouter.post(
  "/forgot-password",
  validateBody(forgotPasswordSchema),
  async (req, res) => {
    await forgotUC.execute(req.body.email);
    // Respuesta uniforme aunque el correo no exista (no filtra cuentas).
    res.status(200).json({ data: { success: true } });
  },
);

authRouter.post(
  "/reset-password",
  validateBody(resetPasswordSchema),
  async (req, res) => {
    await resetUC.execute(req.body);
    res.status(200).json({ data: { success: true } });
  },
);
