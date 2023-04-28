# Extension

To provide the developers the possibility to write more accessible page objects and tests, we provide **Extensions**.

---

An **Extension** is a small isolated reusable unit that can provide new functionality to page objects. Those reusable units allow developers to add, for example, `click` functionality by reusing a default implementation provided by the framework.

## Categories

We differentiate between **Capabilities**, **Flows**, and **Models**.

### Capability

Capabilities provide GLSP-Client-specific functionality like accessing the `command-palette` or `popup`. Complex interaction possibilities with GLSP are defined there.

### Flow

Flows define an action or sequence of actions the user would typically do, like `clicking`, `hovering`, or `renaming` an element.

-   The `Click` flow consists of only a single action, namely clicking on an element.
-   The `Rename` flow consists of actions like double-clicking on the element, writing the new name, and pressing enter.

### Model

Models are mainly used to provide semantics to page objects. The framework sometimes requires further information from the page objects to enable better usability. For example, the `PLabelledElement` allows the page objects to define a label for an element. Afterward, elements based on those labels can be searched in the graph.

Capabilities and Flows provide default implementations most of the time; however, for **Models**, this is not always possible. Thus, making it necessary to use the interfaces directly.

## Mixin

The basis for **Extensions** are [Mixins](https://www.typescriptlang.org/docs/handbook/mixins.html). Mixins allow us to define the class hierarchy for the page objects dynamically. Due to this reason, it is possible to reuse functionality as necessary without polluting the prototype chain and to only use the necessary functionality in the page objects.

### Using Extensions

```ts
const TaskManualMixin = Mix(PNode)
    .flow(useClickableFlow)
    .flow(useHoverableFlow)
    .flow(useDeletableFlow)
    .capability(useResizeHandleCapability)
    .capability(usePopupCapability)
    .capability(useCommandPaletteCapability)
    .build();
```

The code builds the class hierarchy for a page object. It can be read as follows. The root class is of class `PNode`. The class `PNode` is extended with `Clickable`, `Hoverable` and `Deletable` functionality. Finally, the capabilities `ResizeHandleCapability`, `PopupCapability`, and `CommandPaletteCapability` are added.

The result of this chaining is a new base class with all the functionality (e.g., `clicking`, `deleting`, accessing the `popup`) as listed. The `TaskManualMixin` can be again the base class for any other mixin or used as the base class for a page object.

```ts
export class TaskManual extends TaskManualMixin implements PLabelledElement {...}
```

**Models** can not be always used similary to **Capabilities** and **Flows**. In this case, the page object needs to implement the `PLabelledElement` interface directly and provide the necessary implementation. Afterward, the `TaskManual` can be used in places where the `PLabelledElement` is required.

### Defining new Extensions

**Capabilities** and **Flows** always consist of two necessary parts, namely the `Extension-Declaration` and `Extension-Provider`. **Models** have mostly only the `Extension-Declaration` part. No default implementation is available in this case, and the developers must provide it themselves.

#### Extension-Declaration

The `Extension-Declaration` interface defines the functionality the **Extension** wants to provide.

```ts
export interface PopupCapability<TPopup extends Popup = Popup> {
    popup(): TPopup;
    popupText(): Promise<string>;
}
```

The `Extension-Declaration` of the capability `Popup` is defined in the interface `PopupCapability`. It describes two methods, namely `popup()` and `popupText()`. The former returns the `popup` page object, and the latter the popup's text directly.

```ts
export interface Clickable {
    click(): Promise<void>;
    dblclick(): Promise<void>;
}
```

The `Extension-Declaration` of the flow `Clickable` defines two methods that trigger different click actions.

The framework uses those interfaces, and the final implementation is open to the users. They can reuse default implementations or provide their custom implementations. This approach allows the developers to override, restructure, or extend the functionality when necessary.

#### Extension-Provider

The `Extension-Provider` provides the default implementation for the specific `Extension-Declaration`.

```ts
export function usePopupCapability<TBase extends ConstructorA<Locateable & Hoverable>>(Base: TBase): Capability<TBase, PopupCapability> {
    abstract class Mixin extends Base implements PopupCapability {
        #popup = new Popup(this);

        popup(): Popup {
            return this.#popup;
        }

        async popupText(): Promise<string> {
            await this.hover();

            return this.#popup.innerText();
        }
    }

    return Mixin;
}
```

The `Extension-Provider` is a function that returns the class implementing the interface of the `Extension-Declaration`. The function requires a base class to allow correct prototype chaining. Constraining the possible base class (e.g., `TBase extends ConstructorA<Locateable & Hoverable>`) is also possible. Only base classes that fulfill the specific constraint are allowed in this case. The implementation is up to the developers. The framework provides a default implementation.

Regardless, as the `provider` and the `declaration` is separated, it is possible to use completely new implementations without reusing the default `providers`. It is only necessary to define a new function that returns a class implementing the `Extension-Declaration` while respecting the class hierarchy and using it in the `Mix.flow` or `Mix.capability` methods.

Overriding only some aspects of a default `provider` is also possible. As the providers always return a class, the returned class from the `provider` could be used as the base class, as visible in the following snippet:

```ts
export function useCustomPopupCapability<TBase extends ConstructorA<Locateable & Hoverable>>(
    Base: TBase
): Capability<TBase, PopupCapability> {
    abstract class Mixin extends usePopupCapability(Base) implements PopupCapability {
        override async popupText(): Promise<string> {
            await this.hover();

            return `Prefix: ${await this.popup().innerText()}`;
        }
    }

    return Mixin;
}

const CustomTaskManualMixin = Mix(PNode)
    .flow(useClickableFlow)
    .flow(useHoverableFlow)
    .flow(useDeletableFlow)
    .capability(useResizeHandleCapability)
    .capability(useCustomPopupCapability)
    .capability(useCommandPaletteCapability)
    .build();

// Or reuse
const CustomTaskManualMixin = Mix(TaskManualMixin).capability(useCustomPopupCapability).build();
```
