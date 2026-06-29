/**
 * Cliente HTTP de la API.
 * - El access token vive sólo en memoria (no en localStorage) → mitiga XSS.
 * - El refresh token viaja en cookie httpOnly (credentials: "include").
 * - Ante un 401, intenta UNA renovación vía /auth/refresh y reintenta.
 * Ver docs/06-api.md y docs/07-autenticacion.md.
 */
import { type ApiError as ApiErrorBody } from "@labocenter/contracts";

const API_URL =
  import.meta.env.VITE_API_URL ?? "http://localhost:3000/api/v1";

let accessToken: string | null = null;
export function setAccessToken(token: string | null): void {
  accessToken = token;
}
export function getAccessToken(): string | null {
  return accessToken;
}

/** Error de API con código estable y detalles de validación. */
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly body?: ApiErrorBody["error"],
  ) {
    super(body?.message ?? `Error ${status}`);
    this.name = "ApiError";
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
  /** Si es false, no intenta renovar el token ante un 401 (p. ej. login). */
  retryOnUnauthorized?: boolean;
}

// Evita renovaciones concurrentes: comparte una sola promesa de refresh.
let refreshing: Promise<boolean> | null = null;

async function tryRefresh(): Promise<boolean> {
  refreshing ??= fetch(`${API_URL}/auth/refresh`, {
    method: "POST",
    credentials: "include",
  })
    .then(async (res) => {
      if (!res.ok) return false;
      const json = await res.json();
      accessToken = json.data.accessToken;
      return true;
    })
    .catch(() => false)
    .finally(() => {
      refreshing = null;
    });
  return refreshing;
}

export async function apiFetch<T>(
  path: string,
  options: ApiOptions = {},
): Promise<T> {
  const { body, retryOnUnauthorized = true, headers, ...rest } = options;

  const doFetch = () =>
    fetch(`${API_URL}${path}`, {
      ...rest,
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        ...headers,
      },
      ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    });

  let res = await doFetch();

  if (res.status === 401 && retryOnUnauthorized) {
    const ok = await tryRefresh();
    if (ok) res = await doFetch();
  }

  const json = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, json?.error);
  }
  return json.data as T;
}
