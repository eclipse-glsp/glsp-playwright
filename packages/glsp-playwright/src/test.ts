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
import { test as base } from '@playwright/test';
import {
    Integration,
    IntegrationArgs,
    IntegrationOptions,
    IntegrationType,
    PageIntegration,
    StandaloneIntegration,
    TheiaIntegration,
    VSCodeIntegration,
    VSCodeSetup
} from '~/integration';

/**
 * GLSP-Playwright specific options
 */
export interface GLSPPlaywrightOptions {
    /**
     * Options used in the isolated [Integrations](https://github.com/eclipse-glsp/glsp-playwright/docs/concepts/integration.md).
     */
    integrationOptions?: IntegrationOptions;
}

/**
 * GLSP-Playwright specific fixtures
 */
export interface GLSPPlaywrightFixtures {
    /**
     * Isolated [Integration](https://github.com/eclipse-glsp/glsp-playwright/docs/concepts/integration.md) instance created for each test.
     * They are passed to the `GLSPApp` instance.
     *
     * **Usage**
     *
     * ```ts
     * test.beforeEach(async ({ integration }) => {
     *      app = new GLSPApp({
     *           type: 'integration',
     *           integration
     *      });
     * });
     * ```
     */
    integration: Integration;
    vscodeSetup?: VSCodeSetup;
}

export const test = base.extend<GLSPPlaywrightOptions & GLSPPlaywrightFixtures>({
    integrationOptions: [undefined, { option: true }],

    vscodeSetup: ({ integrationOptions }, use) => {
        if (integrationOptions?.type === 'VSCode') {
            use(new VSCodeSetup(integrationOptions, { enableLogging: true }));
        } else {
            use(undefined);
        }
    },

    integration: async ({ playwright, browser, page, integrationOptions }, use) => {
        const args: IntegrationArgs = {
            playwright,
            browser,
            page
        };

        if (integrationOptions) {
            let integration: Integration;
            switch (integrationOptions.type) {
                case 'Page':
                    integration = new PageIntegration(args, integrationOptions);
                    break;
                case 'Standalone':
                    integration = new StandaloneIntegration(args, integrationOptions);
                    break;
                case 'Theia':
                    integration = new TheiaIntegration(args, integrationOptions);
                    break;
                case 'VSCode': {
                    integration = new VSCodeIntegration(args, integrationOptions);
                    break;
                }
                default: {
                    const exhaustiveCheck: never = integrationOptions;
                    throw new Error(`Unhandled case: ${JSON.stringify(exhaustiveCheck)}`);
                }
            }

            await integration.initialize();
            await integration.start();
            await use(integration);
        } else {
            const integration = new PageIntegration(args);
            await integration.initialize();
            await integration.start();
            await use(integration);
        }
    }
});

// https://playwright.dev/docs/test-parameterize

export type ParameterizedIntegrationData<T> = Record<IntegrationType, T>;
export function createParameterizedIntegrationData<T>(options: {
    default: T;
    override?: Partial<ParameterizedIntegrationData<T>>;
}): ParameterizedIntegrationData<T> {
    return {
        Page: options.override?.Page ?? options.default,
        Standalone: options.override?.Standalone ?? options.default,
        Theia: options.override?.Theia ?? options.default,
        VSCode: options.override?.VSCode ?? options.default
    };
}

export function skipIntegration(integrationOptions?: IntegrationOptions, ...integration: IntegrationType[]): boolean {
    return integrationOptions === undefined || integration.includes(integrationOptions.type);
}

export { expect } from '@playwright/test';
export { test as setup };
