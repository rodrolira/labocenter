---
description: Valida el "Definition of Done" de una fase del roadmap antes de avanzar
argument-hint: "[número de fase, ej. 2]"
allowed-tools: Bash(pnpm *), Read, Glob, Grep
---

Valida que la **Fase $1** del roadmap esté realmente terminada antes de avanzar.

Sigue estrictamente la regla del proyecto: **no se avanza de fase sin validar la anterior.**

Pasos:

1. Lee los criterios de aceptación (DoD) de la Fase $1 en @docs/10-roadmap.md.
2. Verifica calidad ejecutando (si el monorepo ya existe):
   - `pnpm lint`
   - `pnpm typecheck`
   - `pnpm test`
   - `pnpm test:e2e` (solo si la fase tiene flujos E2E)
3. Comprueba que los entregables concretos de la fase existen en el repo (archivos, módulos, migraciones, rutas).
4. Verifica que los hallazgos del análisis (IDs en @docs/01-analisis-sitio-actual.md) que la fase debía resolver están efectivamente cubiertos.
5. Confirma que la documentación de la fase está actualizada.

Entrega un **informe de validación** con: ✅/❌ por cada criterio DoD, salida resumida de los checks, hallazgos resueltos, y un veredicto final: **"Fase $1 LISTA para cerrar"** o **"Fase $1 INCOMPLETA"** con la lista exacta de lo que falta. No marques la fase como terminada si algún check falla.
