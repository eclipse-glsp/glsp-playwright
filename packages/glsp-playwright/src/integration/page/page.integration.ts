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
import { SVGMetadataUtils } from '~/glsp';
import { Integration } from '../integration.base';
import type { IntegrationType } from '../integration.type';
import type { PageIntegrationOptions } from './page.options';

/**
 * The {@link PageIntegration} provides an unchanged experience of Playwright.
 */
export class PageIntegration extends Integration {
    readonly type: IntegrationType = 'Page';

    constructor(public readonly page: Page, protected readonly options?: PageIntegrationOptions) {
        super();
    }

    /**
     * Launches the browser and *optionally* goes to the provided URL.
     *
     * See {@link PageIntegrationOptions} for more options.
     */
    protected override async launch(): Promise<void> {
        if (this.options) {
            await this.page.goto(this.options.url);
            await this.assertMetadataAPI();
            await this.page.waitForSelector(`${SVGMetadataUtils.typeAttrOf('graph')} svg.sprotty-graph > g`);
        }
    }
}
