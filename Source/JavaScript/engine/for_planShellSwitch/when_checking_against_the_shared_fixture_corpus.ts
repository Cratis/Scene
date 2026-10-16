// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Screen, TemplateReference, UiProfile } from '@cratis/scene.model';
import { OutletRemaps, ShellOutletAction, ShellSwitchPlan, TemplateLibrary, planShellSwitch, placeableScreenTemplates, resolveEffectiveShell } from '../index';

interface SwitchCase {
    name: string;
    description: string;
    profile: UiProfile;
    currentRoot: TemplateReference;
    candidateRoot: TemplateReference;
    screens: Screen[];
    remaps: OutletRemaps;
    expected: ShellSwitchPlan;
}

const corpus = JSON.parse(readFileSync(join(import.meta.dirname, '../../../../shell-switch-fixtures.json'), 'utf-8')) as {
    libraries: { default: TemplateLibrary };
    cases: SwitchCase[];
};

const planOf = (fixture: SwitchCase): ShellSwitchPlan => {
    const context = { library: corpus.libraries.default };
    const current = resolveEffectiveShell({ ...fixture.profile, root: { template: fixture.currentRoot } }, context);
    const candidate = resolveEffectiveShell({ ...fixture.profile, root: { template: fixture.candidateRoot } }, context);
    return planShellSwitch(current, candidate, fixture.screens, placeableScreenTemplates(fixture.profile, context), fixture.remaps);
};

describe('when planning a shell switch against the shared fixture corpus', () => {
    it('should have cases in the corpus', () => corpus.cases.length.should.be.greaterThan(20));

    it('should cover every outlet action', () => {
        const covered = new Set(corpus.cases.flatMap(fixture => fixture.expected.moves.map(move => move.action)));
        [...covered].sort().should.deep.equal(Object.values(ShellOutletAction).sort());
    });

    it('should never leave a placeholder or an id in a message', () => {
        const messages = corpus.cases.flatMap(fixture => {
            const plan = planOf(fixture);
            return [...plan.moves.map(move => move.description), ...plan.blockers.map(item => item.message), ...plan.warnings.map(item => item.message)];
        });
        messages.filter(message => /[{}]|undefined|null|\[object/.test(message)).should.deep.equal([]);
    });

    for (const fixture of corpus.cases) {
        describe(`and the case is ${fixture.name}`, () => {
            const plan = planOf(fixture);

            it('should give the plan the corpus expects', () => JSON.parse(JSON.stringify(plan)).should.deep.equal(fixture.expected));
            it('should plan the same twice', () => JSON.stringify(planOf(fixture)).should.equal(JSON.stringify(plan)));
            it('should block exactly when there are blockers', () => plan.canSwitch.should.equal(plan.blockers.length === 0));
            it('should account for every outlet of the current shell', () => plan.moves.length.should.be.at.least(1));
        });
    }
});
