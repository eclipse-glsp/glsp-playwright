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
import 'reflect-metadata';

import type { GLSPPlaywrightOptions } from '@eclipse-glsp/playwright';
import { assertReposPresent, baseConfig, buildGlspServerWebServer, getGlspServerRepo, loadEnv } from '@eclipse-glsp/workflow/configs';
import { type PlaywrightTestConfig } from '@playwright/test';
import { buildProjects } from './configs/project.config';

loadEnv(__dirname);

assertReposPresent(__dirname, ['glsp-vscode-integration', getGlspServerRepo()], '--vscode');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig<GLSPPlaywrightOptions> = {
    ...baseConfig,
    testDir: 'lib/tests',
    // VS Code launches Electron itself, so only the GLSP server is needed.
    webServer: [buildGlspServerWebServer(__dirname)],
    projects: buildProjects(__dirname)
};

export default config;
