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
