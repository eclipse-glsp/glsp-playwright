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

import { Locator } from '@playwright/test';
import { waitForFunction } from '~/integration/wait.fixes';

export async function waitForClassRemoval(locator: Locator, className: string, timeout: number = 30000): Promise<void> {
    await locator.waitFor({
        timeout,
        state: 'attached'
    });

    const element = await locator.elementHandle();

    await waitForFunction(async () => {
        const contains = (await element?.evaluate((e, c) => e.classList.contains(c), className)) ?? false;
        return !contains;
    });
}
