# Eclipse GLSP Playwright Changelog

## v2.6.0 - active

-   [po] Fix for changed icon of tool palette [#37](https://github.com/eclipse-glsp/glsp-playwright/pull/37)

### Changes

## [v2.5.0 - 10/09/2025](https://github.com/eclipse-glsp/glsp-playwright/releases/tag/v2.5.0)

### Changes

### Potentially breaking changes

-   [api] Fix selector for theia context menu integration [#30](https://github.com/eclipse-glsp/glsp-playwright/pull/28)
    -   Selector no longer works for Theia >= 1.60.0
-   [theia] Set Theia 1.64.0 and node 20 as new minimum versions [#32](https://github.com/eclipse-glsp/glsp-playwright/pull/32)

## [v2.4.0 - 04/04/2025](https://github.com/eclipse-glsp/glsp-playwright/releases/tag/v2.4.0)

### Changes

-   [api] Various improvements in async handling of page object to reduce test flakiness [#27](https://github.com/eclipse-glsp/glsp-playwright/pull/27)
-   [api] Bug fix for edge routing handle page object [#28](https://github.com/eclipse-glsp/glsp-playwright/pull/28)

## [v2.3.0 -18/02/2024](https://github.com/eclipse-glsp/glsp-playwright/releases/tag/v2.3.0)

### Changes

-   [example] Update workflow example tests to handle differences between the java and node server implementation accordingly [#22](https://github.com/eclipse-glsp/glsp-playwright/pull/22)
    -   New assertions:
        -   `toContainClass` - Checks if the element has the css class
        -   `toContainElement` - Checks if the graph contains the element
        -   `toBeSelected` - Checks that the element is selected
-   [example] Introduce/improve test cases for GLSP core functionality [#23](https://github.com/eclipse-glsp/glsp-playwright/pull/23)
-   Use playwright id selectors over plain # selectors [#25](https://github.com/eclipse-glsp/glsp-playwright/pull/25)

### Potentially Breaking Changes

-   Combine `get<ModelElement>BySelector` and `get<ModelElement>ByLocator` methods [#21](https://github.com/eclipse-glsp/glsp-playwright/pull/21)
    -   e.g. `getNodesBySelector`/`getNodesByLocator` -> `getNodes`

## [v2.2.1 - 23/07/2024](https://github.com/eclipse-glsp/glsp-playwright/releases/tag/v2.2.1)

### Changes

-   Make GLSP-Playwright more defensive (e.g., more information, checks, vscode-setup) [#7](https://github.com/eclipse-glsp/glsp-playwright/pull/7)
-   Introduce a page object to test context menu integrations [#9](https://github.com/eclipse-glsp/glsp-playwright/pull/9/)
-   Ensure that the `GLSPGraphLocator` can be used generically for any graph view representation [#10](https://github.com/eclipse-glsp/glsp-playwright/pull/10)
-   Add a page object for validation marker testing and introduce custom selection assertions for the `GLSPGraph` [#15](https://github.com/eclipse-glsp/glsp-playwright/pull/15)

## [v2.0.0 - 24/10/2023](https://github.com/eclipse-glsp/glsp-playwright/releases/tag/v2.0.0)

Inception of the GLSP Playwright project.
This project provides a Playwright-based page object framework for testing GLSP diagrams in different tool platform integration scenarios.
