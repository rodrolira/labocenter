/**
 * Documento raíz de la aplicación (React Router framework mode).
 * - `Layout` define el <html> y la estructura del documento.
 * - Inyecta el script anti-parpadeo de tema en <head> (antes de hidratar).
 * - Envuelve la app con ThemeProvider para el modo claro/oscuro.
 */
import { ThemeProvider, themeInitScript } from "@labocenter/ui";
import { type ReactNode } from "react";
import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  type LinksFunction,
} from "react-router";
import stylesheet from "./app.css?url";

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: stylesheet },
];

export function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
        {/* Fija el tema antes del primer pintado para evitar FOUC. */}
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <Outlet />
    </ThemeProvider>
  );
}
