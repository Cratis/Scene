// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { SearchableSelect } from '../Registry/SearchableSelect';

// The id of another model element, from a searchable dropdown restricted to what the descriptor's `reference` filter allows (spec 8.1). The
// host decides what a target and a predicate name; an id that is no longer offered is shown as unresolved, never dropped.
export const ReferenceEditor = ({ value, onChange, descriptor, context, disabled, problem, id }: PropertyEditorProps<string>) => {
    const text = context.strings.editors.select;
    const filter = descriptor.editorOptions?.reference;
    const candidates = filter ? context.lookups.references(filter.target) : [];
    const stored = typeof value === 'string' && value !== '' ? value : undefined;
    const options = candidates.map(candidate => ({ value: candidate.id, label: candidate.label, ...(candidate.group ? { group: candidate.group } : {}) }));
    const unresolved = stored !== undefined && !options.some(option => option.value === stored);

    return (
        <>
            <SearchableSelect
                id={id} options={unresolved ? [...options, { value: stored, label: stored }] : options} value={stored} disabled={disabled} invalid={unresolved || problem !== undefined}
                placeholder={text.placeholder} searchLabel={text.search} emptyLabel={text.empty} clearLabel={text.clear} clearable={descriptor.constraints?.required !== true}
                aria-labelledby={`${id}-label`} onChange={onChange} />
            {unresolved && <span className='studio-editor-chip studio-editor-chip--error'>{context.strings.editors.unresolved}</span>}
        </>
    );
};
