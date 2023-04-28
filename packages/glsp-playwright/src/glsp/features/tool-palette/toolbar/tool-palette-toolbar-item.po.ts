/********************************************************************************
 * Copyright (c) 2023 Business Informatics Group (TU Wien) and others.
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
import { useClickableFlow } from '~/extension/flows';
import { Mix } from '~/extension/mixin';
import type { GLSPLocator } from '~/remote';
import { Input } from '~/remote';
import type { ConstructorT } from '~/types';
import { definedGLSPAttr } from '~/utils/ts.utils';
import { BaseToolPaletteItem } from '../tool-palette-item.base';
import type { GLSPToolPalette } from '../tool-palette.po';

export type ToolPaletteToolbarItemConstructor<TElement extends ToolPaletteToolbarItem> = ConstructorT<
    TElement,
    [GLSPLocator, GLSPToolPalette]
>;

const ToolPaletteToolbarItemMixin = Mix(BaseToolPaletteItem).flow(useClickableFlow).build();
export class ToolPaletteToolbarItem extends ToolPaletteToolbarItemMixin {
    async classAttr(): Promise<string> {
        return definedGLSPAttr(this.locator, 'class');
    }

    async titleAttr(): Promise<string> {
        return definedGLSPAttr(this.locator, 'title');
    }
}

export class SearchToolbarItem extends ToolPaletteToolbarItem {
    readonly input;

    constructor(locator: GLSPLocator, toolPalette: GLSPToolPalette) {
        super(locator, toolPalette);
        this.input = new Input(toolPalette.locator.child('[id$="_tool-palette_search_field"]'));
    }

    async search(text: string): Promise<void> {
        if (await this.input.isHidden()) {
            await this.click();
            await this.input.focus();
        }

        await this.input.type(text);
        await this.input.press('Enter');
    }
}
