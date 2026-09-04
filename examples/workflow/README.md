# Eclipse GLSP-Playwright Example

This package contains code examples that demonstrate how to test diagram editors using the [Graphical Language Server Platform (GLSP)](https://github.com/eclipse-glsp/glsp).

<details>
  <summary>Expand test list</summary>
  
| Feature                                                                              |      Standalone      | Theia Integration | VS Code Integration |
| ------------------------------------------------------------------------------------ | :------------------: | :---------------: | :-----------------: |
| Model Saving                                                                         |          -           |         -         |          -          |
| Model Dirty State                                                                    |                      |         -         |          -          |
| Model SVG Export                                                                     |          -           |         -         |          -          |
| Model Layout                                                                         |          -           |         -         |          -          |
| Restoring viewport on re-open                                                        |                      |         -         |                     |
| Model Edit Modes<br>- Edit<br>- Read-only                                            |   <br>-<br>-&nbsp;   |    <br>-<br>-     |  <br>-<br>-&nbsp;   |
| Client View Port<br>- Center<br>- Fit to Screen                                      |      <br>-<br>-      |    <br>-<br>-     |     <br>-<br>-      |
| Client Status Notification                                                           |          -           |         -         |          -          |
| Client Message Notification                                                          |          -           |         -         |          -          |
| Client Progress Reporting                                                            |                      |         -         |          -          |
| Element Selection                                                                    |          ✓           |         ✓         |          ✓          |
| Element Hover                                                                        |          ✓           |         ✓         |          ✓          |
| Element Validation                                                                   |          ✓           |         ✓         |          ✓          |
| Element Navigation                                                                   |          ✓           |         ✓         |          x          |
| Element Type Hints                                                                   |          ✓           |         ✓         |          ✓          |
| Element Creation and Deletion                                                        |          ✓           |         ✓         |          ✓          |
| Node Change Bounds<br>- Move<br>- Resize                                             |      <br>✓<br>✓      |    <br>✓<br>✓     |     <br>✓<br>✓      |
| Node Change Container                                                                |          -           |         -         |          -          |
| Edge Reconnect                                                                       |          ✓           |         ✓         |          ✓          |
| Edge Routing Points                                                                  |          ✓           |         ✓         |          ✓          |
| Ghost Elements                                                                       |          -           |         -         |          -          |
| Element Text Editing                                                                 |          ✓           |         ✓         |          ✓          |
| Clipboard (Cut, Copy, Paste)                                                         |          -           |         -         |          -          |
| Undo / Redo                                                                          |          ✓           |         ✓         |          x          |
| Contexts<br>- Context Menu<br>- Command Palette<br>- Tool Palette                    |    <br><br>-<br>-    |  <br>-<br>-<br>-  |   <br>-<br>-<br>-   |
| Accessibility Features (experimental) <br>- Search<br>- Move <br>- Zoom <br>- Resize | <br>-<br>-<br>-<br>- |                   |                     |
| Helper Lines (experimental)                                                          |          -           |         -         |          -          |

</details>

## Prerequisites

The following libraries/frameworks need to be installed on your system:

- [Node.js](https://nodejs.org/en/) `>=22.18`
- [pnpm](https://pnpm.io/installation) `>=11.6.0`

## Min versions

- [Standalone](https://github.com/eclipse-glsp/glsp-client): v2.1.1
- [Theia](https://github.com/eclipse-glsp/glsp-theia-integration): v2.1.1
- [VSCode](https://github.com/eclipse-glsp/glsp-vscode-integration): v2.1.1

Default installations:

- [VS Code IDE](https://code.visualstudio.com/updates/): 1.88.1

## Structure

The example is split across three packages, mirroring the framework packages:

| Package                    | Contents                                                                       |
| -------------------------- | ------------------------------------------------------------------------------ |
| `examples/workflow`        | Page objects, reusable test suites, and the standalone contract registration   |
| `examples/workflow-theia`  | Theia contract registration, configuration, and Theia-specific tests           |
| `examples/workflow-vscode` | VS Code contract registration, configuration, setup test, and the vsix helpers |

Within this package:

- [./src](./src/): The page objects and reusable test suites for the `Workflow Example`, exported
  through `src/index.ts` so that integration packages can reuse and customize them.
- [./tests](./tests/): The single entry point that registers the complete reusable contract for
  the standalone projects.
- [./configs](./configs/): The Playwright configuration, split into parts that are shared with the
  integration packages (`base.config.ts`, `env.ts`, `repos.ts`, `glsp-server.config.ts`) and the
  standalone specific ones.
- [playwright.config.ts](./playwright.config.ts): The Playwright configuration. More information is
  available in the [Playwright Documentation](https://playwright.dev/docs/test-configuration).

### Shared tests

The test bodies live in reusable suite factories under [./src/test/suites](./src/test/suites/).
Each test case has a stable identifier, allowing an integration to replace or extend individual
cases and to add integration-specific cases without copying the base implementation:

```ts
import { defineWorkflowSuites, test } from '@eclipse-glsp/workflow';

defineWorkflowSuites(test, {
    contextMenu: {
        replace: {
            open: {
                title: 'should open the native context menu',
                run: async ({ app }) => app.contextMenu.open()
            }
        }
    },
    markerNavigator: { skip: 'The integration has no support for marker navigation' }
});
```

The aggregate function is the integration contract. It registers every shared suite by default, so
updating `@eclipse-glsp/workflow` automatically includes newly published suites. Integrations
only configure case-level differences and mark unsupported suites with a `skip` reason so they
remain visible in test discovery and reports.
Playwright still executes a local test entry point; integration repositories do not load compiled
spec files from the core package. The reusable suites depend only on `@eclipse-glsp/playwright`, so
they do not couple the core package to Theia or VS Code.

Replaced cases keep the source location of their declaration in the shared suite factory. Report
links and IDE navigation therefore open the shared registration rather than the
integration-specific replacement body. This is an intentional consequence of retaining stable,
per-case Playwright locations.

## Preparations

We use the GLSP repositories to run the tests.
Run `pnpm repo:setup` from the repository root to clone and build the required repositories and
create the shared `.env` file when it does not exist.

### `pnpm repo:setup`

Clones and builds the necessary GLSP repositories into `examples/.repositories` and creates
`examples/.env` from `examples/.env.example` if needed. Existing settings in `.env` are preserved.
Both are shared by all three example packages, since the GLSP server is needed by every integration.
Set `GLSP_REPO_DIR` in the shell or `.env` to use a different directory; `pnpm repo`,
`pnpm repo:setup`, and `pnpm repo:clean` all honor it.

**Integration flags** (if none is provided, all repositories are cloned):

| Flag           | Cloned Repositories                           |
| -------------- | --------------------------------------------- |
| `--standalone` | `glsp-client`, `glsp-server-node`             |
| `--theia`      | `glsp-server-node`, `glsp-theia-integration`  |
| `--vscode`     | `glsp-server-node`, `glsp-vscode-integration` |
| _(none)_       | All of the above                              |

**Additional flags:**

- `--java` — Clone `glsp-server` (Java) instead of `glsp-server-node`
- `--skip-build` — Only clone repositories without building them

**Examples:**

```bash
# Clone and build everything (Node server)
pnpm repo:setup

# Set up only for Theia tests
pnpm repo:setup --theia

# Set up for VS Code tests with the Java server, skip building
pnpm repo:setup --vscode --java --skip-build
```

Afterward, review the generated `examples/.env` file and provide the necessary data for the keys.
This file contains private information about your environment, so do not commit it.

## Building the examples

The example project has to be built using pnpm.
Simply execute the task `[Playwright] Build all` or the following command in the _root_ folder:

```bash
pnpm build
```

Running `pnpm install` in the repository root also installs the Chromium browser used by the
Standalone and Theia tests.

The different versions share the same server instance.
The server will be started automatically by Playwright.

## Testing the Standalone version

The test cases can be executed by executing the task `[Playwright] Test Standalone` or the following command in the _workflow_ folder:

```bash
pnpm test:standalone
```

## Testing the Standalone Browser version

The standalone browser variant runs the GLSP server as a web worker directly in the browser, without a separate server process.

The test cases can be executed by running the following command in the _workflow_ folder:

```bash
pnpm test:standalone-browser
```

## Testing the Theia version

The Theia instance will be started automatically by Playwright.

The test cases can be executed by executing the task `[Playwright] Test Theia` or the following command in the _workflow-theia_ folder:

```bash
pnpm test
```

This runs the shared tests from this package plus the Theia specific ones.

## Testing the VS Code version

GLSP-Playwright will download and start the necessary VS Code instances automatically.

The test cases can be executed by executing the task `[Playwright] Test VS Code` or the following command in the _workflow-vscode_ folder:

```bash
pnpm test
```

This runs the `vscode-setup` project first, which downloads VS Code and installs the extension,
followed by the shared tests from this package.

## Development

Use the `Watch All` task to rebuild the project automatically after doing changes.

> Note: The test files will be also rebuild.

## Debugging

1. Read the [Playwright Debug Documentation](https://playwright.dev/docs/debug).
2. Install the VSCode Playwright Extension.

### Live Debugging

- Read the [Live Debugging Documentation](https://playwright.dev/docs/debug#live-debugging)
- You can get the locator of a specific page object or a `GLSPLocator` by using the `.locate()` method:

```ts
const locator = task.locate();
```

- Click on the locator variable to highlight it within the browser

### Extractors

Using the powerful debugger coming with `Playwright` is the recommended way to debug the test cases.
Still, to provide more information, we offer utility functions to extract additional context. See
the [debug suite](./src/test/suites/core/debug.standalone.suite.ts) for examples and usage notes.

## More information

For more information, please visit the [Eclipse GLSP Umbrella repository](https://github.com/eclipse-glsp/glsp) and the [Eclipse GLSP Website](https://www.eclipse.org/glsp/).
If you have questions, please raise them in the [discussions](https://github.com/eclipse-glsp/glsp/discussions) and have a look at our [communication and support options](https://www.eclipse.org/glsp/contact/).
