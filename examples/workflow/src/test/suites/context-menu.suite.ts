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
import { workflowSuite, WorkflowSuiteCaseBodies, WorkflowSuiteOptions, WorkflowTestCases } from '../suite';
import type { WorkflowTest } from '../workflow-test';

/**
 * Default cases of the reusable context-menu suite, keyed by stable identifiers.
 * The defaults describe integrations without context-menu support.
 */
export const contextMenuSuiteCases = {
    open: {
        title: 'should throw an error when opening is not supported',
        run: async ({ app }) => {
            expect(() => app.contextMenu.open()).toThrow();
        }
    },
    close: {
        title: 'should throw an error when closing is not supported',
        run: async ({ app }) => {
            expect(() => app.contextMenu.close()).toThrow();
        }
    }
} satisfies WorkflowTestCases;

/** Integration-provided replacement bodies for {@link defineContextMenuSuite}. */
export type ContextMenuSuiteCaseBodies = WorkflowSuiteCaseBodies<typeof contextMenuSuiteCases>;

/** Integration-specific skips for {@link defineContextMenuSuite}. */
export type ContextMenuSuiteOptions = WorkflowSuiteOptions<typeof contextMenuSuiteCases>;

/**
 * Registers the reusable context-menu contract.
 *
 * @param test test instance whose integration should execute the suite
 * @param options integration-specific suite and case skips
 */
export function defineContextMenuSuite(test: WorkflowTest, options?: ContextMenuSuiteOptions): void {
    test.describe('The context menu', () => {
        const suite = workflowSuite(test, 'contextMenu', contextMenuSuiteCases, options);
        test(...suite.args('open'));
        test(...suite.args('close'));
        suite.done();
    });
}
