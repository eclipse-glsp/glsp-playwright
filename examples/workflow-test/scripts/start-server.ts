/********************************************************************************
 * Copyright (c) 2020-2023 EclipseSource and others.
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

import * as childProcess from 'child_process';
import * as fs from 'fs';
import * as net from 'net';
import * as path from 'path';
import * as config from '../server/server-config.json';

// ============ LIB ============

const START_UP_COMPLETE_MSG = '[GLSP-Server]:Startup completed';

interface JavaSocketServerLauncherOptions {
    /** Path to the location of the server executable (JAR or node module) that should be launched as process */
    readonly executable: string;
    /** Socket connection on which the server should listen for new client connections */
    socketConnectionOptions: net.TcpSocketConnectOpts;
    /** Set to `true` if server stdout and stderr should be printed in extension host console. Default: `false` */
    readonly logging?: boolean;
    readonly serverType: 'java' | 'node';
    /** Additional arguments that should be passed when starting the server process. */
    readonly additionalArgs?: string[];
}

async function start(options: JavaSocketServerLauncherOptions): Promise<void> {
    return new Promise(resolve => {
        const executable = options.executable;

        if (!fs.existsSync(executable)) {
            throw Error(`Could not launch GLSP server. The given server executable path is not valid: ${executable}`);
        }

        const process = options.serverType === 'java' ? startJavaProcess(options) : startNodeProcess(options);

        process.stdout.on('data', data => {
            if (data.toString().includes(START_UP_COMPLETE_MSG)) {
                resolve();
            }

            handleStdoutData(options, data);
        });

        process.stderr.on('data', error => handleStderrData(options, error));
        process.on('error', error => handleProcessError(options, error));
    });
}

function startJavaProcess(options: JavaSocketServerLauncherOptions): childProcess.ChildProcessWithoutNullStreams {
    if (!options.executable.endsWith('jar')) {
        throw new Error(`Could not launch Java GLSP server. The given executable is no JAR: ${options.executable}`);
    }
    const args = ['-jar', options.executable, '--port', `${options.socketConnectionOptions.port}`, ...(options.additionalArgs ?? [])];

    if (options.socketConnectionOptions.host) {
        args.push('--host', `${options.socketConnectionOptions.host}`);
    }
    return childProcess.spawn('java', args);
}

function startNodeProcess(options: JavaSocketServerLauncherOptions): childProcess.ChildProcessWithoutNullStreams {
    if (!options.executable.endsWith('.js')) {
        throw new Error(`Could not launch Node GLSP server. The given executable is no node module: ${options.executable}`);
    }
    const args = [options.executable, '--port', `${options.socketConnectionOptions.port}`, ...(options.additionalArgs ?? [])];

    if (options.socketConnectionOptions.host) {
        args.push('--host', `${options.socketConnectionOptions.host}`);
    }
    return childProcess.spawn('node', args);
}

function handleStdoutData(options: JavaSocketServerLauncherOptions, data: string | Buffer): void {
    if (options.logging) {
        console.log(data.toString());
    }
}

function handleStderrData(options: JavaSocketServerLauncherOptions, data: string | Buffer): void {
    if (data && options.logging) {
        console.error(data.toString());
    }
}

function handleProcessError(options: JavaSocketServerLauncherOptions, error: Error): never {
    if (options.logging) {
        console.error(error);
    }

    throw error;
}

// Main

const DEFAULT_SERVER_PORT = '5007';
const { version, isSnapShot } = config;
const JAVA_EXECUTABLE = path.join(
    __dirname,
    `../server/org.eclipse.glsp.example.workflow-${version}${isSnapShot ? '-SNAPSHOT' : ''}-glsp.jar`
);
const defaultOptions: JavaSocketServerLauncherOptions = {
    executable: JAVA_EXECUTABLE,
    socketConnectionOptions: { port: JSON.parse(process.env.GLSP_SERVER_PORT || DEFAULT_SERVER_PORT) },
    additionalArgs: ['--fileLog', 'true', '--logDir', path.join(__dirname, '../server')],
    logging: true,
    serverType: 'java'
};

const args = process.argv.slice(2);

const type = args[0];
if (type === 'standalone') {
    const options = {
        ...defaultOptions,
        socketConnectionOptions: { port: JSON.parse(process.env.GLSP_SERVER_PORT || '8081') },
        additionalArgs: [...(defaultOptions.additionalArgs ?? []), '--websocket']
    };

    console.log('=== Starting WebSocket Server ===');
    console.log('Options', options);
    console.log();

    start(options);
} else {
    console.log('No type provided', process.argv);
}
