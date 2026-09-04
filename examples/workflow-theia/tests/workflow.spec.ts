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
import { expect } from '@eclipse-glsp/playwright';
import { defineWorkflowSuites, test } from '@eclipse-glsp/workflow';

defineWorkflowSuites(test, {
    contextMenu: {
        replace: {
            open: {
                title: 'should allow to open the context menu',
                run: async ({ app }) => {
                    await app.contextMenu.open();
                }
            },
            close: {
                title: 'should allow to close the context menu',
                run: async ({ app }) => {
                    await app.contextMenu.open();
                    await expect(app.contextMenu.locate()).toBeVisible();
                    await app.contextMenu.close();
                    await expect(app.contextMenu.locate()).toBeHidden();
                }
            }
        },
        // Exercise extending an effective case separately from replacing its implementation.
        extend: {
            open: base => async (context, testInfo) => {
                await base(context, testInfo);
                await expect(context.app.contextMenu.locate()).toBeVisible();
            }
        }
    }
});
