// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateReferenceSource } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { resolveUiProfile } from '../../../UiProfile/resolveUiProfile';
import { withRootTemplate } from '../shellSwitch';
import { defaultBlueprint, settings } from '../given/aShellContext';

describe('when choosing a layout of the blueprint as the root template', () => {
    const next = withRootTemplate({ ...settings, root: { template: { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'AppShell', version: '^1.0.0' }, options: { navigationMode: 'static' } } },
        { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'FullPage' }, blueprintPreviewBundles);
    const resolved = resolveUiProfile(next, blueprintPreviewBundles);

    it('should resolve the profile to that layout', () => resolved.layout.should.equal('FullPage'));
    it('should hand Scene the root template', () => resolved.profile.root!.template.id.should.equal('FullPage'));
    it('should not carry the options of the shell it replaces over', () => (next.root!.options ?? {}).should.deep.equal({}));
    it('should keep the blueprint among the packages', () => resolved.selection.packages.should.include(defaultBlueprint));
});

describe('when choosing a template that is not a layout the blueprint declares', () => {
    const next = withRootTemplate(settings, { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'NoSuchShell' }, blueprintPreviewBundles);

    it('should fall back on the first layout of the blueprint', () => resolveUiProfile(next, blueprintPreviewBundles).layout.should.equal('AppShell'));
});
