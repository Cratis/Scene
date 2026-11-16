// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { resolveComponentName, toComponentCatalog } from '@cratis/scene.engine';
import type { ScenePackageBundle } from '@cratis/scene.react';
import type { ResolvedUiProfile } from '../../UiProfile/ResolvedUiProfile';

export enum SupplierAnswerKind {
    // A package in the profile supplies the name; `supplier` is the one that wins and `shadows` the ones it overrides.
    Supplied = 'supplied',

    // No package in the profile supplies it, but packages the profile does not include do (`offeredBy`).
    NotIncluded = 'notIncluded',

    // No package at all declares it.
    Unknown = 'unknown',
}

export interface SupplierAnswer {
    name: string;
    kind: SupplierAnswerKind;
    supplier?: string;
    shadows: string[];
    offeredBy: string[];
}

const limit = 8;

// "Who supplies `card`?": the answer for each component name that matches what was typed, drawn from the same resolution the canvas and Stage use
// (`resolveComponentName`), so the answer is never the designer's own opinion. A name with a package in front of it (`Acme.Charts.line`) is answered
// for exactly that package. An empty query has no answers.
export function findComponentSuppliers(query: string, resolved: ResolvedUiProfile, bundles: ScenePackageBundle[]): SupplierAnswer[] {
    const text = query.trim();
    if (text.length === 0) return [];

    const catalog = toComponentCatalog(bundles.map(bundle => bundle.manifest));
    const included = new Set(resolved.selection.packages);
    const declared = [...new Set(Object.values(catalog).flat())];
    const lowered = text.toLowerCase();

    const names = text.includes('.')
        ? [text]
        : declared.filter(name => name.toLowerCase().includes(lowered)).sort((left, right) => rank(left, lowered) - rank(right, lowered) || left.localeCompare(right)).slice(0, limit);
    if (names.length === 0) return [{ name: text, kind: SupplierAnswerKind.Unknown, shadows: [], offeredBy: [] }];

    return names.map(name => {
        const resolution = resolveComponentName(name, resolved.profile, catalog);
        if (resolution) return { name, kind: SupplierAnswerKind.Supplied, supplier: resolution.package, shadows: resolution.shadows, offeredBy: [] };

        const offeredBy = Object.entries(catalog).filter(([packageName, components]) => !included.has(packageName) && components.includes(name.slice(name.lastIndexOf('.') + 1))).map(([packageName]) => packageName);
        return { name, kind: offeredBy.length > 0 ? SupplierAnswerKind.NotIncluded : SupplierAnswerKind.Unknown, shadows: [], offeredBy };
    });
}

// An exact name first, then names that start with what was typed, then the rest.
function rank(name: string, lowered: string): number {
    const value = name.toLowerCase();
    return value === lowered ? 0 : value.startsWith(lowered) ? 1 : 2;
}
