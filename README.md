# Eclipse GLSP - Playwright [![CI](https://github.com/eclipse-glsp/glsp-playwright/actions/workflows/ci.yml/badge.svg)](https://github.com/eclipse-glsp/glsp-playwright/actions/workflows/ci.yml?branch=main)

> [!IMPORTANT]
> **This repository is deprecated and will be archived soon.**
> Development has moved to the consolidated [`glsp-core`](https://github.com/eclipse-glsp/glsp-core) monorepo.
> The `@eclipse-glsp/glsp-playwright` package has been **renamed to
> [`@eclipse-glsp/playwright`](https://www.npmjs.com/package/@eclipse-glsp/playwright)** and is developed and published from
> [`glsp-core/e2e/playwright`](https://github.com/eclipse-glsp/glsp-core/tree/main/e2e/playwright) starting with version `2.9.0`.
> The Theia and VS Code integration code has been **split out into separate packages**:
> [`@eclipse-glsp/playwright-theia`](https://www.npmjs.com/package/@eclipse-glsp/playwright-theia) (from
> [`glsp-theia-integration/e2e/playwright-theia`](https://github.com/eclipse-glsp/glsp-theia-integration/tree/master/e2e/playwright-theia))
> and [`@eclipse-glsp/playwright-vscode`](https://www.npmjs.com/package/@eclipse-glsp/playwright-vscode) (from
> [`glsp-vscode-integration/e2e/playwright-vscode`](https://github.com/eclipse-glsp/glsp-vscode-integration/tree/master/e2e/playwright-vscode)).
> Only the standalone integration remains part of `@eclipse-glsp/playwright`.
> Please report issues in the [GLSP umbrella repository](https://github.com/eclipse-glsp/glsp/issues) and open pull requests against `glsp-core`.

A Playwright-based framework for testing the [Graphical Language Server Platform (GLSP)](https://github.com/eclipse-glsp/glsp).

## Structure

- `@eclipse-glsp/glsp-playwright`: Generic Playwright testing framework (superseded by [`@eclipse-glsp/playwright`](https://www.npmjs.com/package/@eclipse-glsp/playwright) in [`glsp-core/e2e/playwright`](https://github.com/eclipse-glsp/glsp-core/tree/main/e2e/playwright))

## Developer Documentation

### First time setup

- Install [node.js](https://nodejs.org/) (requires Node v22+)
- Install pnpm: <https://pnpm.io/installation> (use pnpm 10+); a recent pnpm automatically switches to the version pinned in the `packageManager` field
- Clone this repository
- Install dependencies: `pnpm i` or `pnpm i --frozen-lockfile`

### Build & Testing

- Build (all packages): `pnpm build`
- Lint (all packages): `pnpm lint`
- Clean (all packages): `pnpm clean`
- Full validation: `pnpm check:all`

## Workflow Diagram Example

The workflow diagram is a consistent example provided by all GLSP components.
The example implements a simple flow chart diagram editor with different types of nodes and edges (see below).
The example can be used to try out different GLSP features, as well as several available integrations with IDE platforms (Theia, VS Code, Eclipse, Standalone).

The example test cases test the features provided by the GLSP client. The test cases in the [Workflow Example](https://github.com/eclipse-glsp/glsp-playwright/examples/workflow-test) demonstrate all supported features.

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

Once the setup is finished, follow the instructions to test the example in the [example folder](./examples/workflow-test/README.md).

### Tasks

The repository also provides build & watch tasks, so that you can build all packages with the task `Build all` or start watching all packages with `Watch all`.

## Documentation

We provide a [Documentation](./docs) for further information on the used concepts.
These concept docs have been moved to [`glsp-core/e2e/playwright/docs`](https://github.com/eclipse-glsp/glsp-core/tree/main/e2e/playwright/docs) and are maintained there.

## More information

For more information, please visit the [Eclipse GLSP Umbrella repository](https://github.com/eclipse-glsp/glsp) and the [Eclipse GLSP Website](https://www.eclipse.org/glsp/).
The successor of this repository is the consolidated [`glsp-core`](https://github.com/eclipse-glsp/glsp-core) monorepo.
If you have questions, please raise them in the [discussions](https://github.com/eclipse-glsp/glsp/discussions) and have a look at our [communication and support options](https://www.eclipse.org/glsp/contact/).
