import { type Config } from "@react-router/dev/config";

// SSR activado: las páginas públicas se renderizan en el servidor para
// SEO y mejor LCP (resuelve SEO-1..5 y PERF-4). Las zonas autenticadas
// se cargan en cliente (ver docs/05-rutas.md).
export default {
  ssr: true,
} satisfies Config;
