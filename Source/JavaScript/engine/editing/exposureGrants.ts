// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    CollectionOperation, DiagnosticCode, ExposedProperty, PropertyDescriptor, PropertyValueType, SceneDiagnostic,
} from '@cratis/scene.model';
import { DescriptorCatalog, findComponentDescriptor } from './DescriptorCatalog';
import { errorDiagnostic } from './diagnostics';
import { TemplateChain } from './TemplateChain';

/**
 * What one instance may configure on one property: the owner's exposure, narrowed by every re-exposure between the
 * owner and that instance.
 */
export interface ExposureGrant {
    /** The id of the element that owns the property. */
    component: string;

    path: string;
    descriptor: PropertyDescriptor;

    /** The name of the layout or template that owns the element. */
    owner: string;

    /** The index of the owner in the chain. */
    ownerLevel: number;

    /** For a collection: what may be done to it. Empty for any other property. */
    operations: CollectionOperation[];

    /** For a collection: the item fields that may be changed; absent means all of them. */
    editableFields?: string[];

    label?: string;
}

/**
 * The outcome of working out who may configure what.
 */
export interface ExposureGrants {
    /** Every valid exposure, one per owner-declared property, at the level of its owner. */
    exposed: ExposureGrant[];

    /** For each contributing instance id, what it may configure, keyed by {@link grantKey}. */
    byInstance: Map<string, Map<string, ExposureGrant>>;

    diagnostics: SceneDiagnostic[];
}

/**
 * The key a grant is stored under.
 */
export function grantKey(component: string, path: string): string {
    return `${component}\u0000${path}`;
}

function narrow(grant: ExposureGrant, reExposure: ExposedProperty): { grant: ExposureGrant; widened: boolean } {
    const requested = reExposure.operations ?? [];
    const operations = requested.filter(operation => grant.operations.includes(operation));
    const fields = grant.editableFields === undefined
        ? reExposure.editableFields
        : (reExposure.editableFields === undefined ? grant.editableFields : reExposure.editableFields.filter(field => grant.editableFields!.includes(field)));

    const widened = operations.length < requested.length
        || (grant.editableFields !== undefined && reExposure.editableFields !== undefined && reExposure.editableFields.some(field => !grant.editableFields!.includes(field)));

    return { grant: { ...grant, operations, editableFields: fields, label: reExposure.label ?? grant.label }, widened };
}

/**
 * Works out, for every instance in a chain, which properties it may configure.
 *
 * An owner's exposure reaches the instance directly inside it. It reaches further only through explicit
 * re-exposure by every level in between, and each re-exposure can only narrow what it passes on - a nested
 * template that lists more operations or fields than its owner granted gets the owner's, not its own.
 *
 * @param chain The chain to analyze.
 * @param catalog The descriptors that say what each component supports.
 */
export function computeExposureGrants(chain: TemplateChain, catalog: DescriptorCatalog): ExposureGrants {
    const result: ExposureGrants = { exposed: [], byInstance: new Map(), diagnostics: [] };
    for (const chainLevel of chain.levels) result.byInstance.set(chainLevel.instance, new Map());

    const consumed = new Set<ExposedProperty>();

    chain.levels.forEach((owner, ownerLevel) => {
        for (const exposure of owner.exposures.filter(candidate => candidate.reExposes === undefined)) {
            const element = owner.elements.find(candidate => candidate.id === exposure.component);
            if (!element) {
                result.diagnostics.push(errorDiagnostic(
                    DiagnosticCode.ExposureTargetMissing,
                    `'${owner.owner}' exposes '${exposure.path}' on '${exposure.component}', but it has no such component.`,
                    { component: exposure.component, path: exposure.path }));
                continue;
            }

            const descriptor = findComponentDescriptor(catalog, element.componentName);
            if (!descriptor) {
                result.diagnostics.push(errorDiagnostic(
                    DiagnosticCode.MissingComponentDescriptor,
                    `'${owner.owner}' exposes '${exposure.path}' on '${exposure.component}', but nothing describes the component '${element.componentName}'.`,
                    { component: exposure.component, path: exposure.path }));
                continue;
            }

            const property = descriptor.properties.find(candidate => candidate.path === exposure.path);
            if (!property) {
                result.diagnostics.push(errorDiagnostic(
                    DiagnosticCode.ExposureTargetMissing,
                    `'${owner.owner}' exposes '${exposure.path}' on '${exposure.component}', but '${element.componentName}' no longer has that property.`,
                    { component: exposure.component, path: exposure.path }));
                continue;
            }

            const isCollection = property.valueType === PropertyValueType.Collection;
            let current: ExposureGrant = {
                component: exposure.component,
                path: exposure.path,
                descriptor: property,
                owner: owner.owner,
                ownerLevel,
                operations: isCollection ? [...new Set(exposure.operations ?? [])] : [],
                editableFields: isCollection ? exposure.editableFields : undefined,
                label: exposure.label,
            };
            result.exposed.push(current);

            for (let contributor = ownerLevel + 1; contributor < chain.levels.length; contributor++) {
                result.byInstance.get(chain.levels[contributor].instance)!.set(grantKey(exposure.component, exposure.path), current);

                const reExposure = chain.levels[contributor].exposures.find(candidate =>
                    candidate.reExposes === owner.owner && candidate.component === exposure.component && candidate.path === exposure.path);
                if (!reExposure) break;

                consumed.add(reExposure);
                const narrowed = narrow(current, reExposure);
                if (narrowed.widened) {
                    result.diagnostics.push(errorDiagnostic(
                        DiagnosticCode.ExposureWidensOwner,
                        `'${chain.levels[contributor].owner}' re-exposes more of '${exposure.path}' than '${owner.owner}' exposed; only what the owner granted is passed on.`,
                        { component: exposure.component, path: exposure.path }));
                }

                current = narrowed.grant;
            }
        }
    });

    for (const chainLevel of chain.levels) {
        for (const reExposure of chainLevel.exposures.filter(candidate => candidate.reExposes !== undefined && !consumed.has(candidate))) {
            result.diagnostics.push(errorDiagnostic(
                DiagnosticCode.ReExposureBroken,
                `'${chainLevel.owner}' re-exposes '${reExposure.path}' on '${reExposure.component}' from '${reExposure.reExposes}', which does not expose it to this chain.`,
                { component: reExposure.component, path: reExposure.path }));
        }
    }

    return result;
}
