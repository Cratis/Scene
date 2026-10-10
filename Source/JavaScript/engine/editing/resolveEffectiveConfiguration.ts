// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import {
    CollectionOperation, DiagnosticCode, EffectiveCollectionItem, EffectiveComponentConfiguration,
    EffectiveConfiguration, EffectivePropertyValue, InstanceContribution, PropertyValueType, SceneDiagnostic, ValueSource,
} from '@cratis/scene.model';
import { DescriptorCatalog, findComponentDescriptor } from './DescriptorCatalog';
import { errorDiagnostic } from './diagnostics';
import { computeExposureGrants, ExposureGrant, grantKey } from './exposureGrants';
import { cloneData, getValueAtPath, setValueAtPath } from './pathAccess';
import { TemplateChain } from './TemplateChain';
import { validateItemValues, validateValue } from './validateValue';

/**
 * Splits a flat collection item as it is stored on an element - `{ id, label, ... }` - into its id and fields.
 */
function toEffectiveItem(item: unknown, index: number): EffectiveCollectionItem {
    const { id, ...values } = (item !== null && typeof item === 'object' ? item : {}) as Record<string, unknown>;
    return { id: typeof id === 'string' && id.length > 0 ? id : `owner-${index}`, values, origin: 'owner', fixed: true };
}

function toFlatItem(item: EffectiveCollectionItem): Record<string, unknown> {
    return { id: item.id, ...item.values };
}

function scalarValue(grant: ExposureGrant, matching: InstanceContribution[], instance: string, current: EffectivePropertyValue, diagnostics: SceneDiagnostic[]): void {
    for (const contribution of matching) {
        const problem = contribution.value === undefined ? 'a value is required' : validateValue(grant.descriptor, contribution.value);
        if (problem) {
            diagnostics.push(errorDiagnostic(
                DiagnosticCode.ContributionTypeMismatch,
                `The saved value of '${grant.path}' set by '${instance}' is ignored: ${problem}. It is kept, and applies again when it fits.`,
                { instance, component: grant.component, path: grant.path }));
            continue;
        }

        current.value = contribution.value;
        current.source = ValueSource.Instance;
        current.contributedBy = instance;
    }
}

function collectionValue(grant: ExposureGrant, matching: InstanceContribution[], instance: string, items: EffectiveCollectionItem[], diagnostics: SceneDiagnostic[]): boolean {
    let contributed = false;

    for (const contribution of matching) {
        const context = { instance, component: grant.component, path: grant.path };
        if (contribution.items === undefined) {
            diagnostics.push(errorDiagnostic(DiagnosticCode.ContributionTypeMismatch, `The saved value of '${grant.path}' set by '${instance}' is ignored: a collection takes items.`, context));
            continue;
        }

        if (contribution.items.length > 0 && !grant.operations.includes(CollectionOperation.Add)) {
            diagnostics.push(errorDiagnostic(
                DiagnosticCode.ContributionOperationNotPermitted,
                `'${instance}' has items in '${grant.path}', but adding items is not exposed. They are ignored and kept.`,
                context));
            continue;
        }

        for (const item of contribution.items) {
            const itemContext = { ...context, itemId: item.id };
            if (items.some(existing => existing.id === item.id)) {
                diagnostics.push(errorDiagnostic(DiagnosticCode.DuplicateCollectionItem, `The item id '${item.id}' in '${grant.path}' is already used.`, itemContext));
                continue;
            }

            const values: Record<string, unknown> = {};
            for (const [field, value] of Object.entries(item.values)) {
                if (grant.editableFields !== undefined && !grant.editableFields.includes(field)) {
                    diagnostics.push(errorDiagnostic(DiagnosticCode.ContributionOperationNotPermitted, `The field '${field}' of '${grant.path}' is not exposed for editing.`, itemContext));
                    continue;
                }

                const problem = validateItemValues(grant.descriptor.item, { [field]: value }).find(candidate => candidate.field === field);
                if (problem) {
                    diagnostics.push(errorDiagnostic(
                        problem.problem.startsWith('is not a field') ? DiagnosticCode.UnknownCollectionField : DiagnosticCode.ContributionTypeMismatch,
                        `The field '${field}' of an item in '${grant.path}' is ignored: ${problem.problem}.`,
                        itemContext));
                    continue;
                }

                values[field] = value;
            }

            items.push({ id: item.id, values, origin: instance, fixed: false });
            contributed = true;
        }
    }

    return contributed;
}

/**
 * Resolves what every configurable component in a template chain is worth: the owner's own values, with each
 * instance's contributions applied in nesting order.
 *
 * This is the one merge. The editor shows its result and the runtime renders from it, so what an author sees is
 * what Play renders. Order is fixed: the owner's value first, then each level from the outermost inwards, so a
 * later level wins a scalar and appends to a collection after the earlier ones.
 *
 * Nothing in the persisted data is changed. A contribution that cannot apply - the exposure was withdrawn, the
 * property's type changed, the component is gone - is reported in `diagnostics` and left out of the result, and
 * stays in `instanceContributions`, so restoring the exposure brings its value back.
 *
 * @param templateChain The nesting, from {@link resolveTemplateChain} or built by hand.
 * @param instanceContributions What each instance has set.
 * @param catalog The descriptors saying what each component supports.
 */
export function resolveEffectiveConfiguration(
    templateChain: TemplateChain,
    instanceContributions: InstanceContribution[],
    catalog: DescriptorCatalog,
): EffectiveConfiguration {
    const grants = computeExposureGrants(templateChain, catalog);
    const diagnostics: SceneDiagnostic[] = [...templateChain.diagnostics, ...grants.diagnostics];
    const handled = new Set<InstanceContribution>();
    const components = new Map<string, EffectiveComponentConfiguration>();

    for (const grant of grants.exposed) {
        const owner = templateChain.levels[grant.ownerLevel];
        const element = owner.elements.find(candidate => candidate.id === grant.component)!;

        let configuration = components.get(grant.component);
        if (!configuration) {
            configuration = { component: grant.component, owner: owner.owner, properties: cloneData(element.properties), values: [] };
            components.set(grant.component, configuration);
        }

        const stored = getValueAtPath(element.properties, grant.path);
        const base = stored === undefined ? cloneData(grant.descriptor.default) : cloneData(stored);
        const isCollection = grant.descriptor.valueType === PropertyValueType.Collection;
        const baseItems = isCollection && Array.isArray(base) ? base.map(toEffectiveItem) : [];
        const items = [...baseItems];

        const current: EffectivePropertyValue = {
            path: grant.path,
            value: base,
            source: stored === undefined ? ValueSource.Default : ValueSource.Local,
            inheritedValue: base,
        };
        let contributed = false;

        for (let index = grant.ownerLevel + 1; index < templateChain.levels.length; index++) {
            const instance = templateChain.levels[index].instance;
            if (!grants.byInstance.get(instance)?.has(grantKey(grant.component, grant.path))) continue;

            const effectiveGrant = grants.byInstance.get(instance)!.get(grantKey(grant.component, grant.path))!;
            const matching = instanceContributions.filter(contribution =>
                contribution.instance === instance && contribution.component === grant.component && contribution.path === grant.path);
            for (const contribution of matching) handled.add(contribution);

            if (isCollection) {
                if (collectionValue(effectiveGrant, matching, instance, items, diagnostics)) {
                    contributed = true;
                    current.contributedBy = instance;
                }
            } else {
                scalarValue(effectiveGrant, matching, instance, current, diagnostics);
            }
        }

        const maximumItems = grant.descriptor.constraints?.maximumItems;
        if (isCollection && maximumItems !== undefined && items.length > maximumItems) {
            // Saved items that no longer fit - the owner lowered the limit after they were added - are left out of
            // the result in order and kept in the saved data, like any other saved value that no longer fits.
            const dropped = items.splice(maximumItems);
            diagnostics.push(errorDiagnostic(
                DiagnosticCode.ContributionTypeMismatch,
                `'${grant.path}' on '${grant.component}' allows at most ${maximumItems} items; ${dropped.map(item => `'${item.id}'`).join(', ')} ${dropped.length === 1 ? 'is' : 'are'} ignored and kept.`,
                { instance: current.contributedBy ?? owner.instance, component: grant.component, path: grant.path }));
        }

        if (isCollection) {
            current.items = items;
            current.inheritedValue = baseItems.map(toFlatItem);
            current.value = items.map(toFlatItem);
            if (contributed) current.source = ValueSource.Instance;
        }

        if (current.value !== undefined) setValueAtPath(configuration.properties, grant.path, current.value);
        configuration.values.push(current);
    }

    const levelOf = new Map(templateChain.levels.map((chainLevel, index) => [chainLevel.instance, index]));
    for (const contribution of instanceContributions) {
        const contributorLevel = levelOf.get(contribution.instance);
        if (contributorLevel === undefined || handled.has(contribution)) continue;

        const context = { instance: contribution.instance, component: contribution.component, path: contribution.path };
        const owner = templateChain.levels.slice(0, contributorLevel).find(chainLevel => chainLevel.elements.some(element => element.id === contribution.component));
        if (!owner) {
            diagnostics.push(errorDiagnostic(
                DiagnosticCode.ContributionTargetMissing,
                `'${contribution.instance}' has saved values for '${contribution.component}', which is not in any layout or template above it. They are kept.`,
                context));
        } else if (!findComponentDescriptor(catalog, owner.elements.find(element => element.id === contribution.component)!.componentName)) {
            diagnostics.push(errorDiagnostic(
                DiagnosticCode.MissingComponentDescriptor,
                `'${contribution.instance}' has saved values for '${contribution.component}', but nothing describes that component any more. They are kept.`,
                context));
        } else {
            diagnostics.push(errorDiagnostic(
                DiagnosticCode.ContributionNotExposed,
                `'${contribution.instance}' has a saved value for '${contribution.path}' on '${contribution.component}', which is not exposed to it. It is ignored and kept.`,
                context));
        }
    }

    return { components: [...components.values()], diagnostics };
}
