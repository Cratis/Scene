// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { asList, movedItem, withItem, withoutItem } from '../Structured/structuredValue';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';

// A list of simple items - words, or numbers when the descriptor's editor kind says so: add, remove and reorder rows. The whole list is
// the value; the last row removed unsets it.
export const ListEditor = ({ value, onChange, descriptor, context, disabled, id }: PropertyEditorProps<unknown[]>) => {
    const text = context.strings.editors.list;
    const numeric = descriptor.editorKind === 'numberList';
    const entries = asList(value);
    const change = (next: unknown[]) => onChange(next.length === 0 ? undefined : next);

    return (
        <fieldset id={id} className='studio-editor-list' disabled={disabled}>
            {entries.map((entry, index) => (
                <div key={index} className='studio-editor-list__row'>
                    <input
                        className='studio-editor-field__input' type={numeric ? 'number' : 'text'} aria-label={`${descriptor.label} ${index + 1}`} defaultValue={String(entry ?? '')}
                        onBlur={event => { const raw = event.target.value; const next = numeric ? Number(raw) : raw; if (next !== entry && (!numeric || Number.isFinite(next))) change(withItem(entries, index, next)); }} />
                    <button type='button' aria-label={text.moveUp} disabled={index === 0} onClick={() => change(movedItem(entries, index, -1))}>↑</button>
                    <button type='button' aria-label={text.moveDown} disabled={index === entries.length - 1} onClick={() => change(movedItem(entries, index, 1))}>↓</button>
                    <button type='button' aria-label={text.remove} onClick={() => change(withoutItem(entries, index))}>×</button>
                </div>
            ))}
            <button type='button' className='studio-editor-list__add' onClick={() => change([...entries, numeric ? 0 : ''])}>{text.add}</button>
        </fieldset>
    );
};
