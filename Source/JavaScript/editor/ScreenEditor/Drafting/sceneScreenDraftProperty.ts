// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { inspect, validateValue, type EditingContext } from '@cratis/scene.engine';
import { SceneEditKind, type PropertyDescriptor, type SceneEdit } from '@cratis/scene.model';
import { supportedDraftProperty } from './sceneScreenDraftRequest';
import { hasOnlyKeys } from './sceneScreenDraftValues';
import type { DraftState } from './sceneScreenDraftState';

function addedNodeId(raw: Record<string, unknown>, state: DraftState): string {
    const shaped = hasOnlyKeys(raw, ['kind', 'nodeId', 'path', 'value']) && typeof raw.nodeId === 'string' && raw.nodeId.startsWith('element:') && typeof raw.path === 'string';
    if (!shaped || !state.added.has((raw.nodeId as string).slice('element:'.length))) throw new Error('Set properties only on controls added by this draft.');
    return raw.nodeId as string;
}

function checkedValue(descriptor: PropertyDescriptor, value: unknown) {
    if (!['string', 'number', 'boolean'].includes(typeof value)) throw new Error('Only scalar property values are supported; query bindings are unsupported.');
    if (validateValue(descriptor, value) !== undefined) throw new Error('The property value does not match its descriptor.');
    return value as string | number | boolean;
}

export function propertyEdit(raw: Record<string, unknown>, state: DraftState, context: EditingContext): SceneEdit {
    const nodeId = addedNodeId(raw, state);
    const property = inspect(state.document, nodeId, context)?.properties.find(candidate => candidate.descriptor.path === raw.path);
    if (!property?.editable || !supportedDraftProperty(property.descriptor)) throw new Error('This property is not supported or editable.');
    return { kind: SceneEditKind.SetProperty, nodeId, path: raw.path as string, value: checkedValue(property.descriptor, raw.value) };
}
