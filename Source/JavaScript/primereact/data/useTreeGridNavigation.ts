// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { KeyboardEvent, useCallback, useRef, useState } from 'react';
import { TreeTableRow } from './TreeTableRow';

/** What the keyboard navigation of a tree grid needs from the control. */
export interface TreeGridNavigationOptions {
    rows: TreeTableRow[];
    expanded: ReadonlySet<string>;
    enabled: boolean;
    toggle(key: string): void;
    select(row: TreeTableRow): void;
}

/** The wiring a tree grid applies to its rows. */
export interface TreeGridNavigation {
    /** The one row that is in the tab order (roving tabindex). */
    tabStopKey: string | undefined;

    /** Gives the navigation the element of a row, so it can move focus there. */
    register(key: string, element: HTMLElement | null): void;

    /** Makes a row the tab stop, as a click does. */
    activate(key: string): void;

    /** The key handler of a row. */
    onKeyDown(row: TreeTableRow, event: KeyboardEvent<HTMLElement>): void;
}

/**
 * The keyboard model of an ARIA tree grid, with a roving tab index.
 *
 * Up and Down move between visible rows, Home and End to the first and last, Right expands a collapsed row or
 * enters its first child, Left collapses an expanded row or goes to its parent, and Space or Enter selects.
 * Keys pressed on a control inside the row (its expand button or checkbox) are left to that control.
 */
export function useTreeGridNavigation({ rows, expanded, enabled, toggle, select }: TreeGridNavigationOptions): TreeGridNavigation {
    const [activeKey, setActiveKey] = useState<string | undefined>(undefined);
    const elements = useRef(new Map<string, HTMLElement>());
    const tabStopKey = rows.some(row => row.key === activeKey) ? activeKey : rows[0]?.key;

    const register = useCallback((key: string, element: HTMLElement | null) => {
        if (element === null) elements.current.delete(key); else elements.current.set(key, element);
    }, []);

    const moveTo = (row: TreeTableRow | undefined) => {
        if (row === undefined) return;
        setActiveKey(row.key);
        elements.current.get(row.key)?.focus();
    };

    const onKeyDown = (row: TreeTableRow, event: KeyboardEvent<HTMLElement>) => {
        if (event.target !== event.currentTarget) return;
        const index = rows.indexOf(row);
        const hasChildren = (row.node.children?.length ?? 0) > 0;
        const handled = (action: () => void) => { event.preventDefault(); action(); };

        switch (event.key) {
            case 'ArrowDown': handled(() => moveTo(rows[index + 1])); break;
            case 'ArrowUp': handled(() => moveTo(rows[index - 1])); break;
            case 'Home': handled(() => moveTo(rows[0])); break;
            case 'End': handled(() => moveTo(rows[rows.length - 1])); break;
            case 'ArrowRight':
                if (hasChildren) handled(() => { if (!expanded.has(row.key)) { if (enabled) toggle(row.key); } else moveTo(rows[index + 1]); });
                break;
            case 'ArrowLeft':
                if (hasChildren && expanded.has(row.key)) handled(() => { if (enabled) toggle(row.key); });
                else if (row.parentKey !== undefined) handled(() => moveTo(rows.find(candidate => candidate.key === row.parentKey)));
                break;
            case ' ':
            case 'Enter':
                handled(() => select(row));
                break;
            default:
                break;
        }
    };

    return { tabStopKey, register, activate: setActiveKey, onKeyDown };
}
