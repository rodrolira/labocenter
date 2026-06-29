# 04 · Sistema de Componentes (Atomic Design + Shadcn)

> Design system reutilizable, accesible (WCAG AA) y con modo oscuro. Resuelve UI-3, UI-4, A11Y-1..4 del [análisis](./01-analisis-sitio-actual.md).

## 1. Principios

- **Atomic Design**: átomos → moléculas → organismos → plantillas → páginas.
- **Shadcn/UI** (sobre Radix) como base accesible: componentes copiados al repo, no caja negra → control total y bundle pequeño.
- **Tokens semánticos** (no colores crudos): `bg-background`, `text-foreground`, `text-primary`… para soportar dark mode sin reescribir.
- **Composición sobre configuración**: componentes pequeños y combinables (resuelve UI-3, "componentes completamente reutilizables").
- **Accesibilidad por defecto**: foco visible, roles ARIA, navegación por teclado, `prefers-reduced-motion`.

## 2. Capas de Atomic Design

```
packages/ui/src/
├─ tokens/         # design tokens (CSS vars) + tailwind preset
├─ atoms/          # Button, Input, Label, Badge, Icon, Spinner, Avatar...
├─ molecules/      # FormField, SearchBar, Card, Pagination, ThemeToggle...
├─ organisms/      # Navbar, Footer, ExamTable, AppointmentForm, DataTable...
└─ index.ts
apps/web/app/
├─ templates/      # PublicLayout, PortalLayout, DashboardLayout, AuthLayout
└─ routes/         # páginas (componen templates + organismos)
```

| Capa | Definición | Ejemplos |
|------|-----------|----------|
| **Átomos** | Elementos UI indivisibles, sin lógica de negocio. | `Button`, `Input`, `Badge`, `Spinner`, `Skeleton`. |
| **Moléculas** | Combinaciones simples reutilizables. | `FormField` (label+input+error), `SearchBar`, `StatCard`, `ThemeToggle`. |
| **Organismos** | Secciones complejas con varias moléculas. | `Navbar`, `Footer`, `ExamSearch`, `AppointmentWizard`, `ResultsTable`. |
| **Plantillas** | Layout/estructura sin datos reales. | `DashboardLayout` (sidebar+topbar), `PublicLayout`. |
| **Páginas** | Plantilla + datos reales (rutas). | `HomePage`, `ExamDetailPage`, `AdminDashboard`. |

## 3. Design tokens y theming

Tokens como variables CSS, mapeadas en el preset Tailwind compartido (`packages/config`). Dark mode con clase `.dark` (gestionado por `next-themes`), respetando preferencia del sistema.

```css
:root {
  --background: 0 0% 100%;
  --foreground: 222 47% 11%;
  --primary: 201 96% 32%;        /* azul clínico Labocenter */
  --primary-foreground: 0 0% 100%;
  --muted: 210 40% 96%;
  --destructive: 0 84% 60%;
  --ring: 201 96% 32%;
  --radius: 0.75rem;
}
.dark {
  --background: 222 47% 11%;
  --foreground: 210 40% 98%;
  --primary: 199 89% 48%;
  --muted: 217 33% 17%;
  /* ... */
}
```

> Paleta orientada a **confianza médica** (azules/teal), alto contraste AA, evitando rojos salvo para destructivo/errores.

## 4. Accesibilidad (objetivo WCAG 2.1 AA)

- **Jerarquía**: un único `<h1>` por página y orden correcto (resuelve A11Y-1).
- **Foco**: anillos `--ring` visibles; `:focus-visible`.
- **Teclado**: todos los interactivos operables; diálogos con focus trap (Radix).
- **Contraste**: pares token validados a ≥ 4.5:1 (texto) / 3:1 (UI).
- **Formularios**: `label` asociado, errores con `aria-describedby`, `aria-invalid`.
- **Imágenes**: `alt` significativo o `alt=""` decorativo (resuelve A11Y-3/4).
- **Movimiento**: animaciones Framer Motion desactivadas con `prefers-reduced-motion`.

## 5. Animaciones (Framer Motion)

- Microinteracciones discretas: entradas de sección, transiciones de página, feedback de botones.
- Siempre con `viewport once` y duraciones cortas; sin animar contenido crítico de lectura.
- Hook `useReducedMotion` para desactivar.

## 6. Estados estándar de componentes

Todo componente de datos define explícitamente (resuelve UX-6):

- **Loading** → `Skeleton`/`Spinner`.
- **Empty** → mensaje + acción sugerida.
- **Error** → mensaje claro + reintento.
- **Success/Data** → contenido.

## 7. Convenciones

- Componentes en PascalCase, un componente por archivo, export nombrado.
- Props tipadas; variantes con `cva` (class-variance-authority).
- Sin estilos inline salvo cálculos dinámicos; clases vía `cn()` (clsx + tailwind-merge).
- Documentación: cada componente del `packages/ui` lleva comentario de propósito, props y ejemplo de uso.

## 8. Componentes clave del dominio

| Componente | Resuelve |
|------------|----------|
| `ExamSearch` (autocompletado + filtros) | UX-1, PERF-3 (buscador inexistente). |
| `ExamCard` / `ExamDetail` (preparación en pantalla) | UX-4, SEO-4. |
| `AppointmentWizard` (reserva paso a paso) | UX-2 (reservas dispersas). |
| `ResultsList` + `ResultVerifier` | UX-2, ARQ-4 (verificación integrada HTTPS). |
| `BranchCard`/`BranchMap` (en página, no popup) | UX-3. |
| `ContactForm` (Zod + RHF) | UX-5. |
| `ThemeToggle` | UI-4 (dark mode). |

> Continúa en [05-rutas.md](./05-rutas.md).
