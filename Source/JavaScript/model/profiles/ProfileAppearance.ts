// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme } from './ColorScheme';
import { CornerStyle } from './CornerStyle';

/**
 * How an application looks beyond the {@link UiProfile.theme} it selects: the colour scheme, the accent colour, the corner style and the font.
 */
export interface ProfileAppearance {
    /** Whether the application is light, dark or follows the system. Absent leaves the theme's own default. */
    colorScheme?: ColorScheme;

    /** The accent colour as a CSS colour (for example `#4f46e5`). Absent keeps the theme's accent. */
    accent?: string;

    /** How rounded corners are. Absent keeps the theme's own corner radius. */
    corners?: CornerStyle;

    /** The font, by the id of an entry in the font catalog (for example `inter`). Absent keeps the theme's own font. */
    font?: string;
}

export const ProfileAppearancePropertyNames: (keyof ProfileAppearance)[] = ['colorScheme', 'accent', 'corners', 'font'];
