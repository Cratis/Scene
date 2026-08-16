// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CSSProperties, HTMLAttributes } from 'react';
import { MenuItem } from '../MenuItem';
import { DockPosition } from './DockPosition';

const dockStyle: CSSProperties = {
    position: 'absolute',
    background: 'var(--scene-surface-overlay)',
    border: '1px solid var(--scene-surface-border)',
    borderRadius: 'var(--scene-content-border-radius)',
    color: 'var(--scene-text-color)',
};

const entryStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: 'inherit',
    cursor: 'pointer',
    font: 'inherit',
    fontSize: '1.5rem',
    lineHeight: 1,
    textDecoration: 'none',
};

/**
 * Where the dock sits within its container, for one edge.
 *
 * The offset lives here rather than in four CSS classes because this package ships no component
 * stylesheets, and because the two axes are genuinely coupled: an edge decides both which side is pinned
 * and which axis is centered, so writing them together is what keeps them consistent.
 */
function anchor(position: DockPosition): CSSProperties {
    switch (position) {
        case DockPosition.Top:
            return { top: 0, left: '50%', transform: 'translateX(-50%)' };
        case DockPosition.Left:
            return { left: 0, top: '50%', transform: 'translateY(-50%)' };
        case DockPosition.Right:
            return { right: 0, top: '50%', transform: 'translateY(-50%)' };
        default:
            return { bottom: 0, left: '50%', transform: 'translateX(-50%)' };
    }
}

/**
 * The configuration {@link Dock} takes.
 */
export interface DockProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * The entries to show. Each is shown as its icon alone, with its label as the accessible name.
     */
    items?: MenuItem[];

    /**
     * The edge of the containing box to anchor against.
     */
    position?: DockPosition;
}

/**
 * A small strip of icons anchored to one edge of its container. Cratis-owned.
 *
 * This exists because PrimeReact 11 removed `primereact/dock` outright, with no successor and no headless
 * hook. It positions itself absolutely, so it expects a positioned container to sit in - dropped straight
 * into a page it would pin itself to the page, which is why the Scene adapter wraps it in a sized relative
 * box.
 *
 * Entries are icon-only, and that is precisely why each one carries its label as `aria-label` and as a
 * `title`: a control whose only content is a decorative glyph has no accessible name at all otherwise, and
 * a dock is exactly the shape of component where that gets forgotten. An entry with no icon still renders,
 * as a neutral placeholder glyph, so a half-authored screen shows a gap rather than an invisible control.
 *
 * What it deliberately does not carry over from the v10 `Dock`: there is no magnification of the icon under
 * the pointer, which was the component's signature effect and is pure decoration; there are no tooltips
 * beyond the browser's own `title`; and item templates are not supported.
 */
export function Dock({ items = [], position = DockPosition.Bottom, ...rest }: DockProps) {
    const vertical = position === DockPosition.Left || position === DockPosition.Right;

    return (
        <div
            {...rest}
            role='toolbar'
            aria-orientation={vertical ? 'vertical' : 'horizontal'}
            className={vertical ? 'flex flex-col items-center gap-2 p-3' : 'flex items-center gap-2 p-3'}
            style={{ ...dockStyle, ...anchor(position) }}>
            {items.map((item, index) =>
                item.url === undefined ? (
                    <button
                        key={index}
                        type='button'
                        style={entryStyle}
                        disabled={item.disabled}
                        title={item.label}
                        aria-label={item.label}
                        onClick={() => item.command?.()}>
                        <i className={item.icon ?? 'pi pi-circle'} aria-hidden='true' />
                    </button>
                ) : (
                    <a key={index} href={item.url} style={entryStyle} title={item.label} aria-label={item.label}>
                        <i className={item.icon ?? 'pi pi-circle'} aria-hidden='true' />
                    </a>
                )
            )}
        </div>
    );
}
