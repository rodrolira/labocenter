/**
 * Hook de autorización de UI. Expone el usuario actual y `can()` para
 * mostrar/ocultar elementos según permisos (defensa en profundidad: el
 * backend siempre decide; ver docs/08-permisos.md §5).
 */
import { type PermissionCode } from "@labocenter/contracts";
import { useMe } from "./api";

export function useAuth() {
  const { data, isLoading, isError } = useMe();
  const user = data?.user ?? null;

  return {
    user,
    isLoading,
    isAuthenticated: !!user && !isError,
    /** ¿El usuario tiene el permiso? ADMIN siempre puede. */
    can: (code: PermissionCode): boolean =>
      !!user && (user.role === "ADMIN" || user.permissions.includes(code)),
  };
}
