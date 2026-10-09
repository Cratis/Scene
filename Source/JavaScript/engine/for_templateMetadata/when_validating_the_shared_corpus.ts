// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TemplateMetadata } from '@cratis/scene.model';
import { TemplateCatalogEntry, TemplateSource, describeTemplateCatalog, validateTemplateMetadata } from '../index';

interface ValidationCase {
    name: string;
    template: string;
    metadata?: TemplateMetadata;
    expectedProblems: string[];
}

interface CatalogCase {
    name: string;
    sceneVersion?: string;
    sources: TemplateSource[];
    expectedEntries: Pick<TemplateCatalogEntry, 'package' | 'kind' | 'name' | 'compatible' | 'problems'>[];
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../template-metadata-fixtures.json'), 'utf-8')) as {
    validation: ValidationCase[];
    catalog: CatalogCase[];
};

for (const fixture of corpus.validation) {
    describe(`when validating template metadata for ${fixture.name}`, () => {
        it('should report the same problems as the C# engine', () => validateTemplateMetadata(fixture.template, fixture.metadata).should.deep.equal(fixture.expectedProblems));
    });
}

for (const fixture of corpus.catalog) {
    describe(`when describing the template catalog for ${fixture.name}`, () => {
        let entries: TemplateCatalogEntry[];
        beforeEach(() => (entries = describeTemplateCatalog(fixture.sources, fixture.sceneVersion)));

        it('should describe the same entries as the C# engine', () =>
            entries.map(({ package: owner, kind, name, compatible, problems }) => ({ package: owner, kind, name, compatible, problems })).should.deep.equal(fixture.expectedEntries));

        it('should surface each template\'s provenance', () => {
            const templates = fixture.sources.flatMap(source => [...(source.layouts ?? []), ...(source.screenTemplates ?? []), ...(source.dialogTemplates ?? [])]);
            entries.map(entry => [entry.license, entry.attribution, entry.compatibility]).should.deep.equal(
                templates.map(template => [template.metadata?.license, template.metadata?.attribution, template.metadata?.compatibility]),
            );
        });
    });
}
