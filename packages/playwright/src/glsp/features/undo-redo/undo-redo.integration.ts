/********************************************************************************
 * Copyright (c) 2024-2026 EclipseSource and others.
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
import { hasProperty } from '~/utils/ts.utils';
import type { GLSPApp } from '../../app';
import { UndoRedoTrigger } from './undo-redo';

export class StandaloneUndoRedoTrigger extends UndoRedoTrigger {
    protected readonly undoKey = 'ControlOrMeta+z';
    protected readonly redoKey = 'ControlOrMeta+Shift+z';
}

/**
 * Implemented by integrations whose host application binds undo/redo to different keys than the
 * GLSP-Client does on its own.
 *
 * Contributing the variant through the integration — instead of a map keyed by integration type —
 * keeps this package free of any knowledge about concrete integrations, and lets a test that runs
 * under several integrations call {@link provideUndoRedoTrigger} without importing any of them.
 */
export interface UndoRedoIntegration extends Integration {
    createUndoRedoTrigger(app: GLSPApp): UndoRedoTrigger;
}

export namespace UndoRedoIntegration {
    export function is(integration: Integration): integration is UndoRedoIntegration {
        return hasProperty<UndoRedoIntegration>(integration, 'createUndoRedoTrigger');
    }
}

/**
 * Returns the {@link UndoRedoTrigger} for the active integration.
 *
 * Integrations that rebind undo/redo provide their own trigger; everything else uses the
 * {@link StandaloneUndoRedoTrigger} key bindings of the GLSP-Client.
 *
 * @param integration Active integration
 * @param app App under test
 * @returns Trigger matching the active integration
 */
export function provideUndoRedoTrigger(integration: Integration, app: GLSPApp): UndoRedoTrigger {
    return UndoRedoIntegration.is(integration) ? integration.createUndoRedoTrigger(app) : new StandaloneUndoRedoTrigger(app);
}
