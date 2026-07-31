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
import { baseConfig } from '@eclipse-glsp/workflow-test/lib/configs/base.config';
import { loadEnv } from '@eclipse-glsp/workflow-test/lib/configs/env';
import { getGlspServerRepo } from '@eclipse-glsp/workflow-test/lib/configs/glsp-server.config';
import { assertReposPresent } from '@eclipse-glsp/workflow-test/lib/configs/repos';
import { type PlaywrightTestConfig } from '@playwright/test';
import { SHARED_TEST_DIR, buildProjects } from './configs/project.config';
import { buildWebServers } from './configs/webserver.config';

loadEnv(__dirname);

assertReposPresent(__dirname, ['glsp-theia-integration', getGlspServerRepo()], '--theia');

/**
 * See https://playwright.dev/docs/test-configuration.
 */
const config: PlaywrightTestConfig<GLSPPlaywrightOptions> = {
    ...baseConfig,
    // Most specs come from `@eclipse-glsp/workflow-test`; making that the top-level `testDir` keeps
    // the report paths relative to it. Overridden per project for this package's own specs.
    testDir: SHARED_TEST_DIR,
    // `snapshotDir` defaults to `testDir`, which would write into the other package's build
    // output. Pin it here instead.
    snapshotDir: 'snapshots',
    webServer: buildWebServers(__dirname),
    projects: buildProjects()
};

export default config;
