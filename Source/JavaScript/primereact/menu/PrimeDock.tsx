// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { stringProperty } from '../properties';
import { Dock } from './Dock';
import { DockPosition } from './DockPosition';

/**
 * Narrows an authored `position` onto the edges a dock can actually be anchored to.
 *
 * A screen's properties are authored data rather than compiler-checked values, so an unrecognized edge is
 * an ordinary thing to encounter. Falling back to the bottom edge - the dock's own default - keeps a
 * mistyped property behaving exactly like an absent one, which is the rule every reader in this package
 * follows.
 *
 * @param value The authored position.
 * @returns The matching edge, or the bottom edge when the value names none.
 */
function dockPosition(value: string): DockPosition {
    switch (value) {
        case DockPosition.Top:
            return DockPosition.Top;
        case DockPosition.Left:
            return DockPosition.Left;
        case DockPosition.Right:
            return DockPosition.Right;
        default:
            return DockPosition.Bottom;
    }
}

/**
 * The `PrimeReact:dock` component - a strip of icons anchored to one edge.
 *
 * PrimeReact 11 removed `dock` with nothing to replace it, so what this adapts is Scene's own
 * {@link Dock}. The magnifying effect that made v10's dock recognizable is not part of the replacement;
 * what a screen actually depends on is a row of icon commands pinned to an edge, and that is what remains.
 *
 * A dock positions itself absolutely against its nearest positioned ancestor, so it is wrapped in a sized
 * relative box here; dropped straight into a Scene tree it would otherwise pin itself to the page.
 */
export function PrimeDock({ element }: RegisteredComponentProps) {
    return (
        <div data-scene-id={element.id} className='relative h-40 w-full'>
            <Dock items={menuItemsProperty(element, 'items')} position={dockPosition(stringProperty(element, 'position', DockPosition.Bottom))} />
        </div>
    );
}
