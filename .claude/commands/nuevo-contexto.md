---
description: Crea un bounded context (módulo) del backend con las 4 capas DDD
argument-hint: "[nombre del contexto, ej. scheduling]"
allowed-tools: Read, Glob, Write, Edit
---

Crea (o completa) el bounded context **$1** en `apps/api/src/modules/$1/` siguiendo la arquitectura DDD descrita en @docs/02-arquitectura.md y @docs/09-estructura-proyecto.md.

Estructura a generar:

- `domain/` — entidades y reglas de negocio puras (sin Express ni Prisma).
- `application/` — casos de uso (testeables sin HTTP/DB, dependen de interfaces de repositorio).
- `infrastructure/` — repositorios Prisma y servicios externos que implementan las interfaces del dominio.
- `interface/` — router Express + controllers delgados.

Requisitos:

1. Reutiliza los esquemas Zod de `packages/contracts` para validación de entrada y DTOs; si faltan, créalos ahí (no dupliques tipos).
2. Aplica los permisos correspondientes según @docs/08-permisos.md (middleware + verificación de ownership en el use case cuando aplique).
3. Respuestas y errores uniformes según @docs/06-api.md.
4. Cada archivo y función con comentario en español que explique su propósito; justifica decisiones no obvias.
5. Añade tests Vitest para los casos de uso (con repositorios mockeados).

Si el contexto necesita endpoints concretos, alinéalos con la sección correspondiente de @docs/06-api.md.
