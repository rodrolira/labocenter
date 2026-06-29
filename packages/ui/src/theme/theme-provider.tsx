/**
 * ThemeProvider — gestión de modo claro/oscuro (resuelve UI-4).
 * Mantiene el tema en estado, lo persiste en localStorage y aplica/quita
 * la clase `.dark` en <html>. Diseñado para SSR: el estado inicial llega
 * por prop desde el servidor y un script en <head> evita el parpadeo (FOUC).
 */
import * as React from "react";

export type Theme = "light" | "dark";

interface ThemeContextValue {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  toggleTheme: () => void;
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null);

/** Clave de almacenamiento compartida con el script anti-parpadeo. */
export const THEME_STORAGE_KEY = "labocenter-theme";

export function ThemeProvider({
  children,
  defaultTheme = "light",
}: {
  children: React.ReactNode;
  defaultTheme?: Theme;
}) {
  // Inicialización perezosa: en cliente toma la decisión real (localStorage o
  // preferencia del sistema) para coincidir con el script anti-parpadeo y no
  // provocar mismatch de hidratación; en servidor usa el valor por defecto.
  const [theme, setThemeState] = React.useState<Theme>(() => {
    if (typeof window === "undefined") return defaultTheme;
    try {
      const stored = window.localStorage.getItem(THEME_STORAGE_KEY);
      if (stored === "light" || stored === "dark") return stored;
    } catch {
      // localStorage no disponible; se cae al cálculo por preferencia.
    }
    return window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  // Sincroniza la clase del documento y persiste la preferencia.
  React.useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle("dark", theme === "dark");
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // localStorage puede no estar disponible (modo privado); se ignora.
    }
  }, [theme]);

  const value = React.useMemo<ThemeContextValue>(
    () => ({
      theme,
      setTheme: setThemeState,
      toggleTheme: () => setThemeState((t) => (t === "dark" ? "light" : "dark")),
    }),
    [theme],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme(): ThemeContextValue {
  const ctx = React.useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme debe usarse dentro de <ThemeProvider>");
  return ctx;
}

/**
 * Script que se inyecta en <head> para fijar el tema ANTES de pintar,
 * evitando el flash de tema incorrecto durante la hidratación SSR.
 */
export const themeInitScript = `
(function () {
  try {
    var stored = localStorage.getItem("${THEME_STORAGE_KEY}");
    var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    var theme = stored || (prefersDark ? "dark" : "light");
    if (theme === "dark") document.documentElement.classList.add("dark");
  } catch (e) {}
})();
`;
