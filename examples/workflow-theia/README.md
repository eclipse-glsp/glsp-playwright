# Eclipse GLSP-Playwright Example — Theia

Theia integration tests for the `Workflow Example`.

This package holds what is specific to Theia:

- [./tests](./tests/): One registration of the complete reusable Workflow contract plus tests that
  only apply to Theia. Its context-menu override demonstrates replacing the title and body of
  default cases.
- [./configs](./configs/): The Theia project and the web server that starts the Theia browser
  application.

The integration-agnostic test bodies live in
[`@eclipse-glsp/workflow`](../workflow/README.md). This package registers the aggregate
contract locally, so newly published suites run automatically and remain customizable.

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
