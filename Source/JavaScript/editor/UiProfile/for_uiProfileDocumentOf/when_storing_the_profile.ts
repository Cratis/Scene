// Copyright (c) Cratis. All rights reserved.
// Licensed under the MIT license. See LICENSE file in the project root for full license information.

import { LayoutMode } from '@cratis/scene.blueprint.default';
import { TemplateReferenceSource } from '@cratis/scene.model';
import { blueprintPreviewBundles } from '../../BlueprintPreview/blueprintPreviewCatalog';
import { defaultUiProfileSettings } from '../defaultUiProfileSettings';
import { uiProfileDocumentOf } from '../uiProfileDocumentOf';

const defaultBlueprint = 'Cratis.Blueprint.Default';
const settings = defaultUiProfileSettings(blueprintPreviewBundles);

describe('when storing a profile that only names a blueprint as its shell (no root chosen)', () => {
    const document = uiProfileDocumentOf(settings, blueprintPreviewBundles);

    it('should make the first layout of the blueprint the root template', () => {
        document.root.template.should.deep.include({ source: 'blueprint', blueprint: defaultBlueprint, id: 'AppShell' });
    });
    it('should keep the navigation mode among the options of the shell', () => JSON.parse(document.root.optionsJson).navigationMode.should.equal(settings.navigationMode));
    it('should store the packages the resolver arrived at', () => document.resolvedPackages.should.include(defaultBlueprint));
    it('should store the appearance', () => document.appearance.should.deep.equal({ colorScheme: settings.colorScheme, accent: settings.accent }));
});

describe('when storing a profile with a root template and options of its own', () => {
    const document = uiProfileDocumentOf({
        ...settings,
        navigationMode: LayoutMode.Overlay,
        root: { template: { source: TemplateReferenceSource.Blueprint, blueprint: defaultBlueprint, id: 'FullPage', version: '^1.0.0' }, options: { showFooter: false } },
    }, blueprintPreviewBundles);

    it('should store the template with its pin', () => document.root.template.should.deep.equal({ source: 'blueprint', blueprint: defaultBlueprint, id: 'FullPage', version: '^1.0.0', isNone: false }));
    it('should store the options and the navigation mode', () => JSON.parse(document.root.optionsJson).should.deep.equal({ showFooter: false, navigationMode: LayoutMode.Overlay }));
});

describe('when storing a profile whose root template is the application\'s own', () => {
    const document = uiProfileDocumentOf({ ...settings, shell: '', root: { template: { source: TemplateReferenceSource.Own, id: '5d7e2a9c-0000-4000-8000-000000000001' }, options: {} } }, blueprintPreviewBundles);

    it('should say it is the application\'s own', () => document.root.template.should.deep.equal({ source: 'own', blueprint: '', id: '5d7e2a9c-0000-4000-8000-000000000001', version: '', isNone: false }));
});

describe('when storing a profile with no shell at all', () => {
    const document = uiProfileDocumentOf({ ...settings, shell: '' }, blueprintPreviewBundles);

    it('should store no root template', () => document.root.template.source.should.equal(''));
});
