// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { SampleDataPack } from '@cratis/scene.model';
import { isValidSampleDataOwner, sampleDataIdPattern, sampleDataLocalePattern } from './sampleDataRules';

/**
 * Checks a pack's schema: an id of the allowed form, a title, a well-formed locale tag, an owner that is
 * `user` or `blueprint:<id>`, and sets with a shape each, none repeated. The C# engine
 * (`SampleDataValidation.ValidatePack`) reports the same problems in the same order; both are asserted against
 * `sample-data-resolution-fixtures.json`.
 */
export function validateSampleDataPack(pack: SampleDataPack): string[] {
    const problems: string[] = [];
    const id = pack.id ?? '';
    const label = id.trim() === '' ? 'Sample data pack' : `Sample data pack '${id}'`;

    if (id.trim() === '') {
        problems.push('Sample data pack declares no id');
    } else if (!sampleDataIdPattern.test(id)) {
        problems.push(`${label} declares an invalid id; use lower-case letters, digits and '.', '_' or '-' separators`);
    }

    if ((pack.title ?? '').trim() === '') problems.push(`${label} declares no title`);

    if ((pack.locale ?? '').trim() === '') {
        problems.push(`${label} declares no locale`);
    } else if (!sampleDataLocalePattern.test(pack.locale)) {
        problems.push(`${label} declares an invalid locale '${pack.locale}'`);
    }

    if (!isValidSampleDataOwner(pack.owner)) {
        problems.push(`${label} declares owner '${pack.owner ?? ''}', which is neither 'user' nor 'blueprint:<id>'`);
    }

    const seen = new Set<string>();
    for (const set of pack.sets ?? []) {
        if ((set.shape ?? '').trim() === '') {
            problems.push(`${label} declares a set without a shape`);
        } else if (seen.has(set.shape)) {
            problems.push(`${label} declares shape '${set.shape}' more than once`);
        } else {
            seen.add(set.shape);
        }
    }

    return problems;
}
