---
description: Crea un componente siguiendo Atomic Design, accesible y con dark mode
argument-hint: "[atom|molecule|organism] [NombreComponente]"
allowed-tools: Read, Glob, Write, Edit
---

Crea el componente **$2** en la capa **$1** del design system, siguiendo @docs/04-sistema-componentes.md.

Ubicación:
- `atom` / `molecule` / `organism` → `packages/ui/src/$1s/`
- Si es específico de una feature, va en `apps/web/app/features/<feature>/` en su lugar (decídelo y justifícalo).

Requisitos:

1. **Accesibilidad WCAG AA**: roles/ARIA correctos, foco visible, operable por teclado, `label`/`alt` cuando aplique.
2. **Tokens semánticos** (`bg-background`, `text-foreground`, `text-primary`...), nunca colores crudos → soporta dark mode.
3. Variantes con `cva` y composición de clases con `cn()`.
4. Props tipadas en TypeScript; export nombrado; un componente por archivo.
5. Estados estándar cuando corresponda (loading / empty / error / data).
6. Animaciones con Framer Motion solo si aportan, respetando `prefers-reduced-motion`.
7. Comentario de propósito, descripción de props y ejemplo de uso.
8. Si resuelve un hallazgo del análisis, refiérelo (`// resuelve UX-4: ...`).

Reutiliza primitivas de Shadcn/Radix ya existentes en `packages/ui` antes de crear algo desde cero.
