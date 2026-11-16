// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isCanvas, isExternalComponent, isPanel } from '@cratis/scene.engine';
import { SceneEditKind, type SceneEdit, type SceneElement } from '@cratis/scene.model';
import { authoredRoot } from '../Document/studioScreen';
import { placeOnCanvas, placementBelow, placementOf } from '../Document/placeOnCanvas';
import { findSceneElement } from '../Selection/sceneTree';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import { insertionElement } from './sceneScreenDraftElement';
import { hasOnlyKeys } from './sceneScreenDraftValues';
import type { DraftState } from './sceneScreenDraftState';

const isLocalTarget = (target: unknown): target is string => typeof target === 'string' && target.startsWith('element:');

function insertionTarget(raw: Record<string, unknown>): string {
    if (!hasOnlyKeys(raw, ['kind', 'target', 'element', 'index']) || !isLocalTarget(raw.target)) throw new Error('Insert targets must be local containers; slots and other insertion modes are not supported.');
    return raw.target as string;
}

const indexInRange = (index: unknown, length: number) => index === undefined || (typeof index === 'number' && Number.isInteger(index) && index >= 0 && index <= length);

function localContainer(element: SceneElement | undefined) {
    if (!element || !isPanel(element)) return undefined;
    return isExternalComponent(element) ? undefined : element;
}

function insertionParent(target: string, state: DraftState) {
    const parent = localContainer(findSceneElement([authoredRoot(state.document)!], target.slice('element:'.length)));
    if (!parent) throw new Error('Insert only inside the authored screen’s containers.');
    return parent;
}

export function insertEdit(raw: Record<string, unknown>, state: DraftState, runtime: ScreenEditorRuntime): SceneEdit {
    const target = insertionTarget(raw);
    const parent = insertionParent(target, state);
    if (!indexInRange(raw.index, parent.children.length)) throw new Error('The insertion index is out of range.');
    let element = insertionElement(raw.element, runtime);
    const id = (element as { id: string }).id;
    if (state.used.has(id)) throw new Error('An element ID is already in use.');
    state.used.add(id);
    state.added.add(id);
    if (isCanvas(parent)) element = placeOnCanvas(element, placementBelow(parent.children.map(child => ({ placement: placementOf(child) }))));
    return { kind: SceneEditKind.InsertNode, target, element, ...(raw.index === undefined ? {} : { index: raw.index as number }) };
}
