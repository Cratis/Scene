// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { UIEvent, useMemo, useState } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, numberProperty, stringProperty } from '../properties';

/** The `PrimeReact:dataScroller` component, a progressively loaded list over its authored item collection. */
export function PrimeDataScroller({ element, interactions }: RegisteredComponentProps) {
    const items = useMemo(() => Array.isArray(element.properties.items) ? element.properties.items : [], [element.properties.items]);
    const rows = Math.max(numberProperty(element, 'rows', 10), 1);
    const inline = booleanProperty(element, 'inline', false);
    const scrollHeight = numberProperty(element, 'scrollHeight');
    const [loaded, setLoaded] = useState(rows);
    const visible = items.slice(0, loaded);
    const canLoad = loaded < items.length;

    const loadMore = () => setLoaded(current => Math.min(current + rows, items.length));
    const scrolled = (event: UIEvent<HTMLDivElement>) => {
        if (!inline || !canLoad) return;
        const target = event.currentTarget;
        if (target.scrollTop + target.clientHeight >= target.scrollHeight - 1) loadMore();
    };

    return (
        <div
            data-scene-id={element.id}
            role='region'
            tabIndex={inline ? 0 : undefined}
            aria-label={stringProperty(element, 'ariaLabel', 'Scrollable data')}
            onClick={interactions?.onClick}
            onDoubleClick={interactions?.onDoubleClick}
            onScroll={scrolled}
            style={inline && scrollHeight !== undefined ? { maxHeight: `${scrollHeight}px`, overflowY: 'auto' } : undefined}>
            <ol>
                {visible.map((item, index) => <li key={itemKey(item, index)}>{itemLabel(item)}</li>)}
            </ol>
            {canLoad && (
                <button type='button' disabled={!element.isEnabled} onClick={() => { loadMore(); interactions?.onChange?.(); }}>
                    Load more
                </button>
            )}
        </div>
    );
}

function itemKey(item: unknown, index: number): string {
    const record = typeof item === 'object' && item !== null && !Array.isArray(item) ? item as { id?: unknown } : undefined;
    if (typeof record?.id === 'string') return record.id;
    return `${index}-${itemLabel(item)}`;
}

function itemLabel(item: unknown): string {
    if (typeof item === 'string' || typeof item === 'number' || typeof item === 'boolean') return String(item);
    if (typeof item === 'object' && item !== null && !Array.isArray(item)) return JSON.stringify(item);
    return '';
}
