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

const snapshot = (fixture: VerificationCase) => JSON.stringify({ source: fixture.source, library: fixture.library, options: fixture.options });
const pristine = corpus.verification.map(snapshot);

for (const [index, fixture] of corpus.verification.entries()) {
    describe(`when verifying a blueprint for ${fixture.name}`, () => {
        it('should report the same problems, in the same order, as the C# engine', () =>
            verifyBlueprintPackage(fixture.source, fixture.library, fixture.options).should.deep.equal(fixture.expectedProblems));

        it('should leave the blueprint, the library and the options as they were', () => {
            verifyBlueprintPackage(fixture.source, fixture.library, fixture.options);
            snapshot(fixture).should.equal(pristine[index]);
        });
    });
}

describe('when writing the problems of a blueprint', () => {
    const fixture = corpus.verification.find(candidate => candidate.name === 'screen set that is inconsistent')!;

    it('should write them in the order they are found', () =>
        JSON.stringify(verifyBlueprintPackage(fixture.source, fixture.library, fixture.options)).should.equal(`["Blueprint '@cratis/scene.blueprint.crm' declares screen 'Leads' more than once","Blueprint '@cratis/scene.blueprint.crm' declares a screen set entry without a name","Blueprint '@cratis/scene.blueprint.crm' screen 'Leads' uses template 'Missing', which is not available","Blueprint '@cratis/scene.blueprint.crm' screen 'Leads' declares no title","Blueprint '@cratis/scene.blueprint.crm' screen 'Orphan' has parent 'Nowhere', which is not in the screen set","Blueprint '@cratis/scene.blueprint.crm' screen 'Orphan' is named in the screen set but the package does not provide it","Blueprint '@cratis/scene.blueprint.crm' screen 'A' is named in the screen set but the package does not provide it","Blueprint '@cratis/scene.blueprint.crm' screen 'B' is named in the screen set but the package does not provide it","Blueprint '@cratis/scene.blueprint.crm' screen 'A' is its own ancestor","Blueprint '@cratis/scene.blueprint.crm' screen 'B' is its own ancestor"]`));
});

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
