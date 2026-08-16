// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { IconDisplay } from '@cratis/components/Common';
import { RegisteredComponentProps } from '@cratis/scene.react';
import { stringProperty } from '../properties';

/**
 * The `Cratis.Components:icon` component - `IconDisplay` from `@cratis/components/Common`.
 *
 * Takes an icon class name (`pi pi-check`) rather than an image, and normalizes the shorthand forms
 * people actually write - `pi-check` on its own, or a bare name - into the class PrimeIcons expects.
 * That normalization is the whole reason to route a screen's icons through this rather than emitting an
 * `<i>`: a screen author writes what they remember and it still renders.
 */
export function SceneIcon({ element }: RegisteredComponentProps) {
    return <IconDisplay icon={stringProperty(element.properties, 'icon') ?? ''} className={stringProperty(element.properties, 'className')} />;
}
