// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { effectiveOutlet, outletChainOf } from '../index';
import { corpus, describeLevel, describeOutlet } from './given/outlet_fixtures';

describe('when building the chain of a screen', () => {
    for (const fixture of corpus.chains) {
        describe(`and ${fixture.name}`, () => {
            const built = outletChainOf(fixture.source, fixture.screen);

            it('should build the chain', () => built.chain.map(describeLevel).should.deep.equal(fixture.expected.chain));
            it('should find the contributors', () => built.contributors.map(describeLevel).should.deep.equal(fixture.expected.contributors));

            for (const entry of fixture.resolve) {
                it(`should resolve the outlet '${entry.outlet}' through it`, () =>
                    describeOutlet(effectiveOutlet(built.chain, entry.outlet, built.contributors)).should.deep.equal(entry.expected));
            }
        });
    }
});
