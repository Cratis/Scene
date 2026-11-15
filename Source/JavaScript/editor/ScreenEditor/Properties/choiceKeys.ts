// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { InspectedProperty } from '@cratis/scene.model';

// The generic choice control identifies an option by a string, but a Scene choice is a typed value: `1` and `'1'` are two
// different choices, and a migrated document stores the number. The control is therefore handed a key that carries the
// type of the value, and the value that is applied is always the choice's own, never the text the control reports.
export const choiceKey = (value: unknown): string => `${typeof value}:${String(value)}`;

// What the control is handed as the selected key: the key of the stored choice, or the control's own "unset" option (the empty
// key) for a property that holds nothing. A property that was never set, or that Scene reports as null, selects "unset".
export const selectedChoiceKey = (value: unknown): string => value === undefined || value === null ? '' : choiceKey(value);

// What picking an option by key means. The control reports its "unset" option as nothing (or the empty key), and that is a request
// to put the property back to its default - `{ value: undefined }`, which becomes a reset. A key that names a choice gives the
// choice's own typed value. A key that names nothing (the control's text, a stale key) is not a change at all: `undefined`.
export function choiceValueOf(property: InspectedProperty, key: unknown): { value: unknown } | undefined {
    if (key === undefined || key === null || key === '') return { value: undefined };
    const choice = (property.descriptor.choices ?? []).find(candidate => choiceKey(candidate.value) === key);
    return choice ? { value: choice.value } : undefined;
}

// One option of a choice control: the key that identifies it, the text shown and the typed value stored when it is picked.
export interface ChoiceOption {
    key: string;
    label: string;
    value: unknown;
}

// The options a choice control offers for a descriptor's choices. A stored value that is none of them (an older document) is kept
// selectable under its own, readable, text; the control would otherwise offer it under the internal key, which is not something an author
// can read. A property never set, or that Scene reports as null, adds nothing.
export function choiceOptions(choices: readonly { value: unknown; label: string }[], stored: unknown): ChoiceOption[] {
    const options = choices.map(choice => ({ key: choiceKey(choice.value), label: choice.label, value: choice.value }));
    const known = stored === undefined || stored === null || options.some(option => option.key === choiceKey(stored));
    return known ? options : [...options, { key: choiceKey(stored), label: String(stored), value: stored }];
}
