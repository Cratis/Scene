// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { DialogTemplate, Layout, ScreenTemplate, TemplateScope } from '@cratis/scene.model';
import { validateDialogTemplateApplicability, validateLayoutApplicability, validateScreenTemplateApplicability } from '../index';

interface FixtureCase {
    name: string;
    kind: 'Layout' | 'ScreenTemplate' | 'DialogTemplate';
    scope: TemplateScope;
    definition?: ScreenTemplate;
    container?: Layout;
    expectedProblems: string[];
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../template-applicability-fixtures.json'), 'utf-8')) as { cases: FixtureCase[] };

for (const fixture of corpus.cases) {
    describe(`when validating template applicability for ${fixture.name}`, () => {
        let problems: string[];
        let original: string;
        beforeEach(() => {
            original = JSON.stringify(fixture);
            switch (fixture.kind) {
                case 'Layout': problems = validateLayoutApplicability(fixture.definition as Layout | undefined, fixture.scope); break;
                case 'DialogTemplate': problems = validateDialogTemplateApplicability(fixture.definition as DialogTemplate | undefined, fixture.scope); break;
                case 'ScreenTemplate': problems = validateScreenTemplateApplicability(fixture.definition, fixture.scope, fixture.container); break;
            }
        });
        it('should report the same diagnostics as the C# engine', () => problems.should.deep.equal(fixture.expectedProblems));
        it('should preserve authored metadata and invalid input', () => JSON.stringify(fixture).should.equal(original));
    });
}
