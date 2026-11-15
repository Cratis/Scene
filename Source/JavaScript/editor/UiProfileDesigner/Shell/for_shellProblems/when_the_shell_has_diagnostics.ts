// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource } from '@cratis/scene.model';
import { ShellDiagnosticCode } from '@cratis/scene.engine';
import { ProfileNodeKind } from '../../Structure/ProfileNodeKind';
import { shellProblemsOf } from '../shellProblems';
import { effectiveShellOf } from '../shellSwitch';
import { contextWith, defaultBlueprint, settings } from '../given/aShellContext';

describe('when the shell is sound', () => {
    it('should have no problems', () => shellProblemsOf(effectiveShellOf(settings, contextWith())).should.be.empty);
});

describe('when the root template names a template no blueprint has', () => {
    const shell = effectiveShellOf({ ...settings, root: { template: { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'NoSuchShell' }, options: {} } }, contextWith());
    const problems = shellProblemsOf(shell);

    it('should say so with the engine\'s own code', () => problems.map(problem => problem.code).should.include(ShellDiagnosticCode.RootTemplateUnknown));
    it('should be an error of the Shell node', () => {
        const found = problems.find(problem => problem.code === ShellDiagnosticCode.RootTemplateUnknown)!;
        found.severity.should.equal('error');
        found.node.should.equal(ProfileNodeKind.Shell);
    });
    it('should name the template, not an identifier', () => problems.find(problem => problem.code === ShellDiagnosticCode.RootTemplateUnknown)!.message.should.contain('NoSuchShell'));
});

describe('when the root template pins a version the blueprint does not have', () => {
    const shell = effectiveShellOf({ ...settings, root: { template: { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'AppShell', version: '^99.0.0' }, options: {} } }, contextWith());

    it('should be an error', () => shellProblemsOf(shell).find(problem => problem.code === ShellDiagnosticCode.RootTemplateVersionNotSatisfied)!.severity.should.equal('error'));
});
