// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';
import { blueprintThemeCompatibility } from './blueprintThemeCompatibility';
import { defaultFontStack } from './defaultFontStack';

/**
 * The dark theme the shell ships with.
 *
 * Deliberately the same roles as the light theme and nothing more. A dark theme that introduced
 * extra roles would work only for the parts of the shell written after it existed - the roles are the
 * contract, and both themes filling them identically is what makes switching between them a swap rather than
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
        'color.primary': '#818cf8',
        'color.on-primary': '#10131f',
        'color.background': '#0f1117',
        'color.surface': '#171a23',
        'color.border': '#262a36',
        'color.hover': '#1f2431',
        'color.overlay': '#1c2030',
        'color.text': '#e6e8ef',
        'color.text-muted': '#9aa1b1',
        'color.highlight': '#232a45',
        'color.on-highlight': '#c7ccff',
        'radius.content': '0.5rem',
        'font.sans': defaultFontStack,
        'shadow.focus-ring': '0 0 0 2px rgb(129 140 248 / 0.45)',
        'color.success': '#86efac',
        'color.success-surface': '#14301f',
        'color.warning': '#fcd34d',
        'color.warning-surface': '#33290f',
        'color.danger': '#fca5a5',
        'color.danger-surface': '#3a1616',
        'color.info': '#93c5fd',
        'color.info-surface': '#162a4a',
    },
};
