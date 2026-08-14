// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '../renderer';

/**
 * The `core:button` component - part of the minimum vocabulary a `ui profile` can always fall back to.
 */
export function CoreButton({ element, slots }: RegisteredComponentProps) {
    const label = typeof element.properties.label === 'string' ? element.properties.label : '';
    return (
        <button type="button" data-scene-id={element.id}>
            {label}
            {slots.content}
        </button>
    );
}
