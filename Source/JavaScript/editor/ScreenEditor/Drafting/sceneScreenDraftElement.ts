// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { SceneElement } from '@cratis/scene.model';
import { createExternalComponent } from '../Document/createExternalComponent';
import { createPanel } from '../Document/createPanel';
import { LayoutItem } from '../Layouts/LayoutItem';
import type { ScreenEditorRuntime } from '../Runtime/screenEditorRuntime';
import { supportedDraftComponents } from './sceneScreenDraftRequest';
import { isRecord, sameValue } from './sceneScreenDraftValues';

const validIdentity = (value: Record<string, unknown>) => typeof value.id === 'string' && /^[a-zA-Z][\w-]{0,99}$/.test(value.id);
const validName = (value: Record<string, unknown>) => typeof value.name === 'string' && !!value.name.trim() && value.name.length <= 200;

const validShape = (value: Record<string, unknown>) => validIdentity(value) && validName(value);

function componentElement(value: Record<string, unknown>, componentName: string, runtime: ScreenEditorRuntime): SceneElement {
    if (!supportedDraftComponents(runtime).some(component => component.component === componentName)) throw new Error('The component is not supported by the active profile.');
    const built = createExternalComponent(value.id as string, value.name as string, componentName);
    if (!sameValue(value, built)) throw new Error('Insert an empty component, then set described properties separately.');
    return built;
}

function layoutElement(value: Record<string, unknown>): SceneElement {
    const built = [LayoutItem.Stack, LayoutItem.Row].map(layout => createPanel(layout, value.id as string, value.name as string)).find(candidate => sameValue(value, candidate));
    if (!built) throw new Error('Only empty Stack and Row containers are supported.');
    return built;
}

// Never casts an untrusted payload into a replacement document: reconstructs only empty known factories.
export function insertionElement(value: unknown, runtime: ScreenEditorRuntime): SceneElement {
    if (!isRecord(value) || !validShape(value)) throw new Error('New controls need a unique ID and a readable name.');
    return typeof value.componentName === 'string' ? componentElement(value, value.componentName, runtime) : layoutElement(value);
}

