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
import { useHoverableFlow } from '~/extension/flows';
import { ModelElementMetadata, PModelElement, PModelElementData, SVGMetadataUtils } from '~/glsp/graph';
import { Mix } from '../../mixin';
import { usePopupCapability } from '../popup/popup.capability';

export interface MarkerData extends PModelElementData {
    /**
     * The marker can be accessed either directly or as a child from an element.
     */
    isParentLocator?: boolean;
}

const MarkerMixin = Mix(PModelElement).flow(useHoverableFlow).capability(usePopupCapability).build();

@ModelElementMetadata({
    type: 'marker'
})
export class Marker extends MarkerMixin {
    constructor(data: MarkerData) {
        super({ locator: data.isParentLocator ? data.locator.child(SVGMetadataUtils.typeAttrOf(Marker)) : data.locator });
    }
}
