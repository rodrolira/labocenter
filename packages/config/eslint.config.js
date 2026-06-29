// Configuración ESLint base compartida (flat config, ESLint 9).
// Cada paquete la importa y, si necesita reglas extra (p. ej. React),
// las añade a este array. Centralizar evita divergencias de estilo.
import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";

/** Config base reutilizable por todo el workspace. */
export const baseConfig = tseslint.config(
  // Ignorados globales
  {
    ignores: [
      "**/dist/**",
      "**/build/**",
      "**/.react-router/**",
      "**/node_modules/**",
      "**/coverage/**",
      "**/*.config.{js,ts}",
    ],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: "module",
      globals: { ...globals.node },
    },
    rules: {
      // Permite argumentos/variables sin usar si empiezan con "_".
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
    },
  },
);

export default baseConfig;
