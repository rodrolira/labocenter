# 07 · Autenticación (JWT + Refresh Tokens)

> Autenticación segura para datos clínicos. Resuelve ARQ-4 (HTTP inseguro) y sienta la base de RBAC ([08](./08-permisos.md)).

## 1. Modelo de tokens

| Token | Vida | Dónde vive | Contenido |
|-------|------|-----------|-----------|
| **Access token** (JWT) | corto (15 min) | memoria del cliente (no localStorage) | `sub`, `role`, `permissions`, `exp` |
| **Refresh token** | largo (7–30 días) | **cookie `httpOnly`, `Secure`, `SameSite=Strict`** | opaco; sólo su **hash** se guarda en `Session` |

**Por qué así:**
- Access en memoria evita robo por XSS (no persiste).
- Refresh en cookie httpOnly no es accesible por JS (mitiga XSS) y `SameSite=Strict` mitiga CSRF.
- Sólo se guarda el **hash** del refresh en BD: si la BD se filtra, los tokens no son usables.

## 2. Flujo

```
Login
  ├─ valida credenciales (argon2id)
  ├─ crea Session { tokenHash, family, expiresAt }
  ├─ set-cookie refresh (httpOnly)
  └─ responde { accessToken, user }

Request protegida
  └─ Authorization: Bearer <access>  → middleware verifica firma + exp

Access expira
  └─ POST /auth/refresh (cookie) → rota refresh, nuevo access + nueva cookie

Logout
  └─ revoca Session (revokedAt) + borra cookie
```

## 3. Rotación con detección de reuse

- Cada refresh pertenece a una **familia** (`family`). Al refrescar:
  1. Se valida el hash contra `Session` y que no esté `revoked`/expirado.
  2. Se **revoca** el token usado y se emite uno nuevo en la **misma familia**.
- Si llega un refresh **ya revocado** (reuse) → se asume robo: se **revoca toda la familia** y se fuerza re-login. (Patrón estándar de seguridad de refresh tokens.)

## 4. Hashing y secretos

- Contraseñas: **argon2id** (memory-hard) — no bcrypt por defecto.
- Refresh token: aleatorio de 256 bits, hash **SHA-256** antes de guardar.
- JWT firmado con **secreto fuerte** (`JWT_SECRET`) o claves asimétricas (RS256) en prod; secretos vía variables de entorno, nunca en repo.
- Rotación de secretos soportada por `kid` en el header del JWT (futuro).

## 5. Recuperación de contraseña

- `forgot-password`: genera token de un solo uso (hash en BD, expira ~1h), envía correo. **Respuesta siempre 200** (no revelar si el email existe).
- `reset-password`: valida token, setea nueva contraseña (argon2id), revoca todas las sesiones.

## 6. Verificación de correo y estados de cuenta

- `emailVerified` en `User`; correo de verificación tras registro.
- `isActive=false` bloquea login (cuenta deshabilitada por admin).

## 7. Integración con el frontend

- Interceptor de React Query/fetch: ante `401`, intenta `/auth/refresh` una vez; si falla, redirige a `/login`.
- `GET /auth/me` hidrata usuario + permisos al cargar la app (cacheado por React Query).
- Access token nunca se persiste; se pierde al cerrar pestaña (refresh lo reconstruye).

## 8. Defensas adicionales

- Rate limiting agresivo en `/auth/login` y `/auth/forgot-password`.
- Bloqueo temporal tras N intentos fallidos.
- Registro en `AuditLog` de login, logout, refresh-reuse y cambios de contraseña.
- `userAgent`/`ip` guardados en `Session` para listar/cerrar sesiones activas (futuro: "mis dispositivos").

> Continúa en [08-permisos.md](./08-permisos.md).
