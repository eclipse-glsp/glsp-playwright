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
import { existsSync, readdirSync, renameSync, rmSync } from 'node:fs';
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
    protocol: 'ssh' | 'https';
}

// ========== Constants ======================================================== //
const clientRepository = 'glsp-client';
const theiaRepository = 'glsp-theia-integration';
const vsCodeRepository = 'glsp-vscode-integration';
const nodeServerRepository = 'glsp-server-node';
const javaServerRepository = 'glsp-server';

// ========== Functions ======================================================== //
function repositoryFolder(folder: string, glspRepository: string, ...paths: string[]): string {
    return path.resolve(`${folder}/${glspRepository}`, ...paths);
}

/**
 * Custom function to execute a command. Similar to `exec` but with better logging.
 */
function execute(command: string, args: readonly string[], options?: SpawnOptionsWithoutStdio): boolean {
    console.log(`[Execute][${options?.cwd ?? '.'}] ${command} ${args.join(' ')}`);
    const spawn = spawnSync(command, args, {
        encoding: 'utf-8',
        stdio: ['inherit', 'inherit', 'pipe'],
        ...options
    });
    if (spawn.status !== 0) {
        throw spawn.stderr;
    }
    return true;
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

    const remote =
        options.protocol === 'ssh' ? `git@github.com:eclipse-glsp/${repository}.git` : `https://github.com/eclipse-glsp/${repository}.git`;
    execute('git', ['clone', remote, ...branch, destination]);
}

function log(repository: string, options: GlobalOptions): void {
    const repoPath = repositoryFolder(options.folder, repository);
    if (existsSync(repoPath)) {
        execute('git', ['--no-pager', 'log', '-1'], { cwd: repositoryFolder(options.folder, repository) });
    }
}

function buildClient(options: GlobalOptions): void {
    execute('yarn', [], { cwd: repositoryFolder(options.folder, clientRepository) });
}

function buildTheia(options: GlobalOptions): void {
    if (execute('yarn', [], { cwd: repositoryFolder(options.folder, theiaRepository) })) {
        execute('yarn', ['browser', 'build'], { cwd: repositoryFolder(options.folder, theiaRepository) });
    }
}

function buildVSCode(options: GlobalOptions): void {
    const repoCwd = repositoryFolder(options.folder, vsCodeRepository);
    if (execute('yarn', [], { cwd: repoCwd })) {
        // Lerna fails to execute those commands as we have a repo within a repo
        execute('yarn', ['build'], { cwd: path.resolve(repoCwd, 'example', 'workflow', 'webview') });
        execute('yarn', ['workflow', 'build'], { cwd: path.resolve(repoCwd) });
        execute('yarn', ['workflow', 'package'], { cwd: repoCwd });
    }
}

function buildNodeServer(options: GlobalOptions): void {
    execute('yarn', [], { cwd: repositoryFolder(options.folder, nodeServerRepository) });
}

function buildJavaServer(options: GlobalOptions): void {
    execute('mvn', ['clean', '--batch-mode', 'verify', '-Pm2', '-Pfatjar'], {
        cwd: repositoryFolder(options.folder, javaServerRepository)
    });
}

// ========== CLI ======================================================== //
/**
 * This script allows to manage the necessary repositories
 * Use `yarn repo -h` for more information.
 */
async function main(): Promise<void> {
    const cli = yargs(hideBin(process.argv));
    await cli
        .scriptName('repo')
        .options('folder', {
            alias: 'o',
            type: 'string',
            description: 'Output folder',
            default: './repositories'
        })
        .command(
            'prepare',
            'Clones and builds all default projects',
            b =>
                b
                    .options('override', {
                        choices: ['rename', 'remove'],
                        description: 'Rename or remove if the folder already exists',
                        type: 'string'
                    } as const)
                    .options('protocol', {
                        choices: ['ssh', 'https'],
                        description: 'Protocol to use for cloning',
                        type: 'string',
                        default: 'ssh'
                    } as const)
                    .options('serverType', {
                        choices: ['node', 'java', 'all'],
                        description: 'GLSP server variant to clone and build',
                        type: 'string',
                        default: 'node'
                    } as const),
            argv => {
                const serverType = argv.serverType;
                const options = { folder: argv.folder, override: argv.override, protocol: argv.protocol };
                clone(clientRepository, options);
                clone(theiaRepository, options);
                clone(vsCodeRepository, options);
                if (serverType === 'node' || serverType === 'all') {
                    clone(nodeServerRepository, options);
                }
                if (serverType === 'java' || serverType === 'all') {
                    clone(javaServerRepository, options);
                }
                buildClient(argv);
                buildTheia(argv);
                buildVSCode(argv);
                if (serverType === 'node' || serverType === 'all') {
                    buildNodeServer(argv);
                }
                if (serverType === 'java' || serverType === 'all') {
                    buildJavaServer(argv);
                }
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
                log(nodeServerRepository, {
                    folder
                });
                log(javaServerRepository, {
                    folder
                });
            }
        )
        .command(
            'client',
            'Client',
            subCommands([
                cloneCommand(argv => {
                    const { folder, branch, override, protocol } = argv;
                    clone(clientRepository, {
                        folder,
                        branch,
                        override,
                        protocol
                    });
                }),
                buildCommand(argv => {
                    buildClient(argv);
                }),
                builder => {
                    builder.command(
                        'url',
                        'Prints the URL for the workflow standalone example',
                        () => {},
                        argv => {
                            const repoCwd = repositoryFolder(argv.folder, clientRepository);
                            console.log(`file://${path.resolve(repoCwd, 'examples', 'workflow-standalone', 'app', 'diagram.html')}`);
                        }
                    );
                }
            ])
        )
        .command(
            'theia-integration',
            'Theia integration',
            subCommands([
                cloneCommand(argv => {
                    const { folder, branch, override, protocol } = argv;
                    clone(theiaRepository, {
                        folder,
                        branch,
                        override,
                        protocol
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
                            execute('yarn', ['browser', 'start:ws:debug'], { cwd: repositoryFolder(folder, theiaRepository) });
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
                    const { folder, branch, override, protocol } = argv;
                    clone(vsCodeRepository, {
                        folder,
                        branch,
                        override,
                        protocol
                    });
                }),
                buildCommand(argv => {
                    buildVSCode(argv);
                }),
                builder => {
                    builder.command(
                        'vsixPath',
                        'Prints the path to the VSIX file',
                        () => {},
                        argv => {
                            const { folder } = argv;
                            const repoCwd = repositoryFolder(folder, vsCodeRepository);
                            const vsixDir = path.resolve(repoCwd, 'example', 'workflow', 'extension');
                            const vsixFile = readdirSync(vsixDir).find(file => file.endsWith('.vsix'));
                            if (vsixFile) {
                                console.log(path.resolve(vsixDir, vsixFile));
                            }
                        }
                    );
                }
            ])
        )
        .command(
            'node-server',
            'Node server',
            subCommands([
                cloneCommand(argv => {
                    const { folder, branch, override, protocol } = argv;
                    clone(nodeServerRepository, {
                        folder,
                        branch,
                        override,
                        protocol
                    });
                }),
                buildCommand(argv => {
                    buildNodeServer(argv);
                }),
                builder => {
                    builder.command(
                        'start',
                        'Start the Workflow node server',
                        b => b.options('port', { type: 'string', description: 'The server port', default: '8081' }),
                        argv => {
                            const { folder, port } = argv;
                            const repoCwd = repositoryFolder(folder, nodeServerRepository);
                            execute('node', ['./wf-glsp-server-node.js', '-w', '--port', port], {
                                cwd: path.resolve(repoCwd, 'examples', 'workflow-server-bundled')
                            });
                        }
                    );
                }
            ])
        )
        .command(
            'java-server',
            'Java server',
            subCommands([
                cloneCommand(argv => {
                    const { folder, branch, override, protocol } = argv;
                    clone(javaServerRepository, {
                        folder,
                        branch,
                        override,
                        protocol
                    });
                }),
                buildCommand(argv => {
                    buildJavaServer(argv);
                }),
                builder => {
                    builder.command(
                        'start',
                        'Start the Workflow Java server',
                        b => b.options('port', { type: 'string', description: 'The server port', default: '8081' }),
                        argv => {
                            const { folder, port } = argv;
                            const repoCwd = repositoryFolder(folder, javaServerRepository);
                            const targetDir = path.resolve(repoCwd, 'examples', 'org.eclipse.glsp.example.workflow', 'target');
                            const jarFile = readdirSync(targetDir).find(file => file.endsWith('-glsp.jar'));
                            if (!jarFile) {
                                throw new Error('Could not start the server. No jar file found');
                            }
                            execute('java', ['-jar', path.resolve(targetDir, jarFile), '--websocket', '-p', port], {
                                cwd: repositoryFolder(folder, javaServerRepository)
                            });
                        }
                    );
                }
            ])
        )
        .help('h')
        .strict()
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
                    .options('protocol', {
                        choices: ['ssh', 'https'],
                        description: 'Protocol to use for cloning',
                        type: 'string',
                        default: 'ssh'
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

main().catch(error => {
    console.error('=== An error occurred ===');
    console.error(error);
    process.exit(1);
});
