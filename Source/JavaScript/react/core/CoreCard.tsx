// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '../renderer';

/**
 * The `core:card` component - part of the minimum vocabulary a `ui profile` can always fall back to.
 */
export function CoreCard({ element, slots }: RegisteredComponentProps) {
    return (
        <section data-scene-id={element.id} style={{ border: '1px solid #ccc', borderRadius: 4, padding: '0.75rem' }}>
            {slots.content}
        </section>
    );
}
