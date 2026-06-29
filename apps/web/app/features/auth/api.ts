/**
 * Hooks de datos de autenticación (React Query).
 * Encapsulan las llamadas a la API y sincronizan la caché del usuario actual.
 */
import {
  type ForgotPasswordInput,
  type LoginInput,
  type LoginResponse,
  type MeResponse,
  type RegisterInput,
  type ResetPasswordInput,
} from "@labocenter/contracts";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch, setAccessToken } from "~/lib/api-client";

export const ME_KEY = ["auth", "me"] as const;

/** Usuario actual. Si no hay sesión válida, la query falla (sin reintentos). */
export function useMe() {
  return useQuery({
    queryKey: ME_KEY,
    queryFn: () => apiFetch<MeResponse>("/auth/me"),
    retry: false,
    staleTime: 5 * 60_000,
  });
}

export function useLogin() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: LoginInput) =>
      apiFetch<LoginResponse>("/auth/login", {
        method: "POST",
        body: input,
        retryOnUnauthorized: false,
      }),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      qc.setQueryData<MeResponse>(ME_KEY, { user: data.user });
    },
  });
}

export function useRegister() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: RegisterInput) =>
      apiFetch<LoginResponse>("/auth/register", {
        method: "POST",
        body: input,
        retryOnUnauthorized: false,
      }),
    onSuccess: (data) => {
      setAccessToken(data.accessToken);
      qc.setQueryData<MeResponse>(ME_KEY, { user: data.user });
    },
  });
}

export function useLogout() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () =>
      apiFetch("/auth/logout", { method: "POST", retryOnUnauthorized: false }),
    onSuccess: () => {
      setAccessToken(null);
      qc.setQueryData(ME_KEY, null);
      qc.removeQueries({ queryKey: ME_KEY });
    },
  });
}

export function useForgotPassword() {
  return useMutation({
    mutationFn: (input: ForgotPasswordInput) =>
      apiFetch("/auth/forgot-password", {
        method: "POST",
        body: input,
        retryOnUnauthorized: false,
      }),
  });
}

export function useResetPassword() {
  return useMutation({
    mutationFn: (input: ResetPasswordInput) =>
      apiFetch("/auth/reset-password", {
        method: "POST",
        body: input,
        retryOnUnauthorized: false,
      }),
  });
}
