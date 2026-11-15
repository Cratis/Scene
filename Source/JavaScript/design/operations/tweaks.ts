// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findComponent } from '../catalogue/outlets';
import { DesignOperation, DesignSystemProposal, TweakControl, designProfileKeys } from './DesignOperation';
import { DesignContext, DesignWorkspace } from './DesignWorkspace';
import { componentNameOf, findElement, resolveTarget } from './documentLookup';
import { profileKeyValues, profileValue, tokenProposal } from './profileOperations';

/** A tweak control resolved against the design: the choices it offers and the value it has now. */
export interface ResolvedTweak {
    control: TweakControl;
    options: string[];
    value: string;
}

const subset = (wanted: string[] | undefined, allowed: string[]): string[] => {
    const kept = wanted?.filter(option => allowed.includes(option)) ?? allowed;
    return kept.length > 0 ? kept : allowed;
};

/** Resolves a control; a control bound to nothing the design has, or to something that is not a choice, resolves to undefined. */
export function resolveTweak(control: TweakControl, workspace: DesignWorkspace, context: DesignContext): ResolvedTweak | undefined {
    const { address } = control;
    if (address.kind === 'profile') {
        if (address.key === undefined || workspace.profile === undefined || !(designProfileKeys as readonly string[]).includes(address.key)) return undefined;
        if (control.kind === 'hue') return address.key === 'accent' ? { control, options: [], value: workspace.profile.appearance?.accent ?? '' } : undefined;
        const allowed = profileKeyValues(context.catalogue, address.key);
        if (allowed === undefined || allowed.length === 0) return undefined;
        return { control, options: subset(control.options, allowed), value: profileValue(workspace.profile, address.key) };
    }
    if (address.kind === 'token') {
        const token = context.catalogue.tokens.find(candidate => candidate.address === address.token);
        return token === undefined ? undefined : { control, options: [], value: token.values[0]?.value ?? '' };
    }
    const target = resolveTarget(workspace.document, address);
    const place = target === undefined || address.element === undefined ? undefined : findElement(target, address.element);
    if (place === undefined || address.prop === undefined) return undefined;
    const component = findComponent(context.catalogue, componentNameOf(place.element));
    const property = component?.properties.find(candidate => candidate.name === address.prop);
    if (property === undefined || property.kind !== 'choice' || property.choices === undefined) return undefined;
    const current = (place.element.properties as Record<string, unknown>)[address.prop];
    return { control, options: subset(control.options, property.choices.map(String)), value: current === undefined ? '' : String(current) };
}

/** Resolves the controls of a design, dropping those that resolve to nothing. */
export const resolveTweaks = (controls: readonly TweakControl[], workspace: DesignWorkspace, context: DesignContext): ResolvedTweak[] =>
    controls.map(control => resolveTweak(control, workspace, context)).filter((tweak): tweak is ResolvedTweak => tweak !== undefined);

/**
 * What moving a control to a value stands for. A profile key and a property of an element become operations a design applies; a token is
 * the design system's, so it becomes a proposal for the design-system draft - the canvas edits screens only.
 */
export function lowerTweak(control: TweakControl, value: string): { operations: DesignOperation[]; proposals: DesignSystemProposal[] } {
    const { address } = control;
    if (address.kind === 'profile' && address.key !== undefined) return { operations: [{ op: 'profile', key: address.key, value }], proposals: [] };
    if (address.kind === 'token') return { operations: [], proposals: [{ ...tokenProposal(value), address: address.token }] };
    const numeric = Number(value);
    const typed = value !== '' && !Number.isNaN(numeric) && /^-?\d/.test(value) ? numeric : value;
    const target = address.screen === undefined ? { template: address.template } : { screen: address.screen };
    return { operations: [{ op: 'set', ...target, element: address.element ?? '', prop: address.prop ?? '', value: typed }], proposals: [] };
}
