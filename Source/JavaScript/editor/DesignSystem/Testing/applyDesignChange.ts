// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import type { DesignComponent, DesignSystem, DesignTheme, DesignVariant } from '@cratis/scene.model';
import type { DesignChange } from '../Resolving/designEdits';

const clone = <T>(value: T): T => structuredClone(value);

const withoutEmpty = <T extends Record<string, unknown>>(record: T): T | undefined => Object.keys(record).length === 0 ? undefined : record;

const setIn = (record: Record<string, string>, key: string, value: string) => {
    if (value === '') delete record[key];
    else record[key] = value;
};

const addressOf = (segments: readonly string[]): string | undefined =>
    segments.length >= 2 ? `${segments[0]}.${segments.slice(1).join('.')}` : undefined;

const setThemeValue = (theme: DesignTheme | undefined, modeOrValues: string, address: string, value: string) => {
    if (theme === undefined) return;
    for (const values of theme.modes) {
        if (modeOrValues === 'values' || modeOrValues === values.mode) setIn(values.tokens, address, value);
    }
};

const setVariantPart = (component: DesignComponent, variantName: string, state: string | undefined, part: string, token: string) => {
    const variant: DesignVariant | undefined = component.variants.find(candidate => candidate.name === variantName);
    if (variant === undefined) return;
    if (state === undefined) {
        setIn(variant.parts, part, token);
        return;
    }
    const states = variant.states ?? {};
    const own = states[state] ?? {};
    setIn(own, part, token);
    const kept = withoutEmpty(own);
    if (kept === undefined) delete states[state];
    else states[state] = kept;
    if (Object.keys(states).length === 0) delete variant.states;
    else variant.states = states;
};

/**
 * Makes one change to a design system, as a host's draft command makes it to the draft's Screenplay: the vocabulary is the
 * one {@link DesignChange}'s helpers build. A change to something that is not there does nothing.
 *
 * This is what the fake host of the editor's stories and specifications uses, so that editing by hand does something visible. A
 * real host edits the Screenplay text and resolves it again.
 *
 * @param design The design system.
 * @param change The change.
 * @returns A new design system with the change made; the one given is not touched.
 */
export const applyDesignChange = (design: DesignSystem, change: DesignChange): DesignSystem => {
    const next = clone(design);
    const segments = change.path.split('.');
    const defaultTheme = next.themes.find(theme => theme.isDefault) ?? next.themes[0];

    if (change.path === 'default-theme') {
        for (const theme of next.themes) theme.isDefault = theme.name === change.value;
        return next;
    }

    switch (segments[0]) {
        case 'tokens': {
            const [, category, ...name] = segments;
            if (category === undefined || name.length === 0) return next;
            const key = name.join('.');
            const existing = next.tokens.findIndex(role => role.category === category && role.name === key);
            if (change.value === '') {
                if (existing >= 0) next.tokens.splice(existing, 1);
                for (const theme of next.themes) for (const values of theme.modes) delete values.tokens[`${category}.${key}`];
            } else if (existing >= 0) next.tokens[existing] = { ...next.tokens[existing], description: change.value };
            else next.tokens.push({ category, name: key, description: change.value });
            return next;
        }
        case 'themes': {
            const name = segments.slice(1).join('.');
            if (change.value === '') {
                next.themes = next.themes.filter(theme => theme.name !== name || theme.isDefault === true);
                return next;
            }
            const source = next.themes.find(theme => theme.name === change.value);
            if (source === undefined || next.themes.some(theme => theme.name === name)) return next;
            next.themes.push({ ...clone(source), name, isDefault: false, description: undefined });
            return next;
        }
        case 'words': {
            const [, kind, ...key] = segments;
            if (kind !== 'voice' && kind !== 'naming') return next;
            const words = next.words ?? {};
            const group = words[kind] ?? {};
            setIn(group, key.join('.'), change.value);
            words[kind] = group;
            next.words = words;
            return next;
        }
        case 'components': {
            const [, componentName, , variantName, ...rest] = segments;
            const component = next.components.find(candidate => candidate.name === componentName);
            if (component === undefined || variantName === undefined) return next;
            if (rest[0] === 'states') setVariantPart(component, variantName, rest[1], rest.slice(2).join('.'), change.value);
            else setVariantPart(component, variantName, undefined, rest.join('.'), change.value);
            return next;
        }
        case 'theme': {
            const [, themeName, modeOrValues, ...role] = segments;
            const address = addressOf(role);
            if (address !== undefined) setThemeValue(next.themes.find(theme => theme.name === themeName), modeOrValues, address, change.value);
            return next;
        }
        default: {
            const [modeOrValues, ...role] = segments;
            const address = addressOf(role);
            if (address !== undefined) setThemeValue(defaultTheme, modeOrValues, address, change.value);
            return next;
        }
    }
};

/**
 * Makes changes to a design system one after the other.
 *
 * @param design The design system.
 * @param changes The changes.
 * @returns A new design system with the changes made.
 */
export const applyDesignChanges = (design: DesignSystem, changes: readonly DesignChange[]): DesignSystem =>
    changes.reduce(applyDesignChange, design);
