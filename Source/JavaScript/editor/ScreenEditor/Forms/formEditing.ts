// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode, type Form, type FormField } from '@cratis/scene.model';
import { commandNameOf, sliceNamedBy, type StateChangeSlice } from '../Actions/StateChangeSlice';
import { formWithLayout } from './commandFormLayout';

// A form whose fields follow the command: one field for each input, nothing authored on top.
export function autoFormFor(slice: StateChangeSlice): Form {
    return { name: commandNameOf(slice), forCommand: commandNameOf(slice), generationMode: FormGenerationMode.Auto, fields: slice.inputs.map(input => ({ name: input.name })) };
}

// The same form with its fields written out, so each can be labelled, mapped and placed on its own.
export function manualFormFor(form: Form, slice: StateChangeSlice): Form {
    return formWithLayout({ ...form, generationMode: FormGenerationMode.Manual, fields: manualFieldsFor(slice) });
}

function manualFieldsFor(slice: StateChangeSlice): FormField[] {
    return slice.inputs.map(input => ({ name: input.name, sourceProperty: input.name, label: input.name }));
}

// How a form generates its fields: what it says, or - for a form that does not say - what its fields amount to.
export function modeFor(form: Form, slice: StateChangeSlice | undefined): FormGenerationMode {
    if (form.generationMode) return form.generationMode;
    return slice !== undefined && form.fields.length === slice.inputs.length && form.fields.every((field, index) => field.name === slice.inputs[index]?.name && !field.sourceProperty && !field.composeUsing && !field.label && !field.placement) ? FormGenerationMode.Auto : FormGenerationMode.Manual;
}

export function replaceField(form: Form, index: number, field: FormField): Form {
    return { ...form, fields: form.fields.map((candidate, candidateIndex) => candidateIndex === index ? field : candidate) };
}

// The form a command form element presents: the screen's form for the element's command. The element names the command by the
// slice's id, a form names it by the name of the slice's command, so the slice is what joins them.
export function formOfCommand(forms: readonly Form[], slice: StateChangeSlice | undefined): Form | undefined {
    return slice ? forms.find(form => form.forCommand === commandNameOf(slice)) : undefined;
}

// The slice an element's `command` property names, if the model has it: by its id, or by the name of its command.
export const sliceOfCommand = sliceNamedBy;
