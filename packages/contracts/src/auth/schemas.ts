/**
 * Contratos (Zod) de autenticación, compartidos por frontend y backend.
 * El frontend los usa con React Hook Form; el backend para validar la entrada.
 */
import { z } from "zod";
import { ROLE_NAMES } from "./permissions";
import { isValidRut, normalizeRut } from "./rut";

/** Política de contraseña: mínimo 8, con minúscula, mayúscula y dígito. */
export const passwordSchema = z
  .string()
  .min(8, "La contraseña debe tener al menos 8 caracteres")
  .max(128)
  .regex(/[a-z]/, "Debe incluir una minúscula")
  .regex(/[A-Z]/, "Debe incluir una mayúscula")
  .regex(/[0-9]/, "Debe incluir un número");

export const emailSchema = z
  .string()
  .email("Correo inválido")
  .transform((v) => v.toLowerCase().trim());

/** RUT opcional; si viene, se valida DV y se normaliza. */
export const rutSchema = z
  .string()
  .refine(isValidRut, "RUT inválido")
  .transform(normalizeRut);

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  firstName: z.string().min(1, "Nombre requerido").max(80),
  lastName: z.string().min(1, "Apellido requerido").max(80),
  phone: z.string().max(20).optional(),
  rut: rutSchema.optional(),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Contraseña requerida"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = z.object({
  email: emailSchema,
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: passwordSchema,
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

/** Usuario autenticado expuesto al cliente (sin datos sensibles). */
export const authUserSchema = z.object({
  id: z.string(),
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  role: z.enum(ROLE_NAMES),
  permissions: z.array(z.string()),
});
export type AuthUser = z.infer<typeof authUserSchema>;

export const loginResponseSchema = z.object({
  accessToken: z.string(),
  user: authUserSchema,
});
export type LoginResponse = z.infer<typeof loginResponseSchema>;

export const meResponseSchema = z.object({
  user: authUserSchema,
});
export type MeResponse = z.infer<typeof meResponseSchema>;
