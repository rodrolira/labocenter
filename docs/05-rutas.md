# 05 · Diseño de Rutas (Frontend)

> Mapa de rutas de `apps/web` (React Router framework mode). SSR para público, CSR para zonas autenticadas. URLs semánticas (resuelve SEO-5, UX-3).

## 1. Estrategia de renderizado por zona

| Zona | Render | Por qué |
|------|--------|---------|
| Público (marketing, catálogo, fichas) | **SSR/SSG** | SEO + LCP (SEO-1..5, PERF-4). |
| Autenticación (`/login`, etc.) | SSR mínimo | Rápido, sin datos sensibles. |
| Portales (paciente/médico) | **CSR** tras login | Datos privados, no indexables. |
| Dashboard admin | **CSR** | App interna, code-split. |

## 2. Rutas públicas (SSR)

| Ruta | Página | Notas SEO |
|------|--------|-----------|
| `/` | Home | Schema.org `MedicalBusiness`, OG. |
| `/servicios` | Listado de servicios por división | Indexable (resuelve UI-1/UX-3). |
| `/servicios/:slug` | Detalle de servicio | `MedicalProcedure`. |
| `/examenes` | Catálogo + **buscador inteligente** | Resuelve UX-1; filtros en query. |
| `/examenes/:slug` | Ficha de examen (preparación, entrega, precio ref.) | `MedicalTest` (resuelve UX-4, SEO-4). |
| `/sucursales` | Sucursales | `LocalBusiness` por sede. |
| `/sucursales/:slug` | Detalle de sucursal (mapa, horarios) | Resuelve UX-3. |
| `/convenios` | FONASA / Isapres | — |
| `/resultados` | Acceso/verificación de resultados | Reemplaza portal externo + `:8199`. |
| `/resultados/verificar/:code` | Verificación pública de autenticidad | `noindex`. |
| `/contacto` | Formulario de contacto | Resuelve UX-5. |
| `/blog`, `/blog/:slug` | Contenido SEO de salud (fase posterior) | `Article`. |
| `*` | 404 | — |

## 3. Autenticación

| Ruta | Página |
|------|--------|
| `/login` | Inicio de sesión |
| `/registro` | Registro de paciente |
| `/recuperar` | Solicitud de reset de contraseña |
| `/restablecer/:token` | Nueva contraseña |

## 4. Portal del Paciente (CSR, rol `PATIENT`)

Prefijo `/portal`:

| Ruta | Página |
|------|--------|
| `/portal` | Dashboard del paciente (próximas citas, resultados recientes) |
| `/portal/reservar` | **Wizard de reserva** (examen u hora médica) |
| `/portal/citas` | Mis citas (próximas/historial, cancelar) |
| `/portal/resultados` | Mis resultados (descarga) |
| `/portal/historial` | Historial clínico |
| `/portal/pagos` | Pagos y boletas |
| `/portal/perfil` | Datos personales y preferencias (tema, notificaciones) |

## 5. Portal del Médico (CSR, rol `DOCTOR`)

Prefijo `/medico`:

| Ruta | Página |
|------|--------|
| `/medico` | Dashboard del médico |
| `/medico/agenda` | Agenda propia |
| `/medico/pacientes` | Pacientes atendidos |
| `/medico/ordenes/nueva` | Solicitar exámenes |
| `/medico/resultados` | Resultados de sus pacientes |

## 6. Dashboard Administrativo (CSR)

Prefijo `/admin`. Acceso por permisos (ver [08-permisos.md](./08-permisos.md)); `ADMIN`, `RECEPTION` y `MEDICAL_TECHNOLOGIST` ven distintos módulos.

| Ruta | Módulo | Rol principal |
|------|--------|---------------|
| `/admin` | Resumen + KPIs | ADMIN |
| `/admin/agenda` | Agenda global (médica y exámenes) | RECEPTION |
| `/admin/reservas` | Gestión de citas | RECEPTION |
| `/admin/pacientes` | Gestión de pacientes | RECEPTION |
| `/admin/examenes` | Catálogo de exámenes/servicios | ADMIN |
| `/admin/resultados` | Carga/validación de resultados | MEDICAL_TECHNOLOGIST |
| `/admin/pagos` | Pagos | ADMIN |
| `/admin/usuarios` | Usuarios y roles | ADMIN |
| `/admin/notificaciones` | Plantillas y envíos | ADMIN |
| `/admin/estadisticas` | Panel de estadísticas | ADMIN |
| `/admin/auditoria` | Logs y auditoría | ADMIN |
| `/admin/configuracion` | Sucursales, convenios, ajustes | ADMIN |

## 7. Protección de rutas

- **Loader guard**: en framework mode, cada layout protegido valida sesión y permisos en el `loader`; si falta, redirige a `/login` (o 403).
- **Guard de permisos**: componente `<RequirePermission code="...">` y util `can(user, code)` para esconder/mostrar acciones.
- **Estado de auth**: access token en memoria + refresh por cookie; React Query revalida el `me`.

## 8. Convenciones de URL

- minúsculas, kebab-case, sin IDs visibles en público (usa `slug`).
- filtros del buscador como query params (`/examenes?q=perfil&fasting=true&cat=hormonas`) → compartible e indexable.
- breadcrumbs derivados de la jerarquía de rutas.

> Continúa en [06-api.md](./06-api.md).
