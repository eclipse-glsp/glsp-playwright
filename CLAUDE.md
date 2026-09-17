# CLAUDE.md

> **DEPRECATED:** This repository is deprecated and will be archived soon. Active development happens in the consolidated [`glsp-core`](https://github.com/eclipse-glsp/glsp-core) monorepo (`e2e/playwright`, `e2e/workflow-e2e`); the Theia and VS Code integrations were split out into `@eclipse-glsp/playwright-theia` and `@eclipse-glsp/playwright-vscode`, which live in the `glsp-theia-integration` and `glsp-vscode-integration` repositories — do not implement changes here.

## Project Overview

Eclipse GLSP Playwright — a Playwright-based testing framework for GLSP (Graphical Language Server Platform) diagram editors. Supports Standalone, Theia, and VS Code integrations.

## Build & Development

- **Package manager**: pnpm (v11.6.0+) — do not use yarn or npm
- **Build**: `pnpm build` from root installs and compiles everything

## Validation

- After completing any code changes, always run the `/fix` skill before reporting completion. It enforces a build gate and auto-fixes lint/format/header issues; manually resolve anything it could not auto-fix (compile errors, remaining lint errors) and re-run it.

## Code Style Rules

- **Floating promises** — `@typescript-eslint/no-floating-promises` is an error; always `await` or handle promises
- **Path alias** — `~/` maps to `packages/glsp-playwright/src/` in TypeScript configs
