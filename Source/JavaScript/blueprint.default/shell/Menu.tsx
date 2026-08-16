// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { readString } from './elementProperties';

/**
 * A navigation list.
 *
 * One markup shape - a `nav` around a `ul` of {@link MenuItem}s - serves every mode; the difference
 * between a docked list, a circular icon rail, a stacked label rail and a horizontal strip with drop-down
 * submenus is entirely in the stylesheet. That is the point of the mode class vocabulary: the menu does
 * not know which mode it is in, so a screen's navigation cannot be written for one mode and broken in
 * another.
 */
export function Menu({ element, slots }: RegisteredComponentProps) {
    const title = readString(element, 'title');
    const label = readString(element, 'label', 'Main');

    return (
        <nav data-scene-id={element.id} aria-label={label}>
            {title && <div className='layout-menu-section-title'>{title}</div>}
            <ul className='layout-menu'>{slots.items}</ul>
        </nav>
    );
}
