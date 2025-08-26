/********************************************************************************
 * Copyright (c) 2023-2025 Business Informatics Group (TU Wien) and others.
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

import { Locator, Page } from '@playwright/test';
import { TheiaAppLoader, TheiaWorkspace } from '@theia/playwright';
import { SVGMetadataUtils } from '~/glsp/graph';
import { ContextMenuIntegration, Integration } from '../integration.base';
import type { IntegrationArgs } from '../integration.type';
import { TheiaGLSPApp } from './po/theia-glsp-app.po';
import { TheiaGLSPEditor } from './po/theia-glsp-editor.po';
import { TheiaIntegrationOptions } from './theia.options';

/**
 * The {@link TheiaIntegration} provides the glue code for working
 * with the Theia version of the GLSP-Client.
 */
export class TheiaIntegration extends Integration implements ContextMenuIntegration {
    protected theiaApp: TheiaGLSPApp;

    override get page(): Page {
        return this.theiaApp.page;
    }

    get contextMenuLocator(): Locator {
        return this.page.locator('body > .lm-Widget.lm-Menu');
    }

    constructor(
        args: IntegrationArgs,
        protected readonly options: TheiaIntegrationOptions
    ) {
        super(args, 'Theia');
    }

    protected override async launch(): Promise<void> {
        const ws = new TheiaWorkspace(this.options.workspace ? [this.options.workspace] : undefined);
        this.theiaApp = await TheiaAppLoader.load(this.args, ws, TheiaGLSPApp as any);
        this.theiaApp.initialize(this.options);
    }

    protected override async afterLaunch(): Promise<void> {
        if (this.options.file) {
            await this.theiaApp.openEditor(this.options.file, TheiaGLSPEditor);
            await this.assertMetadataAPI();
            await this.theiaApp.notifications.closeAll();

            const selector = `${SVGMetadataUtils.typeAttrOf('graph')} svg.sprotty-graph > g`;
            await this.page.waitForSelector(selector);
            // Reset mouse state
            await this.page.click(selector, { force: true });
        }
    }
}
