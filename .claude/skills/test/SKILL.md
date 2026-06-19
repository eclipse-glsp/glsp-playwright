---
name: test
description: Run Playwright tests for a specific integration (standalone, standalone-browser, theia, or vscode). Handles full environment setup including repo preparation and .env generation. Usage - /test standalone, /test theia, or /test vscode.
---

Run Playwright tests for the specified integration. Handles environment setup, compilation, and test execution.

## Usage

`$ARGUMENTS` should be one of: `standalone`, `standalone-browser`, `theia`, `vscode`, or empty (runs all integrations).
If `$ARGUMENTS` contains a specific test name pattern, run tests filtered by that pattern.

## Steps

### 1. Environment Setup

Always run the setup script unless the user explicitly says to skip it:

```bash
pnpm repo:setup
```

This will clone and build the required GLSP repositories and generate the `.env` file from `.env.example`.

### 2. Build

Ensure the project is compiled:

```bash
pnpm build
```

### 3. Run Tests

Run the appropriate test command:

- **all** (default, no argument): `pnpm test` (runs all integrations)
- **standalone**: `pnpm test:standalone`
- **standalone-browser**: `pnpm test:standalone-browser`
- **theia**: `pnpm test:theia`
- **vscode**: `pnpm test:vscode`
- **pattern match**: If `$ARGUMENTS` contains a specific test name pattern, run: `cd examples/workflow-test && pnpm playwright test -g "$ARGUMENTS"`

### 4. Report Failures

If tests fail, read the Playwright HTML report or error output and summarize failures with actionable suggestions.
