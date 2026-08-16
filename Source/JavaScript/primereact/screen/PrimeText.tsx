// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { RegisteredComponentProps } from '@cratis/scene.react';
import { booleanProperty, stringProperty } from '../properties';

/**
 * The `PrimeReact:text` component - a run of prose.
 *
 * PrimeReact has no text primitive, so this one is written directly rather than wrapped. It is still
 * worth shipping: it claims the bare name `core` also declares, and unlike core's unstyled span it picks
 * up the active theme's type color and muting through the Scene token bridge. That is the smallest
 * possible demonstration of why override priority exists - the same screen, the same name, better output
 * once a component library is in the profile.
 */
export function PrimeText({ element, slots }: RegisteredComponentProps) {
    const muted = booleanProperty(element, 'muted', false);
    const strong = booleanProperty(element, 'strong', false);
    return (
        <span
            data-scene-id={element.id}
            className={`${muted ? 'opacity-75' : ''} ${strong ? 'font-semibold' : ''}`.trim()}
            style={{ color: muted ? 'var(--scene-text-muted-color)' : 'var(--scene-text-color)' }}>
            {stringProperty(element, 'text', '')}
            {slots.content}
        </span>
    );
}
