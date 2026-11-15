// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { ProblemSeverity, ProfileSection } from '@cratis/scene.engine';
import { ProfileNodeKind } from '../Structure/ProfileNodeKind';
import { orderProblems, panelProblemsOfHost, panelProblemsOfScene, type PanelProblem } from '../Problems/panelProblems';

const line = (key: string, severity: ProblemSeverity, section: ProfileSection, message = key): PanelProblem => ({ key, severity, section, message });

describe('when ordering the problems', () => {
    const ordered = orderProblems([
        line('info', ProblemSeverity.Info, ProfileSection.Menu),
        line('warning', ProblemSeverity.Warning, ProfileSection.Look),
        line('blocker', ProblemSeverity.Blocker, ProfileSection.Packages),
        line('second warning', ProblemSeverity.Warning, ProfileSection.App),
    ]);

    it('should put what stops the profile first, then what is probably unwanted, then what is only worth knowing', () =>
        ordered.map(problem => problem.key).should.deep.equal(['blocker', 'warning', 'second warning', 'info']));
});

describe('when two lines say the same thing about the same section', () => {
    const ordered = orderProblems([line('a', ProblemSeverity.Warning, ProfileSection.Look, 'Too light'), line('b', ProblemSeverity.Warning, ProfileSection.Look, 'Too light')]);

    it('should be shown once', () => ordered.length.should.equal(1));
});

describe('when two lines say the same thing about different sections', () => {
    const ordered = orderProblems([line('a', ProblemSeverity.Warning, ProfileSection.Look, 'Check this'), line('b', ProblemSeverity.Warning, ProfileSection.Shell, 'Check this')]);

    it('should be shown twice', () => ordered.length.should.equal(2));
});

describe('when there are no problems', () => {
    it('should be none', () => orderProblems([]).should.deep.equal([]));
});

describe('when Studio\'s own problems join Scene\'s', () => {
    const own = panelProblemsOfHost([
        { code: 'noShell', severity: 'warning', message: 'No shell', node: ProfileNodeKind.Shell },
        { code: 'packageMissing', severity: 'error', message: 'Needs a package', node: ProfileNodeKind.Packages },
        { code: 'themeGone', severity: 'error', message: 'No theme', node: ProfileNodeKind.Theme },
        { code: 'sampleGone', severity: 'warning', message: 'No pack', node: ProfileNodeKind.SampleData },
        { code: 'nameless', severity: 'warning', message: 'No name', node: ProfileNodeKind.Application },
    ]);

    it('should take an error as a blocker and a warning as a warning', () => own.map(problem => problem.severity).should.deep.equal([ProblemSeverity.Warning, ProblemSeverity.Blocker, ProblemSeverity.Blocker, ProblemSeverity.Warning, ProblemSeverity.Warning]));
    it('should lead each to the section that owns the node', () => own.map(problem => problem.section).should.deep.equal([ProfileSection.Shell, ProfileSection.Packages, ProfileSection.Look, ProfileSection.SampleData, ProfileSection.App]));
    it('should give each its own key', () => new Set(own.map(problem => problem.key)).size.should.equal(5));
});

describe('when Scene\'s problems are listed', () => {
    const scene = panelProblemsOfScene([
        { code: 'accentTooLight', subject: '#ffeb3b', message: 'Too light', severity: ProblemSeverity.Warning, section: ProfileSection.Look, fix: { kind: 'useThemeAccent', label: 'Use theme accent' } },
        { code: 'revealNeedsHover', subject: 'navigationMode', message: 'Reveal needs hover', severity: ProblemSeverity.Info, section: ProfileSection.Menu },
    ] as never);

    it('should keep the severity and the section', () => scene.map(problem => [problem.severity, problem.section]).should.deep.equal([[ProblemSeverity.Warning, ProfileSection.Look], [ProblemSeverity.Info, ProfileSection.Menu]]));
    it('should keep the fix when there is one', () => [scene[0].fix?.label, scene[1].fix].should.deep.equal(['Use theme accent', undefined]));
});
