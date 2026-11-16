// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode, type Form, type QueryCandidate, type SceneElement } from '@cratis/scene.model';
import { commandNameOf, sliceNamedBy, type StateChangeSlice } from '../Actions/StateChangeSlice';
import { commandFormElements } from '../Forms/commandFormElements';
import { choicesFor, type FieldChoices } from '../Forms/fieldChoices';
import { formOfCommand, modeFor } from '../Forms/formEditing';
import type { CommandDataField } from './DataField';

// One property of the screen's command, as the Data drawer lists it: its concept, whether the screen's form has a field for it, and the picker it is.
export interface CommandPropertyContext {
    field: CommandDataField;
    required: boolean;
    placed: boolean;

    // What the field chooses from, when the property is a picker: the choices the field states, or the ones its concept implies.
    choices?: FieldChoices;
}

// The command a screen submits as the data it is bound to.
export interface CommandContext {
    sliceId: string;
    name: string;
    properties: CommandPropertyContext[];

    // Whether the screen has a command form for the command at all.
    hasForm: boolean;

    // Whether every property has a field: nothing is left for Generate the form to place.
    complete: boolean;
}

const fillsProperty = (form: Form, property: string): boolean => form.fields.some(field => (field.sourceProperty ?? field.name) === property);

// What is placed of the screen's command: with a command form on the screen, an automatic form has a field for every property and a form written
// by hand has the fields it lists; with none, nothing is placed.
export function commandContextOf(
    sliceId: string | undefined,
    slices: readonly StateChangeSlice[],
    forms: readonly Form[],
    roots: readonly SceneElement[],
    candidates: readonly QueryCandidate[]): CommandContext | undefined {
    const slice = sliceId ? sliceNamedBy(slices, sliceId) : undefined;
    if (!slice) return undefined;
    const hasForm = commandFormElements(roots, slices).some(element => element.command === slice.id || element.commandName === commandNameOf(slice));
    const form = formOfCommand(forms, slice);
    const automatic = !form || modeFor(form, slice) === FormGenerationMode.Auto;
    const properties = slice.inputs.map<CommandPropertyContext>(input => {
        const own = form?.fields.find(field => (field.sourceProperty ?? field.name) === input.name);
        return {
            field: { source: 'command', sliceId: slice.id, command: commandNameOf(slice), property: input.name, type: input.type },
            required: input.required,
            placed: hasForm && (automatic || (form !== undefined && fillsProperty(form, input.name))),
            ...(choicesFor(own ?? { name: input.name }, input.type, candidates) ? { choices: choicesFor(own ?? { name: input.name }, input.type, candidates) } : {}),
        };
    });
    return { sliceId: slice.id, name: commandNameOf(slice), properties, hasForm, complete: properties.every(property => property.placed) };
}
