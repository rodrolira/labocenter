import { defineConfig } from "vitest/config";

// Configuración de Vitest aislada de la de Vite/React Router para evitar
// que el plugin de RR intervenga en los tests unitarios.
export default defineConfig({
  test: {
    environment: "node",
    include: ["app/**/*.test.{ts,tsx}"],
  },
});
