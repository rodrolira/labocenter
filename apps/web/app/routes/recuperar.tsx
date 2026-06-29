/**
 * Página de solicitud de recuperación de contraseña.
 * Siempre muestra confirmación (no revela si el correo existe).
 */
import { zodResolver } from "@hookform/resolvers/zod";
import {
  forgotPasswordSchema,
  type ForgotPasswordInput,
} from "@labocenter/contracts";
import { Button, Input, Label } from "@labocenter/ui";
import { useForm } from "react-hook-form";
import { Link, type MetaFunction } from "react-router";
import { useForgotPassword } from "~/features/auth/api";
import { AuthShell, FieldError } from "~/features/auth/auth-shell";

export const meta: MetaFunction = () => [
  { title: "Recuperar contraseña — Labocenter" },
];

export default function RecoverPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });
  const forgot = useForgotPassword();

  const onSubmit = handleSubmit(async (values) => {
    await forgot.mutateAsync(values).catch(() => {});
  });

  return (
    <AuthShell
      title="Recuperar contraseña"
      subtitle="Te enviaremos un enlace para restablecerla"
      footer={
        <Link to="/login" className="font-medium text-primary underline">
          Volver a iniciar sesión
        </Link>
      }
    >
      {forgot.isSuccess ? (
        <p className="rounded-md border border-primary/40 bg-primary/10 px-3 py-2 text-sm">
          Si el correo está registrado, recibirás un enlace para restablecer tu
          contraseña.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="flex flex-col gap-4" noValidate>
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
          <Button type="submit" disabled={isSubmitting} size="lg">
            {isSubmitting ? "Enviando…" : "Enviar enlace"}
          </Button>
        </form>
      )}
    </AuthShell>
  );
}
