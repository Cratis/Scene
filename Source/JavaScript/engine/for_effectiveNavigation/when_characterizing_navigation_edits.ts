// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NavigationModel } from '@cratis/scene.model';
import { NavigationEdit, applyNavigationEdits } from '../index';
import { EditCall, plan } from './given/navigation_fixtures';

interface PlanCase {
    name: string;
    navigation?: NavigationModel;
    call: EditCall;
    expected: { edits?: NavigationEdit[]; rejected?: string };
}

interface ApplyCase {
    name: string;
    navigation?: NavigationModel;
    edits: NavigationEdit[];
    expected: { applied: boolean; model?: NavigationModel; rejected?: string };
}

const corpus = (JSON.parse(readFileSync(join(import.meta.dirname, '../../../../navigation-inheritance-fixtures.json'), 'utf-8')) as {
    characterization: { navigation: NavigationModel; planCases: PlanCase[]; applyCases: ApplyCase[] };
}).characterization;

describe('when characterizing the shared navigation edit helpers', () => {
    it('should carry plan and apply cases', () => {
        corpus.planCases.length.should.be.greaterThan(20);
        corpus.applyCases.length.should.be.greaterThan(30);
    });

    it('should refuse an edit kind that is not a navigation edit', () => {
        const outcome = applyNavigationEdits(corpus.navigation, [{ kind: 'bogus', outlet: 'sidebar' } as unknown as NavigationEdit]);
        outcome.applied.should.be.false;
        outcome.rejected!.should.equal('\'bogus\' is not a navigation edit.');
    });

    it('should check the kind before the outlet', () => {
        const outcome = applyNavigationEdits(corpus.navigation, [{ kind: 'bogus' } as unknown as NavigationEdit]);
        outcome.rejected!.should.equal('\'bogus\' is not a navigation edit.');
    });

    it('should refuse an item the outlet does not take, naming its kind in camel case', () => {
        const outcome = applyNavigationEdits(corpus.navigation, [{ kind: 'addItem', outlet: 'sidebar', item: { kind: 'menuEntry', id: 'm', title: 'M' } } as unknown as NavigationEdit]);
        outcome.rejected!.should.equal('The outlet \'sidebar\' lists navigation and does not take a menuEntry item.');
    });
});

for (const fixture of corpus.planCases) {
    describe(`when planning a navigation edit: ${fixture.name}`, () => {
        const navigation = fixture.navigation ?? corpus.navigation;

        it('should plan what the corpus pins', () => {
            const planned = plan({ name: fixture.name, navigation, call: fixture.call, expected: {} });
            if (fixture.expected.rejected !== undefined) {
                planned.rejected!.should.equal(fixture.expected.rejected);
                planned.edits.should.deep.equal([]);
            } else {
                (planned.rejected === undefined).should.be.true;
                JSON.parse(JSON.stringify(planned.edits)).should.deep.equal(fixture.expected.edits);
            }
        });
    });
}

for (const fixture of corpus.applyCases) {
    describe(`when applying navigation edits: ${fixture.name}`, () => {
        const navigation = fixture.navigation ?? corpus.navigation;
        let original: string;

        beforeEach(() => { original = JSON.stringify(navigation); });

        it('should apply what the corpus pins', () => {
            const outcome = applyNavigationEdits(navigation, fixture.edits);
            outcome.applied.should.equal(fixture.expected.applied);
            if (fixture.expected.applied) {
                (outcome.rejected === undefined).should.be.true;
                JSON.parse(JSON.stringify(outcome.model)).should.deep.equal(fixture.expected.model);
            } else {
                outcome.rejected!.should.equal(fixture.expected.rejected);
                JSON.parse(JSON.stringify(outcome.model)).should.deep.equal(JSON.parse(original));
            }
        });

        it('should not change the model it was given', () => {
            applyNavigationEdits(navigation, fixture.edits);
            JSON.stringify(navigation).should.equal(original);
        });
    });
}
