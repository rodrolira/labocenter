# 10 · Roadmap por Fases

> Plan de ejecución incremental. **Regla de oro: no se avanza a la siguiente fase sin validar la anterior** (criterios de aceptación + CI verde).

Cada fase indica entregables, criterios de "terminado" (DoD) y qué hallazgos del [análisis](./01-analisis-sitio-actual.md) resuelve.

---

## Fase 0 — Fundaciones del monorepo
**Objetivo:** base técnica reproducible.

- pnpm workspaces + Turborepo; `packages/config` (tsconfig, eslint, prettier, tailwind preset).
- `apps/web` (Vite + React 19 + React Router framework mode) "hello world" con SSR.
- `apps/api` (Express + TS) con `/health`.
- `packages/contracts` (Zod) y `packages/ui` (Shadcn init, tokens, dark mode).
- Docker compose (postgres) + `.env.example`.
- GitHub Actions: lint + typecheck + test + build.

**DoD:** `pnpm dev` levanta web+api; CI verde; dark mode conmuta.

---

## Fase 1 — Base de datos y dominio
**Objetivo:** modelo de datos vivo.

- `schema.prisma` completo ([03](./03-base-de-datos.md)); primera migración.
- Seed: roles + permisos + admin + sucursales + servicios + exámenes de ejemplo.
- Repositorios base e infraestructura Prisma.

**DoD:** migración aplica en limpio; seed corre; tests de repos pasan.
**Resuelve:** ARQ-1 (plataforma propia), base de UI-1/UI-2 (datos como fuente de verdad).

---

## Fase 2 — Autenticación y permisos
**Objetivo:** identidad segura.

- JWT access + refresh rotativo con detección de reuse ([07](./07-autenticacion.md)).
- RBAC + middlewares + matriz de permisos ([08](./08-permisos.md)).
- Endpoints `/auth/*`; login/registro/recuperación en frontend (RHF + Zod).
- Guards de ruta y `useAuth`/`can`.

**DoD:** login/refresh/logout end-to-end; rutas protegidas; tests unit + e2e de auth.
**Resuelve:** ARQ-4 (seguridad), habilita portales.

---

## Fase 3 — Sitio público + SEO + Catálogo
**Objetivo:** reemplazo del sitio actual, mejor en todo.

- Layout público, Home, Servicios, Sucursales, Convenios, Contacto.
- Catálogo de exámenes + **buscador inteligente** con filtros (UX-1).
- Fichas de examen con preparación en pantalla (UX-4).
- SSR/SSG, Schema.org, OpenGraph, sitemap, robots (SEO-1..5).
- Formulario de contacto con correo (UX-5).

**DoD:** Lighthouse > 95 en las 4 categorías (público); WCAG AA verificado; contenido indexable.
**Resuelve:** UX-1/3/4/5/7, UI-1..5, A11Y-1..4, PERF-1..4, SEO-1..5, RES-1..3, BP-1/2.

---

## Fase 4 — Reservas y agenda
**Objetivo:** reservas online integradas.

- Disponibilidad por sucursal/box/profesional; bloques de agenda.
- Wizard de reserva (examen y hora médica); anti doble-reserva (409).
- Gestión de citas en admin/recepción (check-in, reprogramar, cancelar).

**DoD:** flujo de reserva e2e; no permite solapamientos; notificación de confirmación.
**Resuelve:** UX-2 (reservas dispersas), oportunidades 1.

---

## Fase 5 — Portales (paciente y médico)
**Objetivo:** experiencias autenticadas.

- Portal paciente: citas, perfil, preferencias, historial (lectura).
- Portal médico: agenda, pacientes, solicitar exámenes.

**DoD:** cada rol ve sólo lo suyo (ownership verificado); e2e por rol.
**Resuelve:** oportunidades 2 y 3.

---

## Fase 6 — Órdenes, resultados y verificación
**Objetivo:** ciclo clínico digital.

- Órdenes de examen; carga de resultados + archivos (tecnólogo médico).
- Validación/publicación; descarga firmada y auditada.
- Verificación pública de autenticidad por código (reemplaza `:8199`).

**DoD:** carga→validación→descarga e2e; accesos auditados; verificación pública funciona.
**Resuelve:** UX-2, ARQ-4, oportunidades 4.

---

## Fase 7 — Notificaciones, pagos, estadísticas, auditoría
**Objetivo:** plataforma operativa completa.

- Notificaciones por correo (activo); SMS/WhatsApp preparados (interfaz lista, sin proveedor).
- Pagos manuales + **interfaz Transbank preparada** (Webpay) sin activar.
- Panel de estadísticas (KPIs) y vista de auditoría/logs.

**DoD:** correos automáticos en eventos clave; pagos registrados; stats y auditoría visibles.
**Resuelve:** oportunidades 6, 7, 8.

---

## Fase 8 — Endurecimiento y entrega
**Objetivo:** calidad de producto premium.

- Cobertura de tests objetivo; E2E de flujos críticos en CI.
- Dockerfiles multi-stage + Nginx (TLS, compresión) + compose prod.
- GitHub Actions de deploy; migraciones automatizadas.
- Auditoría final Lighthouse/accesibilidad/seguridad; documentación de despliegue.

**DoD:** CI/CD completo; despliegue reproducible; auditorías superadas.

---

## Convención de validación entre fases

Antes de cerrar una fase:
1. ✅ Criterios DoD cumplidos.
2. ✅ `pnpm lint && pnpm typecheck && pnpm test` verdes.
3. ✅ E2E de la fase en verde.
4. ✅ Documentación de la fase actualizada.
5. ✅ Demo del flujo. Sólo entonces inicia la siguiente fase.
