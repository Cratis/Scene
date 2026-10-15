// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { applyNavigationEdits } from '../index';
import { loadCorpus, plan } from './given/navigation_fixtures';

const corpus = loadCorpus('navigation-inheritance-fixtures.json');

describe('when applying the shared navigation edit corpus', () => {
    it('should carry cases', () => corpus.editCases!.length.should.be.greaterThan(10));
});

for (const fixture of corpus.editCases!) {
    describe(`when editing navigation: ${fixture.name}`, () => {
        let original: string;

        beforeEach(() => { original = JSON.stringify(fixture.navigation); });

        if (fixture.expected.rejected !== undefined) {
            it('should refuse with the reason the C# engine gives', () => {
                const planned = plan(fixture);
                planned.rejected!.should.equal(fixture.expected.rejected!);
                planned.edits.should.deep.equal([]);
            });
        } else {
            it('should plan the same edits as the C# engine', () => {
                const planned = plan(fixture);
                (planned.rejected === undefined).should.be.true;
                JSON.parse(JSON.stringify(planned.edits)).should.deep.equal(fixture.expected.edits);
            });
            it('should apply them to the same model as the C# engine', () => {
                const outcome = applyNavigationEdits(fixture.navigation, plan(fixture).edits);
                outcome.applied.should.be.true;
                JSON.parse(JSON.stringify(outcome.model)).should.deep.equal(fixture.expected.model);
            });
        }

        it('should not change the model it was given', () => {
            applyNavigationEdits(fixture.navigation, plan(fixture).edits);
            JSON.stringify(fixture.navigation).should.equal(original);
        });
    });
}
