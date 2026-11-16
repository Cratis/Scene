// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ColorScheme, CornerStyle, TemplateReference, TemplateReferenceSource, UiProfile } from '@cratis/scene.model';
import { DesignCatalogue } from '../catalogue/DesignCatalogue';
import { DesignProfileKey, DesignSystemProposal, designProfileKeys } from './DesignOperation';
import { DesignRefusal, DesignRefusalCode } from './DesignOutcome';
import { designMessages } from './designMessages';
import { refuse } from './designValues';

const hexColour = /^#[0-9a-f]{6}$/i;

/** The values a key of the profile takes, as the catalogue lists them. */
export function profileKeyValues(catalogue: DesignCatalogue, key: DesignProfileKey): string[] | undefined {
    const values = catalogue.profile?.values;
    if (values === undefined) return undefined;
    switch (key) {
        case 'theme': return values.themes;
        case 'colorScheme': return values.colorSchemes;
        case 'corners': return values.corners;
        case 'font': return values.fonts;
        case 'rootTemplate': return values.rootTemplates;
        case 'newScreenTemplate': return values.newScreenTemplates;
        default: return undefined;
    }
}

/** The colours the design system's colour tokens take, in any theme and mode. */
export const colourTokenValues = (catalogue: DesignCatalogue): string[] =>
    [...new Set(catalogue.tokens.filter(token => token.category === 'color').flatMap(token => token.values.map(value => value.value)))];

/** The proposal that would let a value through: the design system gains a token for it. */
export const tokenProposal = (value: string): DesignSystemProposal => ({ kind: 'token', summary: `Add a design-system token for ${value}`, value });

/** Checks a value of a profile key against the catalogue; an accent must be a colour the design system declares, when it declares any. */
export function checkProfileValue(catalogue: DesignCatalogue, key: string, value: string): DesignRefusal | undefined {
    if (catalogue.profile === undefined) return refuse(DesignRefusalCode.NoProfile, designMessages.noProfile);
    if (!(designProfileKeys as readonly string[]).includes(key)) return refuse(DesignRefusalCode.ProfileKeyUnknown, designMessages.profileKeyUnknown(key));
    if (key === 'accent') {
        if (!hexColour.test(value)) return refuse(DesignRefusalCode.ProfileValueNotAllowed, designMessages.profileValueNotAllowed(key, value, []));
        const declared = colourTokenValues(catalogue);
        if (declared.length > 0 && !declared.some(colour => colour.toLowerCase() === value.toLowerCase())) {
            return { ...refuse(DesignRefusalCode.OffSystemValue, designMessages.offSystem(value)), alternatives: [{ label: `Propose ${value} to the design system`, proposal: tokenProposal(value) }] };
        }
        return undefined;
    }
    const allowed = profileKeyValues(catalogue, key as DesignProfileKey) ?? [];
    return allowed.includes(value) ? undefined : refuse(DesignRefusalCode.ProfileValueNotAllowed, designMessages.profileValueNotAllowed(key, value, allowed));
}

const reference = (current: TemplateReference | undefined, id: string): TemplateReference =>
    current === undefined ? { source: TemplateReferenceSource.Own, id } : { ...current, id };

/** The profile with one key changed. The value is checked already. */
export function applyProfileValue(profile: UiProfile, key: DesignProfileKey, value: string): UiProfile {
    switch (key) {
        case 'theme': return { ...profile, theme: value };
        case 'colorScheme': return { ...profile, appearance: { ...profile.appearance, colorScheme: value as ColorScheme } };
        case 'accent': return { ...profile, appearance: { ...profile.appearance, accent: value } };
        case 'corners': return { ...profile, appearance: { ...profile.appearance, corners: value as CornerStyle } };
        case 'font': return { ...profile, appearance: { ...profile.appearance, font: value } };
        case 'rootTemplate': return { ...profile, root: { ...profile.root, template: reference(profile.root?.template, value) } };
        case 'newScreenTemplate': return { ...profile, defaults: { ...profile.defaults, newScreenTemplate: reference(profile.defaults?.newScreenTemplate, value) } };
    }
}

/** The current value of a key, as text. */
export function profileValue(profile: UiProfile, key: DesignProfileKey): string {
    switch (key) {
        case 'theme': return profile.theme ?? '';
        case 'colorScheme': return profile.appearance?.colorScheme ?? '';
        case 'accent': return profile.appearance?.accent ?? '';
        case 'corners': return profile.appearance?.corners ?? '';
        case 'font': return profile.appearance?.font ?? '';
        case 'rootTemplate': return profile.root?.template.id ?? '';
        case 'newScreenTemplate': return profile.defaults?.newScreenTemplate?.id ?? '';
    }
}
