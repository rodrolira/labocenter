# 09 · Estructura del Proyecto

> Organización física del monorepo. Coherente con la arquitectura ([02](./02-arquitectura.md)).

## 1. Árbol del monorepo

```
labocenter/
├─ apps/
│  ├─ web/                         # Frontend (React 19 + Vite + React Router framework mode)
│  │  ├─ app/
│  │  │  ├─ routes/                # rutas (público, /portal, /medico, /admin, auth)
│  │  │  ├─ templates/             # layouts (Public, Dashboard, Portal, Auth)
│  │  │  ├─ features/              # lógica por feature (auth, exams, appointments...)
│  │  │  │  └─ <feature>/          # api hooks (React Query), componentes, schemas
│  │  │  ├─ lib/                   # api client, query client, utils, seo, theme
│  │  │  ├─ root.tsx               # documento raíz (providers, meta, theme)
│  │  │  └─ entry.server.tsx       # SSR entry
│  │  ├─ public/                   # estáticos (favicon, og default, robots)
│  │  ├─ tests/                    # Vitest (unit) + Playwright (e2e en /e2e)
│  │  ├─ vite.config.ts
│  │  └─ package.json
│  │
│  └─ api/                         # Backend (Express + Prisma)
│     ├─ src/
│     │  ├─ modules/               # bounded contexts (DDD)
│     │  │  ├─ identity/           # auth, users, roles, permissions
│     │  │  │  ├─ domain/          # entidades + reglas puras
│     │  │  │  ├─ application/     # casos de uso
│     │  │  │  ├─ infrastructure/  # repos Prisma, mailer...
│     │  │  │  └─ interface/       # routers + controllers
│     │  │  ├─ patients/
│     │  │  ├─ catalog/
│     │  │  ├─ scheduling/
│     │  │  ├─ results/
│     │  │  ├─ billing/
│     │  │  ├─ notifications/
│     │  │  └─ audit/
│     │  ├─ shared/                # middlewares, errores, logger, config, di
│     │  ├─ app.ts                 # ensamblado Express
│     │  └─ server.ts              # arranque
│     ├─ prisma/
│     │  ├─ schema.prisma
│     │  ├─ migrations/
│     │  └─ seed.ts
│     ├─ tests/                    # Vitest (unit/integration)
│     └─ package.json
│
├─ packages/
│  ├─ contracts/                   # Zod schemas + tipos + DTOs (FE/BE)
│  ├─ ui/                          # design system (Shadcn, Atomic Design)
│  └─ config/                      # tsconfig base, eslint, tailwind preset, prettier
│
├─ docker/
│  ├─ web.Dockerfile
│  ├─ api.Dockerfile
│  ├─ nginx/                       # nginx.conf, TLS
│  └─ docker-compose.yml
├─ .github/workflows/             # ci.yml, deploy.yml
├─ docs/                           # 01..10 (este diseño)
├─ pnpm-workspace.yaml
├─ turbo.json
├─ package.json                    # scripts raíz
├─ CLAUDE.md
└─ README.md
```

## 2. Organización por *feature* (frontend) y por *módulo/contexto* (backend)

- **Frontend**: agrupación por **feature** (no por tipo). Cada feature reúne sus hooks de datos (React Query), componentes, esquemas y tipos. Reduce acoplamiento y facilita borrar/mover features.
- **Backend**: agrupación por **bounded context**, cada uno con sus 4 capas (domain/application/infrastructure/interface). El dominio no importa Express ni Prisma (DIP).

## 3. Convenciones

| Tema | Convención |
|------|-----------|
| Lenguaje | TypeScript estricto (`strict: true`, `noUncheckedIndexedAccess`). |
| Imports | Alias `@/` por app; `@labocenter/contracts`, `@labocenter/ui`. |
| Estilo | ESLint + Prettier compartidos (`packages/config`). |
| Commits | Conventional Commits (feat, fix, docs, refactor, test, chore). |
| Ramas | `main` protegida; trabajo en `feat/*`, PR con CI verde. |
| Tests | co-localizados (`*.test.ts`) + E2E en `apps/web/e2e`. |
| Documentación | cada archivo y función con comentario de propósito; decisiones no obvias justificadas inline. |

## 4. Variables de entorno

`.env.example` versionado (sin secretos). Claves principales:

```
# api
DATABASE_URL=postgresql://user:pass@localhost:5432/labocenter
JWT_SECRET=...
JWT_ACCESS_TTL=15m
REFRESH_TTL=30d
SMTP_URL=...
CORS_ORIGIN=http://localhost:5173
# web
VITE_API_URL=http://localhost:3000/api/v1
```

## 5. Scripts raíz (pnpm workspaces)

> La orquestación usa el runner recursivo nativo de pnpm (`pnpm -r`), que respeta el orden topológico de dependencias. Turborepo se difirió en la Fase 0 por un fallo del binario nativo en Windows (ver nota en `CLAUDE.md`); los scripts por paquete no cambian si se reintroduce.

| Script | Acción |
|--------|--------|
| `pnpm dev` | Levanta web + api en paralelo (`pnpm -r --parallel --filter "./apps/*"`). |
| `pnpm build` | Build de todos los paquetes. |
| `pnpm lint` / `pnpm typecheck` | Calidad. |
| `pnpm test` | Vitest en todos los paquetes. |
| `pnpm test:e2e` | Playwright. |
| `pnpm db:migrate` / `pnpm db:seed` | Prisma. |
| `pnpm docker:up` | docker-compose. |

> Continúa en [10-roadmap.md](./10-roadmap.md).
