// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { HTMLAttributes } from 'react';

/**
 * Configuration for {@link BlockUI}.
 */
export interface BlockUIProps extends HTMLAttributes<HTMLDivElement> {
    /**
     * Whether the region is currently blocked. While this is `false` the component adds nothing but a
     * positioned wrapper, so it is safe to leave mounted around content that is only occasionally busy.
     */
    blocked?: boolean;

    /**
     * Whether the mask covers the whole viewport rather than only the wrapped content. A long-running
     * action that would leave the rest of the screen misleadingly usable wants the page; a panel
     * refreshing its own data does not.
     */
    fullScreen?: boolean;
}

/**
 * A region that greys itself out and stops accepting input while something is in flight.
 *
 * Cratis owns this component. PrimeReact 10 had `BlockUI`; PrimeReact 11 removed it with no replacement
 * and no headless hook, and the `blockUI` name is one this package's manifest already publishes - screens
 * are written against it. Rebuilding it here is what keeps that promise, and it turns out to be a small
 * thing to own: the whole component is a positioned wrapper, an `inert` subtree and a translucent mask.
 *
 * Blocking is expressed twice on purpose, because the two audiences need different things. `aria-busy`
 * tells assistive technology that the region's content is being updated and should not be announced as
 * final. `inert` on the wrapped subtree takes it out of the tab order and stops it responding to clicks -
 * without that, a mask is only a visual suggestion and a keyboard user tabs straight through it into
 * controls the screen believes are unavailable.
 *
 * What it deliberately does not carry over from v10: the `template` and `containerTemplate` props (a
 * screen that wants a spinner or a message over the mask composes one into the blocked content itself),
 * the enter/leave transitions, `baseZIndex` / `autoZIndex` layering (the mask uses one fixed stacking
 * level and does not negotiate with dialogs), and the `onBlock` / `onUnblock` callbacks - a Scene element
 * has nowhere to route a callback to, and the blocked state is authored rather than discovered.
 */
export function BlockUI({ blocked = false, fullScreen = false, className, children, ...rest }: BlockUIProps) {
    return (
        <div {...rest} className={['relative', className].filter(Boolean).join(' ')} aria-busy={blocked}>
            <div inert={blocked}>{children}</div>
            {blocked && <div className={fullScreen ? 'fixed inset-0 z-50 bg-black/40' : 'absolute inset-0 z-10 bg-black/40'} />}
        </div>
    );
}
