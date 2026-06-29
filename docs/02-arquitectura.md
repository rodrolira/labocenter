# 02 · Arquitectura Profesional

> Cómo se estructura la plataforma y **por qué** cada decisión. Toda elección referencia el problema que resuelve (ver [01-analisis-sitio-actual.md](./01-analisis-sitio-actual.md)).

## 1. Visión general

Plataforma web integral para un laboratorio clínico y centro de imágenes: sitio público con SEO, portales (paciente y médico) y un dashboard administrativo con reservas, agenda, resultados, pagos, notificaciones y auditoría.

```
                        ┌─────────────────────────────────────────┐
   Internet  ─────────▶ │                 Nginx                    │  (TLS, reverse proxy, gzip/brotli, cache)
                        └───────────────┬───────────────┬─────────┘
                                        │               │
                          /  (web)      │               │  /api  (backend)
                                        ▼               ▼
                        ┌───────────────────┐   ┌──────────────────────┐
                        │  apps/web          │   │  apps/api            │
                        │  React 19 + Vite   │   │  Node + Express      │
                        │  React Router (SSR)│   │  Clean Arch + DDD    │
                        │  Tailwind + Shadcn │   │  Prisma ORM          │
                        └─────────┬─────────┘   └──────────┬───────────┘
                                  │ HTTP/JSON (React Query) │
                                  └─────────────┬──────────┘
                                                ▼
                                   ┌──────────────────────────┐
                                   │  PostgreSQL  (Prisma)     │
                                   └──────────────────────────┘
                            servicios externos (futuro): Transbank, SMTP, SMS, WhatsApp
```

## 2. Monorepo

Usamos **monorepo** con **pnpm workspaces + Turborepo**.

| Razón | Detalle |
|-------|---------|
| Tipos y validación compartidos | Esquemas **Zod** en `packages/contracts` se usan en backend (validación de entrada) y frontend (formularios + tipos), evitando contratos divergentes (resuelve ARQ-3). |
| Builds rápidos y cacheables | Turborepo cachea tareas (`build`, `lint`, `test`) por paquete. |
| Una sola fuente de verdad | Config de ESLint/TS/Tailwind compartida. |

```
labocenter/
├─ apps/
│  ├─ web/        # Frontend React 19 + Vite (público + portales + admin)
│  └─ api/        # Backend Express + Prisma
├─ packages/
│  ├─ contracts/  # Zod schemas + tipos + DTOs compartidos (frontend/backend)
│  ├─ ui/         # Design system (Shadcn) reutilizable
│  └─ config/     # tsconfig, eslint, tailwind preset compartidos
├─ docs/          # Esta documentación de diseño
├─ docker/        # Dockerfiles, nginx, compose
└─ .github/       # GitHub Actions (CI/CD)
```

> Alternativa descartada: repos separados → duplican tipos y CI, dificultan compartir contratos. Nx → más pesado que Turborepo para este tamaño.

## 3. Backend — Clean Architecture + DDD

El backend separa responsabilidades en capas concéntricas (dependencias apuntan hacia el dominio):

```
            ┌──────────────────────────────────────────┐
            │ Interfaces (HTTP)                          │  Express routers, controllers, middlewares
            │  ┌────────────────────────────────────┐   │
            │  │ Application (casos de uso)          │   │  servicios de aplicación, orquestación
            │  │  ┌──────────────────────────────┐  │   │
            │  │  │ Domain (entidades, reglas)    │  │   │  entidades, value objects, reglas puras
            │  │  └──────────────────────────────┘  │   │
            │  └────────────────────────────────────┘   │
            │ Infrastructure                             │  Prisma repos, mailer, JWT, storage
            └──────────────────────────────────────────┘
```

**Flujo de una request:** `router → controller → use case (application) → domain + repository (infra) → respuesta`.

### Bounded Contexts (DDD)

El dominio se divide en contextos delimitados, cada uno con sus entidades y casos de uso:

| Contexto | Responsabilidad |
|----------|-----------------|
| **Identity & Access** | Usuarios, roles, permisos, autenticación, sesiones. |
| **Patients** | Pacientes y su historial clínico. |
| **Catalog** | Servicios, exámenes, categorías, indicaciones, precios referenciales. |
| **Scheduling** | Agenda (médica y de exámenes), disponibilidad, reservas/citas, sucursales. |
| **Results** | Órdenes, carga de resultados, archivos, verificación de autenticidad. |
| **Billing** | Pagos (preparado para Transbank). |
| **Notifications** | Correo (activo), SMS/WhatsApp (preparado). |
| **Audit** | Logs de acción y auditoría de accesos a datos clínicos. |

> SOLID aplicado: cada caso de uso tiene una responsabilidad (SRP); dependemos de interfaces de repositorio/servicios (DIP) inyectadas; el dominio no conoce Express ni Prisma.

### Por qué Express (y no Nest)
La consigna fija **Express**. Para mantener orden sin el peso de un framework opinado, imponemos la estructura por capas a mano y `inversify`/inyección simple por composición. Esto da control total y testabilidad.

## 4. Frontend — React 19 + Vite + React Router (SSR selectivo)

- **React Router en "framework mode" (v7)** sobre Vite: integra **SSR + data loaders + nested routing** de forma nativa, satisfaciendo simultáneamente "Vite", "React Router" y "SSR si aporta beneficios".
- **SSR/SSG para páginas públicas** (home, servicios, fichas de examen, contacto): mejora SEO (SEO-1..5) y LCP (PERF-4).
- **CSR para zonas autenticadas** (portales y dashboard): no necesitan SEO; se cargan tras login con code-splitting.
- **React Query** para estado de servidor (caché, revalidación, reintentos), **no** para estado de UI.
- **React Hook Form + Zod** para formularios; los mismos esquemas Zod viven en `packages/contracts`.
- **Framer Motion** para microinteracciones (con respeto a `prefers-reduced-motion`).
- **Atomic Design** + **Shadcn/UI** (ver [04-sistema-componentes.md](./04-sistema-componentes.md)).

## 5. Datos y caché

- **PostgreSQL + Prisma** como única fuente de verdad transaccional ([03-base-de-datos.md](./03-base-de-datos.md)).
- Caché de lectura en cliente con React Query; en servidor, Nginx cachea estáticos.
- (Futuro) Redis para sesiones/colas si la escala lo requiere — no en MVP.

## 6. Seguridad (transversal)

- **HTTPS** end-to-end vía Nginx (resuelve ARQ-4: adiós HTTP en `:8199`).
- **JWT access + refresh token rotativo** en cookie `httpOnly` ([07-autenticacion.md](./07-autenticacion.md)).
- **RBAC** por permisos `recurso:acción` ([08-permisos.md](./08-permisos.md)).
- Cabeceras seguras (`helmet`), CORS estricto, rate limiting, validación Zod en todo endpoint.
- **Auditoría** de accesos a datos clínicos (cumplimiento Ley 19.628 / datos sensibles de salud en Chile).

## 7. Observabilidad

- **Logs** estructurados (pino) con correlación por request id.
- **Auditoría** de negocio en BD (`AuditLog`).
- Métricas básicas y health checks (`/health`, `/ready`) para Docker/Nginx.

## 8. DevOps

- **Docker** multi-stage por app + **docker-compose** (web, api, postgres, nginx).
- **Nginx** como reverse proxy + TLS + compresión.
- **GitHub Actions**: lint → typecheck → test (Vitest) → build → E2E (Playwright) → (deploy).
- **Prisma Migrate** para versionar el esquema; migraciones en CI antes de desplegar.

## 9. Decisiones técnicas — resumen justificado

| Decisión | Alternativas | Por qué |
|----------|--------------|---------|
| Monorepo (pnpm + Turbo) | Multirepo, Nx | Contratos compartidos, CI cacheada, tamaño adecuado. |
| React Router framework mode (SSR) | SPA pura, Next.js | Cumple stack obligatorio (Vite+RR) y aporta SSR para SEO. |
| Clean Arch + DDD sobre Express | MVC plano, Nest | Testabilidad, límites de dominio claros sin framework pesado. |
| Zod en `contracts` | tipos duplicados | Una validación FE+BE, sin divergencia (ARQ-3). |
| Prisma | TypeORM, SQL plano | DX, migraciones, tipado end-to-end. |
| React Query | Redux para datos remotos | Caché/revalidación de servidor sin boilerplate. |
| Tailwind + Shadcn | CSS-in-JS, MUI | Tokens, accesibilidad (Radix), bundle pequeño, dark mode. |

> Continúa en [03-base-de-datos.md](./03-base-de-datos.md).
