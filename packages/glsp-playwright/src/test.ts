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
import { GLSP_SERVER_TYPE_UNKNWON, GLSPServer } from './glsp-server';

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
    glspServer: GLSPServer;
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

    glspServer: async ({ page }, use) => {
        const server: GLSPServer = {
            type: process.env.GLSP_SERVER_TYPE ?? GLSP_SERVER_TYPE_UNKNWON
        };

        await use(server);
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

/**
 * Runs the given callback if the active integration is the same as the provided integration type
 */
export async function runInIntegration(
    integration: Integration,
    types: IntegrationType | IntegrationType[],
    run: () => void | Promise<void>,
    elseRun?: () => void | Promise<void>
): Promise<void> {
    if (types === integration.type || (Array.isArray(types) && types.includes(integration.type))) {
        await run();
    } else {
        await elseRun?.();
    }
}

/**
 * Returns true iff the active integration is provided within the parameters.
 *
 * **Details**
 *
 * The following test case will be executed only if the `Theia` integration is active.
 *
 * ```
 * test.skip(skipNonIntegration(integrationOptions, 'Theia'), 'Only within Theia supported');
 * ```
 */
export function skipNonIntegration(integrationOptions?: IntegrationOptions, ...integration: IntegrationType[]): boolean {
    return integrationOptions !== undefined && !integration.includes(integrationOptions.type);
}

/**
 * Returns true iff the active integration is not provided within the parameters.
 *
 * **Details**
 *
 * The following test case will be skipped if the `Theia` integration is active.
 *
 * ```
 * test.skip(skipIntegration(integrationOptions, 'Theia'), 'Not supported');
 * ```
 */
export function skipIntegration(integrationOptions?: IntegrationOptions, ...integration: IntegrationType[]): boolean {
    return integrationOptions === undefined || integration.includes(integrationOptions.type);
}

export { expect } from './test/assertions';
export { DynamicVariable } from './test/dynamic-variable';
export { test as setup };
