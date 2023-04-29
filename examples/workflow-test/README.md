# Eclipse GLSP-Playwright Example

This package contains code examples that demonstrate how to test diagram editors using the [Graphical Language Server Platform (GLSP)](https://github.com/eclipse-glsp/glsp).

## Prerequisites

The following libraries/frameworks need to be installed on your system:

-   [Node.js](https://nodejs.org/en/) `>=16.11.0`
-   [Yarn](https://classic.yarnpkg.com/en/docs/install#debian-stable) `>=1.7.0`
-   [Java](https://www.oracle.com/java/technologies/javase-jdk11-downloads.html) `>=11`

## Structure

-   [./scripts](./scripts/): Scripts for easier usage (i.e., downloading the server) are provided in this folder.

-   [./server](./server/): The configuration for the server is provided in this folder. The server will also be downloaded and executed from this folder.

-   [./src](./src/): This folder provides the page objects necessary for the `Workflow Example`.

-   [./tests](./tests/): The test cases are implemented in this folder. Every `GLSP-Playwright` feature has the respective test cases for demonstration purposes provided here.

-   [playwright.config.ts](./playwright.config.ts): The Playwright configuration. More information is available in the [Playwright Documentation](https://playwright.dev/docs/test-configuration).

## Preparations

We use the [GLSP-Client](https://github.com/eclipse-glsp/glsp-client) repository to run the tests. Please clone it to your machine and follow the steps to install it.

Next, create a new `.env` file with the content of `.env.example` in the `workflow-test` folder. This file contains private information about your environment, so do not commit it. Afterward, provide for the keys in `.env` file the necessary data, e.g.,

```env
STANDALONE_URL="file:///<path-to-the-glsp-client-folder>/glsp-client/examples/workflow-standalone/app/diagram.html"
GLSP_SERVER_PORT=8081
```

The `STANDALONE_URL` is the URL of the standalone version of the GLSP-Client. You should also be able to open it in the browser.

## Building the examples

The example project has to be built using yarn. Simply execute the task `Build all` or the following command in the _root_ folder:

```bash
yarn
```

Then download the server by executing the task `Download server` or the following command in the _workflow-test_ folder:

```bash
yarn download:server
```

## Running the examples

The test cases can be executed by executing the task `Test standalone` or the following command in the _workflow-test_ folder:

```bash
yarn test:standalone
```

## Development

Use the `Watch All` task to rebuild the project automatically after doing changes.

> Note: The test files will be also rebuild.

## More information

For more information, please visit the [Eclipse GLSP Umbrella repository](https://github.com/eclipse-glsp/glsp) and the [Eclipse GLSP Website](https://www.eclipse.org/glsp/).
If you have questions, please raise them in the [discussions](https://github.com/eclipse-glsp/glsp/discussions) and have a look at our [communication and support options](https://www.eclipse.org/glsp/contact/).
