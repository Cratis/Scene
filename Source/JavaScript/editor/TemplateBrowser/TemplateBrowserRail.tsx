// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Tag } from '@cratis/components/Display';
import { formatTemplateBrowserMessage } from './formatTemplateBrowserMessage';
import { allTemplatesRailId, ownTemplatesRailId, type TemplateBrowserRailItem } from './TemplateBrowserRailItem';
import { TemplateBrowserRailKind } from './TemplateBrowserRailKind';
import type { TemplateBrowserStrings } from './TemplateBrowserStrings';
import './TemplateBrowserRail.css';

export interface TemplateBrowserRailProps {
    items: TemplateBrowserRailItem[];
    selectedId: string;
    strings: TemplateBrowserStrings;
    onSelect: (id: string) => void;
}

/**
 * The left rail: every template, the application's own, then the blueprints in its UI profile, then the ones that are not - "Needs a blueprint…" - which can
 * still be browsed and then added. A rail row is a button that says how many templates it would list, so the count is never the only way to tell.
 */
export function TemplateBrowserRail({ items, selectedId, strings, onSelect }: TemplateBrowserRailProps) {
    const labelOf = (item: TemplateBrowserRailItem) => item.id === allTemplatesRailId ? strings.allTemplates : item.id === ownTemplatesRailId ? strings.myTemplates : item.label;
    const blueprints = items.filter(item => item.kind === TemplateBrowserRailKind.Blueprint);
    const row = (item: TemplateBrowserRailItem) => (
        <li key={item.id}>
            <button type='button' className='studio-template-rail__row' data-rail={item.id} aria-current={item.id === selectedId} onClick={() => onSelect(item.id)}>
                <span className='studio-template-rail__label'>{labelOf(item)}</span>
                {item.update && <span className='studio-template-rail__update' title={formatTemplateBrowserMessage(strings.update.available, { from: item.update.from, to: item.update.to, pin: item.update.pin })}><Tag value='↑' severity='info' /></span>}
                <span className='studio-template-rail__count' aria-label={formatTemplateBrowserMessage(strings.count, { count: item.count })}>{item.count}</span>
            </button>
        </li>
    );

    return (
        <nav className='studio-template-rail' aria-label={strings.rail}>
            <ul className='studio-template-rail__list'>{items.filter(item => item.kind !== TemplateBrowserRailKind.Blueprint).map(row)}</ul>
            {blueprints.some(item => item.installed) && (
                <>
                    <h3 className='studio-template-rail__heading'>{strings.blueprints}</h3>
                    <ul className='studio-template-rail__list'>{blueprints.filter(item => item.installed).map(row)}</ul>
                </>
            )}
            {blueprints.some(item => !item.installed) && (
                <>
                    <h3 className='studio-template-rail__heading'>{strings.needsBlueprint}</h3>
                    <ul className='studio-template-rail__list'>{blueprints.filter(item => !item.installed).map(row)}</ul>
                </>
            )}
        </nav>
    );
}
