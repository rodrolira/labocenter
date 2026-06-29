/**
 * Guardia de rutas privadas (CSR). Mientras valida la sesión muestra carga;
 * si no hay usuario, redirige a /login. El backend sigue siendo la autoridad
 * (defensa en profundidad).
 */
import { type ReactNode, useEffect } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "./use-auth";

export function RequireAuth({ children }: Readonly<{ children: ReactNode }>) {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/login", { replace: true });
    }
  }, [isLoading, user, navigate]);

  if (isLoading) {
    return (
      <div className="flex min-h-dvh items-center justify-center text-muted-foreground">
        Cargando…
      </div>
    );
  }
  if (!user) return null;
  return <>{children}</>;
}
