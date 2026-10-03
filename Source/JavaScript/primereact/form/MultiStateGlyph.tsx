// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SceneIcon } from '@cratis/scene.react';
import { MultiStateOption } from './MultiStateOption';

export interface MultiStateGlyphProps {
    /** The state being shown. */
    state: MultiStateOption | undefined;

    /** Whether the state is the empty (`null`) state, drawn as an empty box. */
    isEmpty: boolean;

    /** Whether the control is disabled or read only. */
    isInactive: boolean;
}

/**
 * The box a multi-state checkbox draws, themed with the PrimeReact checkbox tokens (`--p-checkbox-*`), so
 * it follows the active Scene theme and looks like its sibling `checkbox`. It holds the state's icon - a
 * PrimeIcons class or a qualified icon reference - or a check mark when the state has no icon of its own.
 * An empty state draws only its own icon, if it has one. It is decorative: the state is announced through the control's text, not through this glyph.
 */
export function MultiStateGlyph({ state, isEmpty, isInactive }: MultiStateGlyphProps) {
    const icon = state?.icon;
    return (
        <span
            aria-hidden='true'
            data-scene-part='glyph'
            style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, boxSizing: 'border-box',
                width: 'var(--p-checkbox-width, 1.125rem)', height: 'var(--p-checkbox-height, 1.125rem)',
                borderRadius: 'var(--p-checkbox-border-radius, 4px)',
                border: `1px solid ${isEmpty ? 'var(--p-checkbox-border-color, currentColor)' : 'var(--p-checkbox-checked-border-color, currentColor)'}`,
                backgroundColor: isEmpty ? 'var(--p-checkbox-background, transparent)' : 'var(--p-checkbox-checked-background, currentColor)',
                color: glyphColor(isEmpty, isInactive),
                fontSize: 'var(--p-checkbox-icon-size, 0.75rem)',
            }}>
            {icon === undefined ? !isEmpty && <CheckMark /> : typeof icon === 'string' ? <i className={icon} /> : <SceneIcon reference={icon} size='var(--p-checkbox-icon-size, 0.75rem)' />}
        </span>
    );
}

function glyphColor(isEmpty: boolean, isInactive: boolean): string {
    if (isInactive) return 'var(--p-checkbox-icon-disabled-color, currentColor)';
    return isEmpty ? 'var(--p-checkbox-icon-color, currentColor)' : 'var(--p-checkbox-icon-checked-color, Canvas)';
}

function CheckMark() {
    return (
        <svg viewBox='0 0 12 12' width='1em' height='1em' fill='none' stroke='currentColor' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'>
            <path d='M2 6.5 5 9.5 10 3' />
        </svg>
    );
}
