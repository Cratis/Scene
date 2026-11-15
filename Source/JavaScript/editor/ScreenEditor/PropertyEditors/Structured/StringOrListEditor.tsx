// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyDescriptor } from '@cratis/scene.model';
import { PrimitiveListEditor } from './PrimitiveListEditor';
import type { StructuredEditorStrings } from './StructuredEditorStrings';

export interface StringOrListEditorProps {
    descriptor: PropertyDescriptor;
    value: unknown;
    id: string;
    strings: StructuredEditorStrings;
    disabled: boolean;
    onChange: (value: unknown) => void;
}

// A word that is one value for the whole, or a list with one for each part - a chart's colour for a dataset or for every point. Switching
// between the two keeps what was entered: the one value becomes the first entry, and a list is cut down to its first entry.
export const StringOrListEditor = ({ descriptor, value, id, strings, disabled, onChange }: StringOrListEditorProps) => {
    if (Array.isArray(value)) {
        return (
            <div className='studio-editor-structured__either'>
                <PrimitiveListEditor descriptor={descriptor} value={value} id={id} strings={strings} disabled={disabled} onChange={onChange} />
                <button type='button' disabled={disabled} onClick={() => onChange(typeof value[0] === 'string' && value[0] !== '' ? value[0] : undefined)}>{`${descriptor.label}: ${strings.useSingle}`}</button>
            </div>
        );
    }

    return (
        <div className='studio-editor-structured__either'>
            <label className='studio-editor-structured__field'>
                <span>{descriptor.label}</span>
                <input id={id} disabled={disabled} value={typeof value === 'string' ? value : ''} onChange={event => onChange(event.target.value === '' ? undefined : event.target.value)} />
            </label>
            <button type='button' disabled={disabled} onClick={() => onChange(typeof value === 'string' && value !== '' ? [value] : [''])}>{`${descriptor.label}: ${strings.useList}`}</button>
        </div>
    );
};
