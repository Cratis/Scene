// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { ComponentState, readComponentState } from './ComponentState';
import { ActionButton } from './ActionButton';
import {
    FilterCondition, FilterField, emptyFilter, FilterFieldType, FilterGroup, countActiveConditions, filterOperators, maximumFilterDepth, newCondition,
    normalizeFilter, readFilterFields, updateGroupAt, valuelessOperators,
} from './filterModel';
import { FoundationStrings, formatText, readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';
import { readPermissionRule } from './PermissionRule';

const operatorText = (strings: FoundationStrings, operator: string): string => {
    const names: Record<string, string> = {
        contains: strings.opContains, equals: strings.opEquals, notEquals: strings.opNotEquals, startsWith: strings.opStartsWith, isEmpty: strings.opIsEmpty,
        greater: strings.opGreater, greaterOrEqual: strings.opGreaterOrEqual, less: strings.opLess, lessOrEqual: strings.opLessOrEqual,
        before: strings.opBefore, after: strings.opAfter, on: strings.opOn, is: strings.opIs, isNot: strings.opIsNot, true: strings.opTrue, false: strings.opFalse,
    };
    return names[operator] ?? operator;
};

interface GroupEditorProps {
    group: FilterGroup;
    path: number[];
    fields: FilterField[];
    strings: FoundationStrings;
    locked: boolean;
    change(path: number[], change: (group: FilterGroup) => FilterGroup): void;
}

function ValueInput({ field, condition, strings, label, disabled, onChange }: { field: FilterField | undefined; condition: FilterCondition; strings: FoundationStrings; label: string; disabled: boolean; onChange(value: string): void }) {
    if (valuelessOperators.includes(condition.operator)) return undefined;

    if (field?.type === FilterFieldType.Select) {
        return (
            <select aria-label={`${strings.filterValue}, ${label}`} value={condition.value} disabled={disabled} onChange={event => onChange(event.target.value)}>
                <option value=''>—</option>
                {field.options.map(option => <option key={option} value={option}>{option}</option>)}
            </select>
        );
    }

    return <input aria-label={`${strings.filterValue}, ${label}`} type={field?.type === FilterFieldType.Number ? 'number' : field?.type === FilterFieldType.Date ? 'date' : 'text'} value={condition.value} disabled={disabled} onChange={event => onChange(event.target.value)} />;
}

function GroupEditor({ group, path, fields, strings, locked, change }: GroupEditorProps) {
    const label = path.length === 0 ? strings.filterMatchAll.replace(/ \(.*\)$/, '') : formatText(strings.filterGroup, { n: path.join('.') });
    const depth = path.length + 1;

    return (
        <div className='foundation-filter-group' role='group' aria-label={path.length === 0 ? formatText(countActiveConditions(group) === 1 ? strings.filterSummaryOne : strings.filterSummary, { count: countActiveConditions(group) }) : label} data-depth={depth}>
            <div className='foundation-filter-match'>
                <select aria-label={strings.filterMatchAll} value={group.operator} disabled={locked} onChange={event => change(path, current => ({ ...current, operator: event.target.value === 'or' ? 'or' : 'and' }))}>
                    <option value='and'>{strings.filterMatchAll}</option>
                    <option value='or'>{strings.filterMatchAny}</option>
                </select>
                {path.length > 0 && !locked && (
                    <button type='button' className='foundation-link' onClick={() => change(path.slice(0, -1), parent => ({ ...parent, groups: parent.groups.filter((_, index) => index !== path[path.length - 1]) }))}>{strings.filterRemoveGroup}</button>
                )}
            </div>
            {group.conditions.map((condition, index) => {
                const field = fields.find(candidate => candidate.name === condition.field);
                const conditionLabel = formatText(strings.filterCondition, { n: index + 1 });
                return (
                    <div className='foundation-filter-row' role='group' aria-label={conditionLabel} key={index}>
                        <select aria-label={`${strings.filterField}, ${conditionLabel}`} value={condition.field} disabled={locked}
                            onChange={event => {
                                const next = fields.find(candidate => candidate.name === event.target.value);
                                change(path, current => ({ ...current, conditions: current.conditions.map((existing, position) => (position === index
                                    ? { field: event.target.value, operator: next ? filterOperators[next.type][0] : existing.operator, value: '' } : existing)) }));
                            }}>
                            {fields.map(candidate => <option key={candidate.name} value={candidate.name}>{candidate.label}</option>)}
                        </select>
                        <select aria-label={`${strings.filterOperator}, ${conditionLabel}`} value={condition.operator} disabled={locked}
                            onChange={event => change(path, current => ({ ...current, conditions: current.conditions.map((existing, position) => (position === index ? { ...existing, operator: event.target.value } : existing)) }))}>
                            {filterOperators[field?.type ?? FilterFieldType.Text].map(operator => <option key={operator} value={operator}>{operatorText(strings, operator)}</option>)}
                        </select>
                        <ValueInput field={field} condition={condition} strings={strings} label={conditionLabel} disabled={locked}
                            onChange={value => change(path, current => ({ ...current, conditions: current.conditions.map((existing, position) => (position === index ? { ...existing, value } : existing)) }))} />
                        {!locked && (
                            <button type='button' className='foundation-icon-button' aria-label={`${strings.filterRemove}, ${conditionLabel}`}
                                onClick={() => change(path, current => ({ ...current, conditions: current.conditions.filter((_, position) => position !== index) }))}>×</button>
                        )}
                    </div>
                );
            })}
            {group.groups.map((nested, index) => <GroupEditor key={index} group={nested} path={[...path, index]} fields={fields} strings={strings} locked={locked} change={change} />)}
            {!locked && (
                <div className='foundation-filter-actions'>
                    <button type='button' className='foundation-link' onClick={() => change(path, current => ({ ...current, conditions: [...current.conditions, newCondition(fields)] }))}>{strings.filterAdd}</button>
                    {depth < maximumFilterDepth && (
                        <button type='button' className='foundation-link' onClick={() => change(path, current => ({ ...current, groups: [...current.groups, { operator: 'and', conditions: [newCondition(fields)], groups: [] }] }))}>{strings.filterAddGroup}</button>
                    )}
                </div>
            )}
        </div>
    );
}

/**
 * The `filterBuilder` component: field, operator and value conditions joined by AND or OR, in groups that nest up to three deep.
 *
 * The filter is the component's `value` output - `{ operator, conditions, groups }` - which a list screen binds its query to; the
 * component itself filters nothing. `fields` describe what can be filtered (name, label, type, and options for a select), and
 * the operators on offer follow each field's type. A filter bound in through `value` is read back as the user left it: conditions on
 * fields that no longer exist are dropped rather than shown broken. The component is the filter panel of a list on a desktop and
 * the body of the filter dialog on a phone.
 */
export function FilterBuilder({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const fields = useMemo(() => readFilterFields(element.properties.fields), [element.properties.fields]);
    const supplied = useMemo(() => normalizeFilter(element.properties.filter, fields), [element.properties.filter, fields]);
    const [filter, setFilter] = useState<FilterGroup>(supplied);
    const strings = readFoundationStrings(element);
    const suppliedKey = JSON.stringify(supplied);
    const state = readComponentState(element, fields.length > 0);
    const locked = readPermissionRule(element, 'editPermission') !== 'enabled';

    useEffect(() => setFilter(supplied), [suppliedKey]);
    useValueOutput(bindingOutputs, filter);

    const change = (path: number[], apply: (group: FilterGroup) => FilterGroup) => {
        const next = updateGroupAt(filter, path, apply);
        setFilter(next);
        interactions?.onChange?.();
    };
    const active = countActiveConditions(filter);

    return (
        <FoundationFrame element={element} interactions={interactions} name='filter-builder' state={state} skeleton={[100, 100]}>
            {state !== ComponentState.Loading && (
                <>
                    <GroupEditor group={filter} path={[]} fields={fields} strings={strings} locked={locked} change={change} />
                    <div className='foundation-filter-footer'>
                        <span className='foundation-filter-summary' aria-live='polite'>{active === 1 ? strings.filterSummaryOne : formatText(strings.filterSummary, { count: active })}</span>
                        {active > 0 && !locked && <ActionButton emphasis='quiet' disabledReason={strings.disabledNoPermission} onClick={() => { setFilter(emptyFilter()); interactions?.onChange?.(); }}>{strings.filterClear}</ActionButton>}
                    </div>
                </>
            )}
        </FoundationFrame>
    );
}
