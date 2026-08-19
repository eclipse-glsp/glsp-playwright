# Eclipse GLSP Playwright Changelog

## v2.8.0 - active

### Changes

-   [framework] Split the framework into `@eclipse-glsp/playwright`, `@eclipse-glsp/playwright-theia` and `@eclipse-glsp/playwright-vscode`, so that testing one tool platform no longer pulls in the others. The Theia and VS Code packages depend on the core package but never on each other.
-   [framework] `IntegrationType` and `IntegrationOptions` are now extensible: an integration in any package contributes itself by merging into the global `GLSPPlaywright.IntegrationOptionsMap` interface.
-   [framework] Added the `MarkerNavigatorIntegration` and `UndoRedoIntegration` capability interfaces, so an integration contributes its own key bindings instead of the framework hardcoding them per platform.
-   [example] Split the `Workflow Example` into `examples/workflow`, `examples/workflow-theia` and `examples/workflow-vscode`. The integration-agnostic tests live in `examples/workflow` and are reused by the other two rather than duplicated.
-   [example] `.repositories` and `.env` moved to `examples/` and are shared by all three example packages. `GLSP_REPO_DIR` is now honoured by `pnpm repo:setup`, which previously ignored it.

### Potentially Breaking Changes

-   [framework] The core package was renamed from `@eclipse-glsp/glsp-playwright` to `@eclipse-glsp/playwright`. Testing Theia or VS Code additionally requires `@eclipse-glsp/playwright-theia` or `@eclipse-glsp/playwright-vscode`.
-   [framework] Integration options must be created with a `define*Integration()` helper — `defineStandaloneIntegration()`, `defineTheiaIntegration()`, and so on. The helper attaches the factory that creates the integration, which is what allows integrations to live in separate packages. Hand-written `{ type: 'Theia', ... }` literals no longer compile. Literals for the built-in `Page` and `Standalone` integrations continue to work.
-   [framework] The `vscodeSetup` fixture is no longer part of the core `test` object. VS Code setup specs must import `setup` (or `test`) from `@eclipse-glsp/playwright-vscode`. The fixture is no longer optional, so `vscodeSetup!` and `expect(vscodeSetup).toBeDefined()` are no longer needed.
-   [framework] `provideUndoRedoTriggerVariable` and `provideMarkerNavigatorVariable` are replaced by `provideUndoRedoTrigger` and `provideMarkerNavigator`, which return the trigger or navigator directly instead of an `IntegrationVariable`.
-   [framework] `TheiaUndoRedoTrigger` and `VscodeUndoRedoTrigger` moved to their integration packages and are deprecated: their key bindings are identical to `StandaloneUndoRedoTrigger`. `TheiaMarkerNavigator` moved to `@eclipse-glsp/playwright-theia`.
-   [framework] Deep imports such as `@eclipse-glsp/glsp-playwright/src/glsp` are no longer supported; import from the package root. Deep imports caused a second copy of the module graph to be loaded.

## [v2.7.0 - 02/06/2026](https://github.com/eclipse-glsp/glsp-playwright/releases/tag/v2.7.0)

### Changes

-   [build] Upgrade to Node 22 [#43](https://github.com/eclipse-glsp/glsp-playwright/pull/43)

## [v2.6.0 - 11/02/2026](https://github.com/eclipse-glsp/glsp-playwright/releases/tag/v2.6.0)

### Changes

-   [po] Fix for changed icon of tool palette [#37](https://github.com/eclipse-glsp/glsp-playwright/pull/37)

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
