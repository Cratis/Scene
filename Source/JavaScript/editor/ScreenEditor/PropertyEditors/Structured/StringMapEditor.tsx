// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyDescriptor } from '@cratis/scene.model';
import { ScalarEditor } from './ScalarEditor';
import { isRecord } from './structuredValue';
import type { StructuredEditorStrings } from './StructuredEditorStrings';

export interface StringMapEditorProps {
    descriptor: PropertyDescriptor;
    value: unknown;
    id: string;
    strings: StructuredEditorStrings;
    disabled: boolean;

    // The whole record, or undefined once the last value is removed.
    onChange: (value: unknown) => void;
}

const isScalar = (value: unknown): boolean => ['string', 'number', 'boolean'].includes(typeof value);

// A record whose names are the author's own - a tree node's data, keyed by the field a column shows - as a row for each: its name and
// its value. A value that is a structure, not a scalar, is kept exactly as it is and not edited here.
export const StringMapEditor = ({ descriptor, value, id, strings, disabled, onChange }: StringMapEditorProps) => {
    const record = isRecord(value) ? value : {};
    const entries = Object.entries(record);
    const commit = (next: [string, unknown][]) => onChange(next.length === 0 ? undefined : Object.fromEntries(next));

    const rename = (index: number, name: string) => {
        const trimmed = name.trim();
        if (trimmed === '' || trimmed === entries[index][0] || entries.some(([existing], other) => other !== index && existing === trimmed)) return;
        commit(entries.map(([existing, entry], other) => other === index ? [trimmed, entry] : [existing, entry]));
    };

    const add = () => {
        let position = entries.length + 1;
        while (`value${position}` in record) position++;
        commit([...entries, [`value${position}`, '']]);
    };

    return (
        <fieldset className='studio-editor-structured__list' disabled={disabled}>
            <legend>{descriptor.label}</legend>
            {entries.map(([name, entry], index) => (
                <div key={name} className='studio-editor-structured__entry'>
                    <input aria-label={strings.mapName(index + 1)} defaultValue={name} onBlur={event => { rename(index, event.target.value); event.target.value = name; }} />
                    {isScalar(entry)
                        ? <ScalarEditor label={strings.mapValue(name)} value={entry} id={`${id}-${index}`} strings={strings} disabled={disabled}
                            onChange={next => commit(entries.map(([existing, current]) => existing === name ? [existing, next === undefined ? '' : next] : [existing, current]))} />
                        : <span>{strings.keptValue}</span>}
                    <button type='button' aria-label={strings.removeMapEntry(name)} onClick={() => commit(entries.filter(([existing]) => existing !== name))}>{strings.removeText}</button>
                </div>
            ))}
            <button type='button' onClick={add}>{strings.addMapEntry}</button>
        </fieldset>
    );
};
