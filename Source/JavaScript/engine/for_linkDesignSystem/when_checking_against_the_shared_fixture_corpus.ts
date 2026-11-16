// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ComponentAnatomy, ComponentDescriptor, DesignSystem, UiProfile } from '@cratis/scene.model';
import { DesignLinkDiagnosticCode, linkDesignSystem } from '../index';

interface LinkCase {
    name: string;
    description: string;
    designSystem: DesignSystem;
    profile: UiProfile;
    catalog: Record<string, string[]>;
    components: { component: string; properties: string[]; anatomy: ComponentAnatomy | null }[];
    expected: unknown;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../design-link-fixtures.json'), 'utf-8')) as { cases: LinkCase[] };
const linked = (fixture: LinkCase) => {
    const descriptors = fixture.components.map((item): ComponentDescriptor => ({
        component: item.component,
        properties: item.properties.map(path => ({ path, label: path, group: 'g', valueType: 'string' as never })),
        ...(item.anatomy === null ? {} : { anatomy: item.anatomy }),
    }));
    return JSON.parse(JSON.stringify(linkDesignSystem(fixture.designSystem, fixture.profile, fixture.catalog, descriptors)));
};

describe('when linking a design system against the shared fixture corpus', () => {
    it('should have cases in the corpus', () => corpus.cases.length.should.be.greaterThan(8));

    it('should cover every diagnostic code', () => {
        const covered = new Set(corpus.cases.flatMap(fixture => (fixture.expected as { diagnostics: { code: string }[] }).diagnostics.map(diagnostic => diagnostic.code)));
        [...covered].sort().should.deep.equal(Object.values(DesignLinkDiagnosticCode).sort());
    });

    for (const fixture of corpus.cases) {
        describe(`and the case is ${fixture.name}`, () => {
            it('should link what the corpus expects', () => linked(fixture).should.deep.equal(fixture.expected));
        });
    }
});
