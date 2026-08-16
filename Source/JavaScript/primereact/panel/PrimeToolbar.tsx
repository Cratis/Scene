// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Toolbar } from 'primereact/toolbar';
import { RegisteredComponentProps } from '@cratis/scene.react';

/**
 * The `PrimeReact:toolbar` component - a bar with content anchored to its start, center and end.
 *
 * The three regions map onto three named slots rather than properties, because what goes into them is
 * other components - buttons, a search field, a menu - not values.
 */
export function PrimeToolbar({ element, slots }: RegisteredComponentProps) {
    return <Toolbar data-scene-id={element.id} start={slots.start} center={slots.center} end={slots.end ?? slots.content} />;
}
