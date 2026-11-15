// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Opens, OutletSubject, SceneEditKind, type SceneEdit } from '@cratis/scene.model';
import { elementNodeId } from '@cratis/scene.engine';
import type { ActionModel } from './ActionModel';

// The component Scene describes for an action that submits a modeled command.
export const actionComponentName = 'action';

// Where the slice opens (Scene 5 `opens`, which replaced an action's presentation), beside the command and argument mapping Scene describes.
export const opensProperty = 'opens';

// The slot of the page the slice opens in, when it opens in a slot.
export const opensInProperty = 'opensIn';

// What the action acts on, and when it is enabled.
export const subjectProperty = 'subject';
export const enabledWhenProperty = 'enabledWhen';

// The mapping property Scene describes on the action: a collection of argument name / source pairs.
export const argumentsProperty = 'arguments';

const stringValue = (value: unknown): string => (typeof value === 'string' ? value : '');

// Reads an action from the properties of a \`action\` component. The command is the slice's id - never its name - and the
// argument mapping is Scene's own collection, so there is no editor-only action shape to keep in step with the runtime.
export function readActionModel(properties: Record<string, unknown> | undefined, sliceName = ''): ActionModel | undefined {
    const command = stringValue(properties?.command);
    if (command === '') return undefined;

    const mapped = Array.isArray(properties?.[argumentsProperty]) ? properties![argumentsProperty] as { name?: unknown; source?: unknown }[] : [];
    const inputs = Object.fromEntries(mapped.map(entry => [stringValue(entry.name), stringValue(entry.source)]).filter(([name]) => name !== ''));

    const opens = stringValue(properties?.[opensProperty]);
    const opensIn = stringValue(properties?.[opensInProperty]);
    const subject = stringValue(properties?.[subjectProperty]);
    const enabledWhen = stringValue(properties?.[enabledWhenProperty]);
    return {
        sliceId: command,
        sliceName,
        inputs,
        opens: (Object.values(Opens) as string[]).includes(opens) ? opens as Opens : Opens.Automatic,
        ...(opensIn === '' ? {} : { opensIn }),
        ...((Object.values(OutletSubject) as string[]).includes(subject) ? { subject: subject as OutletSubject } : {}),
        ...(enabledWhen === '' ? {} : { enabledWhen }),
    };
}

// The properties an action writes, in the shape the \`action\` component stores them.
export function toActionProperties(model: ActionModel): Record<string, unknown> {
    return {
        command: model.sliceId,
        [opensProperty]: model.opens,
        ...(model.opens === Opens.Slot && model.opensIn ? { [opensInProperty]: model.opensIn } : {}),
        ...(model.subject ? { [subjectProperty]: model.subject } : {}),
        ...(model.enabledWhen ? { [enabledWhenProperty]: model.enabledWhen } : {}),
        [argumentsProperty]: Object.entries(model.inputs)
            .filter(([, source]) => source.trim() !== '')
            .map(([name, source]) => ({ id: name, name, source: source.trim() })),
    };
}

// The Scene edits that make a component carry this action. The command is required, so an action cannot be blanked - to
// have no action, the component is removed (or never added). Changing it replaces the command, mapping and presentation.
// What the component carries now is given so that what the action no longer says - a slot, a subject, a condition - is reset rather than left behind.
export function actionEdits(componentId: string, model: ActionModel, current?: Record<string, unknown>): SceneEdit[] {
    const nodeId = elementNodeId(componentId);
    const written = toActionProperties(model);
    const cleared = [opensInProperty, subjectProperty, enabledWhenProperty]
        .filter(path => !(path in written) && current?.[path] !== undefined && current[path] !== '')
        .map((path): SceneEdit => ({ kind: SceneEditKind.ResetProperty, nodeId, path }));
    return [...Object.entries(written).map(([path, value]): SceneEdit => ({ kind: SceneEditKind.SetProperty, nodeId, path, value })), ...cleared];
}
