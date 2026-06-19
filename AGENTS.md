# AGENTS.md

## Project Overview

Eclipse GLSP Playwright — a Playwright-based testing framework for GLSP (Graphical Language Server Platform) diagram editors. Supports Standalone, Theia, and VS Code integrations.

## Build & Development

- **Package manager**: pnpm (v11.6.0+) — do not use yarn or npm
- **Build**: `pnpm build` from root installs and compiles everything

## Code Style Rules

- **Floating promises** — `@typescript-eslint/no-floating-promises` is an error; always `await` or handle promises
- **Path alias** — `~/` maps to `packages/glsp-playwright/src/` in TypeScript configs
