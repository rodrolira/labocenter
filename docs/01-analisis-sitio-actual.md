# 01 · Análisis del Sitio Actual (Auditoría)

> Auditoría del sitio de referencia **http://www.labocenter.cl/** (WordPress + Elementor).
> Objetivo: documentar de forma rigurosa cada problema detectado para justificar técnicamente la nueva plataforma. **No copiamos el sitio: lo superamos.**

## Resumen ejecutivo

Labocenter es un laboratorio clínico y centro de diagnóstico por imágenes chileno (Providencia y Rancagua), acreditado por la Superintendencia de Salud, FONASA Nivel 1 y convenios con Isapres. Es laboratorio de referencia para terceros.

El sitio actual está construido sobre **WordPress + Elementor** y, si bien comunica los servicios, presenta deficiencias graves y transversales que afectan a conversión, confianza, posicionamiento y mantenibilidad. La mayoría de las "funcionalidades" (resultados, reservas) son enlaces a sistemas externos heterogéneos, no una plataforma integrada.

| Severidad | Significado |
|-----------|-------------|
| 🔴 Crítico | Rompe funcionalidad, bloquea conversión o es un riesgo legal/seguridad |
| 🟠 Alto | Daña experiencia, SEO o confianza de forma notable |
| 🟡 Medio | Mejora recomendada con impacto moderado |
| ⚪ Bajo | Pulido / detalle |

---

## 1. Errores de UX (experiencia de usuario)

| # | Hallazgo | Sev. | Cómo lo resuelve la nueva plataforma |
|---|----------|------|--------------------------------------|
| UX-1 | **El buscador prometido no existe.** La página de Indicaciones de Exámenes invita a "Busca y revisa sus requerimientos" pero no hay caja de búsqueda; el usuario debe recorrer cientos de filas alfabéticas a mano. | 🔴 | Buscador inteligente con autocompletado, filtros por categoría, tiempo de entrega y preparación (instant search). |
| UX-2 | **Reservas y resultados son sistemas externos dispersos** (Dentalink para dental, portal de resultados aparte, verificación en `:8199`, hora médica externa). No hay un flujo unificado. | 🔴 | Plataforma única: reserva online, portal de paciente, descarga de resultados y verificación integrados. |
| UX-3 | **Información clave escondida en popups** (sucursales, detalle de servicios). Requiere clics y no es enlazable/compartible. | 🟠 | Páginas y secciones reales, con URLs propias y contenido indexable. |
| UX-4 | **Instrucciones de preparación en PDFs sueltos**, sólo para algunos exámenes; muchos muestran "-". El usuario descarga archivos en lugar de leer en pantalla. | 🟠 | Preparación como contenido estructurado en la ficha del examen, legible y accesible. |
| UX-5 | **Sin formulario de contacto real**, pese a existir ítem "Contacto"; todo deriva a teléfono/WhatsApp/correo. | 🟠 | Formularios validados (Zod + React Hook Form) con confirmación y correo automático. |
| UX-6 | **Sin estados claros** (carga, vacío, error) ni feedback en interacciones. | 🟡 | Estados de carga/vacío/error consistentes en todo el sistema. |
| UX-7 | **Doble menú idéntico** (escritorio y móvil) y navegación redundante. | 🟡 | Navegación única, responsive y accesible. |

## 2. Problemas de UI (interfaz)

| # | Hallazgo | Sev. | Resolución |
|---|----------|------|-----------|
| UI-1 | **Contenido duplicado**: la sección "División Apoyo y Laboratorio Clínico" aparece dos veces en Servicios. | 🟠 | Catálogo de servicios como fuente única de verdad en BD; imposible duplicar. |
| UI-2 | **Contenido intercambiado**: la descripción de "Consultas Médicas" habla de mamografía y viceversa. | 🟠 | Datos estructurados y revisables desde el panel de administración. |
| UI-3 | **Inconsistencia visual y de profundidad**: algunos servicios con listas exhaustivas de códigos, otros con prosa breve; jerarquía tipográfica irregular. | 🟡 | Design system con tokens, Atomic Design y componentes reutilizables. |
| UI-4 | **Sin modo oscuro** ni preferencias de tema. | 🟡 | Dark mode nativo con `next-themes` y tokens semánticos. |
| UI-5 | Dependencia de imágenes para texto/CTAs (p. ej. créditos, banners) en vez de HTML/CSS. | 🟡 | Texto real, accesible y traducible; imágenes sólo decorativas/optimizadas. |

## 3. Accesibilidad (WCAG)

| # | Hallazgo | Sev. | Resolución |
|---|----------|------|-----------|
| A11Y-1 | **Jerarquía de encabezados rota**: uso de `H5` para etiquetas de contacto, saltos de nivel. | 🟠 | Jerarquía semántica correcta (un solo `H1` por página, orden lógico). |
| A11Y-2 | **Contenido crítico tras JS (popups)** no operable por teclado/lectores de pantalla de forma fiable. | 🟠 | Componentes Radix/Shadcn accesibles (focus trap, ARIA, teclado). |
| A11Y-3 | Probables fallos de **contraste, foco visible y `alt` ausentes** (típico de plantillas Elementor). | 🟠 | Objetivo **WCAG 2.1 AA**: contraste AA, foco visible, `alt`, labels. |
| A11Y-4 | Enlaces "icono solo" sin texto accesible (celdas de PDF). | 🟡 | Enlaces con texto/`aria-label` descriptivo. |

## 4. Rendimiento

| # | Hallazgo | Sev. | Resolución |
|---|----------|------|-----------|
| PERF-1 | **Stack WordPress + Elementor**: exceso de CSS/JS, render-blocking, mucho DOM. | 🟠 | Vite + React 19, code-splitting, tree-shaking, CSS atómico (Tailwind). |
| PERF-2 | Imágenes pesadas sin formatos modernos ni `srcset`. | 🟠 | Imágenes responsive (AVIF/WebP), `loading="lazy"`, dimensiones explícitas. |
| PERF-3 | Tabla gigante de exámenes renderizada de una sola vez. | 🟡 | Paginación/virtualización + búsqueda en servidor. |
| PERF-4 | Sin SSR/SSG para contenido público; SEO depende del render de plugins. | 🟠 | SSR/SSG selectivo (React Router framework mode) para páginas públicas. |
| — | **Meta objetivo:** Lighthouse > 95 en Performance, Accessibility, Best Practices y SEO. | — | Presupuesto de rendimiento + auditoría en CI. |

## 5. SEO

| # | Hallazgo | Sev. | Resolución |
|---|----------|------|-----------|
| SEO-1 | **Títulos genéricos** ("Inicio - Labocenter", "Servicios - Labocenter") y meta descriptions ausentes. | 🟠 | `<title>`/meta por ruta, plantillas optimizadas. |
| SEO-2 | **Sin datos estructurados** (Schema.org `MedicalBusiness`, `MedicalClinic`, `MedicalTest`...). | 🟠 | JSON-LD Schema.org en páginas relevantes. |
| SEO-3 | **Sin Open Graph / Twitter Cards** verificables → mal compartido en redes. | 🟡 | OpenGraph + Twitter Cards por página. |
| SEO-4 | Contenido valioso (servicios, exámenes) **no indexable** por estar en popups/PDF. | 🟠 | Contenido en HTML server-rendered, indexable. |
| SEO-5 | Sin `sitemap.xml`/`robots.txt` evidentes ni URLs semánticas para fichas. | 🟡 | Sitemap dinámico, robots, URLs limpias (`/examenes/perfil-lipidico`). |

## 6. Arquitectura

| # | Hallazgo | Sev. | Resolución |
|---|----------|------|-----------|
| ARQ-1 | **Sin plataforma propia**: ecosistema de servicios externos (Dentalink, portal de resultados, verificación en puerto `:8199`) sin integración ni datos compartidos. | 🔴 | Backend propio (Express + Prisma + PostgreSQL) que centraliza dominio. |
| ARQ-2 | **Acoplado a WordPress/Elementor**: cambios dependen de plantilla y plugins, difícil de versionar/testear. | 🟠 | Monorepo versionado, CI/CD, testing automatizado. |
| ARQ-3 | Sin separación de capas, sin API documentada, sin contratos. | 🟠 | Clean Architecture + DDD + API REST versionada y documentada. |
| ARQ-4 | Verificación de exámenes sobre **HTTP en puerto no estándar** (riesgo de seguridad/confianza). | 🔴 | Todo bajo HTTPS, mismo dominio, detrás de Nginx. |

## 7. Responsive

| # | Hallazgo | Sev. | Resolución |
|---|----------|------|-----------|
| RES-1 | Doble markup (desktop/móvil) duplicado en lugar de diseño fluido. | 🟡 | Mobile-first con Tailwind, un solo árbol responsive. |
| RES-2 | Tablas anchas (exámenes) no adaptadas a móvil. | 🟠 | Tarjetas/listas adaptativas + scroll controlado en móvil. |
| RES-3 | Popups y banners no garantizan buen comportamiento táctil. | 🟡 | Componentes táctiles accesibles y testeados. |

## 8. Malas prácticas detectadas

| # | Hallazgo | Sev. | Resolución |
|---|----------|------|-----------|
| BP-1 | **Enlaces de WhatsApp malformados** (`[569][97716818]`, corchetes) que pueden romper el clic. | 🟠 | Enlaces `wa.me` correctos y centralizados en config. |
| BP-2 | Datos de negocio (teléfonos, direcciones, horarios) **hardcodeados y repetidos** en el markup. | 🟡 | Configuración única (BD/constantes) reutilizada. |
| BP-3 | Lógica de presentación mezclada con contenido vía popups de Elementor. | 🟡 | Separación contenido/datos/presentación. |
| BP-4 | Sin tests, sin tipado, sin pipeline. | 🟠 | TypeScript estricto, Vitest, Playwright, GitHub Actions. |

## 9. Oportunidades de mejora (más allá de corregir errores)

1. **Reserva online real** de exámenes y horas médicas, con agenda por sucursal, box y profesional.
2. **Portal del paciente**: historial clínico, resultados descargables, próximas citas, preparación personalizada.
3. **Portal del médico**: solicitud de exámenes, revisión de resultados de sus pacientes.
4. **Carga y entrega digital de resultados** con verificación de autenticidad integrada (reemplaza el `:8199`).
5. **Buscador inteligente** de exámenes con preparación, precio referencial FONASA/Isapre y tiempo de entrega.
6. **Pagos online** (preparado para Transbank Webpay).
7. **Notificaciones** por correo (activo) y SMS/WhatsApp (preparado para integración futura).
8. **Panel administrativo** con estadísticas, auditoría y gestión de pacientes/exámenes/agendas.
9. **Confianza y cumplimiento**: HTTPS, accesibilidad AA, datos clínicos protegidos, auditoría de accesos.
10. **Contenido SEO** (blog de salud, fichas de examen) que capte tráfico orgánico.

---

## Mapa de contenido a preservar (migración)

Estos datos del sitio actual se modelan en la nueva plataforma (no se copia el diseño, se reestructura la información):

- **Servicios** en 3 divisiones: Diagnóstica (Resonancia, Scanner/TAC, Mamografía, Radiología, Ecografías, Ecocardiograma), Procedimientos (Electrocardiograma, Holter), Apoyo/Laboratorio (Laboratorio Clínico, Histopatología, Odontología, Consultas Médicas).
- **Catálogo de exámenes** con nombre, tiempo de entrega e indicaciones/preparación.
- **Sucursales**: Providencia (José Manuel Infante 146) y Rancagua (Astorga 145).
- **Convenios**: FONASA Nivel 1, Isapres.
- **Contacto**: Call Center (2) 2611 2700, WhatsApp +569 9771 6818, correo call-center@labocenter.cl.

> Estas correcciones y oportunidades son la **justificación funcional** de cada módulo descrito en los documentos siguientes. Cada feature del roadmap referencia el/los ID(s) de hallazgo que resuelve.
