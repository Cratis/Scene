// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignComponent, DesignSystem, DesignVariant, TokenRole } from '@cratis/scene.model';
import { defaultAppearanceBindings } from './defaultAppearanceBindings';

/** The name of Scene's default design system. */
export const defaultDesignSystemName = 'Scene Default';

const role = (category: string, name: string, description: string): TokenRole => ({ category, name, description });

/**
 * The token roles of Scene's default design system: the twenty-one semantic tokens every package used to style from, recast as roles of
 * a design system. A role is a name for a value; a component never reads one - it reads the anatomy that refers to it.
 */
export const defaultTokenRoles: readonly TokenRole[] = [
    role('color', 'primary', 'brand accent, active states, primary buttons'),
    role('color', 'on-primary', 'text and icons on the primary color'),
    role('color', 'background', 'the page canvas behind everything'),
    role('color', 'surface', 'topbar, sidebar, cards, panels'),
    role('color', 'border', 'every divider and outline'),
    role('color', 'hover', 'hover states on menu items and buttons'),
    role('color', 'overlay', 'floating submenus and popups'),
    role('color', 'text', 'body text'),
    role('color', 'text-muted', 'secondary text, footer, section titles'),
    role('color', 'highlight', 'the current menu item\'s background'),
    role('color', 'on-highlight', 'the current menu item\'s text'),
    role('color', 'success', 'text of a good outcome: a positive trend, an approved step'),
    role('color', 'success-surface', 'the tinted background behind success'),
    role('color', 'warning', 'text of something needing attention: a partial load, a pending approval'),
    role('color', 'warning-surface', 'the tinted background behind a warning'),
    role('color', 'danger', 'text of a problem: an error, a negative trend, a rejection'),
    role('color', 'danger-surface', 'the tinted background behind a problem'),
    role('color', 'info', 'text of neutral information'),
    role('color', 'info-surface', 'the tinted background behind information'),
    role('radius', 'content', 'every rounded corner'),
    role('shadow', 'focus-ring', 'the keyboard focus indicator'),
    role('font', 'sans', 'the font of the whole application'),
];

const parts = (assignments: Record<string, string>): Record<string, string> => assignments;
const variant = (name: string, assigned: Record<string, string>, states?: Record<string, Record<string, string>>): DesignVariant =>
    states === undefined ? { name, parts: assigned } : { name, parts: assigned, states };
const component = (name: string, partNames: string[], variants: DesignVariant[], mapsTo?: string): DesignComponent =>
    mapsTo === undefined ? { name, parts: partNames, variants } : { name, parts: partNames, variants, mapping: { mapsTo } };

const surface = (background: string) => parts({ background, text: 'color.text', border: 'color.border' });
const tone = (name: string) => variant(name, { text: `color.${name}`, background: `color.${name}-surface` });

/**
 * The components of Scene's default design system: the shell and the foundation components, so surfaces, text and the status colors
 * come from anatomy too. Every package that draws one of them declares the same parts, variants and states in its descriptor.
 */
export const defaultDesignComponents: readonly DesignComponent[] = [
    component('Shell', ['background', 'text', 'font'], [
        variant('default', parts({ background: 'color.background', text: 'color.text', font: 'font.sans' })),
    ], 'Cratis.Blueprint.Default.appShell'),
    component('Page', ['background', 'text', 'font'], [
        variant('default', parts({ background: 'color.background', text: 'color.text', font: 'font.sans' })),
    ]),
    component('Topbar', ['background', 'text', 'border'], [variant('default', surface('color.surface'))]),
    component('Sidebar', ['background', 'text', 'border'], [
        variant('default', surface('color.surface')),
        variant('primary', parts({ background: 'color.primary', text: 'color.on-primary', border: 'color.primary' })),
    ]),
    component('Menu', ['background', 'text', 'border', 'radius'], [
        variant('default', parts({ background: 'color.surface', text: 'color.text', border: 'color.border', radius: 'radius.content' }), {
            hover: { background: 'color.hover' },
            selected: { background: 'color.highlight', text: 'color.on-highlight' },
        }),
    ]),
    component('Popover', ['background', 'text', 'border', 'radius'], [
        variant('default', parts({ background: 'color.overlay', text: 'color.text', border: 'color.border', radius: 'radius.content' }), {
            hover: { background: 'color.hover' },
            selected: { background: 'color.highlight', text: 'color.on-highlight' },
        }),
    ], 'Cratis.Blueprint.Default.userMenu'),
    component('Footer', ['background', 'text'], [variant('default', parts({ background: 'color.background', text: 'color.text-muted' }))]),
    component('Text', ['text', 'font'], [
        variant('default', parts({ text: 'color.text', font: 'font.sans' })),
        variant('muted', parts({ text: 'color.text-muted', font: 'font.sans' })),
    ]),
    component('Card', ['background', 'text', 'border', 'radius'], [
        variant('default', parts({ background: 'color.surface', text: 'color.text', border: 'color.border', radius: 'radius.content' })),
    ]),
    component('Button', ['background', 'text', 'border', 'radius', 'shadow'], [
        variant('primary', parts({ background: 'color.primary', text: 'color.on-primary', border: 'color.primary', radius: 'radius.content' }), {
            focus: { shadow: 'shadow.focus-ring' },
        }),
    ]),
    component('Input', ['background', 'text', 'border', 'radius', 'shadow'], [
        variant('default', parts({ background: 'color.surface', text: 'color.text', border: 'color.border', radius: 'radius.content' }), {
            focus: { border: 'color.primary', shadow: 'shadow.focus-ring' },
        }),
    ], 'PrimeReact.inputText'),
    component('StatusChip', ['text', 'background'], [tone('success'), tone('warning'), tone('danger'), tone('info')]),
];

/**
 * Scene's default design system, without any theme: the roles and the shell and foundation anatomy every Scene package renders from,
 * and the contrast every theme must keep. It carries no values - a theme brings them, either as one of its own `themes` (the default
 * blueprint ships "Scene Default" with a light and a dark mode) or as a flat theme a package ships, whose tokens are the values of these roles.
 *
 * An application that names no design system is drawn from this one, which is why it looks as it always did.
 */
export const defaultDesignSystem: DesignSystem = {
    name: defaultDesignSystemName,
    modes: ['light', 'dark'],
    tokens: [...defaultTokenRoles],
    components: [...defaultDesignComponents],
    themes: [],
    contrastRules: [{ foreground: 'text', background: 'background', minimumRatio: 4.5 }],
    appearance: { ...defaultAppearanceBindings },
};
