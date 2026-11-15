// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    DesignComponent,
    DesignSystem,
    DesignTheme,
    DesignThemeMode,
    DesignVariant,
    ResolvedDesignComponent,
    ResolvedDesignVariant,
    TokenRole,
} from '@cratis/scene.model';
import { evaluateDesignComponents, tokenAddress } from '@cratis/scene.engine';

/** A group of token categories the design system editor shows together. */
export type Foundation = 'color' | 'type' | 'spacing' | 'elevation';

/** The state a variant is in when none is named: the variant's own parts. */
export const defaultState = 'default';

/** The states a component variant can declare, in the order they are shown. */
export const componentStates: readonly string[] = [defaultState, 'hover', 'focus', 'active', 'selected', 'disabled'];

/** The parts a component can be made of, in the order they are shown. */
export const componentParts: readonly string[] = ['text', 'background', 'border', 'radius', 'height', 'padding', 'shadow', 'font'];

/** What one part of a variant is: the token role it takes, and the value that resolves to in the theme and mode shown. */
export interface DesignPart {
    /** The part (`text`, `background`, ...). */
    part: string;

    /** The token role (`<category>.<name>`) the part takes in the state. Empty when the variant gives the part none. */
    token: string;

    /** What the token resolves to in the theme and mode shown. Empty when it has no value there. */
    value: string;
}

/**
 * Which foundation a token category belongs to.
 *
 * @param category The token category, such as `color` or `radius`.
 * @returns The foundation, or undefined for a category the editor does not show as a foundation.
 */
export const foundationOf = (category: string): Foundation | undefined => {
    switch (category) {
        case 'color': return 'color';
        case 'type': case 'font': return 'type';
        case 'space': case 'size': case 'radius': case 'border': return 'spacing';
        case 'shadow': case 'motion': case 'opacity': case 'z': return 'elevation';
        default: return undefined;
    }
};

/**
 * The token categories a foundation holds, the first being the one a new token starts in.
 *
 * @param foundation The foundation.
 * @returns The categories.
 */
export const categoriesOf = (foundation: Foundation): readonly string[] => {
    switch (foundation) {
        case 'color': return ['color'];
        case 'type': return ['type', 'font'];
        case 'spacing': return ['space', 'size', 'radius', 'border'];
        case 'elevation': return ['shadow', 'motion', 'opacity', 'z'];
    }
};

/**
 * The tokens of a foundation, in declaration order.
 *
 * @param design The design system.
 * @param foundation The foundation.
 * @returns The token roles.
 */
export const tokensOf = (design: DesignSystem, foundation: Foundation): TokenRole[] =>
    design.tokens.filter(role => foundationOf(role.category) === foundation);

/**
 * The theme a design system draws when none is asked for: the one flagged as the default, else the first.
 *
 * @param design The design system.
 * @returns The theme's name, or an empty string when the design system has no theme.
 */
export const defaultThemeOf = (design: DesignSystem): string =>
    (design.themes.find(theme => theme.isDefault) ?? design.themes[0])?.name ?? '';

/**
 * The theme the editor shows: the one asked for when the design system has it, else the default theme.
 *
 * @param design The design system.
 * @param wanted The theme asked for.
 * @returns The theme name, or an empty string when the design system has no theme.
 */
export const shownTheme = (design: DesignSystem, wanted?: string): string =>
    design.themes.find(theme => theme.name === wanted)?.name ?? defaultThemeOf(design);

/**
 * The mode the editor shows: the one asked for when the design system has it, else its first mode.
 *
 * @param design The design system.
 * @param wanted The mode asked for.
 * @returns The mode.
 */
export const shownMode = (design: DesignSystem, wanted?: string): string =>
    design.modes.find(mode => mode === wanted) ?? design.modes[0] ?? 'light';

const modeOf = (design: DesignSystem, theme: string, mode: string): DesignThemeMode | undefined =>
    design.themes.find((candidate: DesignTheme) => candidate.name === theme)?.modes.find(candidate => candidate.mode === mode);

/**
 * What a theme makes of a token in a mode.
 *
 * @param design The design system.
 * @param theme The theme.
 * @param mode The mode.
 * @param address The token's address (`color.primary`).
 * @returns The resolved value, or an empty string when the theme gives none.
 */
export const valueIn = (design: DesignSystem, theme: string, mode: string, address: string): string =>
    modeOf(design, theme, mode)?.tokens[address] ?? '';

/**
 * What a token role resolves to in a theme and mode.
 *
 * @param design The design system.
 * @param theme The theme.
 * @param mode The mode.
 * @param role The token role.
 * @returns The resolved value, or an empty string when the theme gives none.
 */
export const roleValueIn = (design: DesignSystem, theme: string, mode: string, role: TokenRole): string =>
    valueIn(design, theme, mode, tokenAddress(role));

/**
 * The components of a design system with every part resolved to a value in a theme and mode: the resolution the theme carries,
 * or - when it carries none - the anatomy evaluated against the theme's token values.
 *
 * @param design The design system.
 * @param theme The theme.
 * @param mode The mode.
 * @returns The resolved components; none for a theme or mode the design system does not have.
 */
export const resolvedComponentsIn = (design: DesignSystem, theme: string, mode: string): ResolvedDesignComponent[] => {
    const values = modeOf(design, theme, mode);
    if (values === undefined) return [];
    return values.components ?? evaluateDesignComponents(design.components, values.tokens, false).components;
};

/**
 * One variant of one component, resolved to values in a theme and mode.
 *
 * @param design The design system.
 * @param theme The theme.
 * @param mode The mode.
 * @param component The component's name.
 * @param variant The variant's name.
 * @returns The resolved variant, or undefined when the theme, mode, component or variant is not there.
 */
export const resolvedVariantIn = (design: DesignSystem, theme: string, mode: string, component: string, variant: string): ResolvedDesignVariant | undefined =>
    resolvedComponentsIn(design, theme, mode).find(candidate => candidate.name === component)?.variants.find(candidate => candidate.name === variant);

/**
 * The states a variant declares, the default state first and the others in their usual order.
 *
 * @param variant The variant.
 * @returns The state names.
 */
export const statesOfVariant = (variant: DesignVariant): string[] => {
    const declared = Object.keys(variant.states ?? {});
    const known = componentStates.filter(state => state === defaultState || declared.includes(state));
    return [...known, ...declared.filter(state => !known.includes(state))];
};

/**
 * The states any variant of a component declares, in the order they are shown.
 *
 * @param component The component.
 * @returns The state names, the default state first.
 */
export const statesOfComponent = (component: DesignComponent): string[] => {
    const all = new Set(component.variants.flatMap(statesOfVariant));
    return [...componentStates.filter(state => all.has(state)), ...[...all].filter(state => !componentStates.includes(state))];
};

/**
 * The parts of a variant in a state, every part as it is in that state: the variant's own, with the state's overrides over them.
 *
 * @param variant The variant, as the design system declares it.
 * @param resolved The variant resolved to values in the theme and mode shown, when there is one.
 * @param state The state; the default state is the variant itself.
 * @returns The parts, each with the token it takes and the value that resolves to.
 */
export const partsInState = (variant: DesignVariant, resolved: ResolvedDesignVariant | undefined, state: string): DesignPart[] => {
    const tokens: Record<string, string> = { ...variant.parts, ...(state === defaultState ? {} : variant.states?.[state] ?? {}) };
    const values = state === defaultState ? resolved?.parts : resolved?.states?.[state] ?? resolved?.parts;
    return Object.entries(tokens).map(([part, token]) => ({ part, token, value: values?.[part] ?? '' }));
};

/**
 * The tokens a person can pick for a component part: those whose category the part takes.
 *
 * @param design The design system.
 * @param part The part.
 * @returns The addresses that fit.
 */
export const tokensForPart = (design: DesignSystem, part: string): string[] => {
    const takes: Record<string, readonly string[]> = {
        text: ['color'],
        background: ['color'],
        border: ['color', 'border'],
        radius: ['radius'],
        height: ['size', 'space'],
        padding: ['space', 'size'],
        shadow: ['shadow'],
        font: ['font', 'type'],
    };
    return design.tokens.filter(role => (takes[part] ?? []).includes(role.category)).map(tokenAddress);
};

/**
 * The variant of a component named, or its first when it has none of that name.
 *
 * @param component The component.
 * @param variant The variant's name.
 * @returns The variant, when the component has one.
 */
export const variantOf = (component: DesignComponent | undefined, variant: string | undefined): DesignVariant | undefined =>
    component?.variants.find(candidate => candidate.name === variant) ?? component?.variants[0];

/**
 * A design system with every list present. A version whose design could not be read - or one still arriving - may carry
 * partial lists, and the editor must show that as an empty design system rather than fail on the first list it walks.
 *
 * @param design The design system, when there is one.
 * @returns The design system with each missing list empty, or undefined when there is none.
 */
export const completeDesignSystem = (design?: Partial<DesignSystem>): DesignSystem | undefined =>
    design === undefined || design.name === undefined
        ? undefined
        : { ...design, name: design.name, modes: design.modes ?? [], tokens: design.tokens ?? [], components: design.components ?? [], themes: design.themes ?? [] };
