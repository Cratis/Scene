// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignSystem } from '@cratis/scene.model';
import { tokenAddress } from '@cratis/scene.engine';
import { defaultState } from './designResolution';

/** One difference between two versions of a design system. */
export interface DesignDifference {
    /** What differs - a token role, a theme value, a component part, a word or a theme. */
    path: string;

    /** Whether it was added, removed or changed. */
    kind: 'added' | 'removed' | 'changed';

    /** What it was - empty when it was added. */
    before: string;

    /** What it is - empty when it was removed. */
    after: string;
}

const entries = (design: DesignSystem | undefined): Map<string, string> => {
    const map = new Map<string, string>();
    if (design === undefined) return map;
    for (const role of design.tokens) map.set(`${tokenAddress(role)} (role)`, role.description ?? '');
    for (const theme of design.themes) {
        map.set(`theme ${theme.name}`, theme.isDefault ? 'default' : 'theme');
        for (const values of theme.modes) {
            for (const [address, value] of Object.entries(values.tokens)) {
                if (value !== '') map.set(`${address} in ${theme.name} ${values.mode}`, value);
            }
        }
    }
    for (const component of design.components) {
        for (const variant of component.variants) {
            for (const [part, token] of Object.entries(variant.parts)) map.set(`${component.name} ${variant.name} ${defaultState} ${part}`, token);
            for (const [state, parts] of Object.entries(variant.states ?? {})) {
                for (const [part, token] of Object.entries(parts)) map.set(`${component.name} ${variant.name} ${state} ${part}`, token);
            }
        }
    }
    for (const [key, text] of Object.entries(design.words?.voice ?? {})) map.set(`voice ${key}`, text);
    for (const [key, text] of Object.entries(design.words?.naming ?? {})) map.set(`naming ${key}`, text);
    return map;
};

/**
 * What differs between two versions of a design system: token roles, theme values, component parts (as the variants declare
 * them, so changing a part a state inherits is one change), words and themes.
 *
 * @param before The earlier version - undefined when there is none.
 * @param after The later version.
 * @returns The differences, in the order they appear.
 */
export const designChanges = (before: DesignSystem | undefined, after: DesignSystem): DesignDifference[] => {
    const was = entries(before);
    const is = entries(after);
    const differences: DesignDifference[] = [];
    for (const [path, value] of is) {
        const earlier = was.get(path);
        if (earlier === undefined) differences.push({ path, kind: 'added', before: '', after: value });
        else if (earlier !== value) differences.push({ path, kind: 'changed', before: earlier, after: value });
    }
    for (const [path, value] of was) if (!is.has(path)) differences.push({ path, kind: 'removed', before: value, after: '' });
    return differences;
};

/**
 * Which names appeared and which disappeared between two lists.
 *
 * @param before The earlier names.
 * @param after The later names.
 * @returns What was added and what was removed.
 */
export const nameChanges = (before: readonly string[], after: readonly string[]): { added: string[]; removed: string[] } => ({
    added: after.filter(name => !before.includes(name)),
    removed: before.filter(name => !after.includes(name)),
});
