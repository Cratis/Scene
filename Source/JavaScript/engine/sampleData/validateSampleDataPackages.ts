// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { PackageKind } from '@cratis/scene.model';
import { SampleDataPackSource } from './SampleDataPackSource';
import { isValidSampleDataOwner, isValidSampleDataPath, sampleDataIdPattern, sampleDataLocalePattern } from './sampleDataRules';
import { validateSampleDataPack } from './validateSampleDataPack';

/**
 * Checks the sample data the given packages ship, in package then reference order: only a Blueprint package may
 * ship packs; each reference needs a valid id, a title, a locale tag and a `sampleData/*.json` path, with no id
 * or path repeated; and each loaded pack must be valid, match its reference's id and locale, be owned by a
 * blueprint, and be one the manifest references. The C# engine (`SampleDataValidation.ValidatePackages`)
 * reports the same problems in the same order.
 */
export function validateSampleDataPackages(sources: readonly SampleDataPackSource[]): string[] {
    const problems: string[] = [];

    for (const source of sources) {
        const manifest = source.manifest;
        const references = manifest.sampleData ?? [];
        const owner = `Package '${manifest.name}'`;

        if (references.length > 0 && manifest.kind !== PackageKind.Blueprint) {
            problems.push(`${owner} ships sample data but is not a Blueprint package`);
        }

        const ids = new Set<string>();
        const paths = new Set<string>();
        for (const reference of references) {
            const label = `${owner} sample data pack '${reference.id ?? ''}'`;
            if ((reference.id ?? '').trim() === '') {
                problems.push(`${owner} declares a sample data pack without an id`);
            } else if (!sampleDataIdPattern.test(reference.id)) {
                problems.push(`${label} has an invalid id`);
            } else if (ids.has(reference.id)) {
                problems.push(`${label} is declared more than once`);
            } else {
                ids.add(reference.id);
            }

            if ((reference.title ?? '').trim() === '') problems.push(`${label} declares no title`);

            if ((reference.locale ?? '').trim() === '') {
                problems.push(`${label} declares no locale`);
            } else if (!sampleDataLocalePattern.test(reference.locale)) {
                problems.push(`${label} declares an invalid locale '${reference.locale}'`);
            }

            if (!isValidSampleDataPath(reference.path)) {
                problems.push(`${label} declares path '${reference.path ?? ''}', which is not 'sampleData/<name>.json'`);
            } else if (paths.has(reference.path)) {
                problems.push(`${label} reuses the path '${reference.path}'`);
            } else {
                paths.add(reference.path);
            }
        }

        for (const pack of source.packs ?? []) {
            const label = `${owner} sample data pack '${pack.id ?? ''}'`;
            problems.push(...validateSampleDataPack(pack));
            const reference = references.find(candidate => candidate.id === pack.id);
            if (reference === undefined) {
                problems.push(`${label} is not referenced by the package's sampleData`);
                continue;
            }

            if (reference.locale !== pack.locale) {
                problems.push(`${label} has locale '${pack.locale}' but its reference declares '${reference.locale}'`);
            }

            if (isValidSampleDataOwner(pack.owner) && pack.owner === 'user') {
                problems.push(`${label} must be owned by a blueprint, not 'user'`);
            }
        }
    }

    return problems;
}
