// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TemplateCatalogEntry, TemplateSource, describeTemplateCatalog } from '../index';

interface CategoryCase {
    name: string;
    sources: TemplateSource[];
    expectedEntries: Pick<TemplateCatalogEntry, 'package' | 'kind' | 'name' | 'compatible' | 'problems' | 'warnings'>[];
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../template-applicability-fixtures.json'), 'utf-8')) as { categories: CategoryCase[] };

for (const fixture of corpus.categories) {
    describe(`when describing the template categories for ${fixture.name}`, () => {
        let entries: TemplateCatalogEntry[];
        beforeEach(() => (entries = describeTemplateCatalog(fixture.sources)));

        it('should report a missing category as an error for blueprints and a warning for own templates', () =>
            entries.map(({ package: owner, kind, name, compatible, problems, warnings }) => ({ package: owner, kind, name, compatible, problems, warnings }))
                .should.deep.equal(fixture.expectedEntries));
    });
}
