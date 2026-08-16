// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Toolbar } from 'primereact/toolbar';
import { RegisteredComponentProps } from '@cratis/scene.react';

/**
 * The `PrimeReact:toolbar` component - a bar with content anchored to its start, center and end.
 *
 * The three regions map onto three named slots rather than properties, because what goes into them is
 * other components - buttons, a search field, a menu - not values.
 *
 * PrimeReact 11 turned those regions from `start` / `center` / `end` render props into `Toolbar.Start`,
 * `Toolbar.Center` and `Toolbar.End` parts, which happens to be a closer match for what this adapter was
 * already doing: each region is now children rather than a prop holding elements. All three are always
 * rendered, so the flex layout keeps its three anchors and a toolbar with only an end region still pins
 * that region to the end instead of collapsing it leftwards.
 */
export function PrimeToolbar({ element, slots }: RegisteredComponentProps) {
    return (
        <Toolbar.Root data-scene-id={element.id}>
            <Toolbar.Start>{slots.start}</Toolbar.Start>
            <Toolbar.Center>{slots.center}</Toolbar.Center>
            <Toolbar.End>{slots.end ?? slots.content}</Toolbar.End>
        </Toolbar.Root>
    );
}
