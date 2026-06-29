/**
 * Página de inicio de sesión. Valida con Zod (RHF) y maneja errores de servidor.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginInput } from "@labocenter/contracts";
import { Button, Input, Label } from "@labocenter/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, type MetaFunction } from "react-router";
import { AuthShell, FieldError, FormError } from "~/features/auth/auth-shell";
import { useLogin } from "~/features/auth/api";
import { ApiError } from "~/lib/api-client";

export const meta: MetaFunction = () => [{ title: "Iniciar sesión — Labocenter" }];

export default function LoginPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginSchema) });
  const login = useLogin();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await login.mutateAsync(values);
      navigate("/portal");
    } catch (e) {
      setServerError(
        e instanceof ApiError ? e.message : "Ocurrió un error inesperado",
      );
    }
  });

  return (
    <AuthShell
      title="Iniciar sesión"
      subtitle="Accede a tu portal de paciente"
      footer={
        <>
          ¿No tienes cuenta?{" "}
          <Link to="/registro" className="font-medium text-primary underline">
            Regístrate
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormError message={serverError} />

        <div>
          <Label htmlFor="email">Correo</Label>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
          <Link
            to="/recuperar"
            className="mt-1 inline-block text-sm text-muted-foreground underline"
          >
            ¿Olvidaste tu contraseña?
          </Link>
        </div>

        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Ingresando…" : "Ingresar"}
        </Button>
      </form>
    </AuthShell>
  );
}
