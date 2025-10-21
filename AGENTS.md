# Repository Guidelines

## Project Structure & Module Organization
This Next.js 15 app lives in `app/`; `app/components/` hosts reusable UI, `app/lib/` handles Zustand stores, hooks, and persistence, and `app/api/` contains Edge routes that stream Google Gemini responses and serve the model catalog. Dynamic conversations resolve under `app/c/[id]/`. `public/` stores static assets, `types/` centralizes shared typings, and `test/` holds HTML demos for reference.

## Build, Test, and Development Commands
Install dependencies with `pnpm install`. `pnpm dev` runs the Turbopack dev server at http://localhost:3000. Produce production bundles via `pnpm build` then `pnpm start`. Quality gates include `pnpm lint` for ESLint/Prettier and `pnpm type-check` for TypeScript. Run unit suites with `pnpm exec vitest run`; use `pnpm exec vitest --ui` while iterating.

## Coding Style & Naming Conventions
Write TypeScript throughout. Prettier enforces 2-space indentation, 100-character lines, and trailing commas; rely on editor format-on-save or `pnpm lint --fix`. ESLint extends `next/core-web-vitals` to cover accessibility. Name components and files in `app/components` with PascalCase, hooks in `app/lib` prefixed `use`, and keep route segments lowercase with hyphens. Prefix intentionally unused variables with `_` to satisfy the configured lint rule.

## Testing Guidelines
Place unit tests beside source as `*.test.ts(x)` or under `test/` when sharing HTML fixtures like `test/ui-message.html`. Use `@testing-library/react` plus `@testing-library/user-event` for interaction coverage and load `@testing-library/jest-dom` in a Vitest setup file. Focus on chat store reducers, sidebar state, and API adapters before snapshotting complex Markdown or KaTeX output.

## Commit & Pull Request Guidelines
Commit history favors short imperative subjects (e.g., `fix image viewer zoom`); keep them under 72 characters and add a body only when context is needed. Pull requests should outline behavior changes, flag affected routes, link issues, and include screenshots or GIFs for UI tweaks. Confirm `pnpm lint` and `pnpm type-check` before requesting review and call out new env vars such as `GOOGLE_GENERATIVE_AI_API_KEY`.

## Environment & Security Notes
Secrets belong in `.env.local`; never commit real keys from `.env*`. Edge routes expect `GOOGLE_GENERATIVE_AI_API_KEY`, so prefer sandbox keys while developing. Sanitize logs and PR text to remove chat transcripts or headers containing user metadata.
