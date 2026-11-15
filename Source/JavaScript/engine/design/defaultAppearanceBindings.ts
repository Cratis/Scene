// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { AppearanceBindings } from '@cratis/scene.model';

/**
 * The token roles Scene's default design system (the one `blueprint.default` ships) takes an accent, a corner style and a font
 * through. A design system of a product states its own {@link AppearanceBindings}; nothing else in Scene assumes a token name.
 */
export const defaultAppearanceBindings: Readonly<AppearanceBindings> = {
    accent: 'color.primary',
    focusRing: 'shadow.focus-ring',
    corners: 'radius.content',
    font: 'font.sans',
};
