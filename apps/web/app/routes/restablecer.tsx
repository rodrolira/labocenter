/**
 * Página para fijar una nueva contraseña con el token del enlace.
 * El token llega como parámetro de ruta (/restablecer/:token).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  resetPasswordSchema,
  type ResetPasswordInput,
} from "@labocenter/contracts";
import { Button, Input, Label } from "@labocenter/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, useParams, type MetaFunction } from "react-router";
import { useResetPassword } from "~/features/auth/api";
import { AuthShell, FieldError, FormError } from "~/features/auth/auth-shell";
import { ApiError } from "~/lib/api-client";

export const meta: MetaFunction = () => [
  { title: "Restablecer contraseña — Labocenter" },
];

export default function ResetPage() {
  const { token = "" } = useParams();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token },
  });
  const reset = useResetPassword();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await reset.mutateAsync({ ...values, token });
      navigate("/login");
    } catch (e) {
      setServerError(
        e instanceof ApiError ? e.message : "Ocurrió un error inesperado",
      );
    }
  });

  return (
    <AuthShell
      title="Nueva contraseña"
      footer={
        <Link to="/login" className="font-medium text-primary underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormError message={serverError} />
        <input type="hidden" value={token} {...register("token")} />
        <div>
          <Label htmlFor="password">Contraseña nueva</Label>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
          <FieldError message={errors.password?.message} />
        </div>
        <Button type="submit" disabled={isSubmitting} size="lg">
          {isSubmitting ? "Guardando…" : "Cambiar contraseña"}
        </Button>
      </form>
    </AuthShell>
  );
}
