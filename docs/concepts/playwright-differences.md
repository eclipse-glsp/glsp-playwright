# Playwright Differences

This page describes some differences between the **GLSP-Playwright** framework compared to Playwright.

---

## GLSPLocator

The Playwright framework provides the `Locator` for finding elements on the page. For **GLSP-Playwright**, the `Locator` object has been hidden behind the `GLSPLocator` object. The `GLSPLocator` is a central piece used to locate elements on the page and to switch from the **GLSP-Playwright** context to the Playwright context.

## Locatable

The root class for every page object is the `Locatable` class. It provides the base functionality required by all page objects.
