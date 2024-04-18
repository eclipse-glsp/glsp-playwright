# Eclipse GLSP-Playwright Example

This package contains code examples that demonstrate how to test diagram editors using the [Graphical Language Server Platform (GLSP)](https://github.com/eclipse-glsp/glsp).

<details>
  <summary>Expand test list</summary>
  
| Feature                                                                              |      Standalone      | Theia Integration | Eclipse Integration | VS Code Integration |
| ------------------------------------------------------------------------------------ | :------------------: | :---------------: | :-----------------: | :-----------------: |
| Model Saving                                                                         |          -           |         -         |          -          |          -          |
| Model Dirty State                                                                    |                      |         -         |          -          |          -          |
| Model SVG Export                                                                     |          -           |         -         |          -          |          -          |
| Model Layout                                                                         |          -           |         -         |          -          |          -          |
| Restoring viewport on re-open                                                        |                      |         -         |                     |                     |
| Model Edit Modes<br>- Edit<br>- Read-only                                            |   <br>-<br>-&nbsp;   |    <br>-<br>-     |   <br>-<br>&nbsp;   |  <br>-<br>-&nbsp;   |
| Client View Port<br>- Center<br>- Fit to Screen                                      |      <br>-<br>-      |    <br>-<br>-     |     <br>-<br>-      |     <br>-<br>-      |
| Client Status Notification                                                           |          -           |         -         |          -          |          -          |
| Client Message Notification                                                          |          -           |         -         |                     |          -          |
| Client Progress Reporting                                                            |                      |         -         |                     |          -          |
| Element Selection                                                                    |          ✓           |         ✓         |          -          |          ✓          |
| Element Hover                                                                        |          ✓           |         ✓         |          -          |          ✓          |
| Element Validation                                                                   |          -           |         -         |          -          |          -          |
| Element Navigation                                                                   |                      |         -         |          -          |          -          |
| Element Type Hints                                                                   |          -           |         -         |          -          |          -          |
| Element Creation and Deletion                                                        |          -           |         -         |          -          |          -          |
| Node Change Bounds<br>- Move<br>- Resize                                             |      <br>-<br>-      |    <br>-<br>-     |     <br>-<br>-      |     <br>-<br>-      |
| Node Change Container                                                                |          -           |         -         |          -          |          -          |
| Edge Reconnect                                                                       |          -           |         -         |          -          |          -          |
| Edge Routing Points                                                                  |          -           |         -         |          -          |          -          |
| Ghost Elements                                                                       |          -           |         -         |          -          |          -          |
| Element Text Editing                                                                 |          -           |         -         |          -          |          -          |
| Clipboard (Cut, Copy, Paste)                                                         |          -           |         -         |          -          |          -          |
| Undo / Redo                                                                          |          -           |         -         |          -          |          -          |
| Contexts<br>- Context Menu<br>- Command Palette<br>- Tool Palette                    |    <br><br>-<br>-    |  <br>-<br>-<br>-  |   <br><br>-<br>-    |   <br>-<br>-<br>-   |
| Accessibility Features (experimental) <br>- Search<br>- Move <br>- Zoom <br>- Resize | <br>-<br>-<br>-<br>- |                   |                     |                     |
| Helper Lines (experimental)                                                          |          -           |         -         |          -          |          -          |
</details>

## Prerequisites

The following libraries/frameworks need to be installed on your system:

-   [Node.js](https://nodejs.org/en/) `>=16.11.0`
-   [Yarn](https://classic.yarnpkg.com/en/docs/install#debian-stable) `>=1.7.0`

## Min versions

-   [Standalone](https://github.com/eclipse-glsp/glsp-client): v2.1.1
-   [Theia](https://github.com/eclipse-glsp/glsp-theia-integration): v2.1.1
-   [VSCode](https://github.com/eclipse-glsp/glsp-vscode-integration): v2.1.1

Default installations:

-   [Bundled Workflow Server](https://www.npmjs.com/package/@eclipse-glsp-examples/workflow-server-bundled): v2.1.1
-   [VS Code IDE](https://code.visualstudio.com/updates/): 1.88.1

## Structure

-   [./src](./src/): This folder provides the page objects necessary for the `Workflow Example`.
-   [./tests](./tests/): The test cases are implemented in this folder. Every `GLSP-Playwright` feature has the respective test cases for demonstration purposes provided here.
-   [playwright.config.ts](./playwright.config.ts): The Playwright configuration. More information is available in the [Playwright Documentation](https://playwright.dev/docs/test-configuration).

## Preparations

We use the [GLSP-Client](https://github.com/eclipse-glsp/glsp-client) repository to run the tests.
Please clone it to your machine and follow the steps to install it.

Next, create a new `.env` file with the content of `.env.example` in the `workflow-test` folder.
This file contains private information about your environment, so do not commit it.
Afterward, provide for the keys in `.env` file the necessary data.

## Building the examples

The example project has to be built using yarn.
Simply execute the task `[Playwright] Build all` or the following command in the _root_ folder:

```bash
yarn
```

The different versions share the same server instance.
The server will be started automatically by Playwright.

## Testing the Standalone version

The test cases can be executed by executing the task `[Playwright] Test Standalone` or the following command in the _workflow-test_ folder:

```bash
yarn test:standalone
```

## Testing the Theia version

It is necessary to first start the Theia instance manually.

Afterward, the test cases can be executed by executing the task `[Playwright] Test Theia` or the following command in the _workflow-test_ folder:

```bash
yarn test:theia
```

## Testing the VS Code version

GLSP-Playwright will download and start the necessary VS Code instances automatically.

The user needs to provide the path of the `vsix` file in the `.env` file.
Then the test cases can be executed by executing the task `[Playwright] Test VS Code` or the following command in the _workflow-test_ folder:

```bash
yarn test:vscode
```

## Development

Use the `Watch All` task to rebuild the project automatically after doing changes.

> Note: The test files will be also rebuild.

## More information

For more information, please visit the [Eclipse GLSP Umbrella repository](https://github.com/eclipse-glsp/glsp) and the [Eclipse GLSP Website](https://www.eclipse.org/glsp/).
If you have questions, please raise them in the [discussions](https://github.com/eclipse-glsp/glsp/discussions) and have a look at our [communication and support options](https://www.eclipse.org/glsp/contact/).
