// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useMemo, useRef, useState, type KeyboardEvent } from 'react';
import type { StateChangeSlice } from '../ScreenEditor/Actions/StateChangeSlice';
import type { Rect } from '../ScreenEditor/Surface/dropRegionRects';
import type { LevelTemplateSurfaceStrings } from './LevelTemplateSurfaceStrings';

export interface HookPickerProps {
    /** The "+" it opened from, and the room it may use, in the surface's pixels. */
    anchor: Rect;
    bounds: Rect;
    title: string;
    slices: readonly StateChangeSlice[];
    strings: LevelTemplateSurfaceStrings;
    onChoose: (sliceId: string) => void;
    onClose: () => void;
}

const width = 360;

/** The State Change slices of the level an action can be hooked to, as a list to pick from beside the "+" of the outlet. */
export const HookPicker = ({ anchor, bounds, title, slices, strings, onChoose, onClose }: HookPickerProps) => {
    const root = useRef<HTMLDivElement>(null);
    const search = useRef<HTMLInputElement>(null);
    const [filter, setFilter] = useState('');

    useEffect(() => { search.current?.focus({ preventScroll: true }); }, []);
    useEffect(() => {
        const away = (event: PointerEvent) => {
            const target = event.target as HTMLElement | null;
            if (root.current?.contains(target) || target?.closest('[data-level-add]')) return;
            onClose();
        };
        document.addEventListener('pointerdown', away, true);
        return () => document.removeEventListener('pointerdown', away, true);
    }, [onClose]);

    const shown = useMemo(() => {
        const needle = filter.trim().toLowerCase();
        return needle === '' ? slices : slices.filter(slice => slice.name.toLowerCase().includes(needle) || slice.origin.join(' ').toLowerCase().includes(needle));
    }, [slices, filter]);

    const keys = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); return; }
        if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return;
        const rows = Array.from(root.current?.querySelectorAll<HTMLElement>('[data-hook-slice]') ?? []);
        if (rows.length === 0) return;
        event.preventDefault();
        const at = rows.indexOf(document.activeElement as HTMLElement);
        rows[(at + (event.key === 'ArrowDown' ? 1 : -1) + rows.length) % rows.length].focus();
    };

    const left = Math.max(bounds.left, Math.min(anchor.left + anchor.width - width, bounds.left + bounds.width - width));
    return (
        <div ref={root} role='dialog' aria-label={title} className='studio-level-surface__picker' data-hook-picker style={{ left, top: anchor.top + anchor.height + 6, width }} onKeyDown={keys}>
            <p className='studio-level-surface__picker-title'>{title}</p>
            <input ref={search} type='search' className='studio-level-surface__picker-search' value={filter} placeholder={strings.hookSearch} aria-label={strings.hookSearch} onChange={event => setFilter(event.target.value)} />
            {slices.length === 0 && <p className='studio-level-surface__picker-empty'>{strings.hookNone}</p>}
            {slices.length > 0 && shown.length === 0 && <p className='studio-level-surface__picker-empty'>{strings.hookNoMatch}</p>}
            <ul className='studio-level-surface__picker-list'>
                {shown.map(slice => (
                    <li key={slice.id}>
                        <button type='button' data-hook-slice={slice.id} onClick={() => onChoose(slice.id)}>
                            <span className='studio-level-surface__picker-name'>{slice.name}</span>
                            {slice.origin.length > 0 && <span className='studio-level-surface__picker-origin'>{strings.hookFrom(slice.origin.join(' / '))}</span>}
                        </button>
                    </li>
                ))}
            </ul>
        </div>
    );
};
