---
description: Crea un commit con Conventional Commits a partir de los cambios staged
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git add:*), Bash(git commit:*)
---

Crea un commit siguiendo **Conventional Commits** (convención del proyecto, ver @docs/09-estructura-proyecto.md).

1. Revisa el estado y los cambios:
   - `git status`
   - `git diff --staged` (si no hay nada staged, muestra `git diff` y pregúntame qué incluir)
2. Resume qué cambió y por qué.
3. Redacta el mensaje con tipo apropiado: `feat`, `fix`, `docs`, `refactor`, `test`, `chore`, `style`, `perf`, `build`, `ci`.
   - Asunto en imperativo, conciso, en español.
   - Si el cambio resuelve un hallazgo del análisis, menciónalo en el cuerpo (`Resuelve UX-1`).
   - Si referencia una fase del roadmap, indícalo (`Fase 3`).
4. Crea el commit. No incluyas co-autoría ni firmas salvo que te lo pida.

Contexto extra: $ARGUMENTS
