# Eclipse GLSP - Playwright [![CI](https://github.com/eclipse-glsp/glsp-playwright/actions/workflows/ci.yml/badge.svg)](https://github.com/eclipse-glsp/glsp-playwright/actions/workflows/ci.yml?branch=main)

A Playwright-based framework for testing the [Graphical Language Server Platform (GLSP)](https://github.com/eclipse-glsp/glsp).

## Structure

The framework is split so that a consumer only installs the integration it tests:

-   `@eclipse-glsp/playwright`: Generic Playwright testing framework, including the standalone GLSP-Client integration
-   `@eclipse-glsp/playwright-theia`: Theia integration, adds `@theia/playwright`
-   `@eclipse-glsp/playwright-vscode`: VS Code integration, adds `@vscode/test-electron` and Electron

The Theia and VS Code packages depend on the core package but never on each other.

The `Workflow Example` mirrors that split across `examples/workflow` (shared page objects,
integration-agnostic tests, standalone projects), `examples/workflow-theia` and
`examples/workflow-vscode`.

## Developer Documentation

### First time setup

-   Install [node.js](https://nodejs.org/) (requires Node v22+)
-   Install pnpm: <https://pnpm.io/installation> (use pnpm 10+); a recent pnpm automatically switches to the version pinned in the `packageManager` field
-   Clone this repository
-   Install dependencies: `pnpm i` or `pnpm i --frozen-lockfile`

### Build & Testing

-   Build (all packages): `pnpm build`
-   Lint (all packages): `pnpm lint`
-   Clean (all packages): `pnpm clean`
-   Full validation: `pnpm check:all`

## Workflow Diagram Example

The workflow diagram is a consistent example provided by all GLSP components.
The example implements a simple flow chart diagram editor with different types of nodes and edges (see below).
The example can be used to try out different GLSP features, as well as several available integrations with IDE platforms (Theia, VS Code, Eclipse, Standalone).

The example test cases test the features provided by the GLSP client. The test cases in the [Workflow Example](https://github.com/eclipse-glsp/glsp-playwright/tree/main/examples/workflow) demonstrate all supported features.

https://user-images.githubusercontent.com/588090/154459938-849ca684-11b3-472c-8a59-98ea6cb0b4c1.mp4

### How to test the Workflow Diagram example?

Clone this repository and build the packages:

```bash
pnpm build
```

This command will also install Playwright and the necessary browsers.

Next, run the setup script to clone, build the required repositories and generate the `.env` file:

```bash
pnpm repo:setup
```

Once the setup is finished, follow the instructions to test the example in the [example folder](./examples/workflow/README.md).

### Tasks

The repository also provides build & watch tasks, so that you can build all packages with the task `Build all` or start watching all packages with `Watch all`.

## Documentation

We provide a [Documentation](./docs) for further information on the used concepts.

## More information

For more information, please visit the [Eclipse GLSP Umbrella repository](https://github.com/eclipse-glsp/glsp) and the [Eclipse GLSP Website](https://www.eclipse.org/glsp/).
If you have questions, please raise them in the [discussions](https://github.com/eclipse-glsp/glsp/discussions) and have a look at our [communication and support options](https://www.eclipse.org/glsp/contact/).
