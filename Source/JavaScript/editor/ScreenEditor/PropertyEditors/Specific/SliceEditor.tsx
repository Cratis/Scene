// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { PropertyEditorProps, EditorLookups } from '../Registry/PropertyEditorProps';
import type { PropertyEditorStrings } from '../Registry/PropertyEditorStrings';
import type { SelectOption } from '../Registry/SearchableSelect';
import { SearchableSelect } from '../Registry/SearchableSelect';

// The options of the slice dropdown: every slice, grouped by module and feature, those the descriptor's kinds do not accept listed disabled with
// the reason. Without a list of every slice the State Change slices the host lends are all there is, and all of them are accepted kinds.
export function sliceOptions(lookups: Pick<EditorLookups, 'slices' | 'stateChangeSlices'>, kinds: readonly string[] | undefined, text: PropertyEditorStrings): SelectOption[] {
    const slices = lookups.slices.length > 0
        ? lookups.slices
        : lookups.stateChangeSlices.map(slice => ({ id: slice.id, name: slice.name, kind: 'StateChange', path: slice.origin }));

    // When the descriptor narrows the kinds, the choosable slices come first under one heading and the others below another, each with what the row says at its
    // right: the module of one that can be chosen, the kind of one that cannot (spec p14-2). Without a narrowing there is one list.
    const narrowed = kinds !== undefined;
    const options = slices.map(slice => {
        const accepted = kinds === undefined || kinds.includes(slice.kind);
        return {
            value: slice.id, label: slice.name, group: slice.path.join(' › '),
            ...(narrowed ? { section: accepted ? text.slice.sections.accepted : text.slice.sections.refused, trailing: accepted ? slice.path[0] ?? '' : text.slice.kindName(slice.kind) } : {}),
            ...(accepted ? {} : { disabled: true, reason: text.slice.notKind(text.slice.kindName(kinds?.[0] ?? slice.kind)) }),
        };
    });
    return narrowed ? [...options.filter(option => option.disabled !== true), ...options.filter(option => option.disabled === true)] : options;
}

// A slice from the tree of slices, grouped by module and feature (spec 8.2). `editorOptions.kinds` filters what can be chosen - `['StateChange']`
// for a button - and every other slice is listed disabled with the reason, so the author sees why it is not on offer. A descriptor that names no
// kind offers every slice. The stored value is the slice's id.
export const SliceEditor = ({ value, onChange, descriptor, context, disabled, problem, inline, id }: PropertyEditorProps<string>) => {
    const text = context.strings.editors;
    const options = sliceOptions(context.lookups, descriptor.editorOptions?.kinds, text);
    const stored = typeof value === 'string' && value !== '' ? value : undefined;
    const unresolved = stored !== undefined && !options.some(option => option.value === stored);

    return (
        <SearchableSelect
            id={id} {...(inline ? { inline } : {})} options={unresolved ? [...options, { value: stored, label: stored, group: '' }] : options} value={stored} disabled={disabled} invalid={unresolved || problem !== undefined}
            placeholder={text.slice.placeholder} searchLabel={text.select.search} emptyLabel={text.select.empty} clearLabel={text.select.clear} clearable={descriptor.constraints?.required !== true}
            aria-labelledby={`${id}-label`} onChange={onChange} />
    );
};
