/**
 * Punto de entrada del design system. Se importa como `@labocenter/ui`.
 * Los estilos/tokens se importan aparte: `@labocenter/ui/styles.css`.
 */
export { cn } from "./lib/cn";
export { Button, buttonVariants, type ButtonProps } from "./atoms/button";
export {
  ThemeProvider,
  useTheme,
  themeInitScript,
  THEME_STORAGE_KEY,
  type Theme,
} from "./theme/theme-provider";
export { ThemeToggle } from "./theme/theme-toggle";
