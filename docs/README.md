# Documentación de Diseño — Labocenter V2

Fase de diseño previa al desarrollo. Leer en orden; cada documento enlaza con el siguiente.

| # | Documento | Contenido |
|---|-----------|-----------|
| 01 | [Análisis del sitio actual](./01-analisis-sitio-actual.md) | Auditoría: UX, UI, accesibilidad, rendimiento, SEO, arquitectura, responsive, malas prácticas y oportunidades. Cada hallazgo tiene un ID. |
| 02 | [Arquitectura](./02-arquitectura.md) | Monorepo, Clean Architecture + DDD, SSR, decisiones técnicas justificadas. |
| 03 | [Base de datos](./03-base-de-datos.md) | Modelo de datos y esquema Prisma completo. |
| 04 | [Sistema de componentes](./04-sistema-componentes.md) | Atomic Design, Shadcn, tokens, dark mode, WCAG AA. |
| 05 | [Rutas](./05-rutas.md) | Rutas frontend, SSR/CSR, protección. |
| 06 | [API](./06-api.md) | Contratos REST, respuestas/errores, endpoints. |
| 07 | [Autenticación](./07-autenticacion.md) | JWT + refresh tokens rotativos. |
| 08 | [Permisos](./08-permisos.md) | RBAC y matriz rol×permiso. |
| 09 | [Estructura del proyecto](./09-estructura-proyecto.md) | Organización física del monorepo. |
| 10 | [Roadmap](./10-roadmap.md) | Fases de desarrollo y criterios de aceptación. |

**Trazabilidad:** cada decisión de diseño y cada feature del roadmap referencia el/los ID(s) de hallazgo del documento 01 que resuelve.
