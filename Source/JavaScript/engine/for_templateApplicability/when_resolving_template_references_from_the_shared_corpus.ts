// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { TemplateReference } from '@cratis/scene.model';
import { TemplateCatalogKind, TemplateLibrary, TemplateReferenceResolution, TemplateReferenceStatus, resolveTemplateReference } from '../index';

interface ReferenceCase {
    name: string;
    reference: TemplateReference;
    expected: { status: TemplateReferenceStatus; package?: string; version?: string; kind?: TemplateCatalogKind; message?: string };
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../template-applicability-fixtures.json'), 'utf-8')) as {
    library: TemplateLibrary;
    references: ReferenceCase[];
};

for (const fixture of corpus.references) {
    describe(`when resolving the template reference for ${fixture.name}`, () => {
        let resolution: TemplateReferenceResolution;
        beforeEach(() => (resolution = resolveTemplateReference(fixture.reference, corpus.library)));

        it('should resolve like the C# engine', () =>
            ({ status: resolution.status, package: resolution.package, version: resolution.packageVersion, kind: resolution.kind, message: resolution.message })
                .should.deep.equal({ status: fixture.expected.status, package: fixture.expected.package, version: fixture.expected.version, kind: fixture.expected.kind, message: fixture.expected.message }));
    });
}
