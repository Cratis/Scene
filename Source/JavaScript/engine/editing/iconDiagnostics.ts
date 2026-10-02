// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { CollectionItemDescriptor, DiagnosticCode, DiagnosticSeverity, PropertyDescriptor, PropertyValueType, SceneDiagnostic, isIconReference } from '@cratis/scene.model';
import { EffectiveIconCatalog } from '../icons/EffectiveIconCatalog';
import { IconDiagnosticKind } from '../icons/IconDiagnostic';
import { DiagnosticContext } from './diagnostics';

const codes: Record<IconDiagnosticKind, DiagnosticCode> = {
    'missing-library': DiagnosticCode.MissingIconLibrary,
    'missing-icon': DiagnosticCode.MissingIcon,
    'missing-variant': DiagnosticCode.MissingIconVariant,
    'incompatible-version': DiagnosticCode.IncompatibleIconLibrary,
    'catalog-unavailable': DiagnosticCode.IconCatalogUnavailable,
};

/**
 * Checks one icon value against the effective icon catalog.
 *
 * Nothing is rewritten or dropped: this only reports. A value whose library, icon or variant is missing, or
 * whose library is at an incompatible version, produces a diagnostic of the given severity - an error when
 * the value is being *set* (the edit is refused), a warning when it is already stored (it is kept, and
 * applies again if the icon comes back). A value that cannot be judged yet, because its library's catalog has
 * not been loaded, produces an `IconNotVerified` warning rather than silently passing.
 *
 * @param catalog The effective catalog of the profile being edited.
 * @param value The value; anything that is not an icon reference is left to `validateValue`.
 * @param severity How serious a definite problem is.
 * @param context What the diagnostic is about.
 */
export function iconProblem(catalog: EffectiveIconCatalog, value: unknown, severity: DiagnosticSeverity, context: DiagnosticContext): SceneDiagnostic | undefined {
    if (!isIconReference(value)) return undefined;

    const resolution = catalog.lookup(value);
    if (resolution === undefined) {
        return {
            code: DiagnosticCode.IconNotVerified,
            severity: DiagnosticSeverity.Warning,
            message: `The catalog of the icon library '${value.library}' is not loaded, so '${value.key}' could not be verified.`,
            ...context,
        };
    }

    return resolution.isResolved ? undefined : { code: codes[resolution.diagnostic.kind], severity, message: `${resolution.diagnostic.message}.`, ...context };
}

/**
 * Checks the icon fields of collection items.
 *
 * @param itemDescriptor What the items look like.
 * @param items The items, each with its id and field values.
 */
export function iconProblemsOfItems(
    catalog: EffectiveIconCatalog,
    itemDescriptor: CollectionItemDescriptor | undefined,
    items: { id: string; values: Record<string, unknown>; instance?: string }[],
    severity: DiagnosticSeverity,
    context: DiagnosticContext
): SceneDiagnostic[] {
    const iconFields = (itemDescriptor?.properties ?? []).filter((field) => field.valueType === PropertyValueType.Icon);
    return items.flatMap((item) =>
        iconFields.flatMap((field) => {
            const problem = iconProblem(catalog, item.values[field.path], severity, { ...context, itemId: item.id, ...(item.instance === undefined ? {} : { instance: item.instance }) });
            return problem ? [{ ...problem, message: `'${field.label}' of '${item.id}': ${problem.message}` }] : [];
        })
    );
}

/**
 * Checks a property's value - an icon, or a collection whose items have icon fields - against the effective icon
 * catalog. Any other kind of property has nothing to check.
 *
 * @param descriptor The property.
 * @param value The value; for a collection, the flat items (`{ id, ...fields }`) as they are stored.
 */
export function iconProblemsOfProperty(catalog: EffectiveIconCatalog, descriptor: PropertyDescriptor, value: unknown, severity: DiagnosticSeverity, context: DiagnosticContext): SceneDiagnostic[] {
    if (descriptor.valueType === PropertyValueType.Icon) {
        const problem = iconProblem(catalog, value, severity, { ...context, path: descriptor.path });
        return problem ? [{ ...problem, message: `'${descriptor.label}': ${problem.message}` }] : [];
    }

    if (descriptor.valueType === PropertyValueType.Collection && Array.isArray(value)) {
        const items = value
            .filter((item): item is Record<string, unknown> => item !== null && typeof item === 'object')
            .map(({ id, ...values }) => ({ id: String(id), values }));
        return iconProblemsOfItems(catalog, descriptor.item, items, severity, { ...context, path: descriptor.path });
    }

    return [];
}
