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

import type { Page } from '@playwright/test';
import { TheiaApp, TheiaWorkspace } from '@theia/playwright';
import { SVGMetadataUtils } from '~/glsp';
import { Integration } from '../integration.base';
import type { IntegrationType } from '../integration.type';
import { TheiaGLSPApp } from './po/theia-glsp-app.po';
import { TheiaGLSPEditor } from './po/theia-glsp-editor.po';
import { TheiaIntegrationOptions } from './theia.options';

/**
 * The {@link TheiaIntegration} provides the glue code for working
 * with the Theia version of the GLSP-Client.
 */
export class TheiaIntegration extends Integration {
    readonly type: IntegrationType = 'Theia';

    constructor(public readonly page: Page, protected readonly options: TheiaIntegrationOptions) {
        super();
    }

    protected override async launch(): Promise<void> {
        await this.page.goto(this.options.url);
    }

    protected override async afterLaunch(): Promise<void> {
        const ws = this.options.workspace ? new TheiaWorkspace([this.options.workspace]) : undefined;

        const theiaApp = await TheiaApp.loadApp(this.page as any, TheiaGLSPApp, ws);
        theiaApp.initialize(this.options);

        if (this.options.file) {
            await theiaApp.openEditor(this.options.file, TheiaGLSPEditor as any);
            await this.assertMetadataAPI();
            await this.page.waitForSelector(`${SVGMetadataUtils.typeAttrOf('graph')} svg.sprotty-graph > g`);
        }
    }
}
