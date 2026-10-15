// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useMemo } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { activeTab, readTabs } from './tabModel';
import { ComponentState, readComponentState } from './ComponentState';
import { readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';
import { useUrlState } from './urlState';

/**
 * The `subNavigation` component: a module's own sections as a tab bar or a left rail.
 *
 * `items` name the sections (id, label, optional count badge), `orientation` is `horizontal` (tabs, default) or `vertical` (a left rail), and
 * `urlKey` keeps the active section in the address so a deep link restores it. It is a navigation landmark, the current section carries
 * `aria-current="page"`, and choosing a section only changes the section: the shell around it keeps its state, which is what makes it a
 * sub-navigation rather than a page change. The id of the active section is the `value` output, which the module's content binds to.
 */
export function SubNavigation({ element, interactions, bindingOutputs }: RegisteredComponentProps) {
    const items = useMemo(() => readTabs(element.properties.items), [element.properties.items]);
    const [requested, setRequested] = useUrlState(readOptionalString(element, 'urlKey'), readOptionalString(element, 'activeItem'));
    const active = activeTab(items, requested);
    const strings = readFoundationStrings(element);
    const state = readComponentState(element, items.length > 0);

    useValueOutput(bindingOutputs, active);

    return (
        <FoundationFrame element={element} interactions={interactions} name='sub-navigation' state={state} skeleton={[50]}>
            {state !== ComponentState.Loading && (
                <nav aria-label={readOptionalString(element, 'label') ?? strings.subNavLabel} className='foundation-subnav' data-orientation={element.properties.orientation === 'vertical' ? 'vertical' : 'horizontal'}>
                    <ul>
                        {items.map(item => (
                            <li key={item.id}>
                                <a href={`?${new URLSearchParams({ [readOptionalString(element, 'urlKey') ?? 'section']: item.id }).toString()}`} aria-current={item.id === active ? 'page' : undefined}
                                    aria-disabled={item.disabled || undefined} className='foundation-subnav-link'
                                    onClick={event => { event.preventDefault(); if (!item.disabled) { setRequested(item.id); interactions?.onSelect?.(); } }}>
                                    {item.label}{item.badge !== undefined && <span className='foundation-tab-badge'>{item.badge}</span>}
                                </a>
                            </li>
                        ))}
                    </ul>
                </nav>
            )}
        </FoundationFrame>
    );
}
