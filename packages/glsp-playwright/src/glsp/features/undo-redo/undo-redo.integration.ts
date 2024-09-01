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

import type { Integration } from '~/integration';
import { IntegrationVariable } from '~/test';
import type { GLSPApp } from '../../app';
import { UndoRedoTrigger } from './undo-redo';

export class StandaloneUndoRedoTrigger extends UndoRedoTrigger {
    protected readonly undoKey = 'ControlOrMeta+z';
    protected readonly redoKey = 'ControlOrMeta+Shift+z';
}

export class TheiaUndoRedoTrigger extends UndoRedoTrigger {
    protected readonly undoKey = 'ControlOrMeta+z';
    protected readonly redoKey = 'ControlOrMeta+Shift+z';
}

export class VscodeUndoRedoTrigger extends UndoRedoTrigger {
    protected readonly undoKey = 'ControlOrMeta+z';
    protected readonly redoKey = 'ControlOrMeta+Shift+z';
}

export const provideUndoRedoTriggerVariable = (integration: Integration, app: GLSPApp): IntegrationVariable<UndoRedoTrigger> =>
    new IntegrationVariable<UndoRedoTrigger>({
        value: {
            Standalone: new StandaloneUndoRedoTrigger(app),
            Theia: new TheiaUndoRedoTrigger(app),
            VSCode: new VscodeUndoRedoTrigger(app)
        },
        integration
    });
