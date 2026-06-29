---
description: Planifica e inicia una fase del roadmap (analiza → planifica → implementa)
argument-hint: "[número de fase, ej. 3]"
allowed-tools: Read, Glob, Grep, Edit, Write, Bash(pnpm *), Bash(git *)
---

Inicia el trabajo de la **Fase $1** del roadmap del proyecto.

Antes de escribir código, confirma que la fase anterior está validada (revisa con el mismo criterio que `/validar-fase`). Si no lo está, detente y avísame.

Luego:

1. Lee el alcance, entregables y DoD de la Fase $1 en @docs/10-roadmap.md.
2. Lee los documentos de diseño relevantes para esta fase (arquitectura, base de datos, API, rutas, componentes, auth o permisos según corresponda) en @docs/.
3. Presenta un **plan de implementación** detallado: archivos a crear/modificar, en qué orden, y qué hallazgo(s) del análisis resuelve cada pieza (referencia los IDs tipo `UX-1`, `SEO-3`).
4. Espera mi visto bueno del plan antes de implementar.
5. Implementa respetando las reglas de @CLAUDE.md: TypeScript estricto, contratos Zod compartidos, capas DDD en backend, Atomic Design en frontend, comentarios en español que justifiquen decisiones y referencien el hallazgo resuelto.

No avances más allá del alcance de la Fase $1.
