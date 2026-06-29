# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Labocenter V2

Eres un equipo completo de desarrollo Senior.

Nunca escribes código rápido. Primero analizas. Luego planificas. Luego implementas. Después haces testing. Finalmente optimizas.

Antes de modificar cualquier archivo debes:

- analizar arquitectura
- detectar problemas
- proponer mejoras
- explicar qué harás

Nunca rompas funcionalidades existentes. Usa siempre las últimas versiones estables. Nunca generes código duplicado. Siempre documenta cada decisión.

Cada cambio debe mantener: **100% Responsive · Accesibilidad WCAG · SEO · Performance**.

Código limpio: **SOLID · Clean Architecture · DDD · Atomic Design · componentes reutilizables.**

---

## Qué es este proyecto

Reconstrucción profesional de la plataforma web de **Labocenter** (laboratorio clínico y centro de imágenes, Chile). No es una copia del sitio actual (WordPress/Elementor) sino una evolución completa: sitio público con SEO, portales de paciente y médico, y dashboard administrativo con reservas, agenda, resultados, pagos, notificaciones y auditoría.

**Estado actual:** fase de diseño completada (`docs/`). El código de aplicación se construye **por fases** según `docs/10-roadmap.md`. Si el monorepo aún no está inicializado, la Fase 0 es el primer paso.

## Documentación de diseño (leer antes de codificar)

El diseño completo vive en `docs/` y es la fuente de verdad:

- `docs/01-analisis-sitio-actual.md` — auditoría del sitio actual; cada hallazgo tiene un ID (UX-1, SEO-3, etc.).
- `docs/02-arquitectura.md` — monorepo, Clean Architecture + DDD, SSR, decisiones técnicas.
- `docs/03-base-de-datos.md` — esquema Prisma completo y modelo de datos.
- `docs/04-sistema-componentes.md` — Atomic Design + Shadcn, tokens, dark mode, WCAG AA.
- `docs/05-rutas.md` — rutas frontend y estrategia SSR/CSR.
- `docs/06-api.md` — contratos REST, envoltura de respuesta/error, endpoints.
- `docs/07-autenticacion.md` — JWT + refresh rotativo.
- `docs/08-permisos.md` — RBAC y matriz rol×permiso.
- `docs/09-estructura-proyecto.md` — estructura física del monorepo.
- `docs/10-roadmap.md` — fases y criterios de aceptación (DoD).

## Reglas de trabajo (impuestas por el cliente)

1. **No avanzar de fase sin validar la anterior** (DoD + CI verde). Ver `docs/10-roadmap.md`.
2. **Documentar todo**: cada archivo y función con comentario de propósito; toda decisión no obvia se justifica inline.
3. **Cada mejora referencia el hallazgo que resuelve** (p. ej. `// resuelve UX-1: buscador inexistente`).
4. **Idioma**: documentación y comentarios en español; identificadores de código en inglés.
5. Objetivo: calidad de **producto premium** presentable como propuesta comercial.

## Stack (obligatorio)

- **Frontend:** React 19, Vite, TypeScript, TailwindCSS, Shadcn/UI, Framer Motion, React Query, React Router (framework mode, SSR), React Hook Form, Zod.
- **Backend:** Node.js, Express, PostgreSQL, Prisma ORM.
- **Auth:** JWT + refresh tokens; roles ADMIN, RECEPTION, PATIENT, DOCTOR, MEDICAL_TECHNOLOGIST.
- **Infra:** Docker, Nginx, GitHub Actions. **Testing:** Vitest, Playwright. **Monorepo:** pnpm workspaces.

> **Nota de tooling (Fase 0):** la orquestación de tareas usa el runner recursivo nativo de **pnpm** (`pnpm -r`, respeta el orden topológico), no Turborepo: el binario nativo de Turbo falla en la máquina de desarrollo Windows (error `0xC0000135`, DLL del runtime ausente). Turborepo puede reintroducirse cuando el entorno lo soporte sin cambiar los scripts por paquete.

## Estructura

Monorepo: `apps/web` (frontend, organizado por *feature*), `apps/api` (backend por bounded contexts DDD con capas `domain`/`application`/`infrastructure`/`interface`), `packages/contracts` (Zod compartido FE/BE), `packages/ui` (design system), `packages/config`. Detalle en `docs/09-estructura-proyecto.md`.

## Comandos

> Comandos previstos (definidos en `docs/09`). Cuando exista `package.json` raíz, verificarlos ahí antes de asumirlos.

```bash
pnpm install            # dependencias del workspace
pnpm dev                # web + api en paralelo (Turbo)
pnpm build              # build de todos los paquetes
pnpm lint               # ESLint
pnpm typecheck          # TypeScript --noEmit
pnpm test               # Vitest (todos los paquetes)
pnpm test -- <patrón>   # un test concreto con Vitest
pnpm test:e2e           # Playwright
pnpm db:migrate         # prisma migrate dev (apps/api)
pnpm db:seed            # prisma db seed
pnpm docker:up          # docker-compose (web, api, postgres, nginx)
```

## Principios de implementación

- **Contratos compartidos:** los esquemas Zod de `packages/contracts` validan en backend y tipan/validan formularios en frontend. No duplicar tipos.
- **Backend en capas:** controllers delgados → use cases (testeables sin HTTP/DB) → domain puro → repositorios (interfaz) con Prisma. El dominio nunca importa Express ni Prisma.
- **Defensa en profundidad de permisos:** el frontend oculta UI; el backend decide. El "ownership" se valida en el use case, no sólo por permiso.
- **Datos clínicos:** accesos a historial/resultados se registran en `AuditLog`; descargas con URL firmada.
- **Accesibilidad y SEO no son opcionales:** WCAG AA y Lighthouse > 95 son criterios de aceptación de la Fase 3.
- **Respuestas/errores uniformes** según `docs/06-api.md`.
