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
import {
    customizeWorkflowTestCases,
    selectWorkflowTest,
    workflowTestArguments,
    WorkflowSuiteCustomization,
    WorkflowTestCase
} from '../suite';
import { WorkflowTest } from '../workflow-test';

/** Stable identifiers of the test cases provided by {@link defineContextMenuSuite}. */
export type ContextMenuTestCaseId = 'open' | 'close';

/**
 * Default context-menu behavior for integrations without context-menu support.
 */
export const contextMenuTestCases: Record<ContextMenuTestCaseId, WorkflowTestCase> = {
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
};

/** Integration-specific changes for {@link defineContextMenuSuite}. */
export type ContextMenuSuiteCustomization = WorkflowSuiteCustomization<Record<ContextMenuTestCaseId, WorkflowTestCase>>;

/**
 * Registers the reusable context-menu contract with optional integration-specific behavior.
 *
 * @param test test instance whose integration should execute the suite
 * @param customization integration-specific replacements and extensions
 */
export function defineContextMenuSuite(test: WorkflowTest, customization: ContextMenuSuiteCustomization = {}): void {
    test.describe('The context menu', () => {
        test.skip(customization.skip !== undefined, customization.skip);
        const { cases, additional } = customizeWorkflowTestCases(contextMenuTestCases, customization);

        selectWorkflowTest(test, cases.open)(...workflowTestArguments(cases.open));
        selectWorkflowTest(test, cases.close)(...workflowTestArguments(cases.close));
        additional?.(test);
    });
}
