// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { menuItemsProperty } from '../menuItems';
import { MegaMenu } from './MegaMenu';

/**
 * The `PrimeReact:megaMenu` component - a menubar whose submenus open as multi-column panels.
 *
 * PrimeReact 11 removed `megamenu` with nothing to replace it, so what this adapts is Scene's own
 * {@link MegaMenu}.
 *
 * Columns are one ordinary level of nesting: each root entry's `items` are the columns, and each column's
 * `items` are the commands in it. PrimeReact 10 spelled that as an array of arrays, but `menuItemsProperty`
 * follows nested objects and drops nested arrays, so the doubly-nested form never survived the read in the
 * first place. Authoring it as objects is both what the reader supports and one bracket less to get right.
 */
export function PrimeMegaMenu({ element }: RegisteredComponentProps) {
    return <MegaMenu data-scene-id={element.id} items={menuItemsProperty(element, 'items')} />;
}
