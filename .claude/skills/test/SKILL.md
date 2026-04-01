---
name: test
description: Run Playwright tests for a specific integration (standalone, theia, or vscode). Handles full environment setup including repo preparation and .env generation. Usage - /test standalone, /test theia, or /test vscode.
---

Run Playwright tests for the specified integration. Handles environment setup, compilation, and test execution.

## Usage

`$ARGUMENTS` should be one of: `standalone`, `theia`, `vscode`, or empty (defaults to standalone).
If `$ARGUMENTS` contains a specific test name pattern, run tests filtered by that pattern.

Optionally, the user may specify a version (branch or tag) for the GLSP repositories, e.g. `/test standalone v2.6.0` or `/test theia release_2.7.0`.
Extract the version from `$ARGUMENTS` if present (anything that is not an integration name or test pattern). If no version is specified, default to `master`.

## Steps

### 1. Environment Setup

Check if `examples/workflow-test/.env` exists. If not, run the setup script to prepare repositories and generate it:

```bash
bash .claude/skills/test/scripts/setup-env.sh --protocol https
```

If the user specified a version (branch or tag), add `--branch <version>`:

```bash
bash .claude/skills/test/scripts/setup-env.sh --protocol https --branch <version>
```

When no version is specified, omit `--branch` entirely so each repository uses its own default branch.

This script will:

-   Clone and build required GLSP repositories (via `yarn repo prepare`) at the specified branch/tag if the `repositories/` directory is missing or incomplete
-   Generate `examples/workflow-test/.env` with the correct values (server config, standalone URL, VSCode paths, etc.)

If the `.env` file already exists, skip this step.

### 2. Build

Ensure the project is compiled:

```bash
yarn build
```

### 3. Run Tests

Run the appropriate test command:

-   **standalone** (default): `yarn test:standalone`
-   **theia**: `yarn test:theia`
-   **vscode**: `yarn test:vscode`
-   **pattern match**: If `$ARGUMENTS` contains a specific test name pattern, run: `cd examples/workflow-test && yarn playwright test -g "$ARGUMENTS"`

For **theia** tests, the Theia server needs to be running. Start it before running tests:

```bash
yarn repo theia-integration start &
```

Wait a few seconds for it to start before running the tests.

### 4. Report Failures

If tests fail, read the Playwright HTML report or error output and summarize failures with actionable suggestions.
