import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
  resolve: {
    alias: {
      // Alias "~" → ./app, equivalente al "paths" del tsconfig pero
      // resuelto por Vite/Rollup en build y dev.
      "~": fileURLToPath(new URL("./app", import.meta.url)),
    },
  },
  server: {
    port: 5173,
  },
});
