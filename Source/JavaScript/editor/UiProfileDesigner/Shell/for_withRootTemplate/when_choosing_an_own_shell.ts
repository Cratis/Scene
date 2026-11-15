// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { resolveUiProfile } from '../../../UiProfile/resolveUiProfile';
import { withRootTemplate } from '../shellSwitch';
import { defaultBlueprint, settings } from '../given/aShellContext';

const own = { source: TemplateReferenceSource.Own, id: 'my-shell' };

describe('when choosing an own shell for an application whose shell is a blueprint\'s', () => {
    const next = withRootTemplate(settings, own, blueprintPreviewBundles);
    const resolved = resolveUiProfile(next, blueprintPreviewBundles);

    it('should have no blueprint as its shell any more', () => next.shell.should.equal(''));
    it('should hand Scene the own template as the root', () => resolved.profile.root!.template.should.deep.equal(own));
    it('should keep the blueprint it was made from among the packages, for the components the shell places', () => resolved.selection.packages.should.include(defaultBlueprint));
    it('should keep it as a blueprint whose templates are offered', () => next.templatePacks.should.deep.equal([defaultBlueprint]));
});

describe('when the blueprint is already offered and an own shell is chosen', () => {
    const next = withRootTemplate({ ...settings, templatePacks: [defaultBlueprint] }, own, blueprintPreviewBundles);

    it('should not list it twice', () => next.templatePacks.should.deep.equal([defaultBlueprint]));
});

describe('when choosing an own shell for an application that has no blueprint shell', () => {
    const next = withRootTemplate({ ...settings, shell: '' }, own, blueprintPreviewBundles);

    it('should add no package', () => next.templatePacks.should.deep.equal([]));
});

describe('when going back from an own shell to the blueprint\'s', () => {
    const own1 = withRootTemplate(settings, own, blueprintPreviewBundles);
    const back = withRootTemplate(own1, { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'AppShell' }, blueprintPreviewBundles);

    it('should have the blueprint as its shell again', () => back.shell.should.equal(defaultBlueprint));
    it('should not offer it twice', () => back.templatePacks.should.deep.equal([]));
});
