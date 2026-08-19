# Integration

As mentioned in the [GLSP-Documentation](https://www.eclipse.org/glsp/documentation/integrations/), GLSP supports different tool platforms (e.g., Eclipse Theia, VS Code) and can also be used in web applications or as a standalone version. Here, we will discuss the available integrations in the **GLSP-Playwright** framework.

---

In the **GLSP-Playwright** framework, we define an **Integration** as the necessary glue code to allow handling different **GLSP-Client-Integrations** in the Playwright context.

The **GLSP-Client** can be executed in browser and browser-like environments (e.g., Electron). Consequently, Playwright can access the DOM and handle its elements in browser environments without issues. However, some **GLSP-Client-Integrations** require preparations or need to change how Playwright behaves as they are executed. For example, the application needs to be started first in Electron (e.g., VS Code). Currently, the following **GLSP-Client-Integrations** have a respective **GLSP-Playwright-Integration**.

|               | **Page** | **Standalone** | **Eclipse Theia** | **VS Code** | **Eclipse IDE** |
| ------------- | -------- | -------------- | ----------------- | ----------- | --------------- |
| **Supported** | Yes      | Yes            | WIP               | WIP         | No              |

## GLSP-Playwright-Integrations

The **GLSP-Playwright-Integration** has access to the `Page` object of Playwright and integration-specific `options` provided in the Playwright configuration. The developers can also offer additional parameters or logic as integrations are constructed and executed before any test case. Nonetheless, integrations are optional. The `GLSPApp` does not require a **GLSP-Playwright-Integration** and can be created without them. In this case, the `Page` object has to be passed directly.

### Page-Integration

The `Page-Integration` provides a basic integration without modifying the Playwright behavior. This integration can be used to have the known Playwright experience. It is also possible to pass the `Page` object of Playwright directly to the `GLSPApp`. Both cases would result in the same behavior.

### Standalone-Integration

The `Standalone-Integration` should be used for web applications. It has a required `Options` configuration, where the developer has to provide the URL to the running web application. The integration will automatically open the browser and load the URL before any test case and wait until the **GLSP-Client** is ready (e.g., the graph has been rendered).

### Theia- and VSCode-Integration

These live in separate packages, `@eclipse-glsp/playwright-theia` and `@eclipse-glsp/playwright-vscode`, so that a consumer only pulls in the tool platform it actually tests. Install the one you need alongside `@eclipse-glsp/playwright`.

## Selecting an integration

An integration is selected through the `integrationOptions` test option in the Playwright configuration. Always create the options with the `define*Integration()` helper of the owning package:

```ts
import { defineStandaloneIntegration } from '@eclipse-glsp/playwright';
import { defineTheiaIntegration } from '@eclipse-glsp/playwright-theia';

export default {
    projects: [
        {
            name: 'standalone',
            use: { integrationOptions: defineStandaloneIntegration({ url: 'http://localhost:8082/diagram.html' }) }
        },
        {
            name: 'theia',
            use: { integrationOptions: defineTheiaIntegration({ url: 'http://localhost:3000', widgetId: 'workflow-diagram' }) }
        }
    ]
};
```

The `integration` fixture then builds the integration and hands it to the test. Tests stay independent of the integration and keep importing `test` and `expect` from `@eclipse-glsp/playwright`.

The helper is not a convenience: the returned options carry the factory that creates the integration. That is what lets an integration live in its own package without the core framework importing it, and it is why a hand-written `{ type: 'Theia', ... }` literal is rejected at compile time.

## Contributing an integration

To add an integration from another package:

1. Extend `Integration` (or implement one of the capability interfaces such as `ContextMenuIntegration`).
2. Declare an options interface extending `BaseIntegrationOptions` with a literal `type` and a required `integrationFactory`.
3. Register the options type by merging into the global options map, which is what adds the new discriminator to `IntegrationType` and `IntegrationOptions`:

    ```ts
    declare global {
        namespace GLSPPlaywright {
            interface IntegrationOptionsMap {
                MyPlatform: MyPlatformIntegrationOptions;
            }
        }
    }
    ```

    Use the global namespace, not `declare module '@eclipse-glsp/playwright'`. The map is declared inside the package and only re-exported by its barrel, and TypeScript cannot merge into a re-exported declaration — it would silently create an unrelated interface instead.

4. Export a `defineMyPlatformIntegration()` helper that fills in `type` and `integrationFactory`.

If your platform rebinds keys that the framework drives (undo/redo, marker navigation), implement the matching capability interface — `UndoRedoIntegration` or `MarkerNavigatorIntegration` — instead of branching on the integration type in a test. `provideUndoRedoTrigger` and `provideMarkerNavigator` then pick your variant up automatically, which keeps shared tests free of any platform import.
