/**
 * Catálogo de permisos y matriz rol→permisos (RBAC).
 * Fuente única compartida por backend (seed y middleware de autorización)
 * y frontend (`can()` para mostrar/ocultar UI). Ver docs/08-permisos.md.
 */

/** Roles del sistema (espejo del enum RoleName de Prisma). */
export const ROLE_NAMES = [
  "ADMIN",
  "RECEPTION",
  "PATIENT",
  "DOCTOR",
  "MEDICAL_TECHNOLOGIST",
] as const;

export type RoleName = (typeof ROLE_NAMES)[number];

/** Todos los permisos del sistema, en formato "recurso:acción". */
export const PERMISSIONS = {
  USER_READ: "user:read",
  USER_MANAGE: "user:manage",
  ROLE_MANAGE: "role:manage",

  PATIENT_READ: "patient:read",
  PATIENT_MANAGE: "patient:manage",
  RECORD_READ: "record:read",
  RECORD_WRITE: "record:write",

  CATALOG_READ: "catalog:read",
  CATALOG_MANAGE: "catalog:manage",

  APPOINTMENT_CREATE: "appointment:create",
  APPOINTMENT_READ: "appointment:read",
  APPOINTMENT_MANAGE: "appointment:manage",

  SCHEDULE_READ: "schedule:read",
  SCHEDULE_MANAGE: "schedule:manage",

  ORDER_CREATE: "order:create",
  ORDER_READ: "order:read",
  ORDER_MANAGE: "order:manage",

  RESULT_UPLOAD: "result:upload",
  RESULT_VALIDATE: "result:validate",
  RESULT_READ: "result:read",

  PAYMENT_CREATE: "payment:create",
  PAYMENT_READ: "payment:read",
  PAYMENT_MANAGE: "payment:manage",

  NOTIFICATION_READ: "notification:read",
  NOTIFICATION_MANAGE: "notification:manage",

  STATS_READ: "stats:read",
  AUDIT_READ: "audit:read",
  SETTINGS_MANAGE: "settings:manage",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

/** Lista plana de todos los códigos de permiso. */
export const ALL_PERMISSIONS: PermissionCode[] = Object.values(PERMISSIONS);

const P = PERMISSIONS;

/**
 * Permisos por rol (matriz de docs/08). Las reglas de "propiedad" (un
 * paciente sólo accede a lo suyo) se verifican además en cada caso de uso.
 */
export const ROLE_PERMISSIONS: Record<RoleName, PermissionCode[]> = {
  ADMIN: [...ALL_PERMISSIONS],

  RECEPTION: [
    P.PATIENT_READ,
    P.PATIENT_MANAGE,
    P.CATALOG_READ,
    P.APPOINTMENT_CREATE,
    P.APPOINTMENT_READ,
    P.APPOINTMENT_MANAGE,
    P.SCHEDULE_READ,
    P.SCHEDULE_MANAGE,
    P.ORDER_CREATE,
    P.ORDER_READ,
    P.RESULT_READ,
    P.PAYMENT_CREATE,
    P.PAYMENT_READ,
  ],

  MEDICAL_TECHNOLOGIST: [
    P.PATIENT_READ,
    P.RECORD_READ,
    P.RECORD_WRITE,
    P.CATALOG_READ,
    P.ORDER_READ,
    P.RESULT_UPLOAD,
    P.RESULT_VALIDATE,
    P.RESULT_READ,
  ],

  DOCTOR: [
    P.PATIENT_READ,
    P.RECORD_READ,
    P.RECORD_WRITE,
    P.CATALOG_READ,
    P.APPOINTMENT_CREATE,
    P.ORDER_CREATE,
    P.ORDER_READ,
    P.RESULT_READ,
  ],

  PATIENT: [
    P.CATALOG_READ,
    P.APPOINTMENT_CREATE,
    P.APPOINTMENT_READ,
    P.ORDER_READ,
    P.RESULT_READ,
    P.PAYMENT_READ,
  ],
};
