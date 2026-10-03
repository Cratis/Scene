// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ReactNode, useEffect, useMemo, useRef } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { arrayProperty, booleanProperty, numberProperty, stringProperty } from '../properties';
import { useStructuralValue } from '../useStructuralValue';
import { DataScrollerRow } from './DataScrollerRow';
import { isSerializedLegacyElement, legacyElementMessage } from './isSerializedLegacyElement';
import { useIncrementalLoad } from './useIncrementalLoad';
import { useLoadOnReach } from './useLoadOnReach';

/** How tall an inline scroller is when no `scrollHeight` was authored: without a height it would never overflow. */
const defaultScrollHeight = 320;

/**
 * The `PrimeReact:dataScroller` component, a list that loads a chunk at a time as its end is reached.
 *
 * The entries are read as data: strings, numbers and records (see {@link DataScrollerRow}) from `items`, then
 * any child elements authored in the `items` (or `content`) slot, which render as themselves. Serialized
 * legacy UI elements in `items` are refused with a visible message, not shown as JSON.
 *
 * - `inline: true` scrolls inside the control, `scrollHeight` pixels tall (320 when omitted). `inline: false`
 *   loads as the page scrolls the end of the list into view.
 * - The "Load more" button remains for keyboard and assistive technology; focus moves to the first entry it
 *   loads, and the number shown is announced.
 * - A disabled element loads nothing on scroll and its button is disabled.
 * - The loaded count restarts when `rows` or the content of `items` changes.
 */
export function PrimeDataScroller({ element, slots, interactions }: RegisteredComponentProps) {
    const authored = useStructuralValue(arrayProperty(element, 'items'));
    const data = useMemo(() => authored.filter(entry => !isSerializedLegacyElement(entry) && entry !== null && entry !== undefined), [authored]);
    const refusal = legacyElementMessage(authored, 'items', 'items');
    const slotted = slots.items ?? slots.content ?? [];
    const rows = useMemo<ReactNode[]>(() => [...data.map((value, index) => <DataScrollerRow key={index} value={value} />), ...slotted], [data, slotted]);
    const chunk = Math.max(Math.floor(numberProperty(element, 'rows', 10)), 1);
    const inline = booleanProperty(element, 'inline', false);
    const scrollHeight = numberProperty(element, 'scrollHeight', defaultScrollHeight);
    const enabled = element.isEnabled;
    const { loaded, loadMore } = useIncrementalLoad(rows.length, chunk, data);
    const canLoad = loaded < rows.length;
    const scroller = useRef<HTMLDivElement>(null);
    const sentinel = useRef<HTMLDivElement>(null);
    const entries = useRef<(HTMLLIElement | null)[]>([]);
    const focusIndex = useRef<number | undefined>(undefined);

    useLoadOnReach(sentinel, inline ? scroller : null, enabled && canLoad, loaded, loadMore);

    useEffect(() => {
        if (focusIndex.current === undefined) return;
        entries.current[focusIndex.current]?.focus();
        focusIndex.current = undefined;
    }, [loaded]);

    const loadByButton = () => {
        focusIndex.current = loaded;
        loadMore();
    };

    return (
        <div
            data-scene-id={element.id}
            data-scene-component='dataScroller'
            aria-disabled={!enabled}
            onClick={interactions?.onClick}
            onDoubleClick={interactions?.onDoubleClick}>
            <div
                ref={scroller}
                role='region'
                tabIndex={inline ? 0 : undefined}
                aria-label={stringProperty(element, 'ariaLabel', 'Scrollable data')}
                style={inline ? { maxHeight: `${scrollHeight}px`, overflowY: 'auto' } : undefined}>
                <ol>
                    {rows.slice(0, loaded).map((row, index) => <li key={index} tabIndex={-1} ref={node => { entries.current[index] = node; }}>{row}</li>)}
                </ol>
                {canLoad && <div ref={sentinel} aria-hidden='true' />}
            </div>
            {rows.length === 0 && <p role='status'>{stringProperty(element, 'emptyLabel', 'No items to show')}</p>}
            {refusal !== undefined && <p role='alert' data-scene-state='legacy-elements'>{refusal}</p>}
            {canLoad && <button type='button' disabled={!enabled} onClick={loadByButton}>Load more</button>}
            {rows.length > 0 && <output aria-live='polite'>{`Showing ${loaded} of ${rows.length} items`}</output>}
        </div>
    );
}
