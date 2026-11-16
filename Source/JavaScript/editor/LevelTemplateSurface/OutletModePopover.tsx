// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { useEffect, useRef, useState, type KeyboardEvent } from 'react';
import type { OutletDesign, OutletLevelMode } from '../ScreenEditor/DesignMode/Outlets/createOutletDesign';
import type { OutletStrings } from '../ScreenEditor/DesignMode/Outlets/OutletStrings';
import type { Rect } from '../ScreenEditor/Surface/dropRegionRects';

export interface OutletModePopoverProps {
    anchor: Rect;
    bounds: Rect;
    opener: HTMLElement;
    design: OutletDesign;
    strings: OutletStrings;
    onChoose: (mode: OutletLevelMode, copy: boolean) => void;
    onClose: () => void;
}

const modes: readonly OutletLevelMode[] = ['inherit', 'extend', 'override'];
const width = 320;

/**
 * How the level uses an outlet - Inherit, Extend or Override - as a small popover on the outlet instead of the inspector's full cards. Overriding asks
 * whether to start from a copy of what the level inherits, as the inspector does.
 */
export const OutletModePopover = ({ anchor, bounds, opener, design, strings, onChoose, onClose }: OutletModePopoverProps) => {
    const root = useRef<HTMLDivElement>(null);
    const [asking, setAsking] = useState(false);
    const owner = design.effective.sources.filter(source => source !== design.level.name).join(' + ') || (design.declaredBy ?? '');

    useEffect(() => {
        root.current?.querySelector<HTMLElement>('button')?.focus({ preventScroll: true });
        return () => { if (opener.isConnected) opener.focus({ preventScroll: true }); };
    }, [opener]);
    useEffect(() => {
        const away = (event: PointerEvent) => {
            const target = event.target as Node | null;
            if (root.current?.contains(target) || opener.contains(target)) return;
            onClose();
        };
        document.addEventListener('pointerdown', away, true);
        return () => document.removeEventListener('pointerdown', away, true);
    }, [opener, onClose]);

    const keys = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); onClose(); }
    };
    const choose = (mode: OutletLevelMode) => {
        if (mode === design.mode) { onClose(); return; }
        if (mode === 'override' && design.items.some(item => item.readOnly && item.provenance?.source !== 'contribution')) { setAsking(true); return; }
        onChoose(mode, false);
    };

    const left = Math.max(bounds.left, Math.min(anchor.left, bounds.left + bounds.width - width));
    return (
        <div ref={root} role='dialog' aria-label={strings.modeTitle} className='studio-level-surface__modes' data-outlet-modes={design.name} style={{ left, top: anchor.top + anchor.height + 6, width }} onKeyDown={keys}>
            {!asking && (
                <ul role='radiogroup' aria-label={strings.modeTitle}>
                    {modes.map(mode => (
                        <li key={mode}>
                            <button type='button' role='radio' aria-checked={mode === design.mode} data-outlet-mode-choice={mode} onClick={() => choose(mode)}>
                                <span className='studio-level-surface__mode-title'>{strings.modes[mode].title}</span>
                                <span className='studio-level-surface__mode-description'>{strings.modes[mode].description(owner)}</span>
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            {asking && (
                <div className='studio-level-surface__copy' role='group' aria-label={strings.copyPrompt}>
                    <p>{strings.copyPrompt}</p>
                    <button type='button' data-copy='yes' onClick={() => onChoose('override', true)}>{strings.copyYes}</button>
                    <button type='button' data-copy='no' onClick={() => onChoose('override', false)}>{strings.copyNo}</button>
                </div>
            )}
        </div>
    );
};
