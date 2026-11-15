// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { effectivePackages, resolveComponentName, type PackageCatalog } from '@cratis/scene.engine';
import type { UiProfile } from '@cratis/scene.model';

export interface StoredComponentResolution {
    package: string;
    name: string;
}

// A document stores a component as `package:component` (what the editor writes), or as a bare name the UI profile resolves
// (what documents written before the editor stored the package hold). The package of a name is what comes before the first colon.
export function splitStoredComponentName(stored: string): { package: string | undefined; name: string } {
    const separator = stored.indexOf(':');
    return separator > 0 ? { package: stored.slice(0, separator), name: stored.slice(separator + 1) } : { package: undefined, name: stored };
}

// The package and component a stored name stands for, or nothing when the profile cannot show it. A qualified name is that
// package's component, provided the profile includes the package; a bare one is the component the profile's highest-priority
// package declares.
export function resolveStoredComponentName(stored: string, profile: UiProfile, catalog: PackageCatalog): StoredComponentResolution | undefined {
    const { package: qualifier, name } = splitStoredComponentName(stored);
    if (qualifier !== undefined) return effectivePackages(profile).includes(qualifier) && catalog[qualifier]?.includes(name) ? { package: qualifier, name } : undefined;
    const resolved = resolveComponentName(name, profile, catalog);
    return resolved ? { package: resolved.package, name: resolved.name } : undefined;
}

// The document with every bare component name stored under the package the profile resolves it to, so a screen saved before
// names carried their package travels typed like one saved now. A name no package offers is left as it is: it is reported where
// it is used, never rewritten into a guess. The same document (not a copy) when nothing needed qualifying.
export function qualifyStoredComponentNames<TDocument>(document: TDocument, profile: UiProfile, catalog: PackageCatalog): TDocument {
    const known = new Set(effectivePackages(profile));
    const visit = (node: unknown): unknown => {
        if (Array.isArray(node)) {
            const items = node.map(visit);
            return items.some((item, index) => item !== node[index]) ? items : node;
        }

        if (node === null || typeof node !== 'object') return node;
        const record = node as Record<string, unknown>;
        let changed = false;
        const next: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(record)) {
            let converted = visit(value);
            if (key === 'componentName' && typeof value === 'string' && !value.includes(':')) {
                const resolved = resolveComponentName(value, profile, catalog);
                if (resolved && known.has(resolved.package)) converted = `${resolved.package}:${resolved.name}`;
            }

            if (converted !== value) changed = true;
            next[key] = converted;
        }

        return changed ? next : node;
    };

    return visit(document) as TDocument;
}
