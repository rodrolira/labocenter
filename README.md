# Labocenter — Plataforma Web (V2)

Reconstrucción profesional de la plataforma web de **Labocenter**, laboratorio clínico y centro de diagnóstico por imágenes (Providencia y Rancagua, Chile). Una evolución completa del sitio actual: sitio público optimizado para SEO, portales de paciente y médico, y un dashboard administrativo integral.

> Este repositorio **no copia** el sitio existente; lo reemplaza con una plataforma moderna, accesible y de alto rendimiento. La auditoría que lo justifica está en [`docs/01-analisis-sitio-actual.md`](./docs/01-analisis-sitio-actual.md).

## Funcionalidades

Sitio público + SEO avanzado · buscador inteligente de exámenes · reservas online · agenda médica y de exámenes · portal del paciente · portal del médico · carga/descarga y verificación de resultados · pagos (preparado para Transbank) · notificaciones (correo activo; SMS/WhatsApp preparados) · panel de estadísticas · auditoría · gestión de usuarios, pacientes y catálogo · modo oscuro · WCAG AA · Lighthouse > 95.

## Stack

| Capa | Tecnologías |
|------|-------------|
| Frontend | React 19, Vite, TypeScript, TailwindCSS, Shadcn/UI, Framer Motion, React Query, React Router (SSR), React Hook Form, Zod |
| Backend | Node.js, Express, Prisma ORM, PostgreSQL |
| Auth | JWT + refresh tokens, RBAC |
| Infra | Docker, Nginx, GitHub Actions |
| Testing | Vitest, Playwright |
| Monorepo | pnpm workspaces + Turborepo |

## Documentación

El diseño completo (arquitectura, base de datos, API, rutas, auth, permisos, roadmap) está en [`docs/`](./docs). Empieza por el [índice](./docs/README.md).

## Estado

Fase de diseño completada. El desarrollo avanza por fases con validación entre cada una — ver [`docs/10-roadmap.md`](./docs/10-roadmap.md).

## Puesta en marcha (tras inicializar el monorepo)

```bash
pnpm install
cp .env.example .env      # configurar DATABASE_URL, JWT_SECRET, etc.
pnpm docker:up            # PostgreSQL
pnpm db:migrate && pnpm db:seed
pnpm dev                  # web + api
```
