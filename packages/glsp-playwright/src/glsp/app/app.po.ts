/********************************************************************************
 * Copyright (c) 2023 Business Informatics Group (TU Wien) and others.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0.
 *
 * This Source Code may also be made available under the following Secondary
 * Licenses when the conditions for such availability set forth in the Eclipse
 * Public License v. 2.0 are satisfied: GNU General Public License, version 2
 * with the GNU Classpath Exception which is available at
 * https://www.gnu.org/software/classpath/license.html.
 *
 * SPDX-License-Identifier: EPL-2.0 OR GPL-2.0 WITH Classpath-exception-2.0
 ********************************************************************************/
import type { Locator, Page } from 'playwright-core';
import type { Integration } from '~/integration';
import { GLSPLocator } from '~/remote/locator';
import { GLSPGlobalCommandPalette } from '../features/command-palette';
import { GLSPLabelEditor } from '../features/label-editor/label-editor.po';
import { GLSPPopup } from '../features/popup/popup.po';
import { GLSPToolPalette } from '../features/tool-palette/tool-palette.po';
import { GLSPGraph } from '../graph/graph.po';

/**
 * The {@link GLSPApp} can be started either in `page` or `integration` mode.
 * Common options are provided in this interface.
 */
interface BaseOptions {
    type: 'page' | 'integration';
    rootSelector?: string;
}

/**
 * Options for the `page` mode for {@link GLSPApp}
 */
export interface GLSPPageOptions extends BaseOptions {
    type: 'page';
    page: Page;
}

/**
 * Options for the `integration` mode for {@link GLSPApp}
 */
export interface GLSPIntegrationOptions extends BaseOptions {
    type: 'integration';
    integration: Integration;
}

export type GLSPAppOptions = GLSPPageOptions | GLSPIntegrationOptions;

/**
 * The central piece of the **GLSP-Playwright** framework.
 * The {@link GLSPApp} is the entry point into the framework and provides all the necessary
 * page objects to interact with the GLSP-Client. You can extend {@link GLSPApp} and provide your own customizations.
 *
 * **Usage**
 *
 * Integration mode
 * ```ts
 *   test.beforeEach(async ({ integration }) => {
 *       app = await new GLSPApp({
 *           type: 'integration',
 *           integration
 *       });
 *       graph = app.graph;
 *   });
 * ```
 *
 * Page mode
 * ```ts
 *   test.beforeEach(async ({ page }) => {
 *       app = await new GLSPApp({
 *           type: 'page',
 *           page
 *       });
 *       graph = app.graph;
 *   });
 * ```
 */
export class GLSPApp {
    readonly sprottySelector = 'div.sprotty:not(.sprotty-hidden)';

    rootLocator: GLSPLocator;
    locator: GLSPLocator;
    integration?: Integration;
    page: Page;

    graph;
    labelEditor;
    toolPalette;
    popup;
    globalCommandPalette;

    constructor(public readonly options: GLSPAppOptions) {
        this.initialize(options);

        this.graph = this.createGraph();
        this.labelEditor = this.createLabelEditor();
        this.toolPalette = this.createToolPalette();
        this.popup = this.createPopup();
        this.globalCommandPalette = this.createGlobalCommandPalette();
    }

    protected initialize(options: GLSPAppOptions): void {
        let locate: (selector: string) => Locator;

        if (options.type === 'page') {
            this.page = options.page;

            locate = s => this.page.locator(s);
        } else {
            this.integration = options.integration;
            this.page = this.integration.page;

            locate = s => options.integration.prefixRootSelector(s);
        }

        this.rootLocator = new GLSPLocator(
            options.rootSelector === undefined ? locate('body') : locate(options.rootSelector).locator('body'),
            this
        );
        this.locator = this.rootLocator.child(this.sprottySelector);
    }

    protected createGraph(): GLSPGraph {
        return new GLSPGraph({ locator: GLSPGraph.locate(this) });
    }

    protected createLabelEditor(): GLSPLabelEditor {
        return new GLSPLabelEditor({ locator: GLSPLabelEditor.locate(this) });
    }

    protected createToolPalette(): GLSPToolPalette {
        return new GLSPToolPalette({ locator: GLSPToolPalette.locate(this) });
    }

    protected createPopup(): GLSPPopup {
        return new GLSPPopup({ locator: GLSPPopup.locate(this) });
    }

    protected createGlobalCommandPalette(): GLSPGlobalCommandPalette {
        return new GLSPGlobalCommandPalette({ locator: GLSPGlobalCommandPalette.locate(this) });
    }
}
