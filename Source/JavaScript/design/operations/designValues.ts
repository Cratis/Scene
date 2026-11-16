// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { DesignCatalogue, DesignComponentEntry, DesignPropertyEntry } from '../catalogue/DesignCatalogue';
import { DesignRefusal, DesignRefusalCode } from './DesignOutcome';
import { designMessages } from './designMessages';

/** Property names that are free styling rather than a setting of a component. */
export const freeStylingProperty = /^(background|backgroundColor|foreground|color|colour|border|borderColor|borderThickness|borderRadius|padding|margin|fontSize|fontFamily|fontWeight|shadow|boxShadow|gradient|opacity|style|className|css|html|width|height|zIndex)$/i;

/** Free styling names that stand for a colour: a design system answers these with a token. */
export const colourProperty = /^(background|backgroundColor|foreground|color|colour|border|borderColor|gradient|shadow|boxShadow)$/i;

/** A value that is a style of its own - a hex colour, a CSS function, markup - rather than something the design system offers. */
export function isOffSystemLiteral(value: unknown): boolean {
    if (typeof value !== 'string') return false;
    return /^\s*#[0-9a-f]{3,8}\s*$/i.test(value) || /\b(rgb|rgba|hsl|hsla|linear-gradient|radial-gradient|url)\(/i.test(value) || /<\/?[a-z][^>]*>/i.test(value);
}

export const refuse = (code: string, reason: string, extra: Partial<DesignRefusal> = {}): DesignRefusal => ({ code, reason, alternatives: [], ...extra });

const isPlainNumber = (value: unknown): value is number => typeof value === 'number' && Number.isFinite(value);

function checkValue(component: DesignComponentEntry, property: DesignPropertyEntry, value: unknown, catalogue: DesignCatalogue): DesignRefusal | undefined {
    if (value === null || value === undefined) return undefined;
    if (isOffSystemLiteral(value)) return refuse(DesignRefusalCode.OffSystemValue, designMessages.offSystem(String(value)));
    switch (property.kind) {
        case 'text':
        case 'icon':
            return typeof value === 'string' ? undefined : refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, 'takes text'));
        case 'number': {
            if (!isPlainNumber(value)) return refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, 'takes a number'));
            if (property.minimum !== undefined && value < property.minimum) return refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, `is at least ${property.minimum}`));
            if (property.maximum !== undefined && value > property.maximum) return refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, `is at most ${property.maximum}`));
            return undefined;
        }
        case 'boolean':
            return typeof value === 'boolean' ? undefined : refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, 'takes true or false'));
        case 'choice': {
            const choices = property.choices;
            if (choices === undefined) return typeof value === 'string' || isPlainNumber(value) ? undefined : refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, 'takes one of its choices'));
            if (typeof value !== 'string' && !isPlainNumber(value)) return refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, `takes one of: ${choices.join(', ')}`));
            if (choices.some(choice => String(choice) === String(value))) return undefined;
            const governed = component.anatomy?.designSystemComponent !== undefined && component.anatomy.variantProperty === property.name;
            return governed
                ? refuse(DesignRefusalCode.VariantNotInDesignSystem, designMessages.variantNotInDesignSystem(component.label, String(value), choices.map(String)))
                : refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, `takes one of: ${choices.join(', ')}`));
        }
        case 'query': {
            if (typeof value !== 'string' || value === '') return refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, 'takes the name of a query'));
            if (catalogue.queries.length > 0 && !catalogue.queries.some(query => query.name === value || query.id === value)) {
                return refuse(DesignRefusalCode.QueryUnknown, designMessages.queryUnknown(value, catalogue.queries.map(query => query.name)));
            }
            return undefined;
        }
        case 'destination': {
            const named = typeof value === 'string' ? value : (value as { screen?: unknown }).screen;
            return typeof named === 'string' && named !== '' ? undefined : refuse(DesignRefusalCode.ValueNotAllowed, designMessages.valueNotAllowed(property.name, 'takes a screen to navigate to'));
        }
        default:
            return undefined;
    }
}

/** Checks a property of a component and the value it is given: it must exist, take the value, and not be free styling or a value of its own. */
export function checkProperty(component: DesignComponentEntry, name: string, value: unknown, catalogue: DesignCatalogue): DesignRefusal | undefined {
    const property = component.properties.find(candidate => candidate.name === name);
    if (property === undefined) {
        if (freeStylingProperty.test(name)) return refuse(DesignRefusalCode.FreeStylingNotAllowed, designMessages.freeStyling(name));
        return refuse(DesignRefusalCode.PropertyUnknown, designMessages.propertyUnknown(component.label, name, component.properties.map(candidate => candidate.name)));
    }
    return checkValue(component, property, value, catalogue);
}

/** What a property takes in a Scene document: a destination named by a bare screen name becomes a destination reference. */
export function toSceneValue(component: DesignComponentEntry, name: string, value: unknown): unknown {
    const property = component.properties.find(candidate => candidate.name === name);
    return property?.kind === 'destination' && typeof value === 'string' ? { screen: value } : value;
}
