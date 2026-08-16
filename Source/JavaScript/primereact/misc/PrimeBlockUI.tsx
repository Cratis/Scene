// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { BlockUI } from './BlockUI';
import { booleanProperty } from '../properties';

/**
 * The `PrimeReact:blockUI` component - a region masked while something is in flight.
 *
 * PrimeReact 11 removed `BlockUI` outright: no renamed module, no compositional replacement, no headless
 * hook. The name is in this package's manifest and screens are authored against it, so the adapter now
 * renders Cratis's own {@link BlockUI} instead. The element's contract is unchanged - a `blocked` flag and
 * whatever the `content` slot holds - which is the point: the removal is a fact about PrimeReact, not
 * something a screen should have to know.
 *
 * The default is `blocked`, because an element a screen bothered to place is there to say "this region is
 * waiting"; an unblocked block is a wrapper that does nothing.
 */
export function PrimeBlockUI({ element, slots }: RegisteredComponentProps) {
    return (
        <BlockUI
            data-scene-id={element.id}
            blocked={booleanProperty(element, 'blocked', true)}
            fullScreen={booleanProperty(element, 'fullScreen', false)}>
            {slots.content}
        </BlockUI>
    );
}
