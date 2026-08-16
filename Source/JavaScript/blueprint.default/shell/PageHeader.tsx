// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { readString } from './elementProperties';

/**
 * A screen's title, subtitle and actions.
 *
 * This belongs to the layout package rather than to each screen because it is the one piece of page
 * furniture every page template repeats. Centralizing it means the title/actions relationship is spaced
 * and aligned identically across the whole page set, which is most of what makes a template set look like
 * one product rather than twenty pages.
 */
export function PageHeader({ element, slots }: RegisteredComponentProps) {
    const title = readString(element, 'title');
    const subtitle = readString(element, 'subtitle');

    return (
        <div className='layout-page-header' data-scene-id={element.id}>
            <div>
                <h1 className='layout-page-header-title'>{title}</h1>
                {subtitle && <p className='layout-page-header-subtitle'>{subtitle}</p>}
            </div>
            {(slots.actions?.length ?? 0) > 0 && <div className='layout-page-header-actions'>{slots.actions}</div>}
        </div>
    );
}
