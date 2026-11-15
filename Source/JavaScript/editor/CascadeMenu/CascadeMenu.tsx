// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import './CascadeMenu.css';
import { useCallback, useEffect, useRef, useState, type KeyboardEvent } from 'react';
import { createPortal } from 'react-dom';
import { CascadeEntry } from './CascadeEntry';
import { CascadeFilter } from './CascadeFilter';
import { CascadePanel } from './CascadePanel';
import { CascadeStep, focusTarget, stepForKey } from './cascadeNavigation';
import { keepKeyInMenu, menuInputBoundary } from './keepInputInMenu';
import { OpenSubmenu } from './OpenSubmenu';

export interface CascadeMenuProps {
    /** Where the menu opens: the control that was pressed. */
    anchor: DOMRect;

    /** The control that opened the menu. Pressing it again is its own to handle, so it does not count as clicking elsewhere. */
    trigger?: HTMLElement | null;

    /** The rows of the first panel. */
    entries: CascadeEntry[];

    /** The accessible name of the menu. */
    label: string;

    /** The filter field at the top of the first panel, when there is one. */
    filter?: CascadeFilter;

    /** Called when the menu should go away: a row was chosen, the user pressed elsewhere or pressed Escape. */
    onClose: () => void;
}

const focusables = (panel: Element) => [...panel.querySelectorAll<HTMLElement>('[data-cascade-focusable]:not([aria-disabled="true"])')];

/**
 * A cascading menu: a first panel whose rows may open further panels beside it, the way a desktop menu does.
 *
 * It is the one menu Studio draws for choosing among own things and blueprint things - templates and sample data -
 * so the structure (own first, blueprints one level deeper) and the keyboard behaviour exist once. It is drawn on the
 * page, not inside the region it belongs to, so nothing clips it; arrow keys move through rows, the right arrow opens a
 * submenu and the left arrow or Escape closes it, Tab stays inside the menu, and focus returns to what opened it.
 */
export const CascadeMenu = ({ anchor, trigger, entries, label, filter, onClose }: CascadeMenuProps) => {
    const rootRef = useRef<HTMLDivElement>(null);
    const [openPath, setOpenPath] = useState<OpenSubmenu[]>([]);
    const [anchorRect] = useState(() => ({ top: anchor.top, left: anchor.left, width: anchor.width, height: anchor.height }));

    // Focus returns to the control that opened the menu - or, with none given, whatever had focus - when the menu goes.
    useEffect(() => {
        const previous = trigger ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
        return () => previous?.focus?.();
    }, [trigger]);

    useEffect(() => {
        const onPointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (!rootRef.current?.contains(target) && !trigger?.contains(target)) onClose();
        };
        document.addEventListener('pointerdown', onPointerDown, true);
        return () => document.removeEventListener('pointerdown', onPointerDown, true);
    }, [onClose, trigger]);

    const open = useCallback((depth: number, submenu: OpenSubmenu) => setOpenPath(path => [...path.slice(0, depth), submenu]), []);
    const collapse = useCallback((depth: number) => setOpenPath(path => path.length > depth ? path.slice(0, depth) : path), []);

    const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        keepKeyInMenu(event);
        const active = document.activeElement as HTMLElement | null;
        const panel = active?.closest<HTMLElement>('.studio-cascade-menu__panel');
        const depth = Number(panel?.dataset.cascadeDepth ?? 0);

        if (event.key === 'Escape') {
            event.preventDefault();
            event.stopPropagation();
            if (depth > 0) {
                const parent = rootRef.current?.querySelector<HTMLElement>(`[data-cascade-depth="${depth - 1}"] [aria-expanded="true"]`);
                collapse(depth - 1);
                parent?.focus();
            } else onClose();
            return;
        }

        if (event.key === 'Tab' && panel) {
            const rows = focusables(panel);
            if (rows.length === 0) return;
            event.preventDefault();
            const index = rows.indexOf(active!);
            rows[event.shiftKey ? (index <= 0 ? rows.length - 1 : index - 1) : (index + 1) % rows.length]?.focus();
            return;
        }

        const step = stepForKey(event.key, active instanceof HTMLInputElement);
        if (!step || !panel) return;
        event.preventDefault();

        if (step === CascadeStep.Into) {
            if (active?.getAttribute('aria-haspopup') !== 'menu') return;
            active.click();
            requestAnimationFrame(() => {
                const child = rootRef.current?.querySelector<HTMLElement>(`[data-cascade-depth="${depth + 1}"]`);
                if (child) focusables(child)[0]?.focus();
            });
            return;
        }

        if (step === CascadeStep.Out) {
            if (depth === 0) return;
            const parent = rootRef.current?.querySelector<HTMLElement>(`[data-cascade-depth="${depth - 1}"] [aria-expanded="true"]`);
            collapse(depth - 1);
            parent?.focus();
            return;
        }

        const rows = focusables(panel);
        rows[focusTarget(step, rows.indexOf(active!), rows.length)]?.focus();
    };

    return createPortal(
        <div {...menuInputBoundary} ref={rootRef} className='studio-cascade-menu' onKeyDown={onKeyDown}>
            <CascadePanel entries={entries} depth={0} anchor={anchorRect} openPath={openPath} label={label} filter={filter}
                onOpen={open} onCollapse={collapse} onChosen={onClose} />
        </div>,
        document.body);
};
