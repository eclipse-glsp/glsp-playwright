/********************************************************************************
 * Copyright (c) 2024 EclipseSource and others.
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

import { SpawnOptionsWithoutStdio, spawnSync } from 'node:child_process';
import { existsSync, renameSync, rmSync } from 'node:fs';
import * as path from 'node:path';
import { cwd } from 'node:process';
import yargs, { ArgumentsCamelCase, Argv, Omit } from 'yargs';
import { hideBin } from 'yargs/helpers';

// ========== Interfaces ======================================================== //
interface GlobalOptions {
    folder: string;
}
interface CloneOptions extends GlobalOptions {
    override?: 'rename' | 'remove';
    branch?: string;
}

// ========== Constants ======================================================== //
const clientRepository = 'glsp-client';
const theiaRepository = 'glsp-theia-integration';
const vsCodeRepository = 'glsp-vscode-integration';

// ========== Functions ======================================================== //
function repositoryFolder(folder: string, glspRepository: string, ...paths: string[]): string {
    return path.resolve(`${folder}/${glspRepository}`, ...paths);
}

function exec(command: string, args: readonly string[], options?: SpawnOptionsWithoutStdio): boolean {
    console.log(`[Execute][${options?.cwd ?? '.'}] ${command} ${args.join(' ')}`);
    try {
        const result = spawnSync(command, args, {
            encoding: 'utf-8',
            stdio: 'inherit',
            ...options
        });
        if (result.error) {
            console.error(result.error);
            return false;
        }
        return true;
    } catch (error) {
        console.error(error);
    }

    return false;
}

function clone(repository: string, options: CloneOptions): void {
    const destination = repositoryFolder(options.folder, repository);
    let branch: string[] = [];
    if (options.branch) {
        branch = ['-b', options.branch];
    }
    if (options.override) {
        const oldPath = path.resolve(cwd(), destination);
        if (existsSync(oldPath)) {
            if (options.override === 'rename') {
                const newPath = `${oldPath}_${new Date().valueOf()}`;
                renameSync(oldPath, newPath);
            } else if (options.override === 'remove') {
                rmSync(oldPath, { recursive: true, force: true });
            }
        }
    }

    exec('git', ['clone', `git@github.com:eclipse-glsp/${repository}.git`, ...branch, destination]);
}

function log(repository: string, options: GlobalOptions): void {
    exec('git', ['--no-pager', 'log', '-1'], { cwd: repositoryFolder(options.folder, repository) });
}

function buildClient(options: GlobalOptions): void {
    exec('yarn', [], { cwd: repositoryFolder(options.folder, clientRepository) });
}

function buildTheia(options: GlobalOptions): void {
    exec('yarn && yarn browser build', [], { cwd: repositoryFolder(options.folder, theiaRepository) });
}

function buildVSCode(options: GlobalOptions): void {
    const repoCwd = repositoryFolder(options.folder, vsCodeRepository);
    if (exec('yarn', [], { cwd: repoCwd })) {
        // Lerna fails to execute those commands as we have a repo within a repo
        exec('yarn', ['build'], { cwd: path.resolve(repoCwd, 'example', 'workflow', 'webview') });
        exec('yarn', ['workflow', 'build'], { cwd: path.resolve(repoCwd) });
        exec('yarn', ['workflow', 'package'], { cwd: repoCwd });
    }
}

// ========== CLI ======================================================== //
/**
 * This script allows to manage the necessary repositories
 * Use `yarn repo -h` for more information.
 */
async function main(): Promise<void> {
    const cli = yargs(hideBin(process.argv));
    await cli
        .options('folder', {
            alias: 'o',
            type: 'string',
            description: 'Output folder',
            default: './repositories'
        })
        .command(
            'prepare',
            'Clones and builds all projects',
            b =>
                b.options('override', {
                    choices: ['rename', 'remove'],
                    description: 'Rename or remove if the folder already exists',
                    type: 'string'
                } as const),
            argv => {
                const { folder, override } = argv;
                clone(clientRepository, {
                    folder,
                    override
                });
                clone(theiaRepository, {
                    folder,
                    override
                });
                clone(vsCodeRepository, {
                    folder,
                    override
                });
                buildClient(argv);
                buildTheia(argv);
                buildVSCode(argv);
            }
        )
        .command(
            'log',
            'Logs the last commit of each repository',
            () => {},
            argv => {
                const { folder } = argv;
                log(clientRepository, {
                    folder
                });
                log(theiaRepository, {
                    folder
                });
                log(vsCodeRepository, {
                    folder
                });
            }
        )
        .command(
            'client',
            'Client',
            subCommands([
                cloneCommand(argv => {
                    const { folder, branch, override } = argv;
                    clone(clientRepository, {
                        folder,
                        branch,
                        override
                    });
                }),
                buildCommand(argv => {
                    buildClient(argv);
                })
            ])
        )
        .command(
            'theia-integration',
            'Theia integration',
            subCommands([
                cloneCommand(argv => {
                    const { folder, branch, override } = argv;
                    clone(theiaRepository, {
                        folder,
                        branch,
                        override
                    });
                }),
                buildCommand(argv => {
                    buildTheia(argv);
                }),
                builder => {
                    builder.command(
                        'start',
                        'Start the Theia integration',
                        () => {},
                        argv => {
                            const { folder } = argv;
                            exec('yarn', ['start:ws:debug'], { cwd: repositoryFolder(folder, theiaRepository) });
                        }
                    );
                }
            ])
        )
        .command(
            'vscode-integration',
            'VSCode integration',
            subCommands([
                cloneCommand(argv => {
                    const { folder, branch, override } = argv;
                    clone(vsCodeRepository, {
                        folder,
                        branch,
                        override
                    });
                }),
                buildCommand(argv => {
                    buildVSCode(argv);
                })
            ])
        )
        .help('h')
        .demandCommand(1)
        .parse();
}

type GlobalOptionsArgs = Omit<object, keyof string[]> & string[] & GlobalOptions;
type GlobalArgv = Argv<GlobalOptionsArgs>;
function subCommands(commands: ((argv: GlobalArgv) => void)[], builder?: (argv: GlobalArgv) => void) {
    return (argv: GlobalArgv) => {
        commands.forEach(cb => cb(argv));
        builder?.(argv);
        argv.help('h').demandCommand(1);
    };
}

type CloneCommandArgv = ArgumentsCamelCase<GlobalOptionsArgs & CloneOptions>;
function cloneCommand(handler: (argv: CloneCommandArgv) => void) {
    return (builder: GlobalArgv) => {
        builder.command(
            'clone [branch]',
            'Clones the repository',
            b =>
                b
                    .options('override', {
                        choices: ['rename', 'remove'],
                        description: 'Rename or remove if the folder already exists',
                        type: 'string'
                    } as const)
                    .positional('branch', { describe: 'Branch or tag', type: 'string' }),
            argv => {
                handler(argv);
            }
        );
    };
}

type BuildCommandArgv = ArgumentsCamelCase<GlobalOptionsArgs>;
function buildCommand(handler: (argv: BuildCommandArgv) => void) {
    return (builder: GlobalArgv) => {
        builder.command(
            'build',
            'Builds the repository',
            () => {},
            argv => {
                handler(argv);
            }
        );
    };
}

main().catch(console.error);
