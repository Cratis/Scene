// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { Theme } from '@cratis/scene.model';
import { blueprintThemeCompatibility } from './blueprintThemeCompatibility';
import { defaultFontStack } from './defaultFontStack';

/**
 * The light theme the shell ships with.
 *
 * The palette is original to Cratis - a neutral grey ramp with an indigo accent - rather than adopted from
 * any existing preset, which is why `author` says so rather than being left blank. A theme with empty
 * attribution reads as "nobody has checked", and once a palette is lifted from somewhere else without its
 * credit, nobody can tell afterwards which of the two it was.
 *
 * These are the values of the roles of Scene's default design system - the shell's whole styling contract: every
 * rule in `layout.css` resolves, through the anatomy of a component, back to one of these roles. A theme that
 * gives them values defines the entire shell.
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
        'color.primary': '#4f46e5',
        'color.on-primary': '#ffffff',
        'color.background': '#f4f5f7',
        'color.surface': '#ffffff',
        'color.border': '#e2e5e9',
        'color.hover': '#eceef1',
        'color.overlay': '#ffffff',
        'color.text': '#1f2430',
        'color.text-muted': '#5b6472',
        'color.highlight': '#eef2ff',
        'color.on-highlight': '#3730a3',
        'radius.content': '0.5rem',
        'font.sans': defaultFontStack,
        'shadow.focus-ring': '0 0 0 2px rgb(79 70 229 / 0.4)',
        'color.success': '#166534',
        'color.success-surface': '#dcfce7',
        'color.warning': '#854d0e',
        'color.warning-surface': '#fef3c7',
        'color.danger': '#991b1b',
        'color.danger-surface': '#fee2e2',
        'color.info': '#1e40af',
        'color.info-surface': '#dbeafe',
    },
};
