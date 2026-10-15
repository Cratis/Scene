// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SampleDataPack, SampleDataSelection, SampleShape, SampleShapeField } from '@cratis/scene.model';
import {
    SampleDataCatalog,
    SampleDataContext,
    SampleDataPackSource,
    SampleDataRequest,
    SampleDataResolution,
    describeSampleDataCatalog,
    generateSample,
    inferSampleFieldKind,
    resolveSampleData,
    validateSampleDataPack,
    validateSampleDataPackages,
    validateSampleDataSelection,
} from '../index';

interface GenerationCase {
    name: string;
    shape: SampleShape;
    seed?: number;
    rowCount?: number;
    locale?: string;
    expectedRows: Record<string, unknown>[] | { count: number; first: unknown; last: unknown };
}

interface InferenceCase { name: string; field: SampleShapeField; expectedKind: string }
interface ResolutionCase { name: string; request: SampleDataRequest; context: SampleDataContext; expected: SampleDataResolution }
interface PackValidationCase { name: string; pack: SampleDataPack; expectedProblems: string[] }
interface SelectionValidationCase { name: string; selection: SampleDataSelection; packs: SampleDataPack[]; expectedProblems: string[] }
interface PackageValidationCase { name: string; sources: SampleDataPackSource[]; expectedProblems: string[] }
interface CatalogCase {
    name: string;
    sources: SampleDataPackSource[];
    ownPacks: { id: string; title: string; locale: string }[];
    activePack?: string;
    expected: SampleDataCatalog;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../sample-data-resolution-fixtures.json'), 'utf-8')) as {
    generation: GenerationCase[];
    inference: InferenceCase[];
    resolution: ResolutionCase[];
    packValidation: PackValidationCase[];
    selectionValidation: SelectionValidationCase[];
    packageValidation: PackageValidationCase[];
    catalog: CatalogCase[];
};

// Compared as serialized text: the corpus promises byte-identical rows in the C# and TypeScript engines.
const serialize = (value: unknown) => JSON.stringify(value);

for (const fixture of corpus.generation) {
    describe(`when generating sample data for ${fixture.name}`, () => {
        let rows: Record<string, unknown>[];
        beforeEach(() => (rows = generateSample(fixture.shape, fixture.seed, fixture.rowCount, fixture.locale)));

        it('should generate the golden rows', () => {
            const expected = fixture.expectedRows;
            const actual = Array.isArray(expected) ? rows : { count: rows.length, first: rows[0], last: rows[rows.length - 1] };
            serialize(actual).should.equal(serialize(expected));
        });

        it('should generate the same rows again', () => serialize(generateSample(fixture.shape, fixture.seed, fixture.rowCount, fixture.locale)).should.equal(serialize(rows)));
    });
}

describe('when generating sample data for enum and nullable fields', () => {
    const shape: SampleShape = { name: 'Check', fields: [{ name: 'state', kind: 'enum', enumValues: ['A', 'B', 'C'] }, { name: 'maybe', kind: 'name', nullable: true }, { name: 'always', kind: 'name' }] };
    let rows: Record<string, unknown>[];
    beforeEach(() => (rows = generateSample(shape, 5, 200, 'en-GB')));

    it('should only produce enum members', () => rows.every(row => ['A', 'B', 'C'].includes(row.state as string)).should.be.true);
    it('should produce nulls for nullable fields', () => rows.some(row => row.maybe === null).should.be.true);
    it('should not produce nulls for other fields', () => rows.every(row => row.always !== null).should.be.true);
});

for (const fixture of corpus.inference) {
    describe(`when inferring the field kind for ${fixture.name}`, () => {
        it('should infer the same kind as the C# engine', () => inferSampleFieldKind(fixture.field).should.equal(fixture.expectedKind));
    });
}

for (const fixture of corpus.resolution) {
    describe(`when resolving sample data and ${fixture.name}`, () => {
        let resolution: SampleDataResolution;
        beforeEach(() => (resolution = resolveSampleData(fixture.request, fixture.context)));

        it('should resolve the same as the C# engine', () => serialize(resolution).should.equal(serialize(fixture.expected)));
    });
}

for (const fixture of corpus.packValidation) {
    describe(`when validating a sample data pack for ${fixture.name}`, () => {
        it('should report the same problems as the C# engine', () => validateSampleDataPack(fixture.pack).should.deep.equal(fixture.expectedProblems));
    });
}

for (const fixture of corpus.selectionValidation) {
    describe(`when validating a sample data selection for ${fixture.name}`, () => {
        it('should report the same problems as the C# engine', () => validateSampleDataSelection(fixture.selection, fixture.packs).should.deep.equal(fixture.expectedProblems));
    });
}

for (const fixture of corpus.packageValidation) {
    describe(`when validating the sample data packages ship for ${fixture.name}`, () => {
        it('should report the same problems as the C# engine', () => validateSampleDataPackages(fixture.sources).should.deep.equal(fixture.expectedProblems));
    });
}

for (const fixture of corpus.catalog) {
    describe(`when describing the sample data catalog for ${fixture.name}`, () => {
        it('should describe the same catalog as the C# engine', () =>
            serialize(describeSampleDataCatalog(fixture.sources, fixture.ownPacks, fixture.activePack)).should.equal(serialize(fixture.expected)));
    });
}
