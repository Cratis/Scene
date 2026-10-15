// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { BlueprintPinStatus } from '../index';

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../blueprint-verification-fixtures.json'), 'utf-8')) as {
    verification: { expectedProblems: string[] }[];
    pin: { expected: { status: string } }[];
};

const problems = corpus.verification.flatMap(fixture => fixture.expectedProblems);

// A rule nobody exercises is a rule that can silently stop working, in one engine or both.
describe('when checking the corpus covers each rule', () => {
    const rules: [string, RegExp][] = [
        ['not a blueprint package', /is not a Blueprint package/], ['invalid version', /declares an invalid version/], ['missing blueprint metadata', /declares no blueprint metadata/],
        ['no domain', /declares no domain/], ['invalid domain', /declares an invalid domain/], ['no description', /declares no description/], ['long description', /description longer than/],
        ['no thumbnail', /declares no thumbnail/], ['invalid thumbnail', /which is not 'thumbnails/], ['thumbnail not in package', /thumbnail '.*', which is not in the package/],
        ['empty screen set', /no ready-to-use screen set/], ['duplicate screen', /more than once/], ['screen without a name', /without a name/], ['screen without a title', /declares no title/],
        ['screen template missing', /uses template '.*', which is not available/], ['screen parent missing', /has parent/], ['screen not provided', /does not provide it/], ['screen ancestor cycle', /is its own ancestor/],
        ['no sample data', /ships no sample data pack/], ['no default sample data', /declares no default/], ['unknown default sample data', /declares default sample data/], ['sample data not in package', /sample data pack '.*' names/],
        ['missing foundation dependency', /does not depend on the foundation set/], ['template without type', /declares no type/], ['template with unknown type', /which is not one of Shell/],
        ['template category outside business', /does not start with 'Business/], ['template without display name', /declares no display name/], ['template without description', /declares no description/],
        ['template unplaced', /is unplaced/], ['template ambiguous', /is ambiguous/], ['template nested in itself', /is nested inside itself/], ['template package requirement', /requires package/],
    ];

    for (const [name, pattern] of rules) it(`should exercise ${name}`, () => problems.some(problem => pattern.test(problem)).should.equal(true));

    it('should exercise every pin status', () => {
        const seen = new Set(corpus.pin.map(fixture => fixture.expected.status));
        Object.values(BlueprintPinStatus).filter(status => !seen.has(status)).should.deep.equal([]);
    });

    it('should hold a verification with no problems', () => corpus.verification.some(fixture => fixture.expectedProblems.length === 0).should.equal(true));
});
