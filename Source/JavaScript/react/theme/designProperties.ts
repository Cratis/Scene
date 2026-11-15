// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme } from '@cratis/scene.model';
import { ResolvedDesign } from '@cratis/scene.engine';

/**
 * The prefix every design-system custom property gets. A package adapts these to whatever its own component library expects - the
 * PrimeReact package maps them onto PrimeReact's variables, `@cratis/components` onto its `--cratis-*` layer - so layout and component CSS
 * never hardcodes one library's variable names, and a package never reads a token name: it reads anatomy.
 */
export const designPropertyPrefix = '--ds';

const kebab = (text: string) => text.replace(/([a-z0-9])([A-Z])/g, '$1-$2').replace(/[^a-zA-Z0-9]+/g, '-').toLowerCase();

/**
 * The custom property that holds one part of a component's anatomy: `--ds-<component>-<variant>-<part>`, with `-<state>` appended for a
 * state's value. Each segment is kebab-cased, so `StatusChip`, `success` and `background` become `--ds-status-chip-success-background`.
 *
 * Name-to-property is decided here and nowhere else, so a non-DOM renderer can make an entirely different choice.
 *
 * @param component The design-system component.
 * @param variant The variant.
 * @param part The part.
 * @param state The state, or absent for the variant's own value.
 * @returns The custom property name.
 */
export function designAnatomyProperty(component: string, variant: string, part: string, state?: string): string {
    const name = `${designPropertyPrefix}-${kebab(component)}-${kebab(variant)}-${kebab(part)}`;
    return state === undefined ? name : `${name}-${kebab(state)}`;
}

/**
 * The custom property that holds a raw token role: `--ds-token-<category>-<name>`, so `color.text-muted` becomes `--ds-token-color-text-muted`.
 * Raw roles are for blueprints, which are authored against a design system's vocabulary; a package component reads anatomy instead.
 *
 * @param role The role as `<category>.<name>`.
 * @returns The custom property name.
 */
export function designTokenProperty(role: string): string {
    return `${designPropertyPrefix}-token-${role.split('.').map(kebab).join('-')}`;
}

/**
 * Turns a resolved design into the custom properties a renderer sets: every token role, and every part of every component's variant and state.
 *
 * @param design The design for one theme and mode.
 * @returns Custom property names mapped to their values.
 */
export function designCustomProperties(design: ResolvedDesign): Record<string, string> {
    const properties: Record<string, string> = {};
    for (const [role, value] of Object.entries(design.tokens)) properties[designTokenProperty(role)] = value;

    for (const component of design.components) {
        for (const variant of component.variants) {
            for (const [part, value] of Object.entries(variant.parts)) properties[designAnatomyProperty(component.name, variant.name, part)] = value;
            for (const [state, parts] of Object.entries(variant.states ?? {})) {
                for (const [part, value] of Object.entries(parts)) properties[designAnatomyProperty(component.name, variant.name, part, state)] = value;
            }
        }
    }

    return properties;
}

/**
 * Writes a design's custom properties onto an element, in place, and marks the element with the theme's name, the mode and the colour scheme so
 * CSS can key off any of them. Properties the previous design set and this one does not are removed, so switching theme or mode cannot leave a
 * stale value behind.
 *
 * This is deliberately a mutation of an existing element rather than a re-render: switching theme or mode has to be live re-resolution against the
 * running profile, with no reload and no remount, or a gallery preview flickers every time someone tries a different theme.
 *
 * @param element The element the design applies to.
 * @param design The design to apply, or absent to remove the previous one.
 * @param previous The design applied before, whose properties are cleaned up.
 */
export function applyDesign(element: HTMLElement, design: ResolvedDesign | undefined, previous?: ResolvedDesign): void {
    const next = design === undefined ? {} : designCustomProperties(design);
    if (previous !== undefined) {
        for (const property of Object.keys(designCustomProperties(previous))) {
            if (!(property in next)) element.style.removeProperty(property);
        }
    }

    if (design === undefined) {
        element.removeAttribute('data-scene-theme');
        element.removeAttribute('data-scene-mode');
        element.removeAttribute('data-scene-color-scheme');
        return;
    }

    for (const [property, value] of Object.entries(next)) element.style.setProperty(property, value);

    element.setAttribute('data-scene-theme', design.theme);
    if (design.mode === undefined) element.removeAttribute('data-scene-mode');
    else element.setAttribute('data-scene-mode', design.mode);
    element.setAttribute('data-scene-color-scheme', design.colorScheme === ColorScheme.Dark ? 'dark' : 'light');
}

/**
 * Writes a style sheet that carries a design in every mode: one block per design, selected by the `data-scene-mode` attribute, so a page can
 * switch mode by changing an attribute without resolving anything again. A design without a mode is written for the bare selector.
 *
 * @param designs The design of each mode of one theme.
 * @param selector The selector of the element the designs apply to; `:root` when absent.
 * @returns The CSS text.
 */
export function designStyleSheet(designs: readonly ResolvedDesign[], selector = ':root'): string {
    return designs.map(design => {
        const scope = design.mode === undefined ? selector : `${selector}[data-scene-mode='${design.mode}']`;
        const body = Object.entries(designCustomProperties(design)).map(([property, value]) => `    ${property}: ${value};`).join('\n');
        return `${scope} {\n${body}\n}`;
    }).join('\n\n');
}
