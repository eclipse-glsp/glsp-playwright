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
import type { GLSPSemanticApp } from '../../app';
import { MarkerNavigator } from './marker-navigator';

export class StandaloneMarkerNavigator extends MarkerNavigator {
    protected readonly forwardKey = 'Control+.';
    protected readonly backwardKey = 'Control+,';
}

/**
 * Implemented by integrations whose host application binds the marker navigation commands to
 * different keys than the GLSP-Client does on its own.
 *
 * Contributing the variant through the integration — instead of a map keyed by integration type —
 * keeps this package free of any knowledge about concrete integrations, and lets a test that runs
 * under several integrations call {@link provideMarkerNavigator} without importing any of them.
 */
export interface MarkerNavigatorIntegration extends Integration {
    createMarkerNavigator(app: GLSPSemanticApp): MarkerNavigator;
}

export namespace MarkerNavigatorIntegration {
    export function is(integration: Integration): integration is MarkerNavigatorIntegration {
        return hasProperty<MarkerNavigatorIntegration>(integration, 'createMarkerNavigator');
    }
}

/**
 * Returns the {@link MarkerNavigator} for the active integration.
 *
 * Integrations that rebind the navigation keys provide their own navigator; everything else uses
 * the {@link StandaloneMarkerNavigator} key bindings of the GLSP-Client.
 *
 * @param integration Active integration
 * @param app App under test
 * @returns Navigator matching the active integration
 */
export function provideMarkerNavigator(integration: Integration, app: GLSPSemanticApp): MarkerNavigator {
    return MarkerNavigatorIntegration.is(integration) ? integration.createMarkerNavigator(app) : new StandaloneMarkerNavigator(app);
}
