// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findProfileProblems } from '../Problems/findProfileProblems';
import { ProfileNodeKind } from '../Structure/ProfileNodeKind';
import { defaults, resolve } from '../given/a_resolved_profile';
import type { UiProfileDesignerStrings } from '../UiProfileDesignerStrings';

const words = {
    nodes: { application: 'Application', shell: 'Shell', theme: 'Theme', packages: 'Packages', sampleData: 'Sample data' },
    problems: {
        packageSelectionInvalid: 'invalid',
        packageMissing: '{package} needs {dependsOn}, which is not chosen.',
        packageVersionConflict: '{package} needs {dependsOn} {required}, but {actual} is chosen.',
        packageCycle: 'Circle: {packages}.',
        noShell: 'no shell',
        error: 'Error', warning: 'Warning', goTo: 'Go to {node}', onNode: 'On {node}',
    },
} as unknown as UiProfileDesignerStrings;

const settings = defaults();
const sound = resolve(settings);
const broken = (selection: Partial<typeof sound.selection>) => ({ ...sound, isValid: false, selection: { ...sound.selection, ...selection } });
const nameOf = (id: string) => sound.entries.find(entry => entry.name === id)?.displayName ?? id;

describe('when a package needs one that is not chosen', () => {
    const [first, second] = sound.entries.map(entry => entry.name);
    const problems = findProfileProblems(settings, broken({ missing: [{ package: first, dependsOn: second }] }), words);

    it('should report one problem on the Packages node', () => problems.map(problem => problem.node).should.deep.equal([ProfileNodeKind.Packages]));
    it('should name both packages as a person knows them', () => problems[0].message.should.equal(`${nameOf(first)} needs ${nameOf(second)}, which is not chosen.`));
    it('should give it the engine code', () => problems[0].code.should.equal('profilePackageMissing'));
});

describe('when a package needs a version that is not chosen', () => {
    const [first, second] = sound.entries.map(entry => entry.name);
    const problems = findProfileProblems(settings, broken({ versionConflicts: [{ package: first, dependsOn: second, requiredRange: '^2.0.0', actualVersion: '1.4.0' }] }), words);

    it('should say what is needed and what is chosen', () => problems[0].message.should.equal(`${nameOf(first)} needs ${nameOf(second)} ^2.0.0, but 1.4.0 is chosen.`));
    it('should give it its own code', () => problems[0].code.should.equal('profilePackageVersionConflict'));
});

describe('when packages need each other in a circle', () => {
    const [first, second] = sound.entries.map(entry => entry.name);
    const problems = findProfileProblems(settings, broken({ cycles: [[first, second, first]] }), words);

    it('should list the circle by name', () => problems[0].message.should.equal(`Circle: ${nameOf(first)} → ${nameOf(second)} → ${nameOf(first)}.`));
});

describe('when the selection is invalid and the engine gives no reason', () => {
    const problems = findProfileProblems(settings, broken({}), words);

    it('should fall back to the general sentence', () => problems[0].message.should.equal('invalid'));
});
