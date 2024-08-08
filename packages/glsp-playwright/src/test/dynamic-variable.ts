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

import type { GLSPServer } from '../glsp-server';
import { Integration } from '../integration';

export interface DynamicVariableOptions<T> {
    defaultValue?: T;
    value?: Record<string, T>;
}

export interface DynamicVariable<T> {
    getOrThrow(key: string): T;
}

export abstract class BaseDynamicVariable<T> {
    protected readonly value: Record<string, T>;
    protected readonly defaultValue?: T;

    constructor(protected readonly options: DynamicVariableOptions<T>) {
        this.defaultValue = options?.defaultValue;
        this.value = options?.value ?? {};
    }

    getOrThrow(key: string): T {
        const value = this.value[key] ?? this.defaultValue;
        if (value === undefined) {
            throw new Error(`No value found for key ${key}`);
        }
        return value;
    }
}

export class IntegrationVariable<T> extends BaseDynamicVariable<T> {
    protected integration?: Integration;

    constructor(options: DynamicVariableOptions<T> & { integration?: Integration }) {
        super(options);
        this.integration = options.integration;
    }

    get(): T {
        if (this.integration === undefined) {
            throw new Error('No integration set');
        }

        return super.getOrThrow(this.integration.type);
    }

    setIntegration(integration: Integration): void {
        this.integration = integration;
    }
}

export class ServerVariable<T> extends BaseDynamicVariable<T> {
    protected server?: GLSPServer;

    constructor(options: DynamicVariableOptions<T> & { server?: GLSPServer }) {
        super(options);
        this.server = options.server;
    }

    get(): T {
        if (this.server === undefined) {
            throw new Error('No GLSP server set');
        }

        return super.getOrThrow(this.server.type);
    }

    setServer(server: GLSPServer): void {
        this.server = server;
    }
}
