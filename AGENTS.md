# Repository Guidelines

## Project Structure & Module Organization

This repository is a Yarn workspaces monorepo.

-   `packages/glsp-playwright/`: core library source (`src/`) and build output (`lib/`).
-   `examples/workflow-test/`: runnable Playwright example with page objects in `src/` and tests in `tests/`.
-   `docs/`: concept docs (`integration`, `extension`, `metadata`, and Playwright differences).
-   Root config files (`tsconfig.json`, `eslint.config.mjs`, `lerna.json`) define shared tooling.

Use `packages/*` for reusable framework code and `examples/*` for integration demos and test fixtures.

## Build, Test, and Development Commands

Run from repository root unless noted.

-   `yarn install`: install all workspace dependencies.
-   `yarn build`: compile TypeScript project references and rewrite path aliases.
-   `yarn lint`: run ESLint across the monorepo.
-   `yarn format` / `yarn format:check`: apply/check Prettier formatting.
-   `yarn test`: run example Playwright suite (`examples/workflow-test`).
-   `yarn test:standalone`, `yarn test:theia`, `yarn test:vscode`: run integration-specific test projects.
-   `yarn watch`: watch and rebuild TypeScript + alias output during development.

## Coding Style & Naming Conventions

-   Language: TypeScript (`.ts`), 4-space indentation (follow existing files).
-   Formatting: Prettier via `@eclipse-glsp/prettier-config`.
-   Linting: ESLint (`eslint.config.mjs`) with strict TypeScript rules (for example, no floating promises).
-   Naming patterns:
    -   Tests: `*.spec.ts` under `examples/workflow-test/tests/**`.
    -   Page objects/helpers: `*.po.ts`, `*.capability.ts`, `*.integration.ts`.
    -   Keep feature folders aligned with GLSP feature names (`tool-palette`, `validation`, `undo-redo`, etc.).

## Testing Guidelines

Tests use Playwright (`@playwright/test`) and run from compiled output (`examples/workflow-test/lib/tests`).

-   Build before testing when sources changed: `yarn build`.
-   Prefer targeted runs during development, then run `yarn test` before opening a PR.
-   Keep tests deterministic and cover standalone, Theia, and VS Code paths when relevant.

## Commit & Pull Request Guidelines

Commit history favors short, imperative subjects, often with issue IDs (example: `GLSP-1563: Update to node 20 and Theia 1.64.x`).

-   Reference related issue IDs in commit/PR text when available.
-   PRs should fill all template sections in `.github/PULL_REQUEST_TEMPLATE.md`:
    `What it does`, `How to test`, `Follow-ups`, and `Changelog` impact.
-   Do not disclose vulnerabilities in issues/PRs; follow `SECURITY.md`.
