// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { choiceKey, choiceOptions } from '../../Properties/choiceKeys';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { SearchableSelect } from '../Registry/SearchableSelect';

// An enumeration of many choices as a dropdown with a filter (spec 8.1). A stored value that is none of the choices - an older document -
// is kept selectable under its own text rather than lost.
export const SelectEditor = ({ value, onChange, descriptor, context, disabled, problem, id }: PropertyEditorProps<unknown>) => {
    const text = context.strings.editors.select;
    const stored = value ?? undefined;
    const options = choiceOptions(descriptor.choices ?? [], stored);

    return (
        <SearchableSelect
            id={id} options={options.map(option => ({ value: option.key, label: option.label, ...unavailable(descriptor.choices, option.key) }))} value={stored === undefined ? undefined : choiceKey(stored)} disabled={disabled} invalid={problem !== undefined}
            placeholder={text.placeholder} searchLabel={text.search} emptyLabel={text.empty} clearLabel={text.clear} clearable={descriptor.constraints?.required !== true}
            aria-labelledby={`${id}-label`}
            onChange={key => onChange(key === undefined ? undefined : options.find(option => option.key === key)?.value)} />
    );
};

// A choice a descriptor lists but rules out says why in `disabledReason`; the select lists it, disabled, with the reason beside it. The reason is
// not part of Scene's choice yet (Cratis/Scene#160 owns the descriptor shape), so it is read from the choice when the descriptor carries it.
function unavailable(choices: readonly { value: unknown }[] | undefined, key: string): { disabled?: boolean; reason?: string } {
    const choice = choices?.find(candidate => choiceKey(candidate.value) === key) as { disabledReason?: string } | undefined;
    return choice?.disabledReason === undefined ? {} : { disabled: true, reason: choice.disabledReason };
}
