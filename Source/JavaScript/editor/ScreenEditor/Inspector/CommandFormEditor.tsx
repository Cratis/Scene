// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { Form, QueryCandidate } from '@cratis/scene.model';
import { formOfCommand, sliceOfCommand } from '../Forms/formEditing';
import type { StateChangeSlice } from '../Actions/StateChangeSlice';
import { FormEditor } from './FormEditor';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface CommandFormEditorProps {
    // The element being edited, so two command forms on one screen never share a control id.
    elementId: string;

    // The command the element names: a slice id, or nothing when it has none yet.
    command: string | undefined;
    slices: readonly StateChangeSlice[];

    // The queries a field can be a picker over.
    queries?: readonly QueryCandidate[];

    // The screen's forms; the one for the element's command is what this edits.
    forms: readonly Form[];
    strings: ScreenEditorStrings;
    disabled: boolean;
    onCommandChange: (slice: StateChangeSlice | undefined) => void;
    onFormChange: (form: Form) => void;
    onFormCreate: (slice: StateChangeSlice) => void;
}

// What a command form element is for: which command it submits, and the form it presents for it. The element owns its command
// the way an action does; the form is found through that command, so selecting the element is the only way to author its form.
export const CommandFormEditor = ({ elementId, command, slices, queries, forms, strings, disabled, onCommandChange, onFormChange, onFormCreate }: CommandFormEditorProps) => {
    const text = strings.properties.commandForm;
    const slice = sliceOfCommand(slices, command);
    const form = formOfCommand(forms, slice);
    const unknownCommand = command !== undefined && command !== '' && !slice;

    return (
        <fieldset className='studio-editor-query studio-editor-properties__command-form' disabled={disabled}>
            <legend>{text.label}</legend>
            <label>
                <span>{text.command}</span>
                <select value={slice?.id ?? command ?? ''} onChange={event => onCommandChange(slices.find(candidate => candidate.id === event.target.value))}>
                    <option value=''>{text.none}</option>
                    {unknownCommand && <option value={command}>{command}</option>}
                    {slices.map(candidate => <option key={candidate.id} value={candidate.id}>{candidate.name}{candidate.origin.length > 0 ? ` - ${candidate.origin.join(' / ')}` : ''}</option>)}
                </select>
            </label>

            {unknownCommand && <p className='studio-editor-binding__missing' role='alert'>{text.unknownCommand}</p>}
            {!command && <p className='studio-editor-properties__hint'>{text.chooseCommandHint}</p>}

            {slice && !form && (
                <button type='button' onClick={() => onFormCreate(slice)}>{text.createForm(slice.name)}</button>
            )}

            {slice && form && (
                <FormEditor
                    form={form}
                    slice={slice}
                    idPrefix={`${elementId}-form`}
                    queries={queries}
                    strings={strings.properties.forms}
                    disabled={disabled}
                    onChange={onFormChange}
                />
            )}
        </fieldset>
    );
};
