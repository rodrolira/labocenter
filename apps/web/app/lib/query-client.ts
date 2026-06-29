/**
 * Fábrica del QueryClient de React Query.
 * Se crea una instancia por carga de app (no global) para no compartir caché
 * entre requests en SSR.
 */
import { QueryClient } from "@tanstack/react-query";

export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 60_000,
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
