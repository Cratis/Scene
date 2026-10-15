// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useState } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { ChecklistGroup, completed, doneTaskIds, isOverdue, readChecklist, toggleTask } from './checklistModel';
import { ComponentState, readComponentState } from './ComponentState';
import { FoundationIcon } from './FoundationIcon';
import { formatDate, readLocale } from './formatting';
import { formatText, readFoundationStrings } from './foundationStrings';
import { readPermissionRule } from './PermissionRule';
import { FoundationFrame } from './StateFrame';

/**
 * The `checklistSection` component: sections of tasks, each with its owner and due date, and a progress bar per section.
 *
 * `sections` give the structure (`title`, and `items` with `id`, `label`, `owner`, `due`, `done`). Ticking a task publishes the ids of all
 * done tasks as the `value` output and runs the behaviors attached to the element. An open task past its due date says "Overdue" in
 * words as well as in color. Progress is a labelled progress bar, so "2 of 5 complete" is read, not just seen. With `editPermission`
 * not enabled the tasks are shown and cannot be changed.
 */
export function ChecklistSection({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const supplied = useMemo(() => readChecklist(element.properties.sections), [element.properties.sections]);
    const suppliedKey = JSON.stringify(supplied);
    const [groups, setGroups] = useState<ChecklistGroup[]>(supplied);
    const strings = readFoundationStrings(element);
    const locale = readLocale(element);
    const state = readComponentState(element, supplied.some(group => group.items.length > 0));
    const locked = readPermissionRule(element, 'editPermission') !== 'enabled';
    const now = useMemo(() => (typeof element.properties.today === 'string' ? new Date(element.properties.today) : new Date()), [element.properties.today]);

    useEffect(() => setGroups(supplied), [suppliedKey]);
    useValueOutput(bindingOutputs, doneTaskIds(groups));

    return (
        <FoundationFrame element={element} interactions={interactions} name='checklist' state={state} skeleton={[40, 100, 90, 95]}>
            {(state === ComponentState.Ready || state === ComponentState.Partial) && groups.map((group, groupIndex) => {
                const done = completed(group);
                const total = group.items.length;
                return (
                    <section key={group.title + groupIndex} className='foundation-checklist-group' aria-labelledby={`${element.id}-group-${groupIndex}`}>
                        <header className='foundation-checklist-header'>
                            <h3 id={`${element.id}-group-${groupIndex}`}>{group.title}</h3>
                            <span className='foundation-count'>{formatText(strings.checklistProgress, { done, total })}</span>
                        </header>
                        <div className='foundation-progress' role='progressbar' aria-label={formatText(strings.checklistItemProgress, { title: group.title })}
                            aria-valuemin={0} aria-valuemax={total} aria-valuenow={done} aria-valuetext={formatText(strings.checklistProgress, { done, total })}>
                            <span className='foundation-progress-bar' style={{ inlineSize: total === 0 ? '0%' : `${(done / total) * 100}%` }} />
                        </div>
                        {total === 0 ? <p className='foundation-count'>{strings.checklistNone}</p> : (
                            <ul className='foundation-checklist-items'>
                                {group.items.map(item => {
                                    const overdue = isOverdue(item, now);
                                    return (
                                        <li key={item.id} className='foundation-checklist-item' data-done={item.done} data-overdue={overdue}>
                                            <label className='foundation-check'>
                                                <input type='checkbox' checked={item.done} disabled={locked} onChange={() => { setGroups(toggleTask(groups, item.id)); interactions?.onChange?.(); }} />
                                                <span className='foundation-checklist-label'>{item.label}</span>
                                            </label>
                                            <span className='foundation-checklist-meta'>
                                                {item.owner && <span><span className='foundation-visually-hidden'>{`${strings.checklistOwner}: `}</span><FoundationIcon name='user' /> {item.owner}</span>}
                                                {item.due && (
                                                    <span>
                                                        <span className='foundation-visually-hidden'>{`${strings.checklistDue}: `}</span>
                                                        <time dateTime={item.due}>{formatDate(item.due, locale)}</time>
                                                        {overdue && <strong className='foundation-overdue'> · <FoundationIcon name='alert' /> {strings.checklistOverdue}</strong>}
                                                    </span>
                                                )}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </section>
                );
            })}
        </FoundationFrame>
    );
}
