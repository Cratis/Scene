// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
    BlueprintCatalogEntry, BlueprintPinEvaluation, BlueprintSource, BlueprintVerificationOptions, TemplateSource,
    compareVersions, describeBlueprintCatalog, evaluateBlueprintPin, verifyBlueprintPackage,
} from '../index';

interface VerificationCase { name: string; source: BlueprintSource; library: TemplateSource[]; options?: BlueprintVerificationOptions; expectedProblems: string[] }
interface CatalogCase { name: string; sources: TemplateSource[]; expectedEntries: BlueprintCatalogEntry[] }
interface PinCase { name: string; pin?: string; installed: string; latest?: string; expected: BlueprintPinEvaluation }
interface CompareCase { left: string; right: string; expected: number }

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../blueprint-verification-fixtures.json'), 'utf-8')) as {
    verification: VerificationCase[];
    catalog: CatalogCase[];
    pin: PinCase[];
    compare: CompareCase[];
};

for (const fixture of corpus.verification) {
    describe(`when verifying a blueprint for ${fixture.name}`, () => {
        it('should report the same problems, in the same order, as the C# engine', () =>
            verifyBlueprintPackage(fixture.source, fixture.library, fixture.options).should.deep.equal(fixture.expectedProblems));
    });
}

for (const fixture of corpus.catalog) {
    describe(`when describing the blueprint catalog for ${fixture.name}`, () => {
        it('should describe the same entries as the C# engine', () => describeBlueprintCatalog(fixture.sources).should.deep.equal(fixture.expectedEntries));
    });
}

for (const fixture of corpus.pin) {
    describe(`when evaluating a blueprint pin for ${fixture.name}`, () => {
        it('should evaluate it as the C# engine does', () => evaluateBlueprintPin(fixture.pin, fixture.installed, fixture.latest).should.deep.equal(fixture.expected));
    });
}

describe('when comparing versions', () => {
    for (const fixture of corpus.compare) {
        it(`should compare ${fixture.left} with ${fixture.right} as the C# engine does`, () => Math.sign(compareVersions(fixture.left, fixture.right)).should.equal(fixture.expected));
    }
});
