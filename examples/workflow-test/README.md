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

- [Node.js](https://nodejs.org/en/) `>=22`
- [pnpm](https://pnpm.io/installation) `>=11.6.0`

## Min versions

- [Standalone](https://github.com/eclipse-glsp/glsp-client): v2.1.1
- [Theia](https://github.com/eclipse-glsp/glsp-theia-integration): v2.1.1
- [VSCode](https://github.com/eclipse-glsp/glsp-vscode-integration): v2.1.1

Default installations:

- [VS Code IDE](https://code.visualstudio.com/updates/): 1.88.1

## Structure

- [./src](./src/): This folder provides the page objects necessary for the `Workflow Example`.
- [./tests](./tests/): The test cases are implemented in this folder. Every `GLSP-Playwright` feature has the respective test cases for demonstration purposes provided here.
- [playwright.config.ts](./playwright.config.ts): The Playwright configuration. More information is available in the [Playwright Documentation](https://playwright.dev/docs/test-configuration).

## Preparations

We use the [GLSP-Client](https://github.com/eclipse-glsp/glsp-client) repository to run the tests.
You can use `pnpm repo:setup` to automatically clone and build the required repositories and generate the `.env` file from `.env.example`.

### `pnpm repo:setup`

Clones and builds the necessary GLSP repositories into the `.repositories` directory and copies `.env.example` to `.env`.

**Integration flags** (if none is provided, all repositories are cloned):

| Flag           | Cloned Repositories                                          |
| -------------- | ------------------------------------------------------------ |
| `--standalone` | `glsp-client`, `glsp-server-node`                            |
| `--theia`      | `glsp-client`, `glsp-server-node`, `glsp-theia-integration`  |
| `--vscode`     | `glsp-client`, `glsp-server-node`, `glsp-vscode-integration` |
| _(none)_       | All of the above                                             |

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

Afterward, review the generated `.env` file in the `workflow-test` folder and provide the necessary data for the keys.
This file contains private information about your environment, so do not commit it.

## Building the examples

The example project has to be built using pnpm.
Simply execute the task `[Playwright] Build all` or the following command in the _root_ folder:

```bash
pnpm install
```

The different versions share the same server instance.
The server will be started automatically by Playwright.

## Testing the Standalone version

The test cases can be executed by executing the task `[Playwright] Test Standalone` or the following command in the _workflow-test_ folder:

```bash
pnpm test:standalone
```

## Testing the Standalone Browser version

The standalone browser variant runs the GLSP server as a web worker directly in the browser, without a separate server process.

The test cases can be executed by running the following command in the _workflow-test_ folder:

```bash
pnpm test:standalone-browser
```

## Testing the Theia version

The Theia instance will be started automatically by Playwright.

The test cases can be executed by executing the task `[Playwright] Test Theia` or the following command in the _workflow-test_ folder:

```bash
pnpm test:theia
```

## Testing the VS Code version

GLSP-Playwright will download and start the necessary VS Code instances automatically.

The user needs to provide the path of the `vsix` file in the `.env` file.
Then the test cases can be executed by executing the task `[Playwright] Test VS Code` or the following command in the _workflow-test_ folder:

```bash
pnpm test:vscode
```

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
Still, to provide more information, we offer util functions to extract additional context information. See the [debug tests](./tests/core/debug.standalone.spec.ts) for instructions on how to use them.

## More information

For more information, please visit the [Eclipse GLSP Umbrella repository](https://github.com/eclipse-glsp/glsp) and the [Eclipse GLSP Website](https://www.eclipse.org/glsp/).
If you have questions, please raise them in the [discussions](https://github.com/eclipse-glsp/glsp/discussions) and have a look at our [communication and support options](https://www.eclipse.org/glsp/contact/).
