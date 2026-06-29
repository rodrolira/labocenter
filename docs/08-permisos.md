# 08 · Sistema de Permisos (RBAC)

> Control de acceso basado en roles y permisos granulares `recurso:acción`. Soporta los 5 roles exigidos.

## 1. Modelo

- **Role** ↔ **Permission** (N:M vía `RolePermission`).
- Un `User` tiene **un** `Role`; el rol agrupa permisos.
- Permiso = string `recurso:acción` (p. ej. `appointment:create`). Granular y combinable.
- Ventaja sobre "rol hardcodeado": se pueden ajustar permisos por rol sin tocar código.

## 2. Roles

| Rol | Descripción |
|-----|-------------|
| `ADMIN` | Acceso total: configuración, usuarios, estadísticas, auditoría. |
| `RECEPTION` | Agenda, reservas, pacientes, check-in. |
| `MEDICAL_TECHNOLOGIST` | Carga y validación de resultados de laboratorio. |
| `DOCTOR` | Sus pacientes, solicitud de exámenes, resultados de sus órdenes. |
| `PATIENT` | Sus propios datos: reservas, resultados, historial, pagos. |

## 3. Catálogo de permisos (semilla)

```
# Identidad
user:read        user:manage        role:manage

# Pacientes / historial
patient:read     patient:manage     record:read     record:write

# Catálogo
catalog:read     catalog:manage

# Agenda y reservas
appointment:create   appointment:read   appointment:manage
schedule:read        schedule:manage

# Órdenes y resultados
order:create     order:read     order:manage
result:upload    result:validate result:read

# Pagos
payment:create   payment:read   payment:manage

# Notificaciones / sistema
notification:read  notification:manage
stats:read       audit:read     settings:manage
```

## 4. Matriz Rol × Permiso (resumen)

| Permiso | ADMIN | RECEPTION | MED_TECH | DOCTOR | PATIENT |
|---------|:----:|:---------:|:--------:|:------:|:-------:|
| user / role :manage | ✅ | | | | |
| patient:read | ✅ | ✅ | ✅ | ✅¹ | propio |
| patient:manage | ✅ | ✅ | | | propio² |
| record:read | ✅ | | ✅ | ✅¹ | propio |
| record:write | ✅ | | ✅ | ✅ | |
| catalog:read | ✅ | ✅ | ✅ | ✅ | ✅ |
| catalog:manage | ✅ | | | | |
| appointment:create | ✅ | ✅ | | ✅ | ✅ |
| appointment:manage | ✅ | ✅ | | | propio³ |
| schedule:manage | ✅ | ✅ | | | |
| order:create | ✅ | ✅ | | ✅ | |
| order:read | ✅ | ✅ | ✅ | propio¹ | propio |
| result:upload | ✅ | | ✅ | | |
| result:validate | ✅ | | ✅ | | |
| result:read | ✅ | ✅ | ✅ | propio¹ | propio |
| payment:* | ✅ | create/read | | | propio |
| stats:read | ✅ | | | | |
| audit:read | ✅ | | | | |
| settings:manage | ✅ | | | | |

> ¹ "propio" para médico = pacientes/órdenes donde es el médico solicitante.
> ² El paciente edita su propio perfil, no el de otros.
> ³ El paciente sólo cancela/reprograma **sus** citas.

## 5. Aplicación (enforcement)

### Backend
- Middleware `requirePermission('result:validate')` lee permisos del JWT.
- Para reglas "propio/ownership", el **use case** verifica que el recurso pertenece al actor (no basta el permiso). Ej.: un paciente con `result:read` sólo accede a `Result` de sus `Order`.
- Toda verificación que toca datos clínicos deja registro en `AuditLog`.

### Frontend
- `can(user, 'catalog:manage')` para mostrar/ocultar UI.
- `<RequirePermission code="...">` envuelve secciones/acciones.
- Guards en loaders de rutas `/admin`, `/medico`, `/portal` (ver [05-rutas.md](./05-rutas.md)).
- **Defensa en profundidad**: el frontend oculta, el backend **decide**. Nunca se confía sólo en el cliente.

## 6. Evolución

- Permisos en BD permiten crear sub-roles o ajustar sin redeploy.
- Posible futuro: permisos por sucursal (scoping multi-sede) añadiendo `branchId` al check.

> Continúa en [09-estructura-proyecto.md](./09-estructura-proyecto.md).
