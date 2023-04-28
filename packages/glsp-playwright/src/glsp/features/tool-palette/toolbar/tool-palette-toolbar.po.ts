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
import type { GLSPToolPalette } from '../tool-palette.po';
import { SearchToolbarItem, ToolPaletteToolbarItem, ToolPaletteToolbarItemConstructor } from './tool-palette-toolbar-item.po';

export class GLSPToolPaletteToolbar {
    readonly toolbarLocator;

    constructor(public readonly toolPalette: GLSPToolPalette) {
        this.toolbarLocator = this.toolPalette.locator.child('.header-tools');
    }

    itemByIcon<TElement extends ToolPaletteToolbarItem>(
        iconSelector: string,
        constructor: ToolPaletteToolbarItemConstructor<TElement>
    ): TElement {
        const locator = this.toolbarLocator.child(iconSelector);

        return new constructor(locator, this.toolPalette);
    }

    selectionTool(): ToolPaletteToolbarItem {
        return this.itemByIcon('.codicon-inspect', ToolPaletteToolbarItem);
    }

    deletionTool(): ToolPaletteToolbarItem {
        return this.itemByIcon('.codicon-chrome-close', ToolPaletteToolbarItem);
    }

    marqueeTool(): ToolPaletteToolbarItem {
        return this.itemByIcon('.codicon-screen-full', ToolPaletteToolbarItem);
    }

    validateTool(): ToolPaletteToolbarItem {
        return this.itemByIcon('.codicon-pass', ToolPaletteToolbarItem);
    }

    searchTool(): SearchToolbarItem {
        return this.itemByIcon('.codicon-search', SearchToolbarItem);
    }
}
