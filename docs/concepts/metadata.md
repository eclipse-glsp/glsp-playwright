# Metadata

The **GLSP-Client-Graph** adds a `type` and other metadata (e.g., `sourceId`) attributes to every graph element in the DOM. Those metadata attributes allow third-party applications to understand the SVG element's underlying structure.

```html
<g id="sprotty_task0" data-svg-metadata-type="task:manual" data-svg-metadata-parent-id="sprotty_sprotty" ...>
    ...
    <g ... data-svg-metadata-type="icon" data-svg-metadata-parent-id="sprotty_task0" ...>...</g>
    ...
    <text ... data-svg-metadata-type="label:heading" data-svg-metadata-parent-id="sprotty_task0" ...>...</text>
    ...
</g>
```

To connect the correct page object with the right SVG element, we need to provide also the proper `type` aside from the selector. The `type` is necessary to prevent invalid mappings between page objects in the graph.

---

For easier development, we make use of decorators:

-   <https://www.typescriptlang.org/docs/handbook/decorators.html>
-   <https://www.typescriptlang.org/docs/handbook/release-notes/typescript-5-0.html#decorators>

## Decorators

Every graph element (e.g., node, edge, similar) needs to use the appropriate `Decorator`: `NodeMetadata`, `EdgeMetadata`, `ModelElementMetadata`.

Those decorators save additional metadata together with the page objects. The following code demonstrates this behavior.

```ts
@NodeMetadata({
    type: 'task:manual'
})
export class TaskManual extends TaskManualMixin implements PLabelledElement { ... }
```

In the `type` field of the `NodeMetadata` the `type` provided from the **GLSP-Client-Graph** in the SVG is defined. Defining the type allows the framework to validate before accessing the DOM if the page object can handle that SVG element by comparing the `type` (e.g., `task:manual`) from the page object with the `type` available in the DOM of the **GLSP-Client**.

### Reading the Metadata

The `PMetadata` namespace provides functionality for reading and writing the metadata of the page objects.
