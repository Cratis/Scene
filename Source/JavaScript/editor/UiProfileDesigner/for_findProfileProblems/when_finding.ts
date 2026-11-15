// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { findProfileProblems } from '../Problems/findProfileProblems';
import { ProfileNodeKind } from '../Structure/ProfileNodeKind';
import { defaults, resolve, strings } from '../given/a_resolved_profile';

describe('when the profile is sound', () => {
    const settings = defaults();

    it('should have no problems', () => findProfileProblems(settings, resolve(settings), strings).should.be.empty);
});

describe('when the profile has no shell', () => {
    const settings = { ...defaults(), shell: '' };
    const problems = findProfileProblems(settings, resolve(settings), strings);

    it('should report it on the shell node', () => problems.some(problem => problem.node === ProfileNodeKind.Shell).should.be.true);
    it('should report it as a warning with the engine code', () => problems.find(problem => problem.node === ProfileNodeKind.Shell)!.should.include({ code: 'rootTemplateUnknown', severity: 'warning' }));
});
