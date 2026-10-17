// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { NavigationMode, navigationModes } from '@cratis/scene.engine';

/** One of the eight menu modes as a designer draws it: its name, one line about it and a small vector schematic. */
export interface MenuModeCard {
    mode: NavigationMode;

    label: string;

    description: string;

    /** An `<svg>` element, 96 by 64, drawn with `currentColor` for the strokes and the theme's accent where the menu sits. */
    schematic: string;
}

const accent = 'var(--scene-primary-color, #4f46e5)';
const stroke = 'currentColor';

const rect = (x: number, y: number, width: number, height: number, fill: string, extra = '') => `<rect x="${x}" y="${y}" width="${width}" height="${height}" rx="1.5" fill="${fill}" ${extra}/>`;
const dots = (x: number, rows: number, labelled: boolean) => Array.from({ length: rows }, (_, row) =>
    rect(x, 20 + row * 9, 5, 5, row === 0 ? accent : stroke, row === 0 ? '' : 'opacity="0.35"') + (labelled ? rect(x - 1, 26 + row * 9 - 1.5, 7, 1.5, stroke, 'opacity="0.35"') : '')).join('');
const rows = (x: number, width: number, count: number, gap: number) => Array.from({ length: count }, (_, row) => rect(x, 19 + row * gap, width, 3, row === 0 ? accent : stroke, row === 0 ? '' : 'opacity="0.35"')).join('');

/** The part of the schematic that is the menu, per mode. The frame, the top bar and the content card are the same in all. */
const menuOf: Record<NavigationMode, string> = {
    [NavigationMode.Static]: rect(0, 12, 24, 52, stroke, 'opacity="0.12"') + rows(4, 16, 5, 8),
    [NavigationMode.Overlay]: rect(0, 12, 26, 52, 'var(--scene-surface-card, #fff)', `stroke="${stroke}" stroke-opacity="0.4"`) + rows(4, 18, 4, 8),
    [NavigationMode.Slim]: rect(0, 12, 10, 52, stroke, 'opacity="0.12"') + dots(2.5, 5, false),
    [NavigationMode.SlimPlus]: rect(0, 12, 14, 52, stroke, 'opacity="0.12"') + dots(4.5, 5, true),
    [NavigationMode.Compact]: rect(0, 12, 19, 52, stroke, 'opacity="0.12"') + rows(3, 13, 6, 6.5),
    [NavigationMode.Horizontal]: [0, 1, 2, 3].map(index => rect(24 + index * 14, 4, 10, 3, index === 0 ? accent : stroke, index === 0 ? '' : 'opacity="0.35"')).join(''),
    [NavigationMode.Reveal]: rect(0, 12, 10, 52, stroke, 'opacity="0.12"') + dots(2.5, 5, false)
        + rect(10, 12, 24, 52, 'none', `stroke="${stroke}" stroke-opacity="0.5" stroke-dasharray="2 2"`) + rows(14, 16, 4, 8),
    [NavigationMode.Drawer]: rect(0, 12, 96, 52, '#000', 'opacity="0.28"') + rect(0, 12, 26, 52, 'var(--scene-surface-card, #fff)', `stroke="${stroke}" stroke-opacity="0.4"`) + rows(4, 18, 4, 8),
};

const contentOf = (mode: NavigationMode): string => {
    const left = { [NavigationMode.Static]: 28, [NavigationMode.Slim]: 14, [NavigationMode.SlimPlus]: 18, [NavigationMode.Compact]: 23, [NavigationMode.Reveal]: 14 }[mode as string] ?? 4;
    return rect(left, 16, 92 - left, 44, 'var(--scene-surface-card, #fff)', `stroke="${stroke}" stroke-opacity="0.25"`);
};

/** The schematic of a menu mode: a framed screen with a top bar, a content card, and the menu where the mode puts it. */
export function menuModeSchematic(mode: NavigationMode): string {
    const hamburger = mode === NavigationMode.Overlay || mode === NavigationMode.Drawer || mode === NavigationMode.Static
        ? [0, 1, 2].map(line => rect(3, 3 + line * 2, 6, 1, stroke, 'opacity="0.55"')).join('') : '';
    return `<svg xmlns="http://www.w3.org/2000/svg" width="96" height="64" viewBox="0 0 96 64" role="img" aria-label="${navigationModes.find(candidate => candidate.id === mode)!.label}">`
        + rect(0.5, 0.5, 95, 63, 'none', `stroke="${stroke}" stroke-opacity="0.5"`).replace('rx="1.5"', 'rx="3"')
        + rect(0, 0, 96, 12, stroke, 'opacity="0.1"') + hamburger
        + contentOf(mode) + menuOf[mode]
        + '</svg>';
}

/** The eight menu modes, in the order a picker lists them, each with its name, description and schematic. */
export const menuModeCards: readonly MenuModeCard[] = navigationModes.map(info => ({
    mode: info.id,
    label: info.label,
    description: info.description,
    schematic: menuModeSchematic(info.id),
}));
