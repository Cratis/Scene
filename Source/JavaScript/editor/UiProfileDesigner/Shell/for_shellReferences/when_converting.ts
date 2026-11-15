// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { TemplateScope, TemplateReferenceSource } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../../../UiProfile/defaultUiProfileSettings';
import { resolveUiProfile } from '../../../UiProfile/resolveUiProfile';
import { TemplateReferenceKind } from '../../../ScreenTemplates/TemplateReferenceKind';
import { describeTemplateBrowser } from '../../../TemplateBrowser/describeTemplateBrowser';
import { templateBrowserSources } from '../../../TemplateBrowser/templateBrowserSources';
import { TemplateBrowserMode } from '../../../TemplateBrowser/TemplateBrowserMode';
import { browserReferenceOf, sceneReferenceOf } from '../shellReferences';
import { defaultBlueprint } from '../given/aShellContext';

describe('when the template browser lists what the application shell can be', () => {
    const settings = defaultUiProfileSettings(blueprintPreviewBundles);
    const resolved = resolveUiProfile(settings, blueprintPreviewBundles);
    const sources = templateBrowserSources(TemplateBrowserMode.Pick, settings, resolved, blueprintPreviewBundles, []);
    const model = describeTemplateBrowser({ ...sources, target: { scope: TemplateScope.Application }, current: browserReferenceOf({ source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'AppShell' }), railId: 'all', category: '', filter: '' });

    it('should list the layouts of the blueprint', () => model.entries.map(entry => entry.name).should.include.members(['AppShell', 'FullPage']));
    it('should list nothing that is not a shell', () => model.entries.every(entry => entry.applicability.applies).should.be.true);
    it('should mark the shell in place', () => model.entries.filter(entry => entry.current).map(entry => entry.name).should.deep.equal(['AppShell']));
    it('should name the blueprint and the layout the way the profile stores them', () => {
        sceneReferenceOf(model.entries.find(entry => entry.name === 'FullPage')!).should.deep.equal({ source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'FullPage' });
    });
    it('should read an own template back as one of the application\'s', () => browserReferenceOf({ source: TemplateReferenceSource.Own, id: 'abc' })!.kind.should.equal(TemplateReferenceKind.Application));
});
