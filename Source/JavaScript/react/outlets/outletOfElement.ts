// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { EffectiveOutlet, effectiveOutlet, OutletDiagnosticCode, OutletLevel, OutletLevelKind } from '@cratis/scene.engine';
import { Outlet, OutletItem, OutletKind, OutletSubject } from '@cratis/scene.model';
import { SceneOutletsContextValue } from './SceneOutletsContext';

const outletKinds = new Set<string>(Object.values(OutletKind));
const subjects = new Set<string>(Object.values(OutletSubject));

function text(properties: Record<string, unknown>, name: string): string | undefined {
    const value = properties[name];
    return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/**
 * The outlet an `outletItems` element declares itself, from its properties: `name`, `kind`, `subject`, `slot` and `items` -
 * the defaults it draws when no page around it declares the outlet.
 * @param properties The element's properties.
 * @returns The outlet, or undefined when it names no outlet or kind.
 */
export function outletDeclaredBy(properties: Record<string, unknown>): Outlet | undefined {
    const name = text(properties, 'name');
    const kind = text(properties, 'kind');
    if (name === undefined || kind === undefined || !outletKinds.has(kind)) return undefined;

    const outlet: Outlet = { name, kind: kind as OutletKind, defaults: Array.isArray(properties.items) ? properties.items as OutletItem[] : [] };
    const subject = text(properties, 'subject');
    if (subject !== undefined && subjects.has(subject)) outlet.subject = subject as OutletSubject;
    const slot = text(properties, 'slot');
    if (slot !== undefined) outlet.slot = slot;
    return outlet;
}

/**
 * Resolves the outlet an `outletItems` element draws. The page's chain wins: when it declares the outlet the element names,
 * the element draws what the chain resolves - defaults, refinements and contributions, with provenance. Otherwise the
 * element draws the outlet it declares itself.
 * @param elementId The element's id, which names the level of an outlet the element declares itself.
 * @param properties The element's properties.
 * @param context The page the outlets resolve against, if any.
 * @returns The resolved outlet, or undefined when the element names none the page or the element declares.
 */
export function outletOfElement(elementId: string, properties: Record<string, unknown>, context: SceneOutletsContextValue | undefined): EffectiveOutlet | undefined {
    const name = text(properties, 'name');
    if (name === undefined) return undefined;

    if (context !== undefined && context.chain.length > 0) {
        const resolved = effectiveOutlet(context.chain, name, context.contributors);
        if (!resolved.diagnostics.some(diagnostic => diagnostic.code === OutletDiagnosticCode.UnknownOutlet)) return resolved;
    }

    const declared = outletDeclaredBy(properties);
    if (declared === undefined) return undefined;
    const level: OutletLevel = { kind: OutletLevelKind.Screen, name: elementId, outlets: [declared] };
    return effectiveOutlet([level], name);
}
