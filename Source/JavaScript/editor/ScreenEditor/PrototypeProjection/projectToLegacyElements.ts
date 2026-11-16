// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isExternalComponent, isPanel } from '@cratis/scene.engine';
import type { Panel, SceneElement } from '@cratis/scene.model';
import { appliedState, stateFields } from './applyLegacyState';
import { legacyTypeOfLayoutItem } from './layoutContainerItems';
import type { LegacyExtras } from './LegacyExtras';
import { canvasLeft, canvasTop, legacyExtrasKey, legacyOriginalKey, legacyTypeKey } from './legacyPlacement';
import { legacyClassName } from './sceneComponentName';
import { withoutNulls } from './withoutNulls';
import { childrenOfElement } from '../Selection/sceneTree';
import { panelLayoutItem } from '../Selection/panelLayoutItem';

// Names the legacy type of a component that was added in the new editor, so the readers that still draw the earlier shape
// can draw it. Return nothing when no legacy library offers it.
export type NativeLegacyType = (componentName: string) => string | undefined;

type Fields = Record<string, unknown>;
type Placed = SceneElement & { id: string; name?: string; size?: { width?: number; height?: number }; zIndex?: number; properties?: Fields };

// The prototype element shape the board thumbnails, the viewer and every other reader of Elements still draw. The Scene
// document is the source of truth; this is saved beside it so those readers keep working. Converted elements get their
// stored state back, new panels are written as layout containers, and an element Scene could not take is written as it was
// stored, with where it was moved to and what it holds now laid over it.
export function projectToLegacyElements(root: Panel | undefined, nativeType: NativeLegacyType = () => undefined): unknown[] {
    return withoutNulls((root?.children ?? []).map(child => project(child, nativeType)));
}

const numberOr = (value: unknown, fallback: number): number => (typeof value === 'number' ? value : fallback);

function project(element: SceneElement, nativeType: NativeLegacyType): unknown {
    const base = element as Placed;
    const properties: Fields = { ...(base.properties ?? {}) };
    const children = childrenOfElement(element).map(child => project(child, nativeType));
    const original = properties[legacyOriginalKey];

    if (original !== undefined && original !== null && typeof original === 'object') return overlay(original as Fields, base, properties, children);

    const extras = properties[legacyExtrasKey] as LegacyExtras | undefined;
    const stored = typeof properties[legacyTypeKey] === 'string' && properties[legacyTypeKey] !== '' ? properties[legacyTypeKey] as string : undefined;
    const type = stored ?? (isPanel(element) ? legacyTypeOfLayoutItem(panelLayoutItem(element)!) : nativeType(isExternalComponent(element) ? element.componentName : ''));
    const componentName = isExternalComponent(element) ? element.componentName : '';

    const { [legacyTypeKey]: _type, [legacyExtrasKey]: _extras, [canvasLeft]: left, [canvasTop]: top, ...own } = properties;
    const topFields: Fields = {};
    for (const key of extras?.topKeys ?? []) {
        if (key in own) {
            topFields[key] = own[key];
            delete own[key];
        }
    }

    const x = numberOr(left, extras?.position.x ?? 0);
    const y = numberOr(top, extras?.position.y ?? 0);
    const named = base.name ?? '';
    const keepsTypeAsName = extras?.emptyName === true && named === (stored ?? '');

    return {
        ...stateOf(base, extras),
        ...topFields,
        _derivedTypeId: type ?? 'externalComponent',
        id: base.id,
        ...(keepsTypeAsName ? {} : { name: named }),
        componentName: type ? type.slice(type.lastIndexOf('.') + 1) : legacyClassName(componentName),
        properties: { ...own, canvas: { ...(extras?.canvas ?? {}), x, y } },
        slots: { ...(extras?.slots ?? {}), ...(children.length > 0 ? { children } : {}) },
        width: base.size?.width,
        height: base.size?.height,
        ZIndex: base.zIndex ?? 0,
    };
}

// The element base state: what was stored, with a Scene field laid over it only where it was changed in the new editor.
function stateOf(element: Placed, extras: LegacyExtras | undefined): Fields {
    const stored = extras?.top ?? {};
    const applied = appliedState(stored);
    const current = element as unknown as Fields;
    const result: Fields = { ...stored };
    for (const field of stateFields) {
        if (JSON.stringify(current[field]) !== JSON.stringify(applied[field])) result[field] = current[field];
    }

    return result;
}

// Lays what the element is now over the original that could not be converted: where it is, how big, its name and what it holds.
function overlay(original: Fields, element: Placed, properties: Fields, children: unknown[]): Fields {
    const result: Fields = { ...original };
    const stored = (original.properties ?? {}) as Fields;
    const canvas = (stored.canvas ?? {}) as Fields;
    const left = properties[canvasLeft];
    const top = properties[canvasTop];

    if (typeof left === 'number' || typeof top === 'number') {
        if (original.position && typeof original.position === 'object') {
            result.position = { ...(original.position as Fields), x: numberOr(left, numberOr(canvas.x, 0)), y: numberOr(top, numberOr(canvas.y, 0)) };
        } else {
            result.properties = { ...stored, canvas: { ...canvas, x: numberOr(left, numberOr(canvas.x, 0)), y: numberOr(top, numberOr(canvas.y, 0)) } };
        }
    }

    if (element.size?.width !== undefined) result.width = element.size.width;
    if (element.size?.height !== undefined) result.height = element.size.height;
    if (element.name !== undefined && element.name !== '' && element.name !== original.componentName && element.name !== (original._derivedTypeId as string | undefined)) result.name = element.name;
    if (element.zIndex !== undefined && 'ZIndex' in original) result.ZIndex = element.zIndex;

    const slots = (original.slots ?? {}) as Fields;
    if (children.length > 0 || 'children' in slots) result.slots = { ...slots, children };
    return result;
}
