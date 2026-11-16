// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyDescriptor } from '@cratis/scene.model';
import { asList, movedItem, numberListEditorKind, withItem, withoutItem } from './structuredValue';
import type { StructuredEditorStrings } from './StructuredEditorStrings';

export interface PrimitiveListEditorProps {
    descriptor: PropertyDescriptor;
    value: unknown;
    id: string;
    strings: StructuredEditorStrings;
    disabled: boolean;

    // The whole list, or undefined once the last entry is removed.
    onChange: (value: unknown) => void;
}

// A list of plain values - words or numbers - one control for each entry, in order. Scene keeps it as the array it is; each entry
// is typed by the descriptor's editor kind, so a number is never stored as text.
export const PrimitiveListEditor = ({ descriptor, value, id, strings, disabled, onChange }: PrimitiveListEditorProps) => {
    const numeric = descriptor.editorKind === numberListEditorKind;
    const entries = asList(value);
    const change = (next: unknown[]) => onChange(next.length === 0 ? undefined : next);

    return (
        <fieldset className='studio-editor-structured__list' disabled={disabled}>
            <legend>{descriptor.label}</legend>
            {entries.map((entry, index) => (
                <div key={index} className='studio-editor-structured__entry'>
                    <input
                        id={`${id}-${index}`}
                        aria-label={strings.entry(index + 1)}
                        type={numeric ? 'number' : 'text'}
                        value={numeric ? (typeof entry === 'number' ? String(entry) : '') : (typeof entry === 'string' ? entry : '')}
                        onChange={event => onChange(withItem(entries, index, numeric ? (event.target.value === '' ? 0 : Number(event.target.value)) : event.target.value))}
                    />
                    <button type='button' aria-label={strings.moveEntryUp(index + 1)} disabled={index === 0} onClick={() => onChange(movedItem(entries, index, -1))}>{strings.moveUpText}</button>
                    <button type='button' aria-label={strings.moveEntryDown(index + 1)} disabled={index === entries.length - 1} onClick={() => onChange(movedItem(entries, index, 1))}>{strings.moveDownText}</button>
                    <button type='button' aria-label={strings.removeEntry(index + 1)} onClick={() => change(withoutItem(entries, index))}>{strings.removeText}</button>
                </div>
            ))}
            <button type='button' onClick={() => onChange([...entries, numeric ? 0 : ''])}>{strings.addEntry}</button>
        </fieldset>
    );
};
