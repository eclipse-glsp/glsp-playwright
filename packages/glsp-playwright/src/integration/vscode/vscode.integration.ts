/********************************************************************************
 * Copyright (c) 2023 EclipseSource and others.
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
import type { ElectronApplication, Locator, Page } from '@playwright/test';
import { _electron as electron } from '@playwright/test';
import { resolveCliArgsFromVSCodeExecutablePath } from '@vscode/test-electron';
import * as fs from 'fs/promises';
import * as os from 'os';
import * as platformPath from 'path';
import { v4 as uuidv4 } from 'uuid';
import { SVGMetadataUtils } from '~/glsp';
import { Integration } from '../integration.base';
import type { IntegrationType } from '../integration.type';
import { VSCodeWorkbenchActivitybar } from './po/workbench-activitybar.po';
import type { VSCodeIntegrationOptions } from './vscode.options';
import { VSCodeStorage } from './vscode.storage';

export interface VSCodeRunConfig {
    runId: string;
    runFolder: string;
    paths: RunPaths;
}

interface RunPaths {
    extensionDir: string;
    userDataDir: string;
}

/**
 * The {@link VSCodeIntegration} provides the glue code for working
 * with the VSCode version of the GLSP-Client.
 *
 * The integration will:
 *
 * - prefix the root selector to the correct frame, as webviews are used in VSCode
 * - start the VSCode instance (i.e., Electron) with different run configurations
 * - check if the extension is already installed
 * - wait for the GLSP-Client
 *
 * **Note**
 *
 * Run configurations allow starting multiple Electron instances in parallel
 * and the configuration will be saved in the temp folder.
 */
export class VSCodeIntegration extends Integration {
    readonly type: IntegrationType = 'VSCode';
    workbenchActivitybar: VSCodeWorkbenchActivitybar;

    protected runConfig: VSCodeRunConfig;
    protected electronApp: ElectronApplication;
    protected storage: VSCodeStorage.Storage;

    constructor(protected readonly options: VSCodeIntegrationOptions) {
        super();
    }

    override async initialize(): Promise<void> {
        const storagePath = this.options.storagePath;
        const storage = await VSCodeStorage.read(storagePath);
        if (VSCodeStorage.is(storage)) {
            this.storage = storage;
        } else {
            throw Error(`Provided storage in "${storagePath}" was not a valid vscode storage. ${JSON.stringify(storage, null, 2)}`);
        }
    }

    get page(): Page {
        return this.electronApp.windows()[0];
    }

    override prefixRootSelector(selector: string): Locator {
        return this.page.frameLocator('iframe').frameLocator('iframe').locator(selector);
    }

    override async close(): Promise<void> {
        await this.electronApp.close();
        await fs.rm(this.runConfig.runFolder, { recursive: true, force: true });
    }

    protected override async beforeLaunch(): Promise<void> {
        this.runConfig = await this.createRunConfiguration(this.options, this.storage);
    }

    protected override async launch(): Promise<void> {
        this.electronApp = await electron.launch({
            executablePath: this.storage.vscodeExecutablePath,
            args: [
                ...VSCodeIntegrationUtils.pathArgs(this.runConfig),
                '--new-window',
                '--inspect',
                '--skip-release-notes',
                '--skip-welcome',
                '--disable-telemetry',
                '--no-cached-data',
                '--disable-updates',
                '--disable-keytar',
                '--disable-crash-reporter',
                '--disable-workspace-trust',
                '--disable-gpu',
                this.options.workspace
            ]
        });

        this.electronApp.on('window', async page => {
            page.on('pageerror', error => {
                console.error(error);
            });

            page.on('console', msg => {
                // console.log(msg.text());
            });
        });
    }

    protected override async afterLaunch(): Promise<void> {
        const ePage = await this.electronApp.firstWindow();
        await ePage.waitForLoadState('domcontentloaded');

        this.workbenchActivitybar = new VSCodeWorkbenchActivitybar(ePage);

        await this.waitForReady();

        if (this.options.file) {
            await this.navigateToFile(this.options.file);
        }
    }

    protected async createRunConfiguration(options: VSCodeIntegrationOptions, storage: VSCodeStorage.Storage): Promise<VSCodeRunConfig> {
        const runId = uuidv4();

        const [, ...defaultArgs] = resolveCliArgsFromVSCodeExecutablePath(storage.vscodeExecutablePath);
        const runFolder = await fs.mkdtemp(platformPath.join(os.tmpdir(), 'glsp-playwright-run-'));
        const extensionArg = defaultArgs[0].split(/=(.*)/s);

        return {
            runId,
            runFolder,
            paths: {
                extensionDir: extensionArg[1],
                userDataDir: 'user-data'
            }
        };
    }

    protected async waitForReady(): Promise<void> {
        const extensionsView = await this.workbenchActivitybar.openExtensions();
        await extensionsView.waitForStart(this.options.vsixId);
        await this.workbenchActivitybar.openExplorer();
    }

    protected async navigateToFile(file: string): Promise<void> {
        const explorerView = await this.workbenchActivitybar.openExplorer();
        await explorerView.openFile(file);
        await this.assertMetadataAPI();
        await this.prefixRootSelector(`${SVGMetadataUtils.typeAttrOf('graph')} svg.sprotty-graph > g`).waitFor({ state: 'visible' });
    }
}

export namespace VSCodeIntegrationUtils {
    export function fullPath(config: VSCodeRunConfig, path: keyof RunPaths): string {
        const configPath = config.paths[path];

        if (configPath.startsWith('/')) {
            return configPath;
        }

        return `${config.runFolder}/${configPath}`;
    }

    export function pathArgs(config: VSCodeRunConfig): string[] {
        return [`--extensions-dir=${fullPath(config, 'extensionDir')}`, `--user-data-dir=${fullPath(config, 'userDataDir')}`];
    }
}
