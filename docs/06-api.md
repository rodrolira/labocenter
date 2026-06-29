# 06 · Diseño de la API (REST)

> API REST versionada, contratos Zod compartidos, respuestas y errores uniformes. Base: `/api/v1`. Resuelve ARQ-1/ARQ-3 (sin API propia ni contratos).

## 1. Convenciones generales

- **Base URL**: `/api/v1`. Versionado en path para evolución sin romper clientes.
- **Formato**: JSON. Fechas en ISO-8601 (UTC).
- **Nombres de recurso** en plural y kebab/camel consistentes (`/appointments`, `/exam-categories`).
- **Validación**: todo body/query/params se valida con **Zod** (mismo esquema que el frontend, desde `packages/contracts`).
- **Idempotencia**: `POST` crea; `PUT` reemplaza; `PATCH` modifica parcial; `DELETE` elimina (soft cuando aplica).
- **Auth**: `Authorization: Bearer <access>`; refresh vía cookie httpOnly (ver [07](./07-autenticacion.md)).

## 2. Envoltura de respuesta

Éxito:
```json
{ "data": { /* recurso o lista */ }, "meta": { /* paginación si aplica */ } }
```

Error (uniforme):
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El RUT no es válido",
    "details": [{ "path": "rut", "message": "Formato inválido" }],
    "requestId": "req_abc123"
  }
}
```

| HTTP | Código interno | Uso |
|------|----------------|-----|
| 400 | `VALIDATION_ERROR` | Zod falla |
| 401 | `UNAUTHENTICATED` | sin/invalid token |
| 403 | `FORBIDDEN` | sin permiso |
| 404 | `NOT_FOUND` | recurso inexistente |
| 409 | `CONFLICT` | duplicado / slot ya reservado |
| 422 | `BUSINESS_RULE` | regla de dominio |
| 429 | `RATE_LIMITED` | rate limit |
| 500 | `INTERNAL` | error no controlado |

## 3. Paginación, filtros y orden

- Query: `?page=1&pageSize=20&sort=-createdAt&q=texto&<filtros>`.
- Respuesta `meta`: `{ page, pageSize, total, totalPages }`.
- Búsqueda de exámenes: `GET /exams?q=&category=&fasting=&service=` (resuelve UX-1).

## 4. Endpoints por contexto

### Auth & sesión
| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/auth/register` | Registro de paciente | público |
| POST | `/auth/login` | Login → access + set-cookie refresh | público |
| POST | `/auth/refresh` | Rota refresh, devuelve nuevo access | cookie |
| POST | `/auth/logout` | Revoca sesión | auth |
| GET | `/auth/me` | Usuario actual + permisos | auth |
| POST | `/auth/forgot-password` | Envía correo de reset | público |
| POST | `/auth/reset-password` | Cambia contraseña con token | público |

### Catálogo (público de lectura)
| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/services` / `/services/:slug` | público |
| GET | `/exam-categories` | público |
| GET | `/exams` / `/exams/:slug` | público |
| POST/PATCH/DELETE | `/exams`, `/services`, `/exam-categories` | `catalog:manage` |

### Pacientes
| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/patients` (lista, búsqueda) | `patient:read` |
| GET | `/patients/:id` | `patient:read` (o propio) |
| POST/PATCH | `/patients` / `/patients/:id` | `patient:manage` |
| GET | `/patients/:id/medical-record` | `record:read` + auditado |

### Agenda y reservas
| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| GET | `/availability` | Slots libres por sucursal/fecha/tipo | público |
| GET | `/branches` / `/branches/:slug` | Sucursales | público |
| POST | `/appointments` | Crear reserva (valida slot libre → 409 si ocupado) | `appointment:create` / paciente |
| GET | `/appointments` | Lista (filtra por rol) | `appointment:read` |
| GET | `/appointments/:id` | Detalle | dueño o `appointment:read` |
| PATCH | `/appointments/:id` | Reprogramar/confirmar/cancelar | según rol |
| POST | `/schedule/slots` | Crear bloques de agenda | `schedule:manage` |

### Órdenes y resultados
| Método | Ruta | Descripción | Permiso |
|--------|------|-------------|---------|
| POST | `/orders` | Crear orden de exámenes | `order:create` |
| GET | `/orders` / `/orders/:id` | Listar/ver | dueño o `order:read` |
| POST | `/orders/:id/results` | Cargar resultado + archivos | `result:upload` (TM) |
| PATCH | `/results/:id/validate` | Validar/publicar | `result:validate` |
| GET | `/results/:id/files/:fileId` | Descargar (firmado, auditado) | dueño o staff |
| GET | `/results/verify/:code` | Verificación pública de autenticidad | público |

### Pagos (preparado Transbank)
| Método | Ruta | Permiso |
|--------|------|---------|
| POST | `/payments` | Registrar/iniciar pago | `payment:create` |
| GET | `/payments/:id` | Estado | dueño o `payment:read` |
| POST | `/payments/webhook/transbank` | Webhook (futuro) | firma |

### Notificaciones
| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/notifications` | Mis notificaciones | auth |
| PATCH | `/notifications/:id/read` | Marcar leída | dueño |
| POST | `/notifications/test` | Enviar prueba | `notification:manage` |

### Estadísticas y auditoría
| Método | Ruta | Permiso |
|--------|------|---------|
| GET | `/stats/overview` | KPIs del dashboard | `stats:read` |
| GET | `/audit-logs` | Auditoría (filtros) | `audit:read` |

### Contacto y salud del sistema
| Método | Ruta | Permiso |
|--------|------|---------|
| POST | `/contact` | Formulario de contacto → correo | público + rate limit |
| GET | `/health`, `/ready` | Healthchecks | público |

## 5. Capas internas (cómo se implementa cada endpoint)

```
Router (Express)
  → middleware: auth → permisos → validación Zod
    → Controller (mapea HTTP ↔ caso de uso)
      → Use Case (Application): orquesta reglas
        → Domain (entidades/reglas puras)
        → Repository (interface) ──> Prisma (Infra)
      ← DTO
  ← respuesta uniforme
```

- **Controllers** delgados; nada de lógica de negocio.
- **Use cases** testeables sin HTTP ni DB (repos mockeables) — SOLID/DIP.
- **Errores** lanzados como excepciones de dominio y traducidos por un `errorHandler` central a la envoltura uniforme.

## 6. Seguridad de la API

- `helmet`, CORS allowlist, `express-rate-limit` (login y `/contact` más estrictos).
- Tamaño de body limitado; subida de archivos validada (tipo/size/checksum).
- Descarga de resultados con **URL firmada temporal** y registro en `AuditLog` (datos clínicos).
- Toda mutación sensible → entrada en `AuditLog`.

## 7. Documentación

- **OpenAPI** generado desde los esquemas Zod (`zod-to-openapi`), servido en `/api/v1/docs` (Swagger UI) en entornos no productivos.
- Colección de ejemplos para QA/Playwright.

> Continúa en [07-autenticacion.md](./07-autenticacion.md).
