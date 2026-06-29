/**
 * Estructura compartida de las páginas de autenticación: centra el contenido,
 * muestra marca, ThemeToggle y una tarjeta con título. Evita duplicar layout
 * entre login/registro/recuperación (componentes reutilizables).
 */
import { ThemeToggle } from "@labocenter/ui";
import { type ReactNode } from "react";
import { Link } from "react-router";

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: Readonly<{
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
}>) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-6 py-12">
      <div className="flex items-center justify-between">
        <Link to="/" className="text-lg font-semibold text-primary">
          Labocenter
        </Link>
        <ThemeToggle />
      </div>

      <div className="rounded-lg border bg-card p-6 text-card-foreground shadow-sm">
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {subtitle ? (
          <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
        ) : null}
        <div className="mt-6">{children}</div>
      </div>

      {footer ? (
        <div className="text-center text-sm text-muted-foreground">{footer}</div>
      ) : null}
    </main>
  );
}

/** Mensaje de error de campo (validación). */
export function FieldError({ message }: Readonly<{ message?: string }>) {
  if (!message) return null;
  return <p className="mt-1 text-sm text-destructive">{message}</p>;
}

/** Banner de error del servidor. */
export function FormError({ message }: Readonly<{ message?: string | null }>) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="rounded-md border border-destructive/50 bg-destructive/10 px-3 py-2 text-sm text-destructive"
    >
      {message}
    </p>
  );
}
