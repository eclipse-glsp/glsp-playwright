# Eclipse GLSP - Playwright

A Playwright-based framework for testing the [Graphical Language Server Platform (GLSP)](https://github.com/eclipse-glsp/glsp).

## Structure

-   `@eclipse-glsp/glsp-playwright`: Generic Playwright testing framework

## Building

This project is built with `yarn`.

## Workflow Diagram Example

The workflow diagram is a consistent example provided by all GLSP components. The example implements a simple flow chart diagram editor with different types of nodes and edges (see below).
The example can be used to try out different GLSP features, as well as several available integrations with IDE platforms (Theia, VSCode, Eclipse, Standalone).

The example test cases test the features provided by the GLSP client. The test cases in the [Workflow Example](https://github.com/eclipse-glsp/glsp-playwright/examples/workflow-test) demonstrate all supported features.

https://user-images.githubusercontent.com/588090/154459938-849ca684-11b3-472c-8a59-98ea6cb0b4c1.mp4

### How to test the Workflow Diagram example?

Clone this repository and build the packages:

```bash
yarn install
```

This command will also install Playwright and the necessary browsers.

Next, download a pre-built version of the Workflow Example diagram server by executing the task `Download server` or running the command:

```bash
cd examples/workflow-test
yarn download:server
```

Once the server has been downloaded, run the task `Test standalone` or the command `yarn test:standalone` in the root folder. Alternatively, the command `yarn test:standalone` in the `examples/workflow-test` folder can be also run.

### Tasks

The repository also provides build & watch tasks, so that you can build all packages with the task `Build all` or start watching all packages with `Watch all`.

## Documentation

We provide a [Documentation](./docs) for further information on the used concepts.

## More information

For more information, please visit the [Eclipse GLSP Umbrella repository](https://github.com/eclipse-glsp/glsp) and the [Eclipse GLSP Website](https://www.eclipse.org/glsp/).
If you have questions, please raise them in the [discussions](https://github.com/eclipse-glsp/glsp/discussions) and have a look at our [communication and support options](https://www.eclipse.org/glsp/contact/).
