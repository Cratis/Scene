// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ComponentDescriptor, DesignComponent, DesignSystem, UiProfile } from '@cratis/scene.model';
import { PackageCatalog, effectivePackages, resolveComponentName } from '../resolveComponentName';
import { DesignLinkDiagnosticCode } from './DesignLinkDiagnosticCode';

/** The Scene component a design-system component renders, and how a variant reaches it. */
export interface DesignLink {
    /** The design-system component. */
    designComponent: string;

    /** The package that provides the Scene component. */
    package: string;

    /** The bare name of the Scene component within `package`. */
    component: string;

    /** The property a variant is passed in, when the design-system component has variants. */
    variantProperty?: string;

    /** The value each variant takes in that property. */
    variantValues: Record<string, string>;
}

/** One mismatch between a design system and the components that render it. Never silent: a host shows every one. */
export interface DesignLinkDiagnostic {
    code: DesignLinkDiagnosticCode;

    /** The design-system component. */
    designComponent: string;

    /** The part, variant or state at fault. Absent when the whole component is. */
    member?: string;

    message: string;
}

/** The result of linking a design system to the active packages. */
export interface DesignLinking {
    /** One link for each design-system component that found its Scene component. */
    links: DesignLink[];

    /** Every mismatch. */
    diagnostics: DesignLinkDiagnostic[];
}

/** The well-known properties a variant is passed in, in the order they are tried. */
export const wellKnownVariantProperties: readonly string[] = ['variant', 'emphasis'];

const normalize = (name: string) => name.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();

/**
 * Finds the Scene component a design-system component renders: the one its `mapping.mapsTo` names, or else the one that carries its
 * name - compared without regard to case, dashes or dots, so `StatusChip` finds `statusChip` - through the packages the profile lists,
 * the last package winning.
 */
function findComponent(designComponent: DesignComponent, profile: UiProfile, catalog: PackageCatalog): { package: string; name: string } | undefined {
    const mapsTo = designComponent.mapping?.mapsTo;
    if (mapsTo !== undefined) {
        const resolved = resolveComponentName(mapsTo, profile, catalog);
        return resolved === undefined ? undefined : { package: resolved.package, name: resolved.name };
    }

    const wanted = normalize(designComponent.name);
    for (const packageName of [...effectivePackages(profile)].reverse()) {
        const found = catalog[packageName]?.find(name => normalize(name) === wanted);
        if (found !== undefined) return { package: packageName, name: found };
    }

    return undefined;
}

/**
 * Links every component of a design system to the Scene component that renders it, and checks that the component supports what the
 * design system declares (R4). A design-system component finds its Scene component by name through the profile's packages, or by the
 * `maps to` it states; its variant reaches the component through the well-known property (`variant`, else `emphasis`), or the property
 * and per-variant values the design system states.
 *
 * Every part, variant or state the component does not support, every component nobody renders and every component that declares no
 * anatomy is a diagnostic; nothing is dropped silently, so what a package cannot render is always reported (invariant I6).
 *
 * @param designSystem The design system.
 * @param profile The profile whose packages the components are looked up in.
 * @param catalog Every active package's declared component names, keyed by package name.
 * @param descriptors The descriptors of the active packages' components (`<package>:<bare name>`).
 * @returns The links and the diagnostics.
 */
export function linkDesignSystem(
    designSystem: DesignSystem,
    profile: UiProfile,
    catalog: PackageCatalog,
    descriptors: readonly ComponentDescriptor[]
): DesignLinking {
    const links: DesignLink[] = [];
    const diagnostics: DesignLinkDiagnostic[] = [];
    const report = (code: DesignLinkDiagnosticCode, designComponent: string, message: string, member?: string) =>
        diagnostics.push({ code, designComponent, ...(member === undefined ? {} : { member }), message });

    for (const designComponent of designSystem.components) {
        const found = findComponent(designComponent, profile, catalog);
        if (found === undefined) {
            const asked = designComponent.mapping?.mapsTo ?? designComponent.name;
            report(DesignLinkDiagnosticCode.ComponentUnbound, designComponent.name, `The design-system component '${designComponent.name}' finds no component '${asked}' in the packages of profile '${profile.name}', so nothing renders its look.`);
            continue;
        }

        const descriptor = descriptors.find(candidate => candidate.component === `${found.package}:${found.name}`);
        const anatomy = descriptor?.anatomy;
        if (anatomy === undefined) {
            report(
                DesignLinkDiagnosticCode.ComponentWithoutAnatomy,
                designComponent.name,
                `'${found.package}.${found.name}' renders the design-system component '${designComponent.name}' but declares no anatomy, so it cannot take its look from the design system.`
            );
            continue;
        }

        const property = designComponent.mapping?.variantProperty
            ?? anatomy.variantProperty
            ?? wellKnownVariantProperties.find(candidate => descriptor?.properties.some(declared => declared.path === candidate));
        const values = designComponent.mapping?.variantValues ?? {};
        const where = `'${found.package}.${found.name}'`;

        for (const part of designComponent.parts) {
            if (!anatomy.parts.includes(part)) {
                report(DesignLinkDiagnosticCode.PartUnsupported, designComponent.name, `${where} does not draw the part '${part}' of '${designComponent.name}'.`, part);
            }
        }

        const states = new Set(designComponent.variants.flatMap(item => Object.keys(item.states ?? {})));
        for (const state of states) {
            if (!anatomy.states.includes(state)) {
                report(DesignLinkDiagnosticCode.StateUnsupported, designComponent.name, `${where} does not react to the state '${state}' of '${designComponent.name}'.`, state);
            }
        }

        const variantValues: Record<string, string> = {};
        for (const item of designComponent.variants) {
            const value = values[item.name] ?? item.name;
            variantValues[item.name] = value;
            if (!anatomy.variants.includes(value)) {
                report(DesignLinkDiagnosticCode.VariantUnsupported, designComponent.name, `${where} does not render the variant '${item.name}' of '${designComponent.name}'${value === item.name ? '' : ` (as '${value}')`}.`, item.name);
            }
        }

        if (property === undefined && designComponent.variants.length > 1) {
            report(
                DesignLinkDiagnosticCode.VariantPropertyMissing,
                designComponent.name,
                `${where} has no property (${wellKnownVariantProperties.join(' or ')}) to choose a variant of '${designComponent.name}' by.`
            );
        }

        links.push({ designComponent: designComponent.name, package: found.package, component: found.name, ...(property === undefined ? {} : { variantProperty: property }), variantValues });
    }

    return { links, diagnostics };
}
