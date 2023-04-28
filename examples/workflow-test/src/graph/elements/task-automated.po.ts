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
import {
    Mix,
    useClickableFlow,
    useCommandPaletteCapability,
    useHoverableFlow,
    useMarkerCapability,
    usePopupCapability,
    useResizeHandleCapability
} from '@eclipse-glsp/glsp-playwright/extension';
import { ChildrenAccessor, NodeMetadata, PNode, SVGMetadataUtils } from '@eclipse-glsp/glsp-playwright/glsp';
import { LabelHeading } from './label-heading.po';

export const TaskAutomatedMixin = Mix(PNode)
    .flow(useClickableFlow)
    .flow(useHoverableFlow)
    .capability(useResizeHandleCapability)
    .capability(usePopupCapability)
    .capability(useCommandPaletteCapability)
    .capability(useMarkerCapability)
    .build();

@NodeMetadata({
    type: 'task:automated'
})
export class TaskAutomated extends TaskAutomatedMixin {
    override readonly children = new TaskAutomatedChildren(this);
}

export class TaskAutomatedChildren extends ChildrenAccessor {
    async label(): Promise<LabelHeading> {
        return this.ofType(LabelHeading, { selector: SVGMetadataUtils.typeAttrOf(LabelHeading) });
    }
}
