# AGENTS.md

## Project Overview

Eclipse GLSP Playwright — a Playwright-based testing framework for GLSP (Graphical Language Server Platform) diagram editors. Supports Standalone, Theia, and VS Code integrations.

## Build & Development

-   **Package manager**: Yarn 1.x (classic) — do not use Yarn 2+/Berry or npm
-   **Build**: `yarn` from root installs and compiles everything

## Code Style Rules

-   **No direct sprotty imports** — never import from `sprotty` or `sprotty-protocol` directly; use `@eclipse-glsp/client` instead (enforced by ESLint)
-   **Floating promises** — `@typescript-eslint/no-floating-promises` is an error; always `await` or handle promises
-   **Path alias** — `~/` maps to `packages/glsp-playwright/src/` in TypeScript configs
