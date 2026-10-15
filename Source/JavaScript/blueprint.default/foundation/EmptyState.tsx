// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { EmptyStateView } from './StateFrame';
import { readFoundationStrings } from './foundationStrings';
import { readLocale } from './formatting';

/**
 * The empty state as a component of its own: an icon, a headline, a hint and one primary action, embeddable in any region.
 *
 * Every other foundation component shows this same view when it has no data, so a screen reads the same wherever nothing is
 * found. Placed on its own it is what a template puts in a region that has nothing to say yet. The action starts whatever the
 * element's behaviors say, and honours the `actionPermission` rule, so an empty list never offers a creation the user may not do.
 */
export function EmptyState({ element, interactions }: RegisteredComponentProps) {
    return (
        <section className='foundation foundation-empty-state' data-scene-id={element.id} data-state='empty' lang={readLocale(element)}>
            <EmptyStateView element={element} interactions={interactions} strings={readFoundationStrings(element)} />
        </section>
    );
}
