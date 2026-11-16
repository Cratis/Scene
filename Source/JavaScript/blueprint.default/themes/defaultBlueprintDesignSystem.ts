// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignSystem, DesignTheme } from '@cratis/scene.model';
import { defaultDesignSystem, measureDesignContrast } from '@cratis/scene.engine';
import { darkTheme } from './dark';
import { lightTheme } from './light';

/**
 * The theme of the default design system this blueprint ships: "Scene Default", with a light and a dark mode.
 *
 * Its values are the ones of the two flat themes {@link lightTheme} and {@link darkTheme} - one definition, so the palette a profile gets
 * by naming "Scene Default Light" and the one the design system draws in its light mode cannot drift apart.
 */
export const defaultBlueprintDesignTheme: DesignTheme = {
    name: 'Scene Default',
    isDefault: true,
    description: 'The default palette in a light and a dark mode: a neutral grey ramp with an indigo accent.',
    modes: [
        { mode: 'light', tokens: { ...lightTheme.tokens } },
        { mode: 'dark', tokens: { ...darkTheme.tokens } },
    ],
};

const unmeasured: DesignSystem = { ...defaultDesignSystem, themes: [defaultBlueprintDesignTheme] };

/**
 * The default design system (R6): what an application that names no design system is drawn from, reproducing the look every Scene
 * application had before design systems existed.
 *
 * The twenty-one tokens the shell and every package used to style from are recast as the roles of a design system, and the shell and
 * foundation components - Shell, Page, Topbar, Sidebar, Menu, Popover, Footer, Text, Card, Button, Input and StatusChip - read them through anatomy:
 * the Menu's `selected` background, the primary Button's `focus` shadow. The themes are the light and dark palettes the blueprint
 * has always shipped, and the contrast findings are measured from them so a host shows the evidence rather than a claim.
 */
export const defaultBlueprintDesignSystem: DesignSystem = { ...unmeasured, contrastFindings: measureDesignContrast(unmeasured) };
