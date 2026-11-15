// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { SearchableSelect } from '../Registry/SearchableSelect';
import { fieldKindOf } from './fieldKind';

// The fields a `field` editor offers: the result fields of the bound query - or, for a binding path, the values a binding can read - narrowed to the
// kinds the descriptor accepts. Each carries its type, which is shown beside its name.
export function fieldCandidates(descriptor: { editorKind?: string; editorOptions?: { fieldKinds?: string[] } }, lookups: { fields: readonly { name: string; type: string }[]; availableSources: Readonly<Record<string, string>> }): { all: { name: string; type: string }[]; offered: { name: string; type: string }[] } {
    const all = descriptor.editorKind === 'bindingPath'
        ? Object.entries(lookups.availableSources).map(([name, type]) => ({ name, type }))
        : lookups.fields.map(field => ({ name: field.name, type: field.type }));
    const kinds = descriptor.editorOptions?.fieldKinds;
    return { all, offered: all.filter(field => kinds === undefined || kinds.includes(fieldKindOf(field.type))) };
}

// A field of the shape the component is bound to, typed by the kind of field the descriptor accepts (spec 8.2). `resultField` and
// `field` offer the result fields of the bound query; `bindingPath` offers the values a binding can read. A field that is not offered - or
// every field, while the component is bound to nothing - can still be typed, so a document written elsewhere is never made unreadable.
export const FieldEditor = ({ value, onChange, descriptor, context, disabled, problem, id }: PropertyEditorProps<string>) => {
    const text = context.strings.editors;
    const kinds = descriptor.editorOptions?.fieldKinds;
    const { all: candidates, offered } = fieldCandidates(descriptor, context.lookups);
    const stored = typeof value === 'string' && value !== '' ? value : undefined;
    const known = stored === undefined || offered.some(field => field.name === stored);

    if (candidates.length === 0) {
        return (
            <input
                id={id} type='text' className='studio-editor-field__input' disabled={disabled} defaultValue={stored ?? ''} key={stored ?? ''} aria-invalid={problem ? true : undefined}
                onBlur={event => { const next = event.target.value.trim(); if (next !== (stored ?? '')) onChange(next === '' ? undefined : next); }} />
        );
    }

    return (
        <>
            <SearchableSelect
                id={id} options={(known ? offered : [...offered, { name: stored, type: '' }]).map(field => ({ value: field.name, label: field.type ? `${field.name} · ${field.type}` : field.name }))}
                value={stored} disabled={disabled} invalid={!known || problem !== undefined}
                placeholder={text.field.placeholder} searchLabel={text.select.search} emptyLabel={text.select.empty} clearLabel={text.select.clear} clearable={descriptor.constraints?.required !== true}
                aria-labelledby={`${id}-label`} onChange={onChange} />
            {kinds !== undefined && <small className='studio-editor-properties__hint'>{kinds.map(text.field.typed).join(', ')}</small>}
            {!known && <span className='studio-editor-chip studio-editor-chip--error'>{text.unresolved}</span>}
        </>
    );
};
