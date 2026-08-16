// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';
import { blueprintThemeCompatibility } from './blueprintThemeCompatibility';

/**
 * The dark theme the shell ships with.
 *
 * Deliberately the same ten token names as the light theme and nothing more. A dark theme that introduced
 * extra tokens would work only for the parts of the shell written after it existed - the token set is the
 * contract, and both themes filling it identically is what makes switching between them a swap rather than
 * a re-render with holes in it.
 */
export const darkTheme: Theme = {
    name: 'Scene Default Dark',
    compatibleWith: blueprintThemeCompatibility,
    isDark: true,
    author: 'Cratis',
    authorUrl: 'https://cratis.io',
    license: 'MIT',
    description: 'The default dark palette: a deep slate ramp with a lifted indigo accent.',
    tokens: {
        'primary.color': '#818cf8',
        'primary.contrastColor': '#10131f',
        'surface.background': '#0f1117',
        'surface.card': '#171a23',
        'surface.border': '#262a36',
        'surface.hover': '#1f2431',
        'surface.overlay': '#1c2030',
        'text.color': '#e6e8ef',
        'text.mutedColor': '#9aa1b1',
        'highlight.background': '#232a45',
        'highlight.color': '#c7ccff',
        'content.borderRadius': '0.5rem',
        'focus.ring': '0 0 0 2px rgb(129 140 248 / 0.45)',
    },
};
