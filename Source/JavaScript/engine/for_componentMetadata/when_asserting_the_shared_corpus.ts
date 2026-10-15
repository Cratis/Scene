// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ComponentDescriptor, SceneDiagnostic } from '@cratis/scene.model';
import { ComponentQueryMatch, ComponentUsage, componentBadge, matchComponentQuery, rankFrequentlyUsedComponents, validateComponentDescriptors } from '../index';

interface ValidationCase { name: string; descriptors: ComponentDescriptor[]; registered?: string[]; expected: Pick<SceneDiagnostic, 'code' | 'severity' | 'component' | 'path'>[] }
interface BadgeCase { name: string; component: string; displayName?: string; badge?: string; expected: string }
interface QueryCase { name: string; component: Pick<ComponentDescriptor, 'component' | 'displayName' | 'category' | 'keywords'>; query: string; expected: ComponentQueryMatch }
interface FrequentlyUsedCase { name: string; usage: Record<string, ComponentUsage>; limit?: number; expected: string[] }

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../component-metadata-fixtures.json'), 'utf-8')) as {
    validation: ValidationCase[];
    badges: BadgeCase[];
    queries: QueryCase[];
    frequentlyUsed: FrequentlyUsedCase[];
};

for (const fixture of corpus.validation) {
    describe(`when validating component descriptors for ${fixture.name}`, () => {
        it('should report exactly the corpus diagnostics', () =>
            validateComponentDescriptors(fixture.descriptors, fixture.registered)
                .map(({ code, severity, component, path }) => ({ code, severity, component, ...(path === undefined ? {} : { path }) }))
                .should.deep.equal(fixture.expected));

        it('should give every diagnostic a message', () => validateComponentDescriptors(fixture.descriptors, fixture.registered).filter(diagnostic => !diagnostic.message).should.be.empty);
    });
}

for (const fixture of corpus.badges) {
    describe(`when deriving a badge for ${fixture.name}`, () => {
        it('should give the corpus badge', () => componentBadge(fixture).should.equal(fixture.expected));
    });
}

for (const fixture of corpus.queries) {
    describe(`when filtering components for ${fixture.name}`, () => {
        it('should give the corpus match', () => matchComponentQuery(fixture.component, fixture.query).should.deep.equal(fixture.expected));
    });
}

for (const fixture of corpus.frequentlyUsed) {
    describe(`when ranking frequently used components for ${fixture.name}`, () => {
        it('should list the corpus components in order', () =>
            (fixture.limit === undefined ? rankFrequentlyUsedComponents(fixture.usage) : rankFrequentlyUsedComponents(fixture.usage, fixture.limit)).should.deep.equal(fixture.expected));
    });
}
