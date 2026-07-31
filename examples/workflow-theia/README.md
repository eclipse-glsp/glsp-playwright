# Eclipse GLSP-Playwright Example — Theia

Theia integration tests for the `Workflow Example`.

This package holds only what is specific to Theia:

-   [./tests](./tests/): Test cases that only apply to Theia, such as the context menu, which no
    other integration provides.
-   [./configs](./configs/): The Theia project and the web server that starts the Theia browser
    application.

The integration-agnostic test cases live in [`@eclipse-glsp/workflow-test`](../workflow/README.md) and
are reused by pointing this package's `theia` project at `../workflow/lib/tests`, so they exist
only once.

## Running

From the repository root:

```bash
pnpm repo:setup --theia   # clone and build glsp-theia-integration and the GLSP server
pnpm test:theia
```

Or from this folder, once the workspace is built:

```bash
pnpm test
```

Playwright starts the GLSP server and the Theia application automatically.

See the [shared example README](../workflow/README.md) for prerequisites, environment setup and
debugging.
