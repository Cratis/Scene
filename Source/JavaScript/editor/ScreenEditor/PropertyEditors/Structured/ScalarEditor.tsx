// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { StructuredEditorStrings } from './StructuredEditorStrings';

type ScalarKind = 'text' | 'number' | 'flag';

export interface ScalarEditorProps {
    label: string;
    value: unknown;
    id: string;
    strings: StructuredEditorStrings;
    disabled: boolean;

    // The value, or undefined once it is emptied.
    onChange: (value: unknown) => void;
}

const kindOf = (value: unknown): ScalarKind => typeof value === 'number' ? 'number' : typeof value === 'boolean' ? 'flag' : 'text';

// One word, number or yes/no whose type the author chooses - the selected value of a control whose options may be any of them. Changing
// the type converts what is there, and a value is never stored as text when it is a number.
export const ScalarEditor = ({ label, value, id, strings, disabled, onChange }: ScalarEditorProps) => {
    const kind = kindOf(value);

    const convert = (next: ScalarKind) => {
        if (next === kind) return;
        if (next === 'number') onChange(typeof value === 'string' && value.trim() !== '' && Number.isFinite(Number(value)) ? Number(value) : 0);
        else if (next === 'flag') onChange(value === true || value === 'true');
        else onChange(value === undefined ? undefined : String(value));
    };

    return (
        <div className='studio-editor-structured__scalar'>
            <select aria-label={`${label} ${strings.scalarType}`} disabled={disabled} value={kind} onChange={event => convert(event.target.value as ScalarKind)}>
                <option value='text'>{strings.scalarText}</option>
                <option value='number'>{strings.scalarNumber}</option>
                <option value='flag'>{strings.scalarFlag}</option>
            </select>
            {kind === 'flag'
                ? <label><input id={id} type='checkbox' disabled={disabled} checked={value === true} onChange={event => onChange(event.target.checked)} /><span>{strings.scalarFlagOn}</span></label>
                : <input id={id} aria-label={label} type={kind === 'number' ? 'number' : 'text'} disabled={disabled} value={value === undefined ? '' : String(value)}
                    onChange={event => onChange(event.target.value === '' ? undefined : kind === 'number' ? Number(event.target.value) : event.target.value)} />}
        </div>
    );
};
