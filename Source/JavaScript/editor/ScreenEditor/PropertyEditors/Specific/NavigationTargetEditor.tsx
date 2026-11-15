// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { isRecord } from '../Structured/structuredValue';
import type { PropertyEditorProps } from '../Registry/PropertyEditorProps';
import { SearchableSelect } from '../Registry/SearchableSelect';

// The id a stored target names: a plain id, or the screen of a destination reference.
const targetOf = (value: unknown): string | undefined =>
    typeof value === 'string' && value !== '' ? value : isRecord(value) && typeof value.screen === 'string' && value.screen !== '' ? value.screen : undefined;

// The target of a navigation item (spec 8.2): a dropdown of what the model offers, grouped Module > Feature, which reads as a breadcrumb
// when it is closed. A target that is no longer there shows an error chip - and stays stored, so removing the screen is reversible.
// A destination property stores a reference ({ screen }); any other stores the id.
export const NavigationTargetEditor = ({ value, onChange, descriptor, context, disabled, id }: PropertyEditorProps<unknown>) => {
    const text = context.strings.editors;
    const targets = context.lookups.destinations;
    const stored = targetOf(value);
    const chosen = targets.find(target => target.id === stored);
    const unresolved = stored !== undefined && chosen === undefined;
    const asReference = descriptor.valueType === 'destination';

    const options = targets.map(target => ({ value: target.id, label: target.label, ...(target.group ? { group: target.group } : {}) }));
    const crumb = (target: { label: string; group?: string }) => [...(target.group ? target.group.split(/\s*[>›/]\s*/) : []), target.label].join(' › ');

    return (
        <>
            <SearchableSelect
                id={id} options={unresolved ? [...options, { value: stored, label: stored }] : options} value={stored} disabled={disabled} invalid={unresolved}
                placeholder={text.navigationTarget.placeholder} searchLabel={text.select.search} emptyLabel={text.select.empty} clearLabel={text.select.clear} clearable={descriptor.constraints?.required !== true}
                aria-labelledby={`${id}-label`}
                renderClosed={option => <span className={option ? undefined : 'studio-editor-select__placeholder'}>{chosen ? crumb(chosen) : option?.label ?? text.navigationTarget.placeholder}</span>}
                onChange={next => onChange(next === undefined ? undefined : asReference ? { ...(isRecord(value) ? value : {}), screen: next } : next)} />
            {unresolved && <span className='studio-editor-chip studio-editor-chip--error' role='alert'>{text.navigationTarget.unresolved(stored)}</span>}
        </>
    );
};
