// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';
import { blueprintThemeCompatibility } from './blueprintThemeCompatibility';

/**
 * The light theme the shell ships with.
 *
 * The palette is original to Cratis - a neutral grey ramp with an indigo accent - rather than adopted from
 * any existing preset, which is why `author` says so rather than being left blank. A theme with empty
 * attribution reads as "nobody has checked", and once a palette is lifted from somewhere else without its
 * credit, nobody can tell afterwards which of the two it was.
 *
 * The token set is the shell's whole styling contract: every rule in `layout.css` resolves back to one of
 * these ten names. A theme that defines them defines the entire shell.
 */
export const lightTheme: Theme = {
    name: 'Scene Default Light',
    compatibleWith: blueprintThemeCompatibility,
    isDark: false,
    author: 'Cratis',
    authorUrl: 'https://cratis.io',
    license: 'MIT',
    description: 'The default light palette: a neutral grey ramp with an indigo accent.',
    tokens: {
        'primary.color': '#4f46e5',
        'primary.contrastColor': '#ffffff',
        'surface.background': '#f4f5f7',
        'surface.card': '#ffffff',
        'surface.border': '#e2e5e9',
        'surface.hover': '#eceef1',
        'surface.overlay': '#ffffff',
        'text.color': '#1f2430',
        'text.mutedColor': '#6b7280',
        'highlight.background': '#eef2ff',
        'highlight.color': '#3730a3',
        'content.borderRadius': '0.5rem',
        'focus.ring': '0 0 0 2px rgb(79 70 229 / 0.4)',
    },
};
