/********************************************************************************
 * Copyright (c) 2026 EclipseSource and others.
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
import type { GLSPPlaywrightOptions } from '@eclipse-glsp/playwright';
import { defineTheiaIntegration } from '@eclipse-glsp/playwright-theia';
import { STANDALONE_ONLY } from '@eclipse-glsp/workflow-test/lib/configs/base.config';
import { getUrl } from '@eclipse-glsp/workflow-test/lib/configs/env';
import { PlaywrightTestOptions, PlaywrightWorkerOptions, Project, devices } from '@playwright/test';

/**
 * Directory holding the integration-agnostic specs, owned by `@eclipse-glsp/workflow-test`.
 *
 * A plain relative path rather than the `node_modules` symlink: Playwright derives a test's
 * reported location from the realpath of the loaded module but keeps the collected path for the
 * suite title, so going through the symlink would desynchronize the two and break report
 * grouping and `playwright test <file>` filtering.
 */
export const SHARED_TEST_DIR = '../workflow/lib/tests';

export const theiaIntegrationOptions = defineTheiaIntegration({
    url: getUrl('THEIA_PORT'),
    widgetId: 'workflow-diagram',
    workspace: '../workspace',
    file: 'example1.wf'
});

export function buildProjects(): Project<PlaywrightTestOptions & GLSPPlaywrightOptions, PlaywrightWorkerOptions>[] {
    return [
        {
            name: 'theia',
            timeout: 60 * 1000,
            testDir: SHARED_TEST_DIR,
            testMatch: ['**/*.spec.js'],
            testIgnore: [
                ...STANDALONE_ONLY,
                // Theia does provide a context menu, so the "not supported" assertion of the
                // shared spec does not hold here. The Theia behaviour is covered by this
                // package's own `tests/context-menu.spec.ts`.
                '**/core/features/context-menu.spec.js'
            ],
            use: {
                ...devices['Desktop Chrome'],
                baseURL: theiaIntegrationOptions.url,
                integrationOptions: theiaIntegrationOptions
            }
        },
        {
            name: 'theia-specific',
            timeout: 60 * 1000,
            testDir: 'lib/tests',
            testMatch: ['**/*.spec.js'],
            use: {
                ...devices['Desktop Chrome'],
                baseURL: theiaIntegrationOptions.url,
                integrationOptions: theiaIntegrationOptions
            }
        }
    ];
}
