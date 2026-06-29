/**
 * Página de registro de paciente. Reutiliza el schema Zod compartido.
 */
import { zodResolver } from "@hookform/resolvers/zod";
import { registerSchema, type RegisterInput } from "@labocenter/contracts";
import { Button, Input, Label } from "@labocenter/ui";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate, type MetaFunction } from "react-router";
import { AuthShell, FieldError, FormError } from "~/features/auth/auth-shell";
import { useRegister } from "~/features/auth/api";
import { ApiError } from "~/lib/api-client";

export const meta: MetaFunction = () => [{ title: "Crear cuenta — Labocenter" }];

export default function RegisterPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerSchema) });
  const registerMutation = useRegister();
  const navigate = useNavigate();
  const [serverError, setServerError] = useState<string | null>(null);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await registerMutation.mutateAsync(values);
      navigate("/portal");
    } catch (e) {
      setServerError(
        e instanceof ApiError ? e.message : "Ocurrió un error inesperado",
      );
    }
  });

  return (
    <AuthShell
      title="Crear cuenta"
      subtitle="Regístrate para reservar y ver tus resultados"
      footer={
        <>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login" className="font-medium text-primary underline">
            Inicia sesión
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
        <FormError message={serverError} />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label htmlFor="firstName">Nombre</Label>
            <Input id="firstName" aria-invalid={!!errors.firstName} {...register("firstName")} />
            <FieldError message={errors.firstName?.message} />
          </div>
          <div>
            <Label htmlFor="lastName">Apellido</Label>
            <Input id="lastName" aria-invalid={!!errors.lastName} {...register("lastName")} />
            <FieldError message={errors.lastName?.message} />
          </div>
        </div>

        <div>
          <Label htmlFor="email">Correo</Label>
          <Input id="email" type="email" autoComplete="email" aria-invalid={!!errors.email} {...register("email")} />
          <FieldError message={errors.email?.message} />
        </div>

        <div>
          <Label htmlFor="rut">RUT (opcional)</Label>
          <Input id="rut" placeholder="12.345.678-5" aria-invalid={!!errors.rut} {...register("rut")} />
          <FieldError message={errors.rut?.message} />
        </div>

        <div>
          <Label htmlFor="password">Contraseña</Label>
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
          {isSubmitting ? "Creando cuenta…" : "Crear cuenta"}
        </Button>
      </form>
    </AuthShell>
  );
}
