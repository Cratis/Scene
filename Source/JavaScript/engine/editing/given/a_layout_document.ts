// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    EditingScopeKind, FlowContainerKind, HeightSizeClass, Orientation, SceneDocument, SceneElement, WidthSizeClass,
} from '@cratis/scene.model';
import { EditingContext } from '../../index';
import { catalog, component, shell } from './a_scene_document';

/** A panel-shaped element: everything a `FrameworkElement` has, plus its own properties and children. */
export function panel(id: string, own: Record<string, unknown>, children: SceneElement[] = []): SceneElement {
    const { componentName: _componentName, slots: _slots, ...frameworkElement } = component(id, 'ignored');
    return { ...frameworkElement, children, ...own } as unknown as SceneElement;
}

export const stackPanel = (id: string, children: SceneElement[], spacing = 0) => panel(id, { orientation: Orientation.Vertical, spacing }, children);
export const wrapPanel = (id: string, children: SceneElement[], itemWidth?: number) => panel(id, { orientation: Orientation.Horizontal, itemWidth }, children);

export const table = (id: string) => component(id, 'test:table');

const compact = { width: WidthSizeClass.Compact, height: HeightSizeClass.Compact };
const regular = { width: WidthSizeClass.Regular, height: HeightSizeClass.Regular };

export const mainSlot = 'screenTemplate:Page#slot:main';
export const sideSlot = 'screenTemplate:Page#slot:side';
export const canvasSlot = 'screenTemplate:Page#slot:canvas';

/**
 * A template with a flow column in `main` (a row of `a`, `b` above a growing `c`), a freeform `canvas` with `f`
 * placed in two size-class variants, and a `side` slot holding a stack panel of `g` and `h` and a lone `i`. A
 * screen `Home` fills it.
 */
export function createLayoutDocument(): SceneDocument {
    return {
        layouts: [{ ...shell, slots: [{ name: 'content' }] }],
        screenTemplates: [{
            name: 'Page',
            fitsSlot: 'content',
            slots: [
                {
                    name: 'main',
                    arrangement: {
                        root: {
                            kind: FlowContainerKind.Column, gap: 8,
                            children: [
                                { kind: FlowContainerKind.Row, gap: 4, children: [{ content: table('a') }, { content: table('b') }] },
                                { content: table('c'), grow: 1 },
                            ],
                        },
                    } as never,
                },
                {
                    name: 'canvas',
                    arrangement: {
                        variants: [
                            { sizeClass: compact, placements: [{ element: stackPanel('freeStack', [table('f')]), x: 0, y: 0, width: 100, height: 50 }] },
                            { sizeClass: regular, placements: [{ element: stackPanel('freeStack', [table('f')]), x: 10, y: 10, width: 200, height: 80 }] },
                        ],
                    } as never,
                },
                { name: 'side' },
            ],
            content: { side: [stackPanel('stack', [table('g'), table('h')], 6), table('i')] },
        }],
        dialogTemplates: [],
        screens: [{ name: 'Home', layout: 'Shell', screenTemplate: 'Page', forms: [], contributions: [], slotContent: { side: [table('j')] } }],
        exposures: [],
        instanceContributions: [],
    };
}

export function pageContext(extra: Partial<EditingContext> = {}): EditingContext {
    return { catalog, scope: { kind: EditingScopeKind.ScreenTemplate, name: 'Page', layout: 'Shell' }, ...extra };
}

export function homeContext(extra: Partial<EditingContext> = {}): EditingContext {
    return { catalog, scope: { kind: EditingScopeKind.Screen, name: 'Home' }, ...extra };
}

/** Freezes a document deeply, so any edit that mutates it throws instead of passing quietly. */
export function deepFreeze<T>(value: T): T {
    if (value !== null && typeof value === 'object') {
        Object.freeze(value);
        for (const child of Object.values(value)) deepFreeze(child);
    }

    return value;
}
