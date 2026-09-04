# Eclipse GLSP-Playwright Example — VS Code

VS Code integration tests for the `Workflow Example`.

This package holds what is specific to VS Code:

- [./tests](./tests/): One registration of the complete reusable Workflow contract.
- [./tests/setup](./tests/setup/): The setup test that downloads VS Code and installs the extension
  under test. It runs as the `vscode-setup` project, which the `vscode` project depends on.
- [./configs](./configs/): The VS Code projects and the helpers that locate the packaged `vsix`.
- `./playwright/.storage`: Holds the path of the downloaded VS Code instance, written by the setup
  project and read by the tests.

The integration-agnostic test bodies live in
[`@eclipse-glsp/workflow`](../workflow/README.md). This package registers the aggregate
contract locally, so newly published suites run automatically. It explicitly disables two suites
that VS Code does not support: undo/redo through the keyboard and marker navigation.

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
