import { index, route, type RouteConfig } from "@react-router/dev/routes";

// Rutas de la app. Públicas (SSR) + autenticación + portal protegido (CSR).
// El árbol completo (servicios, exámenes, admin) se añade en fases posteriores
// (ver docs/05-rutas.md).
export default [
  index("routes/home.tsx"),
  route("login", "routes/login.tsx"),
  route("registro", "routes/registro.tsx"),
  route("recuperar", "routes/recuperar.tsx"),
  route("restablecer/:token", "routes/restablecer.tsx"),
  route("portal", "routes/portal.tsx"),
] satisfies RouteConfig;
