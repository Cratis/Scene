// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource, TemplateRole, TemplateScope } from '@cratis/scene.model';
import { ownTemplateSource } from '../../../ScreenTemplates/ownTemplateSource';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { shellLibraryOf } from '../shellLibraryOf';
import { effectiveShellOf, planSwitchTo } from '../shellSwitch';
import { shellDisplayName } from '../shellDisplayName';
import { screenPlacing, settings } from '../given/aShellContext';

const ownId = '5d7e2a9c-0000-4000-8000-000000000001';
const ownShell = { id: ownId, name: 'Compact shell', scopes: [TemplateScope.Application], role: TemplateRole.Root, primarySlot: 'main', slots: ['header', 'main'] };
const context = (screens = [screenPlacing('Orders', 'sidebar')]) => ({ bundles: blueprintPreviewBundles, library: shellLibraryOf(blueprintPreviewBundles, ownTemplateSource([ownShell])), screens });
const toOwn = { source: TemplateReferenceSource.Own, id: ownId };

describe('when switching to a shell of the application\'s own', () => {
    const outcome = planSwitchTo(settings, toOwn, context());

    it('should know the shell by the name the author gave it', () => shellDisplayName(outcome.candidate).should.equal('Compact shell'));
    it('should take its slots from the template', () => outcome.candidate.slots.should.deep.equal(['header', 'main']));
    it('should take its primary slot from the template', () => outcome.candidate.primarySlot.should.equal('main'));
    it('should store the root as an own template, with no blueprint', () => {
        outcome.settings.root!.template.should.deep.equal({ source: TemplateReferenceSource.Own, id: ownId });
        outcome.settings.shell.should.equal('');
    });
    it('should ask where the content of a slot it lacks goes', () => outcome.plan.canSwitch.should.be.false);
});

describe('when the application\'s own shell is the root', () => {
    const shell = effectiveShellOf({ ...settings, shell: '', root: { template: toOwn, options: {} } }, context([]));

    it('should be the shell Scene resolves', () => shellDisplayName(shell).should.equal('Compact shell'));
    it('should say it is the application\'s own', () => shell.source.should.equal('own'));
    it('should have no diagnostics', () => shell.diagnostics.should.be.empty);
});
