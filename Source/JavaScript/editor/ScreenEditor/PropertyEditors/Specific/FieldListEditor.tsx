// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { asList, movedItem, withItem, withoutItem } from '../Structured/structuredValue';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { FieldEditor } from './FieldEditor';

// An ordered list of fields of the bound shape - the fields a table's search looks in - one `field` editor per row, with add, remove and
// reorder. The whole list is the value; the last row removed unsets it.
export const FieldListEditor = ({ value, onChange, descriptor, context, disabled, problem, id }: PropertyEditorProps<string[]>) => {
    const text = context.strings.editors.list;
    const entries = asList(value).filter((entry): entry is string => typeof entry === 'string');
    const change = (next: unknown[]) => onChange(next.length === 0 ? undefined : next as string[]);
    const rowDescriptor = { ...descriptor, editorKind: 'field' };

    return (
        <fieldset id={id} className='studio-editor-list' disabled={disabled}>
            {entries.map((entry, index) => (
                <div key={`${index}:${entry}`} className='studio-editor-list__row'>
                    <FieldEditor id={`${id}-${index}`} value={entry} descriptor={rowDescriptor} context={context} disabled={disabled} problem={problem} onChange={next => change(next === undefined ? withoutItem(entries, index) : withItem(entries, index, next))} />
                    <button type='button' aria-label={text.moveUp} disabled={index === 0} onClick={() => change(movedItem(entries, index, -1))}>↑</button>
                    <button type='button' aria-label={text.moveDown} disabled={index === entries.length - 1} onClick={() => change(movedItem(entries, index, 1))}>↓</button>
                    <button type='button' aria-label={text.remove} onClick={() => change(withoutItem(entries, index))}>×</button>
                </div>
            ))}
            <button type='button' className='studio-editor-list__add' onClick={() => change([...entries, ''])}>{text.add}</button>
        </fieldset>
    );
};
