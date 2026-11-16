// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { validateValue } from '@cratis/scene.engine';
import type { PropertyDescriptor } from '@cratis/scene.model';
import type { EditorProblem } from '../Registry/PropertyEditorProps';

// What Scene says is wrong with a value before it is committed - the same check the edit goes through, so an editor shows the engine's
// own code and message inline (PE2) rather than a rule of its own. Nothing when the value is fine or not set.
export function draftProblem(descriptor: PropertyDescriptor, value: unknown): EditorProblem | undefined {
    if (value === undefined) return undefined;
    const message = validateValue(descriptor, value);
    return message === undefined ? undefined : { code: 'invalidValue', message };
}
