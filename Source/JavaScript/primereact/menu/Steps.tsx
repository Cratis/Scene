// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, HTMLAttributes } from 'react';
import { MenuItem } from '../MenuItem';
import { MenuItemContent } from './MenuItemContent';

const listStyle: CSSProperties = { listStyle: 'none', margin: 0, padding: 0, color: 'var(--scene-text-color)' };

const markerStyle: CSSProperties = {
    width: '1.75rem',
    height: '1.75rem',
    borderRadius: '50%',
    border: '1px solid var(--scene-surface-border)',
    background: 'var(--scene-surface-card)',
    color: 'var(--scene-text-muted-color)',
};

const reachedMarkerStyle: CSSProperties = {
    ...markerStyle,
    background: 'var(--scene-primary-color)',
    borderColor: 'var(--scene-primary-color)',
    color: 'var(--scene-primary-contrast-color)',
};

const pendingStepStyle: CSSProperties = { color: 'var(--scene-text-muted-color)' };

/**
 * The configuration {@link Steps} takes.
 */
export interface StepsProps extends HTMLAttributes<HTMLOListElement> {
    /**
     * The steps in the sequence, in order.
     */
    items?: MenuItem[];

    /**
     * The zero-based step the user is on. Everything before it counts as reached.
     */
    activeIndex?: number;
}

/**
 * A numbered horizontal indicator of where the user is in a sequence. Cratis-owned.
 *
 * This exists because PrimeReact 11 removed `primereact/steps` outright. `primereact/stepper` survives,
 * but it is not a replacement: a stepper owns the content of each step and drives moving between them,
 * whereas `steps` shows position and nothing else, next to whatever a screen chose to render itself. Scene
 * has both concepts and they are registered separately, so collapsing one into the other would silently
 * change what an authored screen means.
 *
 * It is an ordered list because that is what it is - a numbered sequence, read in order - and the step the
 * user is on is marked with `aria-current` rather than only with color, so the position is available to a
 * screen reader and not just to an eye.
 *
 * What it deliberately does not carry over from the v10 `Steps`: the indicator is read-only, so v10's
 * `readOnly={false}` mode where clicking a step jumped to it is gone, and with it the `onSelect` callback
 * and the internally held selection. A screen that wants navigable steps should hold the position itself
 * and render whatever control it wants to move between them. Item templates and the vertical layout are
 * not supported either.
 */
export function Steps({ items = [], activeIndex = 0, ...rest }: StepsProps) {
    return (
        <ol {...rest} className='flex items-center gap-4' style={listStyle}>
            {items.map((item, index) => (
                <li
                    key={index}
                    className='inline-flex items-center gap-2'
                    style={index <= activeIndex ? undefined : pendingStepStyle}
                    aria-current={index === activeIndex ? 'step' : undefined}>
                    <span className='inline-flex items-center justify-center' aria-hidden='true' style={index <= activeIndex ? reachedMarkerStyle : markerStyle}>
                        {index + 1}
                    </span>
                    <MenuItemContent item={item} />
                </li>
            ))}
        </ol>
    );
}
