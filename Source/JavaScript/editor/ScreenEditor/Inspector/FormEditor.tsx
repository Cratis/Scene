// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { FormGenerationMode, type Form, type FormField, type QueryCandidate } from '@cratis/scene.model';
import { FormDesigner } from '../../FormDesigner/FormDesigner';
import { classifyFormFields } from '../../FormDesigner/classifyFormFields';
import { autoFormFor, manualFormFor, modeFor, replaceField } from '../Forms/formEditing';
import { choicesFor, choicesOf, defaultDisplayField, inferChoices, listQueriesOf, withChoices } from '../Forms/fieldChoices';
import { fieldMarkersOf } from '../Forms/fieldMarkers';
import type { StateChangeSlice } from '../Actions/StateChangeSlice';
import { FormLayoutEditor } from './FormLayoutEditor';
import type { ScreenEditorStrings } from './ScreenEditorStrings';

export interface FormEditorProps {
    form: Form;

    // The slice the form is for, when the model has it: what auto generation follows and which properties a field can map.
    slice: StateChangeSlice | undefined;

    // Distinguishes the field source lists of forms edited side by side.
    idPrefix: string;

    // The queries a field can be a picker over.
    queries?: readonly QueryCandidate[];
    strings: ScreenEditorStrings['properties']['forms'];
    disabled: boolean;
    onChange: (form: Form) => void;
}

// Edits one command form: how its fields are generated, what each field is called and maps to, and how they are laid out.
export const FormEditor = ({ form, slice, idPrefix, queries = [], strings: text, disabled, onChange }: FormEditorProps) => {
    const commandProperties = slice?.inputs.map(input => input.name) ?? form.fields.map(field => field.sourceProperty ?? field.name);
    const isAuto = modeFor(form, slice) === FormGenerationMode.Auto;
    const mappings = classifyFormFields(form, commandProperties);
    const typeOf = (field: FormField) => slice?.inputs.find(input => input.name === (field.sourceProperty ?? field.name))?.type;

    return (
        <fieldset className='studio-editor-properties__form' disabled={disabled}>
            <legend>{form.name}</legend>
            <label>
                <span>{text.mode}</span>
                <select value={isAuto ? FormGenerationMode.Auto : FormGenerationMode.Manual} onChange={event => slice && onChange(event.target.value === FormGenerationMode.Auto ? autoFormFor(slice) : manualFormFor(form, slice))}>
                    <option value={FormGenerationMode.Auto}>{text.auto}</option>
                    <option value={FormGenerationMode.Manual}>{text.manual}</option>
                </select>
            </label>
            <FormDesigner form={form} commandProperties={commandProperties} />
            <div className='studio-editor-properties__form-fields'>
                {form.fields.map((field, fieldIndex) => (
                    <fieldset key={`${field.name}:${fieldIndex}`}>
                        <legend>{field.name}</legend>
                        <div className='studio-editor-properties__field-markers' data-field-markers={field.name}>
                            <span className='studio-editor-properties__chip' data-mapping={mappings[fieldIndex]?.kind}>{text.mapping[mappings[fieldIndex]?.kind ?? 'autoMapped']}</span>
                            {fieldMarkersOf(field, slice).map(marker => <span key={marker} className='studio-editor-properties__chip' data-marker={marker}>{text.markers[marker]}</span>)}
                        </div>
                        <label>
                            <span>{text.fieldLabel}</span>
                            <input value={field.label ?? ''} onChange={event => onChange(replaceField(form, fieldIndex, { ...field, label: event.target.value || undefined }))} />
                        </label>
                        <label>
                            <span>{text.sourceProperty}</span>
                            <input list={`${idPrefix}-sources`} value={field.sourceProperty ?? ''} onChange={event => onChange(replaceField(form, fieldIndex, { ...field, sourceProperty: event.target.value || undefined }))} />
                        </label>
                        <FieldChoicesEditor field={field} type={typeOf(field)} queries={queries} text={text} onChange={changed => onChange(replaceField(form, fieldIndex, changed))} />
                    </fieldset>
                ))}
                <datalist id={`${idPrefix}-sources`}>{commandProperties.map(property => <option key={property} value={property} />)}</datalist>
            </div>
            {!isAuto && <FormLayoutEditor form={form} strings={text} onChange={onChange} />}
        </fieldset>
    );
};

interface FieldChoicesEditorProps {
    field: FormField;
    type: string | undefined;
    queries: readonly QueryCandidate[];
    text: ScreenEditorStrings['properties']['forms'];
    onChange: (field: FormField) => void;
}

// What a field offers: nothing, or a picker over a list query that shows one of the query's fields. A property whose concept is the key of the rows of
// one list query is a picker without anyone saying so; the author can still change the query, the field it shows, or - when nothing implies a picker - the control.
const FieldChoicesEditor = ({ field, type, queries, text, onChange }: FieldChoicesEditorProps) => {
    const lists = listQueriesOf(queries);
    const stated = choicesOf(field);
    const implied = type ? inferChoices(type, queries) : undefined;
    const choices = choicesFor(field, type, queries);
    const query = lists.find(candidate => candidate.name === choices?.query);
    if (lists.length === 0 && !choices) return null;

    return (
        <div className='studio-editor-properties__choices' data-field-choices={field.name}>
            <label>
                <span>{text.control}</span>
                <select value={choices ? 'picker' : 'text'} disabled={!!implied && !stated}
                    onChange={event => {
                        if (event.target.value === 'text') onChange(withChoices(field, undefined));
                        else if (lists[0]) onChange(withChoices(field, implied ?? { query: lists[0].name, show: defaultDisplayField(lists[0])?.name ?? '' }));
                    }}>
                    <option value='text'>{text.controlText}</option>
                    <option value='picker'>{text.controlPicker}</option>
                </select>
            </label>
            {choices && (
                <>
                    <label>
                        <span>{text.choicesQuery}</span>
                        <select value={choices.query} onChange={event => {
                            const chosen = lists.find(candidate => candidate.name === event.target.value);
                            if (chosen) onChange(withChoices(field, { query: chosen.name, show: defaultDisplayField(chosen)?.name ?? '' }));
                        }}>
                            {!query && <option value={choices.query}>{choices.query}</option>}
                            {lists.map(candidate => <option key={candidate.id} value={candidate.name}>{candidate.name}</option>)}
                        </select>
                    </label>
                    <label>
                        <span>{text.choicesShow}</span>
                        <select value={choices.show} onChange={event => onChange(withChoices(field, { query: choices.query, show: event.target.value }))}>
                            {!query?.resultFields.some(result => result.name === choices.show) && <option value={choices.show}>{choices.show}</option>}
                            {(query?.resultFields ?? []).map(result => <option key={result.name} value={result.name}>{result.name}</option>)}
                        </select>
                    </label>
                    {implied && !stated && <p className='studio-editor-properties__hint'>{text.choicesInferred}</p>}
                </>
            )}
        </div>
    );
};
