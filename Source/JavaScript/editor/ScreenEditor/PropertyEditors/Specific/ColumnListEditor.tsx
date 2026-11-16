// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isRecord, movedItem, withItem, withoutItem } from '../Structured/structuredValue';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { FieldEditor } from './FieldEditor';

type Alignment = 'start' | 'center' | 'end';
const alignments: readonly Alignment[] = ['start', 'center', 'end'];

// The columns of a table (spec 8.2): rows of { field, header, width, align, format }, the field chosen with the `field` editor. A column
// keeps an identity of its own, so reordering and removing never confuses one column for another.
export const ColumnListEditor = ({ value, onChange, descriptor, context, disabled, id }: PropertyEditorProps<Record<string, unknown>[]>) => {
    const text = context.strings.editors.columnList;
    const columns = (Array.isArray(value) ? value : []).filter(isRecord);
    const change = (next: Record<string, unknown>[]) => onChange(next.length === 0 ? undefined : next);
    const set = (index: number, key: string, next: unknown) => {
        const column: Record<string, unknown> = { ...columns[index] };
        if (next === undefined || next === '') delete column[key]; else column[key] = next;
        change(withItem(columns, index, column) as Record<string, unknown>[]);
    };
    const fieldDescriptor = { ...descriptor, editorKind: 'field', label: text.field };

    return (
        <fieldset id={id} className='studio-editor-columns' disabled={disabled}>
            {columns.map((column, index) => (
                <div key={typeof column.id === 'string' ? column.id : index} className='studio-editor-columns__row'>
                    <FieldEditor id={`${id}-${index}-field`} value={column.field as string | undefined} descriptor={fieldDescriptor} context={context} disabled={disabled} onChange={next => set(index, 'field', next)} />
                    <input className='studio-editor-field__input' aria-label={text.header} placeholder={text.header} defaultValue={String(column.header ?? '')} key={String(column.header ?? '')} onBlur={event => { if (event.target.value !== (column.header ?? '')) set(index, 'header', event.target.value); }} />
                    <input className='studio-editor-field__input studio-editor-columns__width' aria-label={text.width} placeholder={text.width} defaultValue={String(column.width ?? '')} key={String(column.width ?? '')} onBlur={event => { const raw = event.target.value.trim(); const next = raw === '' ? undefined : Number.isFinite(Number(raw)) ? Number(raw) : raw; if (next !== column.width) set(index, 'width', next); }} />
                    <select aria-label={text.align} value={alignments.includes(column.align as Alignment) ? String(column.align) : ''} onChange={event => set(index, 'align', event.target.value)}>
                        <option value=''>{text.align}</option>
                        {alignments.map(alignment => <option key={alignment} value={alignment}>{text.alignments[alignment]}</option>)}
                    </select>
                    <input className='studio-editor-field__input' aria-label={text.format} placeholder={text.format} defaultValue={String(column.format ?? '')} key={String(column.format ?? '')} onBlur={event => { if (event.target.value !== (column.format ?? '')) set(index, 'format', event.target.value); }} />
                    <button type='button' aria-label={context.strings.editors.list.moveUp} disabled={index === 0} onClick={() => change(movedItem(columns, index, -1) as Record<string, unknown>[])}>↑</button>
                    <button type='button' aria-label={context.strings.editors.list.moveDown} disabled={index === columns.length - 1} onClick={() => change(movedItem(columns, index, 1) as Record<string, unknown>[])}>↓</button>
                    <button type='button' aria-label={text.remove} onClick={() => change(withoutItem(columns, index) as Record<string, unknown>[])}>×</button>
                </div>
            ))}
            <button type='button' className='studio-editor-list__add' onClick={() => change([...columns, { id: globalThis.crypto.randomUUID() }])}>{text.add}</button>
        </fieldset>
    );
};
