/**
 * Página de inicio (placeholder de Fase 0).
 * Demuestra el stack funcionando extremo a extremo: SSR, design system,
 * tokens y dark mode conmutable. En la Fase 3 se reemplaza por el home real.
 */
import { Button, buttonVariants, ThemeToggle } from "@labocenter/ui";
import { Link, type MetaFunction } from "react-router";
import { SITE, whatsappLink } from "~/lib/site";

export const meta: MetaFunction = () => [
  { title: `${SITE.name} — Plataforma (en construcción)` },
  { name: "description", content: SITE.description },
];

const STACK = [
  "React 19",
  "Vite",
  "TypeScript",
  "TailwindCSS v4",
  "Shadcn/UI",
  "React Router (SSR)",
  "React Query",
  "Zod",
  "Express",
  "Prisma",
  "PostgreSQL",
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-3xl flex-col gap-8 px-6 py-16">
      <header className="flex items-center justify-between">
        <span className="text-lg font-semibold text-primary">{SITE.name}</span>
        <div className="flex items-center gap-2">
          <Link to="/login" className={buttonVariants({ variant: "ghost", size: "sm" })}>
            Iniciar sesión
          </Link>
          <ThemeToggle />
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h1 className="text-balance text-4xl font-bold tracking-tight sm:text-5xl">
          Nueva plataforma de {SITE.name}
        </h1>
        <p className="text-pretty text-lg text-muted-foreground">
          {SITE.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button>Comenzar</Button>
          <a
            href={whatsappLink()}
            target="_blank"
            rel="noreferrer"
            className={buttonVariants({ variant: "outline" })}
          >
            Contactar por WhatsApp
          </a>
        </div>
      </section>

      <section className="rounded-lg border bg-card p-6 text-card-foreground">
        <h2 className="mb-3 text-sm font-medium text-muted-foreground">
          Fundaciones (Fase 0) — stack operativo
        </h2>
        <ul className="flex flex-wrap gap-2">
          {STACK.map((tech) => (
            <li
              key={tech}
              className="rounded-md bg-muted px-2.5 py-1 text-sm text-muted-foreground"
            >
              {tech}
            </li>
          ))}
        </ul>
      </section>
    </main>
  );
}
