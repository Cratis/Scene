// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { createElement } from 'react';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { numberProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:title` component - one of Screenplay's screen directives.
 *
 * Renders a real heading element at the authored level rather than a styled span, because heading level
 * is the document outline a screen reader navigates by; getting it right is not a styling choice. The
 * level is clamped to 1-6 so an out-of-range value degrades to a valid heading instead of an invalid tag.
 */
export function PrimeTitle({ element }: RegisteredComponentProps) {
    const level = Math.min(6, Math.max(1, Math.round(numberProperty(element, 'level', 1))));
    const sizes = ['text-3xl', 'text-2xl', 'text-xl', 'text-lg', 'text-base', 'text-sm'];
    return createElement(
        `h${level}`,
        {
            'data-scene-id': element.id,
            className: `${sizes[level - 1]} font-semibold`,
            style: { color: 'var(--scene-text-color)' },
        },
        stringProperty(element, 'text', '')
    );
}
