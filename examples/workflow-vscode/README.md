# Eclipse GLSP-Playwright Example — VS Code

VS Code integration tests for the `Workflow Example`.

This package holds only what is specific to VS Code:

-   [./tests/setup](./tests/setup/): The setup test that downloads VS Code and installs the extension
    under test. It runs as the `vscode-setup` project, which the `vscode` project depends on.
-   [./configs](./configs/): The VS Code projects and the helpers that locate the packaged `vsix`.
-   `./playwright/.storage`: Holds the path of the downloaded VS Code instance, written by the setup
    project and read by the tests.

The integration-agnostic test cases live in [`@eclipse-glsp/workflow-test`](../workflow/README.md) and
are reused by pointing this package's `vscode` project at `../workflow/lib/tests`, so they exist
only once. Two of them are excluded because VS Code does not support the feature: undo/redo through
the keyboard and marker navigation.

## Running

From the repository root:

```bash
pnpm repo:setup --vscode   # clone and build glsp-vscode-integration, the GLSP server, and package the vsix
pnpm test:vscode
```

Or from this folder, once the workspace is built:

```bash
pnpm test
```

GLSP-Playwright downloads and starts the necessary VS Code instances automatically; the download is
cached in `.vscode-test`. Set `VSCODE_VERSION` in `examples/.env` to pin a different version.

See the [shared example README](../workflow/README.md) for prerequisites, environment setup and
debugging.
