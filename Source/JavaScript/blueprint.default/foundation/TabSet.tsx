// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { KeyboardEvent, useMemo, useRef } from 'react';
import { RegisteredComponentProps, useValueOutput } from '@cratis/scene.react';
import { readOptionalString } from '../shell/elementProperties';
import { activeTab, readTabs, stepTab } from './tabModel';
import { ComponentState, readComponentState } from './ComponentState';
import { readFoundationStrings } from './foundationStrings';
import { FoundationFrame } from './StateFrame';
import { useUrlState } from './urlState';

/**
 * The `tabSet` component: a set of tabs, each showing the content filed under its id in the element's slots.
 *
 * `tabs` name the tabs (id, label, optional count badge, disabled); the content of tab `overview` is the slot `overview`. It follows the
 * ARIA tabs pattern - arrows, Home and End move and select, the active tab is the one tab stop, each panel is labelled by its tab - and the
 * active tab is kept in the address under `urlKey` when one is given, so a deep link and a refresh restore it. The id of the active tab is the
 * `value` output. The tabs a record page offers (Overview, Related, Files, History) are configurable by changing this property.
 */
export function TabSet({ element, interactions, slots, bindingOutputs }: RegisteredComponentProps) {
    const tabs = useMemo(() => readTabs(element.properties.tabs), [element.properties.tabs]);
    const [requested, setRequested] = useUrlState(readOptionalString(element, 'urlKey'), readOptionalString(element, 'activeTab'));
    const active = activeTab(tabs, requested);
    const strings = readFoundationStrings(element);
    const state = readComponentState(element, tabs.length > 0);
    const list = useRef<HTMLDivElement>(null);

    useValueOutput(bindingOutputs, active);

    const choose = (id: string | undefined, focus = false) => {
        if (id === undefined) return;
        setRequested(id);
        interactions?.onSelect?.();
        if (focus) requestAnimationFrame(() => list.current?.querySelector<HTMLElement>(`[data-tab="${CSS.escape(id)}"]`)?.focus());
    };
    const move = (event: KeyboardEvent) => {
        const direction = { ArrowRight: 'next', ArrowDown: 'next', ArrowLeft: 'previous', ArrowUp: 'previous', Home: 'first', End: 'last' }[event.key] as 'next' | 'previous' | 'first' | 'last' | undefined;
        if (direction === undefined) return;
        event.preventDefault();
        choose(stepTab(tabs, active, direction), true);
    };

    return (
        <FoundationFrame element={element} interactions={interactions} name='tab-set' state={state} skeleton={[60, 100]}>
            {state !== ComponentState.Loading && (
                <>
                    <div ref={list} role='tablist' aria-label={readOptionalString(element, 'label') ?? strings.tabsLabel} className='foundation-tabs' onKeyDown={move}>
                        {tabs.map(tab => (
                            <button key={tab.id} id={`${element.id}-tab-${tab.id}`} data-tab={tab.id} type='button' role='tab' className='foundation-tab' aria-selected={tab.id === active}
                                aria-controls={`${element.id}-panel-${tab.id}`} tabIndex={tab.id === active ? 0 : -1} disabled={tab.disabled} onClick={() => choose(tab.id)}>
                                {tab.label}{tab.badge !== undefined && <span className='foundation-tab-badge'>{tab.badge}</span>}
                            </button>
                        ))}
                    </div>
                    {tabs.map(tab => (
                        <div key={tab.id} id={`${element.id}-panel-${tab.id}`} role='tabpanel' aria-labelledby={`${element.id}-tab-${tab.id}`} hidden={tab.id !== active} tabIndex={0} className='foundation-tab-panel'>
                            {tab.id === active ? slots?.[tab.id] : undefined}
                        </div>
                    ))}
                </>
            )}
        </FoundationFrame>
    );
}
