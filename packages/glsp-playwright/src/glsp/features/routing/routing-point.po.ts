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
import type { Locator } from '@playwright/test';
import type { AutoPrepareOptions, AutoWaitOptions } from '~/extension';
import { Clickable, Mix, useDraggableFlow } from '~/extension';
import { ModelElementMetadata, PEdge, PMetadata, PModelElement, PModelElementData, PModelElementSnapshot, SVGMetadata } from '~/glsp/graph';
import type { GLSPLocator } from '~/remote';
import type { Position } from '~/types';
import { definedAttr, definedGLSPAttr } from '~/utils/ts.utils';

export type RoutingPointKind = 'junction' | 'line' | 'source' | 'target';

export class RoutingPoints {
    readonly pointsLocator;
    readonly volatilePointsLocator;

    constructor(public readonly element: PEdge & Clickable) {
        this.pointsLocator = this.element.locate().locator(`> [${SVGMetadata.type}='${PMetadata.getType(RoutingPoint)}']`);
        this.volatilePointsLocator = this.element.locate().locator(`> [${SVGMetadata.type}='${PMetadata.getType(VolatileRoutingPoint)}']`);
    }

    protected async autoWait(options?: AutoWaitOptions): Promise<void> {
        if (options?.wait === false) {
            return;
        }

        await this.pointsLocator.nth(0).waitFor({ state: 'visible', timeout: options?.timeout });
        await this.volatilePointsLocator.nth(0).waitFor({ state: 'visible', timeout: options?.timeout });
    }

    async enable(): Promise<void> {
        await this.element.graph.waitForCreation(PMetadata.getType(RoutingPoint), async () => {
            await this.element.click({ dispatch: true });
        });
    }

    async points(options?: AutoWaitOptions): Promise<RoutingPoint[]> {
        await this.autoWait(options);

        const elements: RoutingPoint[] = [];

        for await (const childLocator of await this.pointsLocator.all()) {
            const id = await definedAttr(childLocator, 'id');

            const routingPoint = new RoutingPoint(this.element.locator.child(`#${id}`), this);
            await routingPoint.snapshot();
            elements.push(routingPoint);
        }

        return elements;
    }

    async volatilePoints(options?: AutoWaitOptions): Promise<VolatileRoutingPoint[]> {
        await this.autoWait(options);

        const elements: RoutingPoint[] = [];

        for await (const childLocator of await this.volatilePointsLocator.all()) {
            const id = await definedAttr(childLocator, 'id');

            const routingPoint = new RoutingPoint(this.element.locator.child(`#${id}`), this);
            await routingPoint.snapshot();
            elements.push(routingPoint);
        }

        return elements;
    }
}

export interface RoutingPointSnapshot extends PModelElementSnapshot {
    kind: RoutingPointKind;
}

const BaseRoutingPointMixin = Mix(PModelElement).flow(useDraggableFlow).build();
export abstract class BaseRoutingPoint extends BaseRoutingPointMixin {
    readonly routingPoints;
    override lastSnapshot?: RoutingPointSnapshot | undefined;

    constructor(data: PModelElementData & { routingPoints: RoutingPoints }) {
        super(data);

        this.routingPoints = data.routingPoints;
    }

    override async snapshot(): Promise<RoutingPointSnapshot> {
        this.lastSnapshot = {
            snapshotTime: new Date().getTime(),
            class: await this.classAttr(),
            id: await this.idAttr(),
            type: await this.typeAttr(),
            kind: await this.dataKindAttr()
        } as RoutingPointSnapshot;

        return this.lastSnapshot;
    }

    protected async autoPrepare(options?: AutoPrepareOptions): Promise<void> {
        if (options?.prepare === false) {
            return;
        }

        if (await this.isHidden()) {
            await this.routingPoints.element.click();
            await this.waitForVisible(options?.timeout);
        }
    }

    async dataKindAttr(): Promise<RoutingPointKind> {
        return (await definedGLSPAttr(this.locator, 'data-kind')) as RoutingPointKind;
    }

    override async dragToAbsolutePosition(position: Position, options?: AutoPrepareOptions): Promise<void> {
        await this.autoPrepare(options);

        await super.dragToAbsolutePosition(position);
    }

    override async dragToRelativePosition(position: Position, options?: AutoPrepareOptions): Promise<void> {
        await this.autoPrepare(options);

        await super.dragToRelativePosition(position);
    }

    override async dragTo(
        target: Locator,
        options?: {
            force?: boolean;
            noWaitAfter?: boolean;
            sourcePosition?: { x: number; y: number };
            targetPosition?: { x: number; y: number };
            timeout?: number;
            trial?: boolean;
        } & AutoPrepareOptions
    ): Promise<void> {
        await this.autoPrepare();

        await super.dragTo(target, options);
    }
}

@ModelElementMetadata({
    type: 'routing-point'
})
export class RoutingPoint extends BaseRoutingPoint {
    constructor(locator: GLSPLocator, routingPoints: RoutingPoints) {
        super({
            routingPoints,
            locator
        });
    }
}

@ModelElementMetadata({
    type: 'volatile-routing-point'
})
export class VolatileRoutingPoint extends BaseRoutingPoint {
    constructor(locator: GLSPLocator, routingPoints: RoutingPoints) {
        super({
            routingPoints,
            locator
        });
    }
}
