// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { elementNodeId, isExternalComponent } from '@cratis/scene.engine';
import { SceneEditKind, type SceneEdit, type SceneElement } from '@cratis/scene.model';
import { childrenOfElement } from '../Selection/sceneTree';
import { commandNameOf, sliceNamedBy, type StateChangeSlice } from '../Actions/StateChangeSlice';

// The component that presents a command's form, and the property by which it names that command.
export const commandFormComponentName = 'commandForm';
export const commandProperty = 'command';

export const isCommandFormType = (typeId: string): boolean => typeId.slice(typeId.lastIndexOf(':') + 1) === commandFormComponentName;

export interface CommandFormElement {
    elementId: string;

    // The command the element names - a slice id, or a command's name - and the name of the slice's command when the model has it.
    command: string;
    commandName: string | undefined;
}

// Every command form element in the trees, with the command each one presents.
export function commandFormElements(roots: readonly SceneElement[], slices: readonly StateChangeSlice[]): CommandFormElement[] {
    return roots.flatMap(element => {
        const own = isExternalComponent(element as never) && isCommandFormType((element as unknown as { componentName: string }).componentName)
            ? [toCommandFormElement(element, slices)]
            : [];
        return [...own, ...commandFormElements(childrenOfElement(element), slices)];
    });
}

function toCommandFormElement(element: SceneElement, slices: readonly StateChangeSlice[]): CommandFormElement {
    const command = (element as { properties?: Record<string, unknown> }).properties?.[commandProperty];
    const id = typeof command === 'string' ? command : '';
    return { elementId: (element as { id: string }).id, command: id, commandName: sliceNamedBy(slices, id) ? commandNameOf(sliceNamedBy(slices, id)!) : undefined };
}

// The Scene edit that makes a command form element name a command - the slice's id, as an action does - or, with no slice, name none.
export function commandEdit(elementId: string, slice: StateChangeSlice | undefined): SceneEdit {
    return slice
        ? { kind: SceneEditKind.SetProperty, nodeId: elementNodeId(elementId), path: commandProperty, value: slice.id }
        : { kind: SceneEditKind.ResetProperty, nodeId: elementNodeId(elementId), path: commandProperty };
}
