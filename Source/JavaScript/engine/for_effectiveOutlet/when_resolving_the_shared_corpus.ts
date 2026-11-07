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

    for (const fixture of corpus.cases) {
        describe(`and ${fixture.name}`, () => {
            for (const entry of fixture.resolve) {
                it(`should resolve the outlet '${entry.outlet}'`, () =>
                    describeOutlet(effectiveOutlet(fixture.chain, entry.outlet, fixture.contributors ?? [])).should.deep.equal(entry.expected));
            }

            it('should diagnose the chain', () =>
                diagnoseOutlets(fixture.chain, fixture.contributors ?? []).map(describeDiagnostic).should.deep.equal(fixture.expectedDiagnostics));
        });
    }
});
