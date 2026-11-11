// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { OutletKind } from '@cratis/scene.model';
import { OutletDiagnosticCode, diagnoseOutlets, effectiveOutlet, outletItemKinds } from '../index';
import { corpus, describeDiagnostic, describeOutlet } from './given/outlet_fixtures';

describe('when resolving outlets against the shared corpus', () => {
    it('should take the item kinds the corpus lists for every outlet kind', () => {
        const actual = Object.fromEntries(Object.values(OutletKind).map(kind => [kind, outletItemKinds(kind)]));
        actual.should.deep.equal(corpus.itemKinds);
    });

    it('should cover every diagnostic code', () => {
        const covered = new Set(corpus.cases.flatMap(fixture => [
            ...fixture.expectedDiagnostics,
            ...fixture.resolve.flatMap(entry => entry.expected.diagnostics),
        ]).map(line => line.split('|')[0]));
        [...covered].sort().should.deep.equal(Object.values(OutletDiagnosticCode).sort());
    });

    it('should write the resolved outlet in the order it is built', () => {
        const fixture = corpus.cases.find(candidate => candidate.name.startsWith('contributions go after inherited'))!;

        const written = JSON.stringify(effectiveOutlet(fixture.chain, fixture.resolve[0].outlet, fixture.contributors ?? []));

        written.should.equal(`{"name":"toolbar","kind":"actions","declaredBy":"Catalog","items":[{"item":{"kind":"button","id":"add","title":"Add product"},"provenance":{"owner":"Products","level":"feature","source":"own"},"editable":false},{"item":{"kind":"button","id":"report","title":"Report","before":"add"},"provenance":{"owner":"Sales","level":"module","source":"contribution"},"editable":false},{"item":{"kind":"button","id":"price","title":"Set price","after":"report"},"provenance":{"owner":"Pricing","level":"feature","source":"contribution"},"editable":false}],"removed":[{"item":{"kind":"button","id":"refresh","title":"Refresh"},"provenance":{"owner":"Catalog","level":"template","source":"default"},"removal":"overridden","removedBy":"Products"},{"item":{"kind":"button","id":"audit","title":"Audit trail"},"provenance":{"owner":"Audit","level":"feature","source":"contribution"},"removal":"hidden","removedBy":"ProductList"}],"sources":["Catalog","Products","ProductList","Sales","Audit","Pricing"],"summary":"Catalog + Products + ProductList + Sales + Audit + Pricing","diagnostics":[{"code":"placementAboveInherited","severity":"warning","outlet":"toolbar","owner":"Sales","item":"report","message":"Sales places 'report' before 'add' in the outlet 'toolbar', but own items never go above inherited ones and contributions never above either, so it goes first after them"}],"mode":"extends"}`);
    });

    for (const fixture of corpus.cases) {
        describe(`and ${fixture.name}`, () => {
            for (const entry of fixture.resolve) {
                it(`should resolve the outlet '${entry.outlet}'`, () =>
                    describeOutlet(effectiveOutlet(fixture.chain, entry.outlet, fixture.contributors ?? [])).should.deep.equal(entry.expected));
            }

            it('should leave the chain as it was', () => {
                const chain = structuredClone(fixture.chain);
                const contributors = structuredClone(fixture.contributors ?? []);
                const before = JSON.stringify({ chain, contributors });
                for (const entry of fixture.resolve) effectiveOutlet(chain, entry.outlet, contributors);
                diagnoseOutlets(chain, contributors);
                JSON.stringify({ chain, contributors }).should.equal(before);
            });

            it('should diagnose the chain', () =>
                diagnoseOutlets(fixture.chain, fixture.contributors ?? []).map(describeDiagnostic).should.deep.equal(fixture.expectedDiagnostics));
        });
    }
});
