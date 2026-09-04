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
import type { TestDetails, TestInfo } from '@playwright/test';
import type { WorkflowTest, WorkflowTestContext, WorkflowTestFixtures } from './workflow-test';

/**
 * Executable body of a reusable Workflow test case.
 */
export type WorkflowTestBody = (context: WorkflowTestContext, testInfo: TestInfo) => Promise<void>;

/**
 * A test case identified independently of its displayed title.
 */
export interface WorkflowTestCase {
    title: string;
    run: WorkflowTestBody;
    /** Skips this case with the given reason. */
    skip?: string;
}

export type WorkflowTestCases = Record<string, WorkflowTestCase>;

/** Replacement behavior for a case. At least a new body or a skip reason is required. */
export type WorkflowTestCaseReplacement =
    | (Pick<WorkflowTestCase, 'run'> & Partial<Pick<WorkflowTestCase, 'title' | 'skip'>>)
    | (Required<Pick<WorkflowTestCase, 'skip'>> & Partial<Pick<WorkflowTestCase, 'title' | 'run'>>);

/** Registers integration-specific tests inside a reusable suite. */
export type WorkflowSuiteAddition = (test: WorkflowTest) => void;

/**
 * Changes applied by an integration before a reusable suite is registered.
 */
export interface WorkflowSuiteCustomization<T extends WorkflowTestCases> {
    /** Registers every case as skipped with this reason. */
    skip?: string;
    /** Replaces the implementation or skips a base case, optionally changing its title. */
    replace?: Partial<{ [K in keyof T]: WorkflowTestCaseReplacement }>;
    /** Wraps the effective implementation of a base test case. */
    extend?: Partial<{ [K in keyof T]: (base: WorkflowTestBody) => WorkflowTestBody }>;
    /** Additional integration-specific tests registered as part of the suite. */
    additional?: WorkflowSuiteAddition;
}

export interface CustomizedWorkflowTestCases<T extends WorkflowTestCases> {
    /** Base cases after applying replacements and extensions, still keyed by their stable identifiers. */
    cases: T;
    /** Integration-specific test registration callback. */
    additional?: WorkflowSuiteAddition;
}

/**
 * Resolves the test cases of a reusable suite after applying integration-specific customizations.
 *
 * @param cases base cases keyed by stable identifiers
 * @param customization replacements, extensions and additional cases
 * @returns effective test cases ready to be registered by the suite factory
 */
export function customizeWorkflowTestCases<T extends WorkflowTestCases>(
    cases: T,
    customization: WorkflowSuiteCustomization<T> = {}
): CustomizedWorkflowTestCases<T> {
    const customized = Object.fromEntries(
        (Object.keys(cases) as (keyof T)[]).map(id => {
            const testCase = { ...cases[id], ...customization.replace?.[id] };
            const run = customization.extend?.[id]?.(testCase.run) ?? testCase.run;
            return [id, { ...testCase, run }];
        })
    ) as unknown as T;

    return {
        cases: customized,
        additional: customization.additional
    };
}

/**
 * Selects normal or statically skipped registration for a reusable case.
 *
 * Suite factories invoke the returned Playwright function at each case declaration instead of
 * registering a record in a loop. Playwright therefore retains a distinct report and IDE source
 * location for every case, while skipped cases never resolve their fixtures.
 */
export function selectWorkflowTest(test: WorkflowTest, testCase: WorkflowTestCase): WorkflowTest | WorkflowTest['skip'] {
    return testCase.skip === undefined ? test : test.skip;
}

/**
 * Builds the declaration arguments for a reusable case, including its static skip annotation.
 */
export function workflowTestArguments(
    testCase: WorkflowTestCase
): [title: string, details: TestDetails, body: (fixtures: WorkflowTestFixtures, testInfo: TestInfo) => Promise<void>] {
    const details: TestDetails = testCase.skip === undefined ? {} : { annotation: { type: 'skip', description: testCase.skip } };
    return [testCase.title, details, async ({ workflow }, testInfo) => testCase.run(workflow, testInfo)];
}
