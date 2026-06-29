/**
 * Portal del paciente (placeholder de Fase 2). Ruta protegida que demuestra
 * la sesión activa: muestra el usuario, su rol y permite cerrar sesión.
 * En la Fase 5 se expande con citas, resultados e historial.
 */
import { Button } from "@labocenter/ui";
import { useNavigate, type MetaFunction } from "react-router";
import { useLogout } from "~/features/auth/api";
import { RequireAuth } from "~/features/auth/require-auth";
import { useAuth } from "~/features/auth/use-auth";

export const meta: MetaFunction = () => [{ title: "Portal — Labocenter" }];

function PortalContent() {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const onLogout = async () => {
    await logout.mutateAsync().catch(() => {});
    navigate("/login", { replace: true });
  };

  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col gap-6 px-6 py-12">
      <header className="flex items-center justify-between">
        <span className="text-lg font-semibold text-primary">Labocenter</span>
        <Button variant="outline" size="sm" onClick={onLogout}>
          Cerrar sesión
        </Button>
      </header>

      <section className="rounded-lg border bg-card p-6 text-card-foreground">
        <h1 className="text-2xl font-bold">
          Hola, {user?.firstName} {user?.lastName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">{user?.email}</p>
        <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
          <div className="rounded-md bg-muted px-3 py-2">
            <dt className="text-muted-foreground">Rol</dt>
            <dd className="font-medium">{user?.role}</dd>
          </div>
          <div className="rounded-md bg-muted px-3 py-2">
            <dt className="text-muted-foreground">Permisos</dt>
            <dd className="font-medium">{user?.permissions.length}</dd>
          </div>
        </dl>
      </section>
    </main>
  );
}

export default function PortalPage() {
  return (
    <RequireAuth>
      <PortalContent />
    </RequireAuth>
  );
}
